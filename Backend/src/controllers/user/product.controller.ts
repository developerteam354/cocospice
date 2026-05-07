import type { Request, Response, NextFunction } from 'express';
import { userProductRepository } from '../../repositories/user/product.repository.js';

export const userProductController = {
  /**
   * GET /api/user/products
   * Fetch all listed products with optional filters
   */
  getAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        categoryId,
        search,
        isVeg,
        minPrice,
        maxPrice,
        sortBy,
        page = '1',
        limit = '50',
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const filters = {
        categoryId: categoryId as string | undefined,
        search: search as string | undefined,
        isVeg: isVeg === 'true' ? true : isVeg === 'false' ? false : undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        sortBy: sortBy as 'price_asc' | 'price_desc' | 'newest' | 'popular' | undefined,
        limit: limitNum,
        skip,
      };

      const { products, total } = await userProductRepository.findAll(filters);

      res.status(200).json({
        products,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/user/products/:id
   * Fetch a single product by ID
   */
  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await userProductRepository.findById(id);

      if (!product) {
        res.status(404).json({ message: 'Product not found or unavailable' });
        return;
      }

      res.status(200).json({ product });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/user/products/category/:categoryId
   * Fetch products by category
   */
  getByCategory: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { categoryId } = req.params;
      const { limit = '20' } = req.query;

      const products = await userProductRepository.findByCategory(
        categoryId,
        parseInt(limit as string, 10)
      );

      res.status(200).json({ products });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/user/products/featured
   * Fetch featured/popular products
   */
  getFeatured: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = '10' } = req.query;
      const products = await userProductRepository.findFeatured(
        parseInt(limit as string, 10)
      );

      res.status(200).json({ products });
    } catch (err) {
      next(err);
    }
  },
};
