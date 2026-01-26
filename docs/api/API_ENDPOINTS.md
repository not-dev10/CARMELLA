# Carmella API Endpoints Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints (except public ones) require Bearer token in Authorization header:
```
Authorization: Bearer <supabase_jwt_token>
```

---

## 1. AUTHENTICATION ENDPOINTS
**Base:** `/auth`

### Sign Up
```
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}

Response: { user, session }
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { user, session }
```

### Google OAuth
```
POST /auth/google
Content-Type: application/json

{
  "token": "<google_id_token>"
}

Response: { user, session }
```

### Logout
```
POST /auth/logout
Authorization: Bearer <token>

Response: { success: true }
```

---

## 2. PRODUCTS ENDPOINTS
**Base:** `/products`

### Get All Products
```
GET /products
Query params:
  - category: UUID (optional)
  - search: string (optional)
  - limit: number (default: 20)
  - offset: number (default: 0)

Response: { products: [], total: number }
```

### Get Product Details
```
GET /products/:id

Response: { product, reviews: [], relatedProducts: [] }
```

### Create Product (Admin Only)
```
POST /products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Description",
  "price": 99.99,
  "categoryId": "uuid",
  "imageUrl": "https://...",
  "moq": 1,
  "stock": 100,
  "badge": "new",
  "features": ["feature1", "feature2"]
}

Response: { product }
```

### Update Product (Admin Only)
```
PUT /products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 89.99,
  "stock": 50
}

Response: { product }
```

### Delete Product (Admin Only)
```
DELETE /products/:id
Authorization: Bearer <admin_token>

Response: { success: true }
```

---

## 3. CART ENDPOINTS
**Base:** `/cart`

### Get Cart
```
GET /cart
Authorization: Bearer <token>

Response: { cart, items: [] }
```

### Add to Cart
```
POST /cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "uuid",
  "quantity": 2
}

Response: { success: true, item }
```

### Update Cart Item
```
PUT /cart/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 5
}

Response: { success: true, item }
```

### Remove from Cart
```
DELETE /cart/:itemId
Authorization: Bearer <token>

Response: { success: true }
```

### Clear Cart
```
DELETE /cart
Authorization: Bearer <token>

Response: { success: true }
```

---

## 4. ORDERS ENDPOINTS
**Base:** `/orders`

### Create Order
```
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": "123 Main St, City, State 12345"
}

Response: { success: true, order }
```

### Get User Orders
```
GET /orders
Authorization: Bearer <token>

Response: { orders: [] }
```

### Get Order Details
```
GET /orders/:id
Authorization: Bearer <token>

Response: { order }
```

### Update Order Status (Admin Only)
```
PUT /orders/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped"
}

Valid statuses: pending, confirmed, shipped, delivered, cancelled

Response: { success: true, order }
```

---

## 5. WISHLIST ENDPOINTS
**Base:** `/wishlist`

### Get Wishlist
```
GET /wishlist
Authorization: Bearer <token>

Response: { items: [] }
```

### Add to Wishlist
```
POST /wishlist/:productId
Authorization: Bearer <token>

Response: { success: true, item }
```

### Remove from Wishlist
```
DELETE /wishlist/:productId
Authorization: Bearer <token>

Response: { success: true }
```

---

## 6. REVIEWS ENDPOINTS
**Base:** `/reviews`

### Get Product Reviews
```
GET /reviews/products/:productId

Response: { reviews: [] }
```

### Create Review
```
POST /reviews/products/:productId
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "title": "Great product!",
  "comment": "This product exceeded my expectations..."
}

Response: { success: true, review }
```

### Update Review
```
PUT /reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "title": "Updated title",
  "comment": "Updated comment..."
}

Response: { success: true, review }
```

### Delete Review
```
DELETE /reviews/:id
Authorization: Bearer <token>

Response: { success: true }
```

### Mark Review as Helpful
```
POST /reviews/:id/helpful
Authorization: Bearer <token>

Response: { success: true }
```

---

## 7. ANALYTICS ENDPOINTS
**Base:** `/admin/analytics` (Admin Only)

