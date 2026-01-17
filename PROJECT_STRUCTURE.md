# 📦 Carmella Project Complete Structure

## Full Project Directory Tree

```
carmella/
│
├── 📄 PROJECT_OVERVIEW.md          ⭐ START HERE - Project summary
├── 📄 BACKEND_SUMMARY.md           - Backend features & structure
├── 📄 BACKEND_ARCHITECTURE.md      - System design & diagrams
├── 📄 FRONTEND_BACKEND_INTEGRATION.md - How to connect frontend
├── 📄 DEPLOYMENT_GUIDE.md          - How to deploy
│
├── 📁 frontend/                    (Existing React Vite app)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Catalog.tsx         (Will connect to /api/products)
│   │   │   ├── ProductDetail.tsx   (Will connect to /api/products/:id)
│   │   │   ├── Login.tsx           (Will connect to /api/auth/login)
│   │   │   ├── Signup.tsx          (Will connect to /api/auth/signup)
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx     (Will use API instead of mock)
│   │   │   └── ...
│   │   ├── components/
│   │   │   └── ... (existing UI)
│   │   └── ...
│   ├── .env.local                  (Needs Supabase credentials)
│   ├── package.json
│   └── ...
│
├── 📁 backend/                     ✨ NEW - Node.js Express API
│   ├── 📁 src/
│   │   ├── index.ts               📍 Server entry point
│   │   │                          Starts Express on port 5000
│   │   │                          Sets up CORS, routes, middleware
│   │   │
│   │   ├── 📁 config/
│   │   │   ├── index.ts          ⚙️ Environment variables
│   │   │   │                     NODE_ENV, PORT, CORS_ORIGIN
│   │   │   │                     SUPABASE_URL, KEYS
│   │   │   └── supabase.ts       Supabase clients (anon & admin)
│   │   │
│   │   ├── 📁 middleware/
│   │   │   └── index.ts          🔐 Express middleware
│   │   │                         ├── authMiddleware - Verify JWT
│   │   │                         ├── adminMiddleware - Check admin
│   │   │                         ├── b2bMiddleware - Check B2B status
│   │   │                         └── errorHandler - Error responses
│   │   │
│   │   ├── 📁 routes/
│   │   │   ├── auth.ts           🔑 Authentication endpoints
│   │   │   │                     ├── POST /signup
│   │   │   │                     ├── POST /login
│   │   │   │                     ├── POST /google
│   │   │   │                     ├── GET /me
│   │   │   │                     └── POST /logout
│   │   │   │
│   │   │   ├── products.ts       📦 Product catalog endpoints
│   │   │   │                     ├── GET / (list with filters)
│   │   │   │                     ├── GET /:id
│   │   │   │                     ├── POST / (admin)
│   │   │   │                     ├── PUT /:id (admin)
│   │   │   │                     └── DELETE /:id (admin)
│   │   │   │
│   │   │   ├── users.ts          👤 User profile endpoints
│   │   │   │                     ├── GET /:id
│   │   │   │                     ├── PUT /:id
│   │   │   │                     ├── POST /:id/request-b2b
│   │   │   │                     └── GET /:id/b2b-status
│   │   │   │
│   │   │   ├── categories.ts     📂 Category endpoints
│   │   │   │                     ├── GET /
│   │   │   │                     ├── GET /:id
│   │   │   │                     └── POST / (admin)
│   │   │   │
│   │   │   └── admin.ts          ⚡ Admin endpoints
│   │   │                         ├── GET /b2b-requests
│   │   │                         ├── PUT /b2b-requests/:id/approve
│   │   │                         └── PUT /b2b-requests/:id/reject
│   │   │
│   │   ├── 📁 controllers/
│   │   │   ├── authController.ts    🔐 Auth logic
│   │   │   │                       signup(), login(), googleAuth()
│   │   │   │                       getCurrentUser(), logout()
│   │   │   │
│   │   │   ├── productController.ts 📦 Product logic
│   │   │   │                       getProducts(), getProduct()
│   │   │   │                       createProduct(), updateProduct()
│   │   │   │                       deleteProduct()
│   │   │   │
│   │   │   ├── userController.ts    👤 User logic
│   │   │   │                       getUserProfile(), updateProfile()
│   │   │   │                       requestB2BAccess()
│   │   │   │                       getB2BStatus()
│   │   │   │
│   │   │   ├── categoryController.ts 📂 Category logic
│   │   │   │                        getCategories(), getCategory()
│   │   │   │                        createCategory()
│   │   │   │
│   │   │   └── adminController.ts   ⚡ Admin logic
│   │   │                           getB2BRequests()
│   │   │                           approveB2BRequest()
│   │   │                           rejectB2BRequest()
│   │   │
│   │   ├── 📁 types/
│   │   │   ├── index.ts            📝 TypeScript interfaces
│   │   │   │                       ├── User, Product, Category
│   │   │   │                       ├── B2BApproval, Cart, Order
│   │   │   │                       └── etc.
│   │   │   │
│   │   │   └── validation.ts       ✔️ Zod validation schemas
│   │   │                           ├── signupSchema
│   │   │                           ├── loginSchema
│   │   │                           ├── productSchema
│   │   │                           └── etc.
│   │   │
│   │   └── 📁 utils/
│   │       └── errors.ts          ⚠️ Error handling
│   │                              AppError class, error constants
│   │
│   ├── 📄 package.json            📦 Dependencies & scripts
│   │                              npm run dev / build / start
│   │
│   ├── 📄 tsconfig.json           ⚙️ TypeScript configuration
│   ├── 📄 .eslintrc.json          🎨 Code linting rules
│   ├── 📄 .gitignore              🚫 Git ignore patterns
│   ├── 📄 .env.example            📋 Environment template
│   │
│   ├── 📄 README.md               📚 Full API documentation
│   │                              All endpoints, examples, security
│   │
│   ├── 📄 SETUP.md                🔧 Setup guide
│   │                              Installation, SQL schema, troubleshooting
│   │
│   ├── 📄 QUICK_REFERENCE.md      ⚡ Quick start guide
│   │                              Commands, cURL examples, env vars
│   │
│   └── 📁 dist/                   (Compiled TypeScript - after npm run build)
│       └── (compiled JavaScript files)
│
└── 📁 FRONTEND_READINESS_ANALYSIS.md (Status of frontend)
    index.html (root)
    main.js (root)
    backend/ (this folder - NEW!)
    ... (other files)
```

