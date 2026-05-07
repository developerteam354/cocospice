import { Category, type ICategory } from '../../models/Category.model.js';
import { BaseRepository } from '../base.repository.js';

export interface ICreateCategoryInput {
  name:          string;
  description:   string;
  categoryImage?: string;
}

export interface IUpdateCategoryInput {
  name?:          string;
  description?:   string;
  categoryImage?: string;
}

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor() { super(Category); }

  async findAll(): Promise<ICategory[]> {
    return Category.find().sort({ createdAt: -1 }).exec();
  }

  async findByName(name: string): Promise<ICategory | null> {
    return Category.findOne({ name: new RegExp(`^${name}$`, 'i') }).exec();
  }

  async createCategory(input: ICreateCategoryInput): Promise<ICategory> {
    return Category.create(input);
  }

  async updateCategory(id: string, input: IUpdateCategoryInput): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async toggleListed(id: string): Promise<ICategory | null> {
    const cat = await Category.findById(id).exec();
    if (!cat) return null;
    cat.isListed = !cat.isListed;
    return cat.save();
  }

  async deleteCategory(id: string): Promise<void> {
    await Category.findByIdAndDelete(id).exec();
  }
}

export const categoryRepository = new CategoryRepository();