### Get Dashboard Stats
```
GET /admin/analytics/dashboard
Authorization: Bearer <admin_token>

Response: {
  totalOrders: number,
  totalRevenue: number,
  totalUsers: number,
  totalProducts: number,
  pendingB2B: number
}
```

### Get Sales Trend
```
GET /admin/analytics/sales-trend
Authorization: Bearer <admin_token>
Query params:
  - days: number (default: 30)

Response: {
  data: [
    { date: "2024-01-01", total: 1000 },
    ...
  ]
}
```

### Get Revenue by Category
```
GET /admin/analytics/revenue-by-category
Authorization: Bearer <admin_token>

Response: {
  data: [
    { category: "Electronics", revenue: 5000 },
    ...
  ]
}
```

### Get Top Products
```
GET /admin/analytics/top-products
Authorization: Bearer <admin_token>
Query params:
  - limit: number (default: 10)

Response: {
  data: [
    { id, name, rating, reviews_count },
    ...
  ]
}
```

---

## 8. CATEGORIES ENDPOINTS
**Base:** `/categories`

### Get All Categories
```
GET /categories

Response: { categories: [] }
```

### Create Category (Admin Only)
```
POST /categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic products",
  "imageUrl": "https://..."
}

Response: { category }
```

### Update Category (Admin Only)
```
PUT /categories/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name"
}

Response: { category }
```

### Delete Category (Admin Only)
```
DELETE /categories/:id
Authorization: Bearer <admin_token>

Response: { success: true }
```

---

## 9. USERS ENDPOINTS
**Base:** `/users`

### Get User Profile
```
GET /users/profile
Authorization: Bearer <token>

Response: { user }
```

### Update User Profile
```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "companyName": "Acme Corp"
}

Response: { user }
```

### Request B2B Approval
```
POST /users/b2b-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "Acme Corp",
  "taxId": "12-3456789"
}

Response: { success: true, request }
```

### Get B2B Request Status
```
GET /users/b2b-request
Authorization: Bearer <token>

Response: { request }
```

---

## 10. ADMIN ENDPOINTS
**Base:** `/admin` (Admin Only)

### Get All Users
```
GET /admin/users
Authorization: Bearer <admin_token>
Query params:
  - search: string (optional)
  - limit: number (default: 20)
  - offset: number (default: 0)

Response: { users: [], total: number }
```

### Get B2B Requests
```
GET /admin/b2b-requests
Authorization: Bearer <admin_token>
Query params:
  - status: pending|approved|rejected (optional)

Response: { requests: [] }
```

### Approve B2B Request
```
PUT /admin/b2b-requests/:id/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "notes": "Approved for bulk orders"
}

Response: { success: true, request }
```

### Reject B2B Request
```
PUT /admin/b2b-requests/:id/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Tax ID verification failed"
}

Response: { success: true, request }
```

### Get Contact Submissions
```
GET /admin/contacts
Authorization: Bearer <admin_token>
Query params:
  - status: new|read|responded (optional)

Response: { contacts: [] }
```

### Update Contact Status
```
PUT /admin/contacts/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "responded"
}

Response: { success: true, contact }
```

### Update Homepage Content
```
PUT /admin/content/:section
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "content": { ... }
}

Response: { success: true, content }
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting
- No rate limiting currently implemented
- Recommended: 100 requests per minute per IP

## CORS
- Enabled for frontend domain
- Credentials: included

## Pagination
- Default limit: 20
- Max limit: 100
- Use `offset` for pagination

## Sorting
- Default: created_at DESC
- Supported fields vary by endpoint

---

## Testing

### Using cURL
```bash
# Get products
curl http://localhost:3000/api/products

# Create order (with token)
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"shippingAddress": "123 Main St"}'
```

### Using Postman
1. Import this documentation
2. Set `{{base_url}}` to `http://localhost:3000/api`
3. Set `{{token}}` to your JWT token
4. Run requests

---

## Webhook Events (Future)
- order.created
- order.shipped
- order.delivered
- review.created
- b2b.approved
- b2b.rejected
