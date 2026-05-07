import { productRepository, type ICreateProductInput } from '../../repositories/admin/product.repository.js';
import type { IProduct } from '../../models/Product.model.js';

export const productService = {
  create: async (input: ICreateProductInput): Promise<IProduct> => {
    return productRepository.createProduct(input);
  },

  getAll: async (filter: Record<string, unknown> = {}): Promise<IProduct[]> => {
    return productRepository.findWithFilters(filter);
  },

  getById: async (id: string): Promise<IProduct | null> => {
    return productRepository.findById(id);
  },

  getStats: async () => {
    return productRepository.getStats();
  },

  update: async (id: string, input: Partial<ICreateProductInput>): Promise<IProduct | null> => {
    // Fetch old product to get old image keys
    const oldProduct = await productRepository.findById(id);
    if (!oldProduct) return null;

    const oldThumbnailKey = oldProduct.thumbnail?.key;
    const oldGalleryKeys = oldProduct.gallery?.map(g => g.key) ?? [];

    return productRepository.updateProduct(id, input, oldThumbnailKey, oldGalleryKeys);
  },

  toggleAvailability: async (id: string, isAvailable: boolean): Promise<IProduct | null> => {
    return productRepository.updateById(id, { isAvailable });
  },

  delete: async (id: string): Promise<void> => {
    return productRepository.deleteWithImages(id);
  },
};
