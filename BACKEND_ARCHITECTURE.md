# Carmella Backend Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Pages: Home, Catalog, ProductDetail, Login, Signup, etc.    │   │
│  │ Components: Products, Cart, Header, Footer, etc.            │   │
│  │ AuthContext: Manages user session & authentication         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                    HTTP + JSON
                    (axios/fetch)
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                    Backend (Express + TypeScript)                    │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Express Server (Port 5000)                                  │  │
│  │                                                                │  │
│  │  Routes Layer                                                │  │
│  │  ├── /api/auth         → authRoutes                          │  │
│  │  ├── /api/products     → productRoutes                       │  │
│  │  ├── /api/users        → userRoutes                          │  │
│  │  ├── /api/categories   → categoryRoutes                      │  │
│  │  └── /api/admin        → adminRoutes                         │  │
│  │                                                                │  │
│  │  Controllers Layer                                           │  │
│  │  ├── authController    → signup, login, google, me           │  │
│  │  ├── productController → list, get, create, update, delete   │  │
│  │  ├── userController    → profile, B2B requests               │  │
│  │  ├── categoryController→ list, get, create                   │  │
│  │  └── adminController   → B2B approvals management            │  │
│  │                                                                │  │
│  │  Middleware Layer                                            │  │
│  │  ├── authMiddleware    → Verify JWT tokens                   │  │
│  │  ├── adminMiddleware   → Check admin role                    │  │
│  │  ├── b2bMiddleware     → Check B2B status                    │  │
│  │  └── errorHandler      → Error responses                     │  │
│  │                                                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                    Supabase SDK
                    (JWT Tokens)
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                   Supabase (Auth + PostgreSQL)                      │
│                                                                       │
│  Authentication Layer                Database Layer                 │
│  ├── Email/Password         ├── users                              │
│  ├── Google OAuth           ├── products                           │
│  ├── JWT Tokens             ├── categories                         │
│  └── Session Mgmt           ├── b2b_approvals                      │
│                             └── orders (optional)                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Request Flow Examples

### 1. User Signup/Login

```
Frontend Form Submit
       ↓
POST /api/auth/signup { email, password, name }
       ↓
authController.signup()
       ↓
supabase.auth.signUpWithPassword()
       ↓
Supabase creates auth user
       ↓
Insert profile to users table
       ↓
Return { user, session }
       ↓
Frontend stores token in localStorage
       ↓
Ready for authenticated requests
```

### 2. Get Products

```
Frontend: productAPI.list({ category, search, sort })
       ↓
GET /api/products?category=bowls&search=ceramic&page=1
       ↓
productController.getProducts()
       ↓
Build Supabase query with filters
       ↓
supabase.from("products").select().where(...).order(...)
       ↓
Database returns products + pagination
       ↓
Return { products, pagination }
       ↓
Frontend displays product grid
```

### 3. Protected Route (B2B Request)

```
Frontend: User clicks "Request B2B Access"
       ↓
POST /api/users/{id}/request-b2b with token
       ↓
Authorization header: "Bearer <access_token>"
       ↓
authMiddleware verifies token
       ↓
userController.requestB2BAccess()
       ↓
Validate request (name, company)
       ↓
Insert to b2b_approvals table
       ↓
Return approval request record
       ↓
Frontend shows "Request Pending"
       ↓
Admin views in /api/admin/b2b-requests
       ↓
Admin clicks "Approve"
       ↓
adminController.approveB2BRequest()
       ↓
Update b2b_approvals: status = "approved"
       ↓
Update users: user_type = "b2b_approved"
       ↓
Set expires_at = 90 days from now
       ↓
Frontend sees B2B status changed
       ↓
User can now access B2B pricing & features
```

## Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────┐
│          User Action (Login/Signup)             │
└──────────────────┬──────────────────────────────┘
                   ↓
        ┌──────────────────────┐
        │   Supabase Auth      │
        │ • Email/Password     │
        │ • Google OAuth       │
        │ • JWT Generation     │
        └──────────┬───────────┘
                   ↓
            ┌─────────────┐
            │ Get Token   │
            │ & User ID   │
            └─────┬───────┘
                  ↓
        ┌─────────────────────┐
        │ Create/Get Profile  │
        │ in users table      │
        └────────┬────────────┘
                 ↓
        ┌────────────────────┐
        │ Return Session     │
        │ { token, user }    │
        └────────┬───────────┘
                 ↓
        ┌────────────────────┐
        │ Frontend stores    │
        │ token in storage   │
        └────────┬───────────┘
                 ↓
    ┌───────────────────────────┐
    │ Include token in requests │
    │ Authorization: Bearer ... │
    └────────┬──────────────────┘
             ↓
    ┌────────────────────────────┐
    │ authMiddleware verifies    │
    │ token with Supabase        │
    └────────┬───────────────────┘
             ↓
    ┌────────────────────────────┐
    │ Get user_type from DB      │
    │ customer/b2b_pending/...   │
    └────────┬───────────────────┘
             ↓
    ┌────────────────────────────┐
    │ Check permissions          │
    │ adminMiddleware if needed  │
    └────────┬───────────────────┘
             ↓
    ┌────────────────────────────┐
    │ Execute handler            │
    │ Return data or 403         │
    └────────────────────────────┘