---

## 🔄 Data Flow Diagram

```
USER                                FRONTEND                          BACKEND                         DATABASE
(Browser)                          (React)                        (Express/Node)                  (Supabase)

1. SIGNUP
  ├─ Click "Sign Up"              ─→ Show signup form
  ├─ Enter email/password          ─→ Form validation
  ├─ Submit                        ─→ POST /api/auth/signup
  │                                   │
  │                                   ├─→ Receive request
  │                                   ├─→ Validate input (Zod)
  │                                   ├─→ Call Supabase Auth
  │                                   │  ├─→ supabase.auth.signUpWithPassword()
  │                                   │  │  └─────────────────────────────────→ Create user
  │                                   │  └─ Create auth record
  │                                   ├─→ Insert profile to users table
  │                                   │  └─────────────────────────────────→ Insert row
  │                                   ├─→ Generate JWT token
  │                                   └─ Return { user, session }
  │                                   ← Response with token
  │
  └─ Receive response
     Store token in localStorage
     Update AuthContext
     Redirect to home
     ✅ Signed up!

2. GET PRODUCTS
  ├─ Load catalog page             ─→ Frontend: GET /api/products
  │                                   │
  │                                   ├─→ authMiddleware (no auth needed)
  │                                   ├─→ productController.getProducts()
  │                                   ├─→ Parse query params
  │                                   ├─→ Build Supabase query
  │                                   │  ├─ Filter by category
  │                                   │  ├─ Filter by price
  │                                   │  ├─ Search by name
  │                                   │  ├─ Sort results
  │                                   │  └─ Pagination
  │                                   │  └──────────────────────────────────→ Execute query
  │                                   ├─ Get results + count
  │                                   └─ Return { products, pagination }
  │                                   ← Response
  │
  └─ Receive products
     Display product grid
     ✅ Showing products!

3. REQUEST B2B ACCESS
  ├─ Click "Request B2B"           ─→ Show modal
  ├─ Enter company name            ─→ Form validation
  ├─ Submit (with auth token)      ─→ POST /api/users/{id}/request-b2b
  │                                   Header: Authorization: Bearer <token>
  │                                   │
  │                                   ├─→ authMiddleware
  │                                   │  ├─ Extract token
  │                                   │  ├─ Call supabase.auth.getUser(token)
  │                                   │  └─ Verify user exists
  │                                   ├─→ userController.requestB2BAccess()
  │                                   ├─→ Validate request (Zod)
  │                                   ├─→ Create b2b_approval record
  │                                   │  └──────────────────────────────────→ Insert row
  │                                   ├─ Return approval request
  │                                   └─ Return { approval }
  │                                   ← Response
  │
  └─ Receive response
     Show "Request Submitted"
     ✅ Request sent!

4. ADMIN APPROVES B2B
  ├─ Admin goes to dashboard       ─→ GET /api/admin/b2b-requests
  │                                   Header: Authorization: Bearer <admin-token>
  │                                   │
  │                                   ├─→ authMiddleware + adminMiddleware
  │                                   ├─→ adminController.getB2BRequests()
  │                                   ├─→ Query b2b_approvals WHERE status='pending'
  │                                   │  └──────────────────────────────────→ Get requests
  │                                   ├─ Format response with pagination
  │                                   └─ Return { requests, pagination }
  │                                   ← Response
  │
  ├─ See user's request
  ├─ Click "Approve"               ─→ PUT /api/admin/b2b-requests/{id}/approve
  │                                   Header: Authorization: Bearer <admin-token>
  │                                   │
  │                                   ├─→ authMiddleware + adminMiddleware
  │                                   ├─→ adminController.approveB2BRequest()
  │                                   ├─→ Update b2b_approvals
  │                                   │  ├─ status = "approved"
  │                                   │  ├─ approval_date = NOW()
  │                                   │  ├─ expires_at = NOW() + 90 days
  │                                   │  └──────────────────────────────────→ Update row
  │                                   ├─→ Update users
  │                                   │  ├─ user_type = "b2b_approved"
  │                                   │  └──────────────────────────────────→ Update row
  │                                   └─ Return success
  │                                   ← Response
  │
  └─ User's status changes
     ✅ User approved!
     User can now access B2B pricing
```

