# Review System Implementation Guide

**Status**: 📋 Ready for Implementation  
**Priority**: Medium (after core APIs)  
**Estimated Time**: 1-2 days

---

## 📊 Overview

The review system allows customers to rate and review products, with admin moderation capabilities. Reviews are displayed on product pages and aggregated for analytics.

---

## 🗄️ Database Schema

### **Reviews Table**
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  rating INT (1-5),
  title VARCHAR(255),
  comment TEXT,
  helpful_count INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(product_id, user_id)
);
```

**Key Features:**
- One review per user per product (UNIQUE constraint)
- 1-5 star rating system
- Helpful count for community feedback
- Timestamps for sorting/filtering
- RLS policies for security

### **Activity Logs Table**
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES users(id),
  action VARCHAR(255),
  target_type VARCHAR(100),
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP
);
```

**Tracks:**
- Review creation/updates/deletions
- Admin moderation actions
- All admin activities for audit trail

### **Views**

**product_ratings** - Aggregated ratings per product
```sql
SELECT 
  product_id,
  total_reviews,
  average_rating,
  five_star_count,
  four_star_count,
  three_star_count,
  two_star_count,
  one_star_count
```

**user_reviews** - User review history with product info
```sql
SELECT 
  review_id,
  product_name,
  user_name,
  rating,
  title,
  comment,
  created_at
```

---

## 🔌 API Endpoints

### **Get Product Reviews**
```
GET /api/products/:productId/reviews
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - sort: "newest" | "oldest" | "highest" | "lowest" | "helpful"

Response:
{
  reviews: [
    {
      id: UUID,
      user_id: UUID,
      user_name: string,
      user_avatar: string,
      rating: 1-5,
      title: string,
      comment: string,
      helpful_count: number,
      created_at: timestamp,
      is_verified_purchase: boolean
    }
  ],
  total: number,
  page: number,
  average_rating: number,
  rating_distribution: {
    5: number,
    4: number,
    3: number,
    2: number,
    1: number
  }
}
```

### **Create Review**
```
POST /api/products/:productId/reviews
Auth: Required (user)

Body:
{
  rating: 1-5,
  title: string,
  comment: string
}

Response:
{
  id: UUID,
  product_id: UUID,
  user_id: UUID,
  rating: 1-5,
  title: string,
  comment: string,
  created_at: timestamp
}

Errors:
- 400: Invalid rating (not 1-5)
- 400: Title too short/long
- 400: Comment too short/long
- 409: User already reviewed this product
- 404: Product not found
```

### **Update Review**
```
PUT /api/reviews/:reviewId
Auth: Required (review owner or admin)

Body:
{
  rating: 1-5,
  title: string,
  comment: string
}

Response:
{
  id: UUID,
  rating: 1-5,
  title: string,
  comment: string,
  updated_at: timestamp
}

Errors:
- 403: Not authorized
- 404: Review not found
```

### **Delete Review**
```
DELETE /api/reviews/:reviewId
Auth: Required (review owner or admin)

Response:
{
  success: true,
  message: "Review deleted"
}

Errors:
- 403: Not authorized
- 404: Review not found
```

### **Mark Review Helpful**
```
POST /api/reviews/:reviewId/helpful
Auth: Required (user)

Response:
{
  helpful_count: number
}

Errors:
- 404: Review not found
```

### **Admin: Get All Reviews**
```
GET /api/admin/reviews
Auth: Required (admin)
Query Parameters:
  - product_id: UUID (optional)
  - user_id: UUID (optional)
  - rating: 1-5 (optional)
  - status: "pending" | "approved" | "rejected" (optional)
  - page: number
  - limit: number

Response:
{
  reviews: [
    {
      id: UUID,
      product_id: UUID,
      product_name: string,
      user_id: UUID,
      user_name: string,
      rating: 1-5,
      title: string,
      comment: string,
      status: "pending" | "approved" | "rejected",
      created_at: timestamp
    }
  ],
  total: number,
  page: number
}
```

### **Admin: Moderate Review**
```
PUT /api/admin/reviews/:reviewId
Auth: Required (admin)

Body:
{
  status: "approved" | "rejected",
  reason: string (optional, for rejection)
}

Response:
{
  id: UUID,
  status: string,
  updated_at: timestamp
}

Errors:
- 404: Review not found
```

---

## 🎨 Frontend Components