```

## Role-Based Access Control (RBAC)

```
┌──────────────────────────────────────────────────────┐
│               User Types & Permissions               │
├──────────────────────────────────────────────────────┤
│                                                       │
│  CUSTOMER (default)                                  │
│  ├── Browse products          ✅                     │
│  ├── View prices              ✅ (retail)            │
│  ├── View profile             ✅                     │
│  ├── Request B2B              ✅                     │
│  ├── Edit profile             ✅                     │
│  ├── Manage orders            ✅ (own only)          │
│  └── Admin features           ❌                     │
│                                                       │
│  B2B_PENDING                                         │
│  ├── Browse products          ✅                     │
│  ├── View prices              ✅ (retail)            │
│  ├── View profile             ✅                     │
│  ├── Edit profile             ✅                     │
│  ├── Manage orders            ✅ (own only)          │
│  ├── B2B prices               ❌ (waiting approval)  │
│  ├── Bulk orders              ❌ (waiting approval)  │
│  └── Admin features           ❌                     │
│                                                       │
│  B2B_APPROVED                                        │
│  ├── Browse products          ✅                     │
│  ├── View B2B prices          ✅ (special pricing)   │
│  ├── Bulk orders              ✅                     │
│  ├── View profile             ✅                     │
│  ├── Edit profile             ✅                     │
│  ├── Manage orders            ✅ (own only)          │
│  ├── Access B2B features      ✅                     │
│  └── Admin features           ❌                     │
│                                                       │
│  ADMIN                                               │
│  ├── All user features        ✅                     │
│  ├── Manage products          ✅ (CRUD)              │
│  ├── Manage categories        ✅                     │
│  ├── View B2B requests        ✅                     │
│  ├── Approve/reject B2B       ✅                     │
│  ├── View all users           ✅                     │
│  ├── View analytics           ✅ (future)            │
│  └── System settings          ✅ (future)            │
│                                                       │
└──────────────────────────────────────────────────────┘
```

## B2B Approval Workflow

```
User                Backend                Admin              Database
 │                    │                      │                   │
 ├─ Request B2B      ─→│                      │                   │
 │  (POST /users/    │  │                     │                   │
 │   :id/request-b2b)│  │                     │                   │
 │                    │  ├─ Insert           ─→                   │
 │                    │  │ b2b_approval      │                  ✓
 │                    │  │ status: pending   │
 │                    │  ←─ Return request  ─│
 │                    │←─────────────────────┤
 │  [Pending]         │                      │
 │                    │                    ┌─→ Sees request in
 │                    │                    │   /admin/b2b-requests
 │                    │                    │
 │                    │                    ├─ Approve
 │                    │                    │  (PUT /.../approve)
 │  ✉️ Notified      ←│ Update user_type  ←│
 │    (B2B Approved)  │ = "b2b_approved"  ←┤
 │                    │ expires_at = +90d  │
 │  [Approved]        │                    │
 │                    │                   ─→ Update database
 │                    │                      │
 │ Access B2B ✅      │                      │ ✓
 │ pricing & features │                      │
 │                    │                      │
 │ [After 90 days]    │                      │
 │ Status expires     │                      │
 │ user_type reverts  │                      │
 │ to "customer"      │                      │
 │ (auto or manual)   │                      │
 │                    │                      │
```

## Database Relationships

```
users
├── id (UUID, PK)
├── email
├── user_type → Determines access level
├── profile info
└── auth via Supabase Auth
    │
    ├─── b2b_approvals (1:Many)
    │    ├── user_id (FK)
    │    ├── status (pending/approved/rejected)
    │    ├── request_date
    │    ├── approval_date
    │    └── expires_at
    │
    └─── orders (1:Many)
         ├── order_id (UUID, PK)
         ├── items (JSON)
         ├── total
         ├── status
         └── created_at

products
├── id (UUID, PK)
├── name
├── price (retail)
├── b2b_price (bulk)
├── category_id (FK)
├── moq (Minimum Order Quantity)
└── stock

categories
├── id (UUID, PK)
├── name
├── description
└── image_url

b2b_approvals
├── id (UUID, PK)
├── user_id (FK → users)
├── status (pending/approved/rejected)
├── company_name
├── tax_id
├── request_date
├── approval_date
├── expires_at (90 days from approval)
└── notes

orders
├── id (UUID, PK)
├── user_id (FK → users)
├── items (JSON array)
├── total
├── status (pending/confirmed/shipped/delivered)
├── shipping_address
└── created_at
```

## Deployment Architecture (Future)

```
┌─────────────────┐          ┌──────────────────┐
│  Frontend       │          │  Backend         │
│  (Vercel/Build) │──────→  │  (Railway/Render)│
│                 │          │                  │
│  React + Vite   │          │  Express + TS    │
└────────┬────────┘          └────────┬─────────┘
         │                            │
         └───────────────────┬────────┘
                             ▼
                   ┌──────────────────┐
                   │  Supabase Cloud  │
                   │ ┌──────────────┐ │
                   │ │ PostgreSQL   │ │
                   │ │ Auth Service │ │
                   │ │ Storage      │ │
                   │ └──────────────┘ │
                   └──────────────────┘
```

---

This architecture ensures:
- ✅ **Scalability** - Supabase handles data layer
- ✅ **Security** - JWT auth, RBAC, input validation
- ✅ **Maintainability** - Clear separation of concerns
- ✅ **Performance** - Indexed database queries
- ✅ **Reliability** - Error handling, logging
