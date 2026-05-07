import type { Document, Model, UpdateQuery } from 'mongoose';

// Extract the filter type directly from Model.find() — avoids importing
// FilterQuery which has inconsistent named-export support across mongoose versions.
type ModelFilter<T> = Parameters<Model<T>['find']>[0];

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: ModelFilter<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findAll(filter: ModelFilter<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
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