### **ReviewList Component**
```typescript
interface ReviewListProps {
  productId: string
  onReviewAdded?: () => void
}

Features:
- Display reviews with pagination
- Sort by newest/oldest/highest/lowest/helpful
- Show rating distribution
- Show average rating
- Load more button
- Empty state
```

### **ReviewForm Component**
```typescript
interface ReviewFormProps {
  productId: string
  onSubmit?: (review: Review) => void
  onCancel?: () => void
}

Features:
- Star rating picker (1-5)
- Title input (max 100 chars)
- Comment textarea (max 1000 chars)
- Submit button
- Cancel button
- Loading state
- Error messages
- Success message
```

### **StarRating Component**
```typescript
interface StarRatingProps {
  value: number (1-5)
  onChange?: (rating: number) => void
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
}

Features:
- Interactive star selection
- Hover effects
- Display current rating
- Read-only mode for display
```

### **RatingDistribution Component**
```typescript
interface RatingDistributionProps {
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  total: number
  average: number
}

Features:
- Show bar chart of ratings
- Show percentage for each rating
- Show average rating
- Show total review count
```

### **ReviewCard Component**
```typescript
interface ReviewCardProps {
  review: Review
  onHelpful?: () => void
  onEdit?: () => void
  onDelete?: () => void
  isAdmin?: boolean
}

Features:
- Display review content
- Show user name and date
- Show rating stars
- Show helpful count
- Edit/delete buttons (if owner)
- Admin moderation buttons
- Verified purchase badge
```

---

## 📄 ProductDetail Page Integration

### **New Section: Customer Reviews**
```
Location: Below product details, above related products

Layout:
┌─────────────────────────────────────────┐
│ Customer Reviews                        │
├─────────────────────────────────────────┤
│ Average Rating: ⭐ 4.8 (127 reviews)   │
│                                         │
│ Rating Distribution:                    │
│ ⭐⭐⭐⭐⭐ 85 (67%)                      │
│ ⭐⭐⭐⭐  28 (22%)                      │
│ ⭐⭐⭐    10 (8%)                       │
│ ⭐⭐      3 (2%)                        │
│ ⭐        1 (1%)                        │
│                                         │
│ [Write a Review Button]                 │
│                                         │
│ Sort: [Newest ▼]                       │
│                                         │
│ Review 1                                │
│ Review 2                                │
│ Review 3                                │
│ [Load More Reviews]                     │
└─────────────────────────────────────────┘
```

### **Write Review Modal**
```
┌─────────────────────────────────────────┐
│ Write a Review                      [X] │
├─────────────────────────────────────────┤
│ Product: Terra Ceramic Vase             │
│                                         │
│ Rating: ⭐ ⭐ ⭐ ⭐ ⭐                  │
│                                         │
│ Title: [________________]               │
│                                         │
│ Comment:                                │
│ [_____________________________]         │
│ [_____________________________]         │
│ [_____________________________]         │
│                                         │
│ [Cancel]  [Submit Review]               │
└─────────────────────────────────────────┘
```

---

## 👨‍💼 Admin Panel Integration

### **New Tab: Reviews Management**
```
Location: Admin sidebar

Features:
- List all reviews
- Filter by product
- Filter by rating
- Filter by status (pending/approved/rejected)
- Search by user name
- Approve/reject reviews
- Delete reviews
- View review details
- See moderation history
```

### **Reviews Table**
```
Columns:
- Product Name
- User Name
- Rating (stars)
- Title
- Comment (truncated)
- Status (badge)
- Date
- Actions (approve/reject/delete)

Filters:
- Product dropdown
- Rating filter
- Status filter
- Date range
- Search box
```

### **Review Moderation Modal**
```
┌─────────────────────────────────────────┐
│ Review Details                      [X] │
├─────────────────────────────────────────┤
│ Product: Terra Ceramic Vase             │
│ User: John Smith                        │
│ Date: Jan 24, 2024                      │
│ Rating: ⭐⭐⭐⭐⭐                      │
│                                         │
│ Title: Amazing quality!                 │
│ Comment: This vase is beautiful...      │
│                                         │
│ Status: [Pending ▼]                    │
│                                         │
│ [Approve] [Reject] [Delete]             │
└─────────────────────────────────────────┘
```

---

## 🔐 Security & Validation

