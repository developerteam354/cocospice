import { Product } from '../../models/Product.model.js';
import type { FilterQuery } from 'mongoose';
import type { IProduct } from '../../models/Product.model.js';

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
    const query: FilterQuery<IProduct> = {
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
      query.finalPrice = {};
      if (filters.minPrice !== undefined) {
        query.finalPrice.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query.finalPrice.$lte = filters.maxPrice;
      }
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

    return { products, total };
  },

  /**
   * Find a single product by ID (only if available)
   */
  findById: async (id: string) => {
    return Product.findOne({ _id: id, isAvailable: true })
      .populate('category', 'name')
      .lean();
  },

  /**
   * Find products by category
   */
  findByCategory: async (categoryId: string, limit = 20) => {
    return Product.find({ category: categoryId, isAvailable: true })
      .populate('category', 'name')
      .sort({ soldCount: -1 })
      .limit(limit)
      .lean();
  },

  /**
   * Find featured/popular products
   */
  findFeatured: async (limit = 10) => {
    return Product.find({ isAvailable: true })
      .populate('category', 'name')
      .sort({ soldCount: -1, 'ratings.average': -1 })
      .limit(limit)
      .lean();
  },
};
