import type { Document, Model, UpdateQuery } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: Record<string, unknown>): Promise<T | null> {
    return this.model.findOne(filter as any).exec();
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<T[]> {
    return this.model.find(filter as any).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
