import type { Request, Response, NextFunction } from 'express';
import { categoryService } from '../../services/admin/category.service.js';
import { uploadRepository } from '../../repositories/admin/upload.repository.js';

export const categoryController = {
  getAll: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await categoryService.getAll();
      res.status(200).json({ categories });
    } catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description } = req.body as { name: string; description?: string };

      if (!name || name.trim().length < 2) {
        res.status(400).json({ message: 'Category name is required (min 2 characters)' });
        return;
      }

      let categoryImage = '';
      
      // Handle category image upload if provided
      if (req.file) {
        const uploadResult = await uploadRepository.uploadImage(req.file, 'categories');
        categoryImage = uploadResult.url;
      }

      const category = await categoryService.create({ 
        name: name.trim(), 
        description: description?.trim() ?? '',
        categoryImage
      });
      res.status(201).json({ category, message: 'Category created' });
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input = req.body as { name?: string; description?: string };
      
      // Trim values if provided
      const trimmedInput: { name?: string; description?: string; categoryImage?: string } = {};
      if (input.name !== undefined) trimmedInput.name = input.name.trim();
      if (input.description !== undefined) trimmedInput.description = input.description.trim();
      
      // Handle category image upload if provided
      if (req.file) {
        const uploadResult = await uploadRepository.uploadImage(req.file, 'categories');
        trimmedInput.categoryImage = uploadResult.url;
      }
      
      const category = await categoryService.update(id, trimmedInput);
      if (!category) { res.status(404).json({ message: 'Category not found' }); return; }
      res.status(200).json({ category, message: 'Category updated' });
    } catch (err) { next(err); }
  },

  toggle: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await categoryService.toggle(req.params.id);
      if (!category) { res.status(404).json({ message: 'Category not found' }); return; }
      res.status(200).json({ category, message: `Category ${category.isListed ? 'listed' : 'unlisted'}` });
    } catch (err) { next(err); }
  },

  delete: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await categoryService.delete(req.params.id);
      res.status(200).json({ message: 'Category deleted' });
    } catch (err) { next(err); }
  },
};
