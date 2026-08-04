import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import XLSX from 'xlsx';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { Cart } from '../models/Cart.model.js';
import { Review } from '../models/Review.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const XLSX_PATH = path.join(__dirname, 'Database_Menu_For_Web_Developers.xlsx');

/** Thumbnail is required by schema — no real photos until uploaded in admin */
const NO_IMAGE = {
  url: 'https://placehold.co/600x400?text=No+Image',
  key: 'placeholder/no-image',
};

interface MenuRow {
  'Product Name': string;
  Description?: string | null;
  'Ingredients (comma separated)'?: string | null;
  'Base Price (£)'?: number | string | null;
  'Offer Percentage (%)'?: number | string | null;
  'Initial Stock Level'?: number | string | null;
  Category: string;
  'Pure Veg'?: boolean | string | null;
  'Publicly Listed'?: boolean | string | null;
  'Spice Level Enabled'?: boolean | string | null;
}

interface CategoryMapRow {
  'Current Menu Category': string;
  'Database Category': string;
  'Verification Status'?: string;
}

function toBool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true' || v === 'yes' || v === '1') return true;
    if (v === 'false' || v === 'no' || v === '0') return false;
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
}

function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseIngredients(raw: unknown): string[] {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const importMenu = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not defined in .env');
    process.exit(1);
  }

  console.log('📖 Reading spreadsheet...');
  const workbook = XLSX.readFile(XLSX_PATH);

  const categoryRows = XLSX.utils.sheet_to_json<CategoryMapRow>(
    workbook.Sheets['Category Mapping'],
    { defval: null }
  );
  const menuRows = XLSX.utils.sheet_to_json<MenuRow>(workbook.Sheets['Database Menu'], {
    defval: null,
  });
  const noteRows = XLSX.utils.sheet_to_json<(string | null)[]>(
    workbook.Sheets['Import Notes'],
    { header: 1, defval: null }
  );

  const importNotes = noteRows
    .flat()
    .filter((n): n is string => typeof n === 'string' && n.trim() !== '' && n !== 'Import Notes');

  console.log('\n📌 Import Notes:');
  for (const note of importNotes) {
    console.log(`   • ${note}`);
  }

  // Unique database category names (preserve spreadsheet order)
  const dbCategoryNames: string[] = [];
  const seenCats = new Set<string>();
  for (const row of categoryRows) {
    const name = row['Database Category']?.trim();
    if (!name || seenCats.has(name)) continue;
    seenCats.add(name);
    dbCategoryNames.push(name);
  }

  if (dbCategoryNames.length === 0) {
    console.error('❌ No categories found in Category Mapping sheet');
    process.exit(1);
  }

  if (menuRows.length === 0) {
    console.error('❌ No products found in Database Menu sheet');
    process.exit(1);
  }

  console.log(`\n🔌 Connecting to MongoDB...`);
  await mongoose.connect(uri);
  console.log('✅ Connected');

  // ── Wipe existing catalog (and dependent data) ─────────────────────────────
  console.log('\n🗑️  Clearing existing catalog...');
  const [deletedReviews, deletedCarts, deletedProducts, deletedCategories] = await Promise.all([
    Review.deleteMany({}),
    Cart.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
  ]);
  console.log(`   Reviews removed   : ${deletedReviews.deletedCount}`);
  console.log(`   Carts cleared     : ${deletedCarts.deletedCount}`);
  console.log(`   Products removed  : ${deletedProducts.deletedCount}`);
  console.log(`   Categories removed: ${deletedCategories.deletedCount}`);

  // ── Insert categories ──────────────────────────────────────────────────────
  console.log(`\n📂 Inserting ${dbCategoryNames.length} categories...`);
  const createdCategories = await Category.insertMany(
    dbCategoryNames.map((name) => ({
      name,
      description: '',
      categoryImage: '',
      isListed: true,
    }))
  );

  const categoryIdByName = new Map<string, mongoose.Types.ObjectId>();
  for (const cat of createdCategories) {
    categoryIdByName.set(cat.name, cat._id as mongoose.Types.ObjectId);
  }
  console.log(`✅ Categories inserted: ${createdCategories.length}`);

  // ── Insert products ────────────────────────────────────────────────────────
  console.log(`\n🍽️  Preparing ${menuRows.length} products...`);

  let skipped = 0;
  const warnings: string[] = [];
  const productsToInsert: Record<string, unknown>[] = [];

  for (const row of menuRows) {
    const name = row['Product Name']?.trim();
    const categoryName = row.Category?.trim();

    if (!name || !categoryName) {
      skipped += 1;
      warnings.push(`Skipped row with missing name/category: ${JSON.stringify(row)}`);
      continue;
    }

    const categoryId = categoryIdByName.get(categoryName);
    if (!categoryId) {
      skipped += 1;
      warnings.push(`Skipped "${name}" — unknown category "${categoryName}"`);
      continue;
    }

    const price = toNumber(row['Base Price (£)'], 0);
    if (row['Base Price (£)'] === null || row['Base Price (£)'] === '' || row['Base Price (£)'] === undefined) {
      warnings.push(`"${name}" has blank price — inserted with price 0`);
    }

    const description =
      (typeof row.Description === 'string' && row.Description.trim()) ||
      'Description coming soon.';

    const offerPercentage = toNumber(row['Offer Percentage (%)'], 0);
    const stock = toNumber(row['Initial Stock Level'], 0);
    const finalPrice =
      offerPercentage > 0
        ? parseFloat((price - (price * offerPercentage) / 100).toFixed(2))
        : price;

    productsToInsert.push({
      name,
      description,
      ingredients: parseIngredients(row['Ingredients (comma separated)']),
      isVeg: toBool(row['Pure Veg'], true),
      price,
      offerPercentage,
      finalPrice,
      stock,
      isAvailable: toBool(row['Publicly Listed'], true),
      thumbnail: NO_IMAGE,
      gallery: [],
      category: categoryId,
      ratings: { average: 0, count: 0 },
      soldCount: 0,
      hasSpiceLevel: toBool(row['Spice Level Enabled'], false),
      extraOptions: [],
    });
  }

  const createdProducts = await Product.insertMany(productsToInsert, { ordered: true });
  console.log(`✅ Products inserted : ${createdProducts.length}`);
  if (skipped > 0) console.log(`⚠️  Products skipped  : ${skipped}`);

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    for (const w of warnings) console.log(`   • ${w}`);
  }

  console.log('\n📊 Summary');
  console.log(`   Categories : ${await Category.countDocuments()}`);
  console.log(`   Products   : ${await Product.countDocuments()}`);

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected — import complete');
  process.exit(0);
};

importMenu().catch(async (err) => {
  console.error('❌ Import failed:', err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
