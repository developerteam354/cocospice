# Product Feedback and Rating System - Implementation Guide

## Overview
Comprehensive product review and rating system allowing users to leave feedback on delivered/collected orders, with admin moderation capabilities.

---

## Phase 1: Backend Implementation ✅ COMPLETE

### Database Schema

**Review Model** (`Backend/src/models/Review.model.ts`)

```typescript
{
  userId: ObjectId (ref: User, required, indexed)
  productId: ObjectId (ref: Product, required, indexed)
  orderId: ObjectId (ref: Order, required, indexed)
  rating: Number (1-5, required)
  comment: String (required, max: 1000 chars)
  isApproved: Boolean (default: false, indexed)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- Compound unique index: `{ userId, productId, orderId }` (prevents duplicate reviews)
- Compound index: `{ productId, isApproved }` (fast approved review queries)

---

### API Endpoints

#### User Endpoints (`/api/user/reviews`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Submit a review | Required |
| GET | `/product/:productId` | Get approved reviews for product | Public |
| GET | `/my-reviews` | Get user's own reviews | Required |
| GET | `/can-review/:orderId/:productId` | Check if user can review | Required |

**POST / - Submit Review**
```json
Request:
{
  "productId": "64abc...",
  "orderId": "64def...",
  "rating": 5,
  "comment": "Excellent food! Highly recommend..."
}

