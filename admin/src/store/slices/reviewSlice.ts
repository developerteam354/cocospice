import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import adminReviewService from '@/services/reviewService';
import type { IReview, IReviewOverallStats } from '@/types/review';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAllReviews = createAsyncThunk<IReview[]>(
  'reviews/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await adminReviewService.getAll();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch reviews';
      return rejectWithValue(message);
    }
  }
);

export const fetchReviewsByProduct = createAsyncThunk<IReview[], string>(
  'reviews/fetchByProduct',
  async (productId, { rejectWithValue }) => {
    try {
      return await adminReviewService.getByProduct(productId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch product reviews';
      return rejectWithValue(message);
    }
  }
);

export const fetchReviewOverallStats = createAsyncThunk<IReviewOverallStats>(
  'reviews/fetchOverallStats',
  async (_, { rejectWithValue }) => {
    try {
      return await adminReviewService.getOverallStats();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch review stats';
      return rejectWithValue(message);
    }
  }
);

export const toggleReviewApproval = createAsyncThunk<IReview, string>(
  'reviews/toggleApproval',
  async (reviewId, { rejectWithValue }) => {
    try {
      return await adminReviewService.toggleApproval(reviewId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to toggle review approval';
      return rejectWithValue(message);
    }
  }
);

export const deleteReview = createAsyncThunk<string, string>(
  'reviews/delete',
  async (reviewId, { rejectWithValue }) => {
    try {
      await adminReviewService.deleteReview(reviewId);
      return reviewId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete review';
      return rejectWithValue(message);
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface ReviewState {
  reviews: IReview[];
  overallStats: IReviewOverallStats | null;
  loading: boolean;
  updating: string | null; // reviewId being updated
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  overallStats: null,
  loading: false,
  updating: null,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchAllReviews ──────────────────────────────────────────────────────
    builder
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action: PayloadAction<IReview[]>) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── fetchReviewsByProduct ────────────────────────────────────────────────
    builder
      .addCase(fetchReviewsByProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByProduct.fulfilled, (state, action: PayloadAction<IReview[]>) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviewsByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── fetchReviewOverallStats ──────────────────────────────────────────────
    builder
      .addCase(fetchReviewOverallStats.fulfilled, (state, action: PayloadAction<IReviewOverallStats>) => {
        state.overallStats = action.payload;
      });

    // ── toggleReviewApproval ─────────────────────────────────────────────────
    builder
      .addCase(toggleReviewApproval.pending, (state, action) => {
        state.updating = action.meta.arg;
      })
      .addCase(toggleReviewApproval.fulfilled, (state, action: PayloadAction<IReview>) => {
        state.updating = null;
        const idx = state.reviews.findIndex(r => r._id === action.payload._id);
        if (idx !== -1) state.reviews[idx] = action.payload;
        // Keep overallStats in sync — approved/pending counts change on every toggle
        if (state.overallStats) {
          if (action.payload.isApproved) {
            state.overallStats.approved = Math.min(state.overallStats.total, state.overallStats.approved + 1);
            state.overallStats.pending  = Math.max(0, state.overallStats.pending - 1);
          } else {
            state.overallStats.approved = Math.max(0, state.overallStats.approved - 1);
            state.overallStats.pending  = Math.min(state.overallStats.total, state.overallStats.pending + 1);
          }
        }
      })
      .addCase(toggleReviewApproval.rejected, (state, action) => {
        state.updating = null;
        state.error = action.payload as string;
      });

    // ── deleteReview ─────────────────────────────────────────────────────────
    builder
      .addCase(deleteReview.pending, (state, action) => {
        state.updating = action.meta.arg;
      })
      .addCase(deleteReview.fulfilled, (state, action: PayloadAction<string>) => {
        state.updating = null;
        // Find the review before removing so we can update the right stat bucket
        const deleted = state.reviews.find(r => r._id === action.payload);
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
        if (state.overallStats && deleted) {
          state.overallStats.total = Math.max(0, state.overallStats.total - 1);
          if (deleted.isApproved) {
            state.overallStats.approved = Math.max(0, state.overallStats.approved - 1);
          } else {
            state.overallStats.pending = Math.max(0, state.overallStats.pending - 1);
          }
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.updating = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = reviewSlice.actions;
export default reviewSlice.reducer;
