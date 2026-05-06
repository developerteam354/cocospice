import { Product, type IProduct, type IImageAsset, type IExtraOption } from '../../models/Product.model.js';
import { BaseRepository } from '../base.repository.js';
import { deleteFromS3 } from '../../utils/s3.utils.js';

export interface ICreateProductInput {
  name: string;
  description: string;
  ingredients: string[];
  isVeg: boolean;
  price: number;
  offerPercentage: number;
  stock: number;
  isAvailable: boolean;
  category: string;
  hasSpiceLevel: boolean;
  extraOptions: IExtraOption[];
  thumbnail: IImageAsset;   // pre-uploaded S3 asset
  gallery: IImageAsset[];   // pre-uploaded S3 assets
}

export class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(Product);
  }

  async createProduct(input: ICreateProductInput): Promise<IProduct> {
    const finalPrice =
      input.offerPercentage > 0
        ? parseFloat((input.price - (input.price * input.offerPercentage) / 100).toFixed(2))
        : input.price;

    return Product.create({ ...input, finalPrice });
  }

  async updateProduct(id: string, input: Partial<ICreateProductInput>, oldThumbnailKey?: string, oldGalleryKeys?: string[]): Promise<IProduct | null> {
    // Calculate final price if price or offer changed
    let finalPrice: number | undefined;
    if (input.price !== undefined || input.offerPercentage !== undefined) {
      const price = input.price ?? 0;
      const offer = input.offerPercentage ?? 0;
      finalPrice = offer > 0
        ? parseFloat((price - (price * offer) / 100).toFixed(2))
        : price;
    }

    // Delete old S3 images if new ones are provided
    const deletePromises: Promise<void>[] = [];
    
    if (input.thumbnail && oldThumbnailKey && oldThumbnailKey !== input.thumbnail.key) {
      deletePromises.push(deleteFromS3(oldThumbnailKey));
    }
    
    if (input.gallery && oldGalleryKeys && oldGalleryKeys.length > 0) {
      const newKeys = input.gallery.map(g => g.key);
      const keysToDelete = oldGalleryKeys.filter(k => !newKeys.includes(k));
      deletePromises.push(...keysToDelete.map(deleteFromS3));
    }

    if (deletePromises.length > 0) {
      await Promise.allSettled(deletePromises);
    }

    const updateData = finalPrice !== undefined 
      ? { ...input, finalPrice }
      : input;

    return Product.findByIdAndUpdate(id, updateData, { new: true })
      .populate('category', 'name')
      .exec();
  }

  async deleteWithImages(id: string): Promise<void> {
    const product = await Product.findById(id).exec();
    if (!product) return;
    const keys = [product.thumbnail.key, ...product.gallery.map((g) => g.key)];
    await Promise.allSettled(keys.map(deleteFromS3));
    await Product.findByIdAndDelete(id).exec();
  }

  async findByCategory(categoryId: string): Promise<IProduct[]> {
    return Product.find({ category: categoryId, isAvailable: true })
      .populate('category', 'name').exec();
  }

  async searchByName(query: string): Promise<IProduct[]> {
    return Product.find(
      { $text: { $search: query }, isAvailable: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('category', 'name').exec();
  }

  async findWithFilters(filter: Record<string, unknown> = {}): Promise<IProduct[]> {
    return Product.find(filter).populate('category', 'name').exec();
  }

  async getStats(): Promise<{ total: number; available: number; outOfStock: number; unlisted: number }> {
    const [total, available, outOfStock, unlisted] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isAvailable: true, stock: { $gt: 0 } }),
      Product.countDocuments({ isAvailable: true, stock: 0 }),
      Product.countDocuments({ isAvailable: false }),
    ]);
    return { total, available, outOfStock, unlisted };
  }

  async incrementSoldCount(id: string, qty: number = 1): Promise<void> {
    await Product.findByIdAndUpdate(id, { $inc: { soldCount: qty } }).exec();
  }

  async updateRatings(id: string, average: number, count: number): Promise<void> {
    await Product.findByIdAndUpdate(id, {
      'ratings.average': average,
      'ratings.count': count,
    }).exec();
  }
}

export const productRepository = new ProductRepository();