Response (201):
{
  "message": "Review submitted successfully. It will be visible after admin approval.",
  "review": { ... }
}
```

**Validation Rules:**
- Order must belong to user
- Order status must be 'Delivered' or 'Collected'
- Product must exist in the order
- User cannot review same product twice in same order
- Rating: 1-5
- Comment: 10-1000 characters

---

#### Admin Endpoints (`/api/admin/reviews`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all reviews (approved + unapproved) |
| GET | `/stats` | Get overall review statistics |
| GET | `/product/:productId` | Get all reviews for a product |
| GET | `/product/:productId/stats` | Get product review stats |
| PATCH | `/:id/toggle-approval` | Toggle review approval status |
| DELETE | `/:id` | Delete a review |

**GET /product/:productId/stats - Product Statistics**
```json
Response:
{
  "stats": {
    "totalReviews": 45,
    "averageRating": 4.3,
    "ratingDistribution": {
      "1": 2,
      "2": 3,
      "3": 8,
      "4": 15,
      "5": 17
    }
  }
}
```

**PATCH /:id/toggle-approval - Toggle Approval**
```json
Response:
{
  "message": "Review approved successfully",
  "review": { ..., "isApproved": true }
}
```

---

### Services

**User Review Service** (`services/user/review.service.ts`)
- `submitReview()` - Create new review with validation
- `getApprovedReviewsByProduct()` - Public approved reviews
- `getUserReviews()` - User's own reviews
- `canReviewProduct()` - Check eligibility

**Admin Review Service** (`services/admin/review.service.ts`)
- `getAllReviews()` - All reviews (admin view)
- `getReviewsByProduct()` - All reviews for a product
- `getProductReviewStats()` - Calculate stats
- `toggleReviewApproval()` - Approve/hide review
- `deleteReview()` - Remove review
- `getOverallStats()` - System-wide statistics

---

### Files Created (Backend)

1. ✅ `Backend/src/models/Review.model.ts`
2. ✅ `Backend/src/services/user/review.service.ts`
3. ✅ `Backend/src/services/admin/review.service.ts`
4. ✅ `Backend/src/controllers/user/review.controller.ts`
5. ✅ `Backend/src/controllers/admin/review.controller.ts`
6. ✅ `Backend/src/routes/user/review.routes.ts`
7. ✅ `Backend/src/routes/admin/review.routes.ts`
8. ✅ Updated: `Backend/src/routes/user/index.ts`
9. ✅ Updated: `Backend/src/routes/admin/index.ts`

**Status:** ✅ All backend files created with no TypeScript errors

---

## Phase 2: Frontend User Implementation (TODO)

### Components to Create

1. **ReviewModal Component** (`frontend/components/ReviewModal/ReviewModal.tsx`)
   - 5-star interactive rating system
   - Textarea for comment (10-1000 chars)
   - Character counter
   - Submit button
   - Loading states

2. **ProductReviews Component** (`frontend/components/ProductReviews/ProductReviews.tsx`)
   - Display approved reviews
   - Star rating display
   - User name and date
   - Review text
   - Average rating summary

3. **Update My Orders Page** (`frontend/app/profile/orders/page.tsx`)
   - Add "Leave Feedback" button for each product
   - Show button only for delivered/collected orders
   - Check if already reviewed
   - Open ReviewModal on click

### Services to Create

1. **Review Service** (`frontend/services/reviewService.ts`)
   ```typescript
   - submitReview(productId, orderId, rating, comment)
   - getApprovedReviews(productId)
   - getMyReviews()
   - canReview(orderId, productId)
   ```

### Redux Store

1. **Review Slice** (`frontend/store/slices/reviewSlice.ts`)
   - State: reviews, loading, error
   - Thunks: submitReview, fetchReviews, fetchMyReviews

---

## Phase 3: Admin Dashboard Implementation (TODO)

### New Sidebar Page: Feedbacks

1. **Feedbacks Page** (`admin/src/app/(admin)/admin/feedbacks/page.tsx`)
   - Table/card layout showing all reviews
   - Columns: User, Product, Rating, Comment, Date, Status
   - Toggle switch for approve/hide
   - Delete button
   - Filter by status (All/Approved/Pending)
   - Search functionality

2. **Update Product Details** (`admin/src/app/(admin)/admin/products/[id]/page.tsx`)
   - Add "Reviews" section
   - Show average rating
   - Display rating distribution chart
   - List all reviews for this product
   - Quick approve/hide toggle

### Components to Create

1. **ReviewCard Component** (`admin/src/components/admin/ReviewCard.tsx`)
   - User info with avatar
   - Product thumbnail and name
   - Star rating display
   - Review text
   - Approval toggle switch
   - Delete button
   - Timestamp

2. **RatingStats Component** (`admin/src/components/admin/RatingStats.tsx`)
   - Average rating (large display)
   - Total reviews count
   - Rating distribution bars (1-5 stars)

### Services to Create

1. **Review Service** (`admin/src/services/reviewService.ts`)
   ```typescript
   - getAllReviews()
   - getReviewsByProduct(productId)
   - getProductStats(productId)
   - toggleApproval(reviewId)
   - deleteReview(reviewId)
   - getOverallStats()
   ```

### Redux Store

1. **Review Slice** (`admin/src/store/slices/reviewSlice.ts`)
   - State: reviews, stats, loading, updating
   - Thunks: fetchReviews, toggleApproval, deleteReview

### Update Sidebar

Add new menu item:
```typescript
{
  label: 'Feedbacks',
  icon: MessageSquare,
  href: '/admin/feedbacks',
  badge: pendingReviewsCount
}
```

---

## UI/UX Specifications

### Star Rating Component
- Interactive stars (hover effect)
- Click to select rating
- Half-star support (optional)
- Colors: Empty (gray-300), Filled (yellow-400)
- Size: 24px (user), 20px (display)

### Review Card Design
- White background
- Rounded corners (16px)
- Shadow on hover
- User avatar (40px circle)
- Product thumbnail (60px)
- 5-star display
- Comment with "Read more" for long text
- Timestamp (relative: "2 days ago")

### Approval Toggle
- Switch component (green when approved)
- Instant feedback
- Toast notification on change
- Optimistic UI update

### Filters
- Pill-style buttons
- Active state highlighting
- Counts in badges
- Options: All, Approved, Pending

---

## Business Logic

### Review Eligibility
✅ Order status is 'Delivered' or 'Collected'
✅ Product exists in the order
✅ User hasn't already reviewed this product in this order
✅ User is authenticated

### Review Approval Flow
1. User submits review → Status: Pending (isApproved: false)
2. Admin reviews → Toggles approval
3. If approved → Visible on product page
4. If hidden → Only visible to admin and user who wrote it

### Rating Calculation
- Only approved reviews count toward average
- Round to 1 decimal place
- Update in real-time when approval changes

---

## Testing Checklist

### Backend
- [x] Review model created with proper schema
- [x] Unique constraint prevents duplicate reviews
- [x] User can only review delivered/collected orders
- [x] Rating validation (1-5)
- [x] Comment length validation (10-1000)
- [x] Admin can toggle approval
- [x] Stats calculation works correctly
- [x] All routes registered
- [x] No TypeScript errors

### Frontend User (TODO)
- [ ] ReviewModal opens on button click
- [ ] Star rating is interactive
- [ ] Comment validation works
- [ ] Submit button disabled until valid
- [ ] Success toast appears
- [ ] "Leave Feedback" button only shows for eligible products
- [ ] Already reviewed products show "Reviewed" badge
- [ ] Approved reviews display on product page

### Admin Dashboard (TODO)
- [ ] Feedbacks page lists all reviews
- [ ] Toggle switch works
- [ ] Delete button works with confirmation
- [ ] Filters work correctly
- [ ] Search functionality works
- [ ] Product details show review stats
- [ ] Rating distribution chart displays
- [ ] Sidebar badge shows pending count

---

## Database Indexes Performance

```javascript
// Compound unique index (prevents duplicates)
{ userId: 1, productId: 1, orderId: 1 }