---

## 🗄️ Database Schema Overview

```
┌─────────────────────────────────┐
│          users                  │
├─────────────────────────────────┤
│ id (UUID, PK)                   │
│ email (UNIQUE)                  │
│ user_type (customer/b2b_approved/admin)
│ first_name, last_name           │
│ phone, company_name             │
│ google_id, google_email         │
│ created_at, updated_at          │
└──────────┬──────────────────────┘
           │
           ├──────────┐
           │          │
           ▼          ▼
    ┌──────────────┐  ┌────────────────────┐
    │ orders       │  │ b2b_approvals      │
    ├──────────────┤  ├────────────────────┤
    │ id (PK)      │  │ id (PK)            │
    │ user_id (FK) │  │ user_id (FK)       │
    │ items (JSON) │  │ status (pending)   │
    │ total        │  │ company_name       │
    │ status       │  │ request_date       │
    │ created_at   │  │ approval_date      │
    └──────────────┘  │ expires_at         │
                      └────────────────────┘


┌──────────────────────────────────┐
│        products                  │
├──────────────────────────────────┤
│ id (UUID, PK)                    │
│ name, description                │
│ price (retail), b2b_price (bulk) │
│ category_id (FK)                 │
│ image_url, moq, stock            │
│ rating, reviews_count            │
│ created_at, updated_at           │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│       categories                 │
├──────────────────────────────────┤
│ id (UUID, PK)                    │
│ name, description                │
│ image_url                        │
│ created_at                       │
└──────────────────────────────────┘
```

---

## ✨ Features by API Endpoint

### 🔑 Authentication (`/api/auth`)
```
├── POST /signup          → Create account
├── POST /login           → Login with credentials
├── POST /google          → Login with Google
├── GET /me              → Get current user
└── POST /logout         → Logout
```

### 📦 Products (`/api/products`)
```
├── GET /                → List products (filters, pagination)
├── GET /:id             → Get product details
├── POST /               → Create (admin)
├── PUT /:id             → Update (admin)
└── DELETE /:id          → Delete (admin)
```

### 👤 Users (`/api/users`)
```
├── GET /:id                 → Get profile
├── PUT /:id                 → Update profile
├── POST /:id/request-b2b    → Request B2B access
└── GET /:id/b2b-status      → Check approval status
```

### 📂 Categories (`/api/categories`)
```
├── GET /                → List categories
├── GET /:id             → Get category
└── POST /               → Create (admin)
```

### ⚡ Admin (`/api/admin`)
```
├── GET /b2b-requests              → List requests
├── PUT /b2b-requests/:id/approve  → Approve user
└── PUT /b2b-requests/:id/reject   → Reject user
```

---

## 🚀 Deployment Structure

```
Development                Production
─────────────             ──────────

Frontend ────────────┐
                     ├──→ Vercel
Backend ─────────────┤
(localhost:5000)     │
                     ├──→ Railway/Render
Supabase (dev)   ────┘
(localhost)          
                     
                     ┌──→ Vercel
Frontend (prod) ─────┤
                     ├──→ Railway/Render/Heroku
Backend (prod)  ─────┤
                     └──→ Supabase (Cloud)
```

---

## 📊 Technology Layers

```
Presentation Layer (Frontend)
├── React 19
├── Vite (build tool)
├── Tailwind CSS
└── Framer Motion (animations)
           ↓
        HTTP
           ↓
API Layer (Backend)
├── Express.js
├── TypeScript
├── Zod (validation)
└── CORS (cross-origin)
           ↓
      Supabase SDK
           ↓
Data Layer (Database)
├── Supabase Auth (authentication)
├── PostgreSQL (database)
└── JWT (tokens)
```

---

**This diagram shows the complete project structure after backend creation.**
**Ready for frontend integration and deployment!** 🚀
