import { categoryRepository } from '../../repositories/admin/category.repository.js';
import type { ICategory } from '../../models/Category.model.js';
import type { ICreateCategoryInput, IUpdateCategoryInput } from '../../repositories/admin/category.repository.js';

export const categoryService = {
  getAll: (): Promise<ICategory[]> =>
    categoryRepository.findAll(),

  create: async (input: ICreateCategoryInput): Promise<ICategory> => {
    // Normalize name: trim and check for duplicates (case-insensitive)
    const normalizedName = input.name.trim();
    
    if (!normalizedName || normalizedName.length < 2) {
      throw Object.assign(
        new Error('Category name is required (min 2 characters)'), 
        { statusCode: 400 }
      );
    }

    const exists = await categoryRepository.findByName(normalizedName);
    if (exists) {
      throw Object.assign(
        new Error('Category name already exists'), 
        { statusCode: 409 }
      );
    }

    return categoryRepository.createCategory({
      ...input,
      name: normalizedName,
      description: input.description?.trim() || '',
    });
  },

  update: async (id: string, input: IUpdateCategoryInput): Promise<ICategory | null> => {
    // If name is being updated, check for duplicates
    if (input.name) {
      const normalizedName = input.name.trim();
      
      if (normalizedName.length < 2) {
        throw Object.assign(
          new Error('Category name must be at least 2 characters'), 
          { statusCode: 400 }
        );
      }

      const exists = await categoryRepository.findByName(normalizedName);
      // Check if exists and it's not the same category being updated
      if (exists && exists._id.toString() !== id) {
        throw Object.assign(
          new Error('Category name already exists'), 
          { statusCode: 409 }
        );
      }

      input.name = normalizedName;
    }

    if (input.description !== undefined) {
      input.description = input.description.trim();
    }

    return categoryRepository.updateCategory(id, input);
  },

  toggle: (id: string): Promise<ICategory | null> =>
    categoryRepository.toggleListed(id),

  delete: (id: string): Promise<void> =>
    categoryRepository.deleteCategory(id),
};
