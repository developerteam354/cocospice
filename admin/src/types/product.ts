export interface IImageAsset {
  url: string;
  key: string;
}

export interface IProductCategory {
  _id: string;
  name: string;
}

export interface IMenuOption {
  name: string;
  choices: string[];
  required: boolean;
}

export interface IExtraOption {
  name: string;
  price: number;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  ingredients: string[];
  isVeg: boolean;
  price: number;
  offerPercentage: number;
  finalPrice: number;
  stock: number;
  isAvailable: boolean;
  thumbnail: IImageAsset;
  gallery: IImageAsset[];
  category: IProductCategory;
  ratings: { average: number; count: number };
  soldCount: number;
  hasSpiceLevel: boolean;
  extraOptions: IExtraOption[];
  productCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProductFilters {
  search?: string;
  status?: 'all' | 'available' | 'unavailable' | 'outofstock';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export interface IProductsResponse {
  products: IProduct[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IProductStats {
  total: number;
  available: number;
  outOfStock: number;
  unlisted: number;
}
