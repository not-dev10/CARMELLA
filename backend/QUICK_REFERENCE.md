# Carmella Backend - Quick Reference

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd carmella/backend
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Run backend
npm run dev
# Server on http://localhost:5000
```

## 📁 Project Structure

```
src/
├── index.ts                 # Express app entry
├── config/                  # Configuration
│   ├── index.ts            # Env vars
│   └── supabase.ts         # Supabase client
├── middleware/             # Express middleware
│   └── index.ts            # Auth & error handling
├── routes/                 # API routes
├── controllers/            # Request handlers
├── types/                  # TypeScript types
└── utils/                  # Utilities
```

## 🔑 Environment Variables

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_key
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

## 🔐 Authentication

All protected routes require:
```
Authorization: Bearer <access_token>
```

### User Roles
- `customer` - Regular user
- `b2b_pending` - Awaiting B2B approval
- `b2b_approved` - Approved B2B user
- `admin` - System administrator

## 📡 API Endpoints

### Auth
```
POST   /api/auth/signup        - Register
POST   /api/auth/login         - Login
POST   /api/auth/google        - Google OAuth
GET    /api/auth/me            - Current user
```

### Products
```
GET    /api/products           - List products
GET    /api/products/:id       - Get product
POST   /api/products           - Create (admin)
PUT    /api/products/:id       - Update (admin)
DELETE /api/products/:id       - Delete (admin)
```

### Users
```
GET    /api/users/:id          - Get profile
PUT    /api/users/:id          - Update profile
POST   /api/users/:id/request-b2b - Request B2B
GET    /api/users/:id/b2b-status  - Get B2B status
```

### Admin
```
GET    /api/admin/b2b-requests         - List requests
PUT    /api/admin/b2b-requests/:id/approve  - Approve
PUT    /api/admin/b2b-requests/:id/reject   - Reject
```

### Categories
```
GET    /api/categories         - List categories
GET    /api/categories/:id     - Get category
POST   /api/categories         - Create (admin)
```

## 🗄️ Database Tables

Required Supabase tables:
- `users` - User profiles
- `products` - Product catalog
- `categories` - Product categories
- `b2b_approvals` - B2B approval requests
- `orders` - Order history (optional)

See [SETUP.md](./SETUP.md) for SQL schema.

## 🛠️ Development

```bash
npm run dev      # Run with hot reload
npm run build    # Build TypeScript
npm run lint     # Check code style
npm start        # Run production build
```

## 🚨 Error Handling

- `400` - Bad request (validation error)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Server error

## 📝 Request Examples

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Products
```bash
curl http://localhost:5000/api/products?category=bowls&sort=name&limit=20
```

### Request B2B Access
```bash
curl -X POST http://localhost:5000/api/users/{userId}/request-b2b \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "ABC Ceramics Inc",
    "taxId": "12-3456789"
  }'
```

## 🔗 Frontend Integration

Frontend needs to:
1. Get Supabase credentials
2. Call `/api/auth/signup` or `/api/auth/login`
3. Store `session.access_token` in localStorage
4. Send token in `Authorization` header for protected routes

See frontend `.env.local`:
```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
```

## 📚 More Info

- See [SETUP.md](./SETUP.md) for detailed setup
- See [README.md](./README.md) for API documentation
- See Supabase docs: https://supabase.com/docs