### **Input Validation**
```typescript
// Rating
- Must be integer 1-5
- Required

// Title
- Min length: 3 characters
- Max length: 100 characters
- Required

// Comment
- Min length: 10 characters
- Max length: 1000 characters
- Required

// Sanitization
- Remove HTML tags
- Escape special characters
- Trim whitespace
```

### **RLS Policies**
```sql
-- Anyone can view reviews
SELECT: true

-- Users can create reviews
INSERT: auth.uid() = user_id

-- Users can update their own reviews
UPDATE: auth.uid() = user_id

-- Users can delete their own reviews
DELETE: auth.uid() = user_id

-- Admins can delete any review
DELETE: user_type = 'admin'
```

### **Rate Limiting**
```
- Max 1 review per user per product
- Max 10 reviews per user per day
- Max 100 reviews per product per day
```

---

## 📊 Analytics & Reporting

### **Review Metrics**
```
- Total reviews
- Average rating
- Rating distribution
- Most helpful reviews
- Most recent reviews
- Reviews per product
- Reviews per user
- Moderation queue size
```

### **Admin Dashboard Widget**
```
Recent Reviews:
- 5 most recent reviews
- Quick approve/reject buttons
- Link to full reviews page

Review Stats:
- Total reviews: 1,247
- Pending moderation: 12
- Average rating: 4.8
- Most reviewed product: Terra Ceramic Vase
```

---

## 🧪 Testing Checklist

- [ ] Create review with valid data
- [ ] Create review with invalid rating
- [ ] Create review with short title
- [ ] Create review with long comment
- [ ] Update own review
- [ ] Cannot update other's review
- [ ] Delete own review
- [ ] Cannot delete other's review
- [ ] Admin can delete any review
- [ ] Cannot create duplicate review
- [ ] Reviews display on product page
- [ ] Rating distribution shows correctly
- [ ] Average rating calculates correctly
- [ ] Sort by newest works
- [ ] Sort by highest rating works
- [ ] Sort by helpful works
- [ ] Pagination works
- [ ] Admin moderation works
- [ ] Rejection reason saves
- [ ] Activity log records actions
- [ ] RLS policies enforce correctly

---

## 🚀 Implementation Steps

### **Step 1: Database (30 min)**
- Execute `supabase-reviews.sql`
- Verify tables created
- Test RLS policies

### **Step 2: Backend APIs (4 hours)**
- Create review controller
- Implement 6 endpoints
- Add validation
- Add error handling
- Test with Postman

### **Step 3: Frontend Components (4 hours)**
- Create ReviewList component
- Create ReviewForm component
- Create StarRating component
- Create RatingDistribution component
- Create ReviewCard component

### **Step 4: ProductDetail Integration (2 hours)**
- Add reviews section
- Add write review button
- Add review modal
- Connect to API

### **Step 5: Admin Integration (2 hours)**
- Add reviews tab
- Create reviews table
- Add moderation modal
- Connect to API

### **Step 6: Testing (2 hours)**
- Test all endpoints
- Test all components
- Test admin moderation
- Test RLS policies

---

## 📝 Files to Create/Modify

### **Backend**
- `src/controllers/reviewController.ts` (NEW)
- `src/routes/reviews.ts` (NEW)
- `src/index.ts` (MODIFY - add review routes)

### **Frontend**
- `src/components/reviews/ReviewList.tsx` (NEW)
- `src/components/reviews/ReviewForm.tsx` (NEW)
- `src/components/reviews/StarRating.tsx` (NEW)
- `src/components/reviews/RatingDistribution.tsx` (NEW)
- `src/components/reviews/ReviewCard.tsx` (NEW)
- `src/pages/ProductDetail.tsx` (MODIFY - add reviews section)
- `src/components/admin/reviews-section.tsx` (NEW)
- `src/pages/Admin.tsx` (MODIFY - add reviews tab)

### **Database**
- `supabase-reviews.sql` (NEW - already created)

---

## ✅ Success Criteria

- [ ] All 6 review endpoints working
- [ ] Reviews display on product pages
- [ ] Users can create/edit/delete reviews
- [ ] Admin can moderate reviews
- [ ] Rating distribution shows correctly
- [ ] Average rating calculates correctly
- [ ] Activity logs record all actions
- [ ] RLS policies enforce correctly
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Performance optimized

---

**Status**: Ready for implementation after Phase 2 (Backend APIs)  
**Estimated Completion**: 1-2 days
