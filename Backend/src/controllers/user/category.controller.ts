import type { Request, Response, NextFunction } from 'express';
import { userCategoryRepository } from '../../repositories/user/category.repository.js';

export const userCategoryController = {
  /**
   * GET /api/user/categories
   * Fetch all active categories
   */
  getAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { withProductCount } = req.query;

      let categories;
      if (withProductCount === 'true') {
        categories = await userCategoryRepository.findWithProductCount();
      } else {
        categories = await userCategoryRepository.findAll();
      }

      res.status(200).json({ categories });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/user/categories/:id
   * Fetch a single category by ID
   */
  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await userCategoryRepository.findById(id);

      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }

      res.status(200).json({ category });
    } catch (err) {
      next(err);
    }
  },
};
