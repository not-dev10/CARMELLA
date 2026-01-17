# Backend Setup Guide

## Overview

The Carmella backend is built with **Express.js** and uses **Supabase** for authentication, database, and real-time features.

### Key Features
- ✅ **Supabase Auth** - Google OAuth + Email/Password
- ✅ **JWT Token Verification** - Secure API access
- ✅ **Role-Based Access Control** - Admin, B2B, Customer
- ✅ **Product Catalog** - Full CRUD operations with filtering
- ✅ **B2B Approval System** - Request, approve, and reject B2B users
- ✅ **User Profiles** - Complete user management
- ✅ **Admin Dashboard** - Manage approvals and users

---

## Installation Steps

### 1. Install Dependencies

```bash
cd carmella/backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 3. Set Up Frontend Environment

Create `carmella/frontend/.env.local`:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Database Setup (Supabase)

Create these tables in your Supabase database:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(50) DEFAULT 'customer',
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  company_name VARCHAR(255),
  google_id VARCHAR(255),
  google_name VARCHAR(255),
  google_email VARCHAR(255),
  google_picture VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  b2b_price DECIMAL(10, 2),
  category_id UUID REFERENCES categories(id),
  image_url VARCHAR(500),
  gallery_images JSON,
  moq INTEGER DEFAULT 1,
  stock INTEGER DEFAULT 0,
  rating DECIMAL(3, 2),
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### B2B Approvals Table
```sql
CREATE TABLE b2b_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  company_name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(255),
  request_date TIMESTAMP DEFAULT NOW(),
  approval_date TIMESTAMP,
  expires_at TIMESTAMP,
  notes TEXT,
  UNIQUE(user_id, status) -- Only one pending request per user
);
```

### Orders Table (optional)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  items JSON NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Running the Backend

### Development
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup` | Register with email/password | ❌ |
| POST | `/login` | Login with email/password | ❌ |
| POST | `/google` | Google OAuth login | ❌ |
| GET | `/me` | Get current user | ✅ |
| POST | `/logout` | Logout | ✅ |

**Signup Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "123456789"
}
```

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { "id": "...", "email": "..." },
  "session": { "access_token": "...", "expires_in": ... }
}
```

### Products (`/api/products`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List products (with filters) | ❌ |
| GET | `/:id` | Get product details | ❌ |
| POST | `/` | Create product | ✅ Admin |
| PUT | `/:id` | Update product | ✅ Admin |
| DELETE | `/:id` | Delete product | ✅ Admin |

**Query Parameters for GET /:**
- `category` - Filter by category ID
- `search` - Search by name/description
- `sort` - Sort by field (default: `created_at`)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

**Example:**
```
GET /api/products?category=xxx&search=bowl&page=1&limit=12
```

### Users (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/:id` | Get user profile | ✅ Self/Admin |
| PUT | `/:id` | Update profile | ✅ Self |
| POST | `/:id/request-b2b` | Request B2B access | ✅ |
| GET | `/:id/b2b-status` | Get B2B status | ✅ Self/Admin |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/b2b-requests` | List B2B requests | ✅ Admin |
| PUT | `/b2b-requests/:userId/approve` | Approve B2B user | ✅ Admin |
| PUT | `/b2b-requests/:userId/reject` | Reject B2B user | ✅ Admin |

---

## Authentication Flow

### 1. Email/Password Signup
```
Frontend → POST /api/auth/signup
Backend → Supabase Auth (creates user) → Store profile in DB
Response → { user, session }
```

### 2. Email/Password Login
```
Frontend → POST /api/auth/login
Backend → Supabase Auth (authenticates)
Response → { user, session }
```

### 3. Google OAuth
```
Frontend → Get Google token from Google Sign-In
Frontend → POST /api/auth/google { token }
Backend → Verify token with Supabase → Store profile in DB
Response → { user, session }
```

### 4. API Requests (Protected)
```
Frontend → Add header: Authorization: Bearer <access_token>
Backend → Verify token with Supabase → Check user_type
Response → Data or 401/403 error
```

---

## Project Structure

```
src/
├── index.ts                 # Main Express app
├── config/
│   ├── index.ts            # Environment config
│   └── supabase.ts         # Supabase client setup
├── middleware/
│   └── index.ts            # Auth, admin, error handling
├── routes/
│   ├── auth.ts             # Auth endpoints
│   ├── products.ts         # Product endpoints
│   ├── users.ts            # User endpoints
│   ├── categories.ts       # Category endpoints
│   └── admin.ts            # Admin endpoints
├── controllers/
│   ├── authController.ts   # Auth logic
│   ├── productController.ts # Product logic
│   ├── userController.ts   # User logic
│   ├── categoryController.ts # Category logic
│   └── adminController.ts  # Admin logic
├── types/
│   ├── index.ts            # TypeScript types
│   └── validation.ts       # Zod validation schemas
└── utils/
    └── errors.ts           # Error handling utilities
```

---

## Security Best Practices

1. **Environment Variables** - Never commit `.env` file
2. **CORS** - Configured to allow only frontend origin
3. **Authentication** - All protected routes require valid JWT
4. **Authorization** - Role-based access control (RBAC)
5. **Input Validation** - Zod schemas validate all inputs
6. **Error Handling** - Sensitive errors logged, safe errors sent to client

---

## Troubleshooting

### "Missing Supabase configuration"
- Check `.env` file has `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### "Invalid token" on protected routes
- Ensure token is in `Authorization: Bearer <token>` format
- Check token hasn't expired
- Token must be from Supabase Auth

### CORS errors
- Frontend URL must match `CORS_ORIGIN` in `.env`
- Default is `http://localhost:5173` for Vite

### B2B approval not working
- Check `b2b_approvals` table exists in Supabase
- User must send `companyName` in request body

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Create `.env` with Supabase credentials
3. ✅ Create database tables (see SQL above)
4. ✅ Run backend: `npm run dev`
5. ✅ Test endpoints with Postman/Thunder Client
6. ✅ Connect frontend to backend APIs
