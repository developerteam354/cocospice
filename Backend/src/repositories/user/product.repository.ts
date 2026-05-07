import { Product } from '../../models/Product.model.js';
import type { IProduct, IImageAsset } from '../../models/Product.model.js';

// Use Record<string, unknown> for query objects — avoids importing FilterQuery
// which has inconsistent named-export support across mongoose versions on Render.
type MongoQuery = Record<string, unknown>;

// ─── URL normalisation ────────────────────────────────────────────────────────
// Products saved by the admin store a backend proxy URL in thumbnail.url
// (e.g. http://localhost:5000/api/admin/upload/image?key=products/...).
// The user frontend cannot hit that admin-only route, so we reconstruct the
// direct public S3 URL from the stored key before returning to the client.

const bucket = process.env.AWS_S3_BUCKET!;
const region = process.env.AWS_REGION!;

function toS3Url(asset: IImageAsset): IImageAsset {
  if (!asset?.key) return asset;
  return {
    key: asset.key,
    url: `https://${bucket}.s3.${region}.amazonaws.com/${asset.key}`,
  };
}

function normaliseProduct(p: any): any {
  if (!p) return p;
  return {
    ...p,
    thumbnail: p.thumbnail ? toS3Url(p.thumbnail) : p.thumbnail,
    gallery:   Array.isArray(p.gallery) ? p.gallery.map(toS3Url) : p.gallery,
  };
}

export const userProductRepository = {
  /**
   * Find all listed (available) products with optional filters
   */
  findAll: async (filters: {
    categoryId?: string;
    search?: string;
    isVeg?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
    limit?: number;
    skip?: number;
  }) => {
    const query: MongoQuery = {
      isAvailable: true, // Only show available products to users
    };

    // Category filter
    if (filters.categoryId) {
      query.category = filters.categoryId;
    }

    // Search filter (name or description)
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Vegetarian filter
    if (filters.isVeg !== undefined) {
      query.isVeg = filters.isVeg;
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const finalPrice: Record<string, number> = {};
      if (filters.minPrice !== undefined) finalPrice.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) finalPrice.$lte = filters.maxPrice;
      query.finalPrice = finalPrice;
    }

    // Build sort object
    let sort: Record<string, 1 | -1> = { createdAt: -1 }; // Default: newest first
    if (filters.sortBy === 'price_asc') {
      sort = { finalPrice: 1 };
    } else if (filters.sortBy === 'price_desc') {
      sort = { finalPrice: -1 };
    } else if (filters.sortBy === 'popular') {
      sort = { soldCount: -1 };
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sort)
      .skip(filters.skip ?? 0)
      .limit(filters.limit ?? 50)
      .lean();

    const total = await Product.countDocuments(query);

    return { products: products.map(normaliseProduct), total };
  },

  /**
   * Find a single product by ID (only if available)
   */
  findById: async (id: string) => {
    const product = await Product.findOne({ _id: id, isAvailable: true })
      .populate('category', 'name')
      .lean();
    return normaliseProduct(product);
  },

  /**
   * Find products by category
   */
  findByCategory: async (categoryId: string, limit = 20) => {
    const products = await Product.find({ category: categoryId, isAvailable: true })
      .populate('category', 'name')
      .sort({ soldCount: -1 })
      .limit(limit)
      .lean();
    return products.map(normaliseProduct);
  },

  /**
   * Find featured/popular products
   */
  findFeatured: async (limit = 10) => {
    const products = await Product.find({ isAvailable: true })
      .populate('category', 'name')
      .sort({ soldCount: -1, 'ratings.average': -1 })
      .limit(limit)
      .lean();
    return products.map(normaliseProduct);
  },
};