// Fast approved review queries
{ productId: 1, isApproved: 1 }

// User review history
{ userId: 1 }

// Product review queries
{ productId: 1 }

// Approval status queries
{ isApproved: 1 }
```

---

## Security Considerations

1. **Authentication:** All write operations require authentication
2. **Authorization:** Users can only review their own orders
3. **Validation:** Server-side validation for all inputs
4. **Rate Limiting:** Consider adding rate limits for review submission
5. **Content Moderation:** Admin approval required before public display
6. **XSS Prevention:** Sanitize review comments before display

---

## Future Enhancements

1. **Review Images:** Allow users to upload photos with reviews
2. **Helpful Votes:** Let users mark reviews as helpful
3. **Review Responses:** Allow restaurant to respond to reviews
4. **Verified Purchase Badge:** Show badge for verified orders
5. **Review Incentives:** Offer discounts for leaving reviews
6. **Sentiment Analysis:** Auto-flag negative reviews for priority review
7. **Review Reminders:** Email users to review after delivery
8. **Review Editing:** Allow users to edit their reviews
9. **Review Reporting:** Let users report inappropriate reviews
10. **Multi-language Support:** Translate reviews

---

## Next Steps

### To Continue Implementation:

1. **Frontend User Components:**
   - Create ReviewModal component
   - Update My Orders page
   - Add review display to product pages
   - Create review service and Redux slice

2. **Admin Dashboard:**
   - Create Feedbacks page
   - Add ReviewCard component
   - Update product details page
   - Add sidebar menu item
   - Create admin review service and Redux slice

3. **Testing:**
   - Test review submission flow
   - Test approval workflow
   - Test edge cases (duplicate reviews, invalid orders)
   - Performance testing with many reviews

4. **Deployment:**
   - Run database migrations (indexes)
   - Update API documentation
   - Train admin staff on moderation
   - Monitor review submission rates

---

## Status Summary

✅ **Backend:** Complete (9 files created/updated, 0 errors)
⏳ **Frontend User:** Pending
⏳ **Admin Dashboard:** Pending

**Estimated Remaining Work:**
- Frontend User: ~8-10 components/files
- Admin Dashboard: ~10-12 components/files
- Total: ~18-22 files remaining

---

## API Quick Reference

```bash
# User APIs
POST   /api/user/reviews
GET    /api/user/reviews/product/:productId
GET    /api/user/reviews/my-reviews
GET    /api/user/reviews/can-review/:orderId/:productId

# Admin APIs
GET    /api/admin/reviews
GET    /api/admin/reviews/stats
GET    /api/admin/reviews/product/:productId
GET    /api/admin/reviews/product/:productId/stats
PATCH  /api/admin/reviews/:id/toggle-approval
DELETE /api/admin/reviews/:id
```

---

**Last Updated:** Phase 1 Complete
**Next Phase:** Frontend User Implementation
