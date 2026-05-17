import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import reviewService, { type IReview, type ISubmitReviewData } from '../../services/reviewService';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const submitReview = createAsyncThunk<IReview, ISubmitReviewData>(
  'review/submitReview',
  async (data, { rejectWithValue }) => {
    try {
      return await reviewService.submitReview(data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit review';
      return rejectWithValue(message);
    }
  }
);

export const fetchApprovedReviews = createAsyncThunk<IReview[], string>(
  'review/fetchApprovedReviews',
  async (productId, { rejectWithValue }) => {
    try {
      return await reviewService.getApprovedReviews(productId);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch reviews';
      return rejectWithValue(message);
    }
  }
);

export const fetchMyReviews = createAsyncThunk<IReview[]>(
  'review/fetchMyReviews',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewService.getMyReviews();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch your reviews';
      return rejectWithValue(message);
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface ReviewState {
  reviews: IReview[];
  myReviews: IReview[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  myReviews: [],
  loading: false,
  submitting: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearReviews(state) {
      state.reviews = [];
    },
  },
  extraReducers: (builder) => {
    // ── submitReview ─────────────────────────────────────────────────────────
    builder
      .addCase(submitReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action: PayloadAction<IReview>) => {
        state.submitting = false;
        state.myReviews.unshift(action.payload);
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    // ── fetchApprovedReviews ─────────────────────────────────────────────────
    builder
      .addCase(fetchApprovedReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovedReviews.fulfilled, (state, action: PayloadAction<IReview[]>) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchApprovedReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── fetchMyReviews ───────────────────────────────────────────────────────
    builder
      .addCase(fetchMyReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReviews.fulfilled, (state, action: PayloadAction<IReview[]>) => {
        state.loading = false;
        state.myReviews = action.payload;
      })
      .addCase(fetchMyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
