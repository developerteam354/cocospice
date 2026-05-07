import { privateApi } from './api';
import type {
  IProductsResponse,
  IProductStats,
  IProductFilters,
  IProduct,
  IImageAsset,
  IExtraOption,
} from '@/types/product';
import type { IProductCategory } from '@/types/product';

export interface ICreateProductPayload {
  name: string;
  description: string;
  ingredients: string[];
  isVeg: boolean;
  price: number;
  offerPercentage: number;
  stock: number;
  isAvailable: boolean;
  category: string;
  extraOptions: IExtraOption[];
  thumbnail: IImageAsset;
  gallery: IImageAsset[];
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/admin`;

/**
 * Convert a raw S3 URL or key into a backend proxy URL.
 * The proxy endpoint streams the private S3 object through the backend,
 * so the S3 bucket can remain private.
 *
 * Accepts:
 *   - Full S3 URL:  https://bucket.s3.region.amazonaws.com/folder/file.jpg
 *   - S3 key only:  folder/file.jpg
 */
export function toProxyUrl(urlOrKey: string): string {
  if (!urlOrKey) return '';
  // If it's already a proxy URL, return as-is
  if (urlOrKey.includes('/upload/image')) return urlOrKey;
  // Extract the key from a full S3 URL
  const s3Match = urlOrKey.match(/amazonaws\.com\/(.+)$/);
  const key = s3Match ? s3Match[1] : urlOrKey;
  return `${API_BASE}/upload/image?key=${encodeURIComponent(key)}`;
}

const productService = {
  // Upload a single image to S3 — returns { url, key } with a proxy URL
  uploadImage: async (file: File, folder: string = 'products'): Promise<IImageAsset> => {
    const fd = new FormData();
    fd.append('image', file);
    
    const { data } = await privateApi.post<IImageAsset>(
      `/upload?folder=${encodeURIComponent(folder)}`,
      fd
    );

    // Replace the direct S3 URL with a backend proxy URL so the private
    // bucket is never accessed directly from the browser.
    return {
      ...data,
      url: toProxyUrl(data.key ?? data.url),
    };
  },

  // Delete an image from S3 by key
  deleteImage: async (key: string): Promise<void> => {
    await privateApi.delete('/upload', { data: { key } });
  },

  // Create product with pre-uploaded S3 assets — JSON body
  create: async (payload: ICreateProductPayload): Promise<{ product: IProduct; message: string }> => {
    const { data } = await privateApi.post<{ product: IProduct; message: string }>(
      '/products',
      payload
    );
    return data;
  },

  getAll: async (filters: IProductFilters = {}): Promise<IProductsResponse> => {
    const params = new URLSearchParams();
    if (filters.search)    params.set('search', filters.search);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.category)  params.set('category', filters.category);
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters.sortBy)    params.set('sortBy', filters.sortBy);
    if (filters.page)      params.set('page', String(filters.page));
    if (filters.limit)     params.set('limit', String(filters.limit));

    const { data } = await privateApi.get<IProductsResponse>(
      `/products?${params.toString()}`
    );
    return data;
  },

  getById: async (id: string): Promise<IProduct> => {
    const { data } = await privateApi.get<{ product: IProduct }>(`/products/${id}`);
    return data.product;
  },

  getStats: async (): Promise<IProductStats> => {
    const { data } = await privateApi.get<IProductStats>('/products/stats');
    return data;
  },

  update: async (id: string, payload: Partial<ICreateProductPayload>): Promise<{ product: IProduct; message: string }> => {
    const { data } = await privateApi.patch<{ product: IProduct; message: string }>(
      `/products/${id}`,
      payload
    );
    return data;
  },

  toggleAvailability: async (id: string, isAvailable: boolean): Promise<void> => {
    await privateApi.patch(`/products/${id}/availability`, { isAvailable });
  },

  delete: async (id: string): Promise<void> => {
    await privateApi.delete(`/products/${id}`);
  },

  getCategories: async (): Promise<IProductCategory[]> => {
    const { data } = await privateApi.get<{ categories: IProductCategory[] }>('/categories');
    return data.categories;
  },
};

export default productService;
