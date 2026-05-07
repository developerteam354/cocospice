import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Category } from '../../types';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

interface CategoryState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (withProductCount?: boolean) => {
    const url = withProductCount
      ? `${API_BASE_URL}/user/categories?withProductCount=true`
      : `${API_BASE_URL}/user/categories`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    
    // Transform backend response to match frontend Category interface
    return data.categories.map((c: any) => ({
      id: c._id,
      name: c.name,
      categoryImage: c.categoryImage || '',
      productCount: c.productCount,
    }));
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchById',
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/user/categories/${id}`);
    if (!response.ok) throw new Error('Category not found');
    const data = await response.json();
    
    return {
      id: data.category._id,
      name: data.category.name,
      categoryImage: data.category.categoryImage || '',
    };
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Fetch category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the category in the items array
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch category';
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
