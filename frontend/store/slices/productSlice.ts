import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { MenuItem } from '../../types';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

interface ProductState {
  items: MenuItem[];
  currentProduct: MenuItem | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

const initialState: ProductState = {
  items: [],
  currentProduct: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 1,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (filters?: {
    categoryId?: string;
    search?: string;
    isVeg?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isVeg !== undefined) params.append('isVeg', String(filters.isVeg));
    if (filters?.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await fetch(`${API_BASE_URL}/user/products?${params}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();

    // Transform backend response to match frontend MenuItem interface
    return {
      products: data.products.map((p: any) => ({
          id: p._id,
          name: p.name,
          description: p.description,
          price: p.finalPrice || p.price,
          image: p.thumbnail?.url || '',
          images: p.gallery?.map((g: any) => g.url) || [],
          ingredients: p.ingredients || [],
          categoryId: typeof p.category === 'object' ? p.category._id : p.category,
          extraOptions: (p.extraOptions || []).map((opt: any) =>
            typeof opt === 'string' ? { name: opt, price: 0 } : { name: opt.name, price: Number(opt.price ?? 0) }
          ),
          isVeg: p.isVeg,
          stock: p.stock,
          isAvailable: p.isAvailable,
          ratings: p.ratings,
          soldCount: p.soldCount,
          hasSpiceLevel: p.hasSpiceLevel,
        })),
      total: data.total,
      page: data.page,
      totalPages: data.totalPages,
    };
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/user/products/${id}`);
    if (!response.ok) throw new Error('Product not found');
    const data = await response.json();
    
    // Transform backend response to match frontend MenuItem interface
    const p = data.product;
    return {
      id: p._id,
      name: p.name,
      description: p.description,
      price: p.finalPrice || p.price,
      image: p.thumbnail?.url || '',
      images: p.gallery?.map((g: any) => g.url) || [],
      ingredients: p.ingredients || [],
      categoryId: typeof p.category === 'object' ? p.category._id : p.category,
      extraOptions: (p.extraOptions || []).map((opt: any) =>
        typeof opt === 'string' ? { name: opt, price: 0 } : { name: opt.name, price: Number(opt.price ?? 0) }
      ),
      isVeg: p.isVeg,
      stock: p.stock,
      isAvailable: p.isAvailable,
      ratings: p.ratings,
      soldCount: p.soldCount,
    };
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchByCategory',
  async (categoryId: string) => {
    const response = await fetch(`${API_BASE_URL}/user/products/category/${categoryId}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    
    return data.products.map((p: any) => ({
      id: p._id,
      name: p.name,
      description: p.description,
      price: p.finalPrice || p.price,
      image: p.thumbnail?.url || '',
      images: p.gallery?.map((g: any) => g.url) || [],
      ingredients: p.ingredients || [],
      categoryId: typeof p.category === 'object' ? p.category._id : p.category,
      extraOptions: (p.extraOptions || []).map((opt: any) =>
        typeof opt === 'string' ? { name: opt, price: 0 } : { name: opt.name, price: Number(opt.price ?? 0) }
      ),
      isVeg: p.isVeg,
      stock: p.stock,
      isAvailable: p.isAvailable,
      ratings: p.ratings,
      soldCount: p.soldCount,
    }));
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeatured',
  async (limit?: number) => {
    const lim = limit ?? 10;
    const response = await fetch(`${API_BASE_URL}/user/products/featured?limit=${lim}`);
    if (!response.ok) throw new Error('Failed to fetch featured products');
    const data = await response.json();
    
    return data.products.map((p: any) => ({
      id: p._id,
      name: p.name,
      description: p.description,
      price: p.finalPrice || p.price,
      image: p.thumbnail?.url || '',
      images: p.gallery?.map((g: any) => g.url) || [],
      ingredients: p.ingredients || [],
      categoryId: typeof p.category === 'object' ? p.category._id : p.category,
      extraOptions: (p.extraOptions || []).map((opt: any) =>
        typeof opt === 'string' ? { name: opt, price: 0 } : { name: opt.name, price: Number(opt.price ?? 0) }
      ),
      isVeg: p.isVeg,
      stock: p.stock,
      isAvailable: p.isAvailable,
      ratings: p.ratings,
      soldCount: p.soldCount,
    }));
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product';
      })
      // Fetch products by category
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch featured products';
      });
  },
});

export const { clearCurrentProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
