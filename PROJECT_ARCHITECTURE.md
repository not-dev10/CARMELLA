# Carmella Project Architecture

## Project Structure Overview

```
carmella/
├── backend/                          # Express.js API Server
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   │   ├── index.ts            # Main config
│   │   │   └── supabase.ts         # Supabase client setup
│   │   │
│   │   ├── controllers/             # Business logic handlers
│   │   │   ├── authController.ts
│   │   │   ├── adminController.ts
│   │   │   ├── cartController.ts
│   │   │   ├── orderController.ts
│   │   │   ├── productController.ts
│   │   │   ├── userController.ts
│   │   │   ├── categoryController.ts
│   │   │   ├── reviewController.ts
│   │   │   ├── analyticsController.ts
│   │   │   ├── homepageController.ts
│   │   │   └── wishlistController.ts
│   │   │
│   │   ├── routes/                  # API endpoints
│   │   │   ├── auth.ts
│   │   │   ├── admin.ts
│   │   │   ├── cart.ts
│   │   │   ├── orders.ts
│   │   │   ├── products.ts
│   │   │   ├── users.ts
│   │   │   ├── categories.ts
│   │   │   ├── reviews.ts
│   │   │   ├── analytics.ts
│   │   │   ├── homepage.ts
│   │   │   └── wishlist.ts
│   │   │
│   │   ├── middleware/              # Express middleware
│   │   │   └── index.ts            # Auth, admin, error handlers
│   │   │
│   │   ├── types/                   # TypeScript types
│   │   │   ├── index.ts            # Common types
│   │   │   └── validation.ts       # Validation schemas
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── errors.ts           # Error handling
│   │   │   ├── jwt.ts              # JWT utilities
│   │   │   ├── password.ts         # Password hashing
│   │   │   ├── orderId.ts          # Order ID generation
│   │   │   ├── securePricing.ts    # Pricing utilities
│   │   │   └── supabaseClient.ts   # Supabase helpers
│   │   │
│   │   └── index.ts                # Server entry point
│   │
│   ├── migrations/                  # Database migrations
│   │   ├── supabase-setup.sql
│   │   ├── add-order-number.sql
│   │   ├── add-b2b-request-fields.sql
│   │   └── supabase-secure-pricing-view.sql
│   │
│   ├── seeds/                       # Database seed files
│   │   ├── seed-categories.sql
│   │   ├── seed-products.sql
│   │   └── seed-orders.sql
│   │
│   ├── docs/                        # Backend documentation
│   │   ├── API_ENDPOINTS.md
│   │   ├── QUICK_START.md
│   │   ├── SETUP.md
│   │   └── B2B_APPROVAL_SYSTEM.md
│   │
│   ├── .env                         # Environment variables (local)
│   ├── .env.example                 # Environment template
│   ├── .eslintrc.json              # ESLint config
│   ├── tsconfig.json               # TypeScript config
│   ├── package.json                # Dependencies
│   └── README.md                   # Backend readme
│
├── frontend/                        # React + Vite Frontend
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Catalog.tsx
│   │   │   ├── Category.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   ├── Admin.tsx
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── AuthCallback.tsx
│   │   │   ├── About.tsx
│   │   │   └── Contact.tsx
│   │   │
│   │   ├── components/              # Reusable components
│   │   │   ├── layout/             # Layout components
│   │   │   │   ├── header.tsx
│   │   │   │   ├── footer.tsx
│   │   │   │   └── announcement-bar.tsx
│   │   │   │
│   │   │   ├── admin/              # Admin panel sections
│   │   │   │   ├── orders-section.tsx
│   │   │   │   ├── products-section.tsx
│   │   │   │   ├── users-section.tsx
│   │   │   │   ├── categories-section.tsx
│   │   │   │   ├── analytics-section.tsx
│   │   │   │   ├── inventory-section.tsx
│   │   │   │   ├── contacts-section.tsx
│   │   │   │   ├── activity-section.tsx
│   │   │   │   └── settings-section.tsx
│   │   │   │
│   │   │   ├── catalog/            # Catalog components
│   │   │   │   ├── product-grid.tsx
│   │   │   │   ├── product-detail.tsx
│   │   │   │   ├── catalog-header.tsx
│   │   │   │   └── related-products.tsx
│   │   │   │
│   │   │   ├── sections/           # Homepage sections
│   │   │   │   ├── hero.tsx
│   │   │   │   ├── categories.tsx
│   │   │   │   ├── product-showcase.tsx
│   │   │   │   ├── testimonials.tsx
│   │   │   │   ├── newsletter.tsx
│   │   │   │   ├── brand-quote.tsx
│   │   │   │   ├── giving-back.tsx
│   │   │   │   └── collection-split.tsx
│   │   │   │
│   │   │   ├── animations/         # Animation components
│   │   │   │   ├── fade-in.tsx
│   │   │   │   ├── parallax.tsx
│   │   │   │   ├── marquee.tsx
│   │   │   │   └── parallax-image.tsx
│   │   │   │
│   │   │   ├── ui/                 # UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── mode-toggle.tsx
│   │   │   │   ├── search-bar.tsx
│   │   │   │   ├── back-to-top.tsx
│   │   │   │   ├── exit-intent-popup.tsx
│   │   │   │   ├── magnetic-button.tsx
│   │   │   │   ├── splash-cursor.tsx
│   │   │   │   ├── spline-scene.tsx
│   │   │   │   ├── 3d-card.tsx
│   │   │   │   ├── image-shim.tsx
│   │   │   │   ├── link-shim.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   └── textarea.tsx
│   │   │   │
│   │   │   ├── protected-route.tsx
│   │   │   ├── admin-protected-route.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   ├── smooth-scroll.tsx
│   │   │   └── PricingDisplay.tsx
│   │   │
│   │   ├── contexts/               # React contexts
│   │   │   ├── AuthContext.tsx     # Authentication state
│   │   │   ├── CartContext.tsx     # Shopping cart state
│   │   │   └── SupabaseContext.tsx # Supabase client
│   │   │
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── index.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── usePricing.ts
│   │   │
│   │   ├── lib/                    # Utility libraries
│   │   │   ├── api.ts             # API client
│   │   │   ├── supabase.ts        # Supabase client
│   │   │   ├── utils.ts           # General utilities
│   │   │   └── router-shim.tsx    # Router utilities
│   │   │
│   │   ├── assets/                # Static assets
│   │   │   └── react.svg
│   │   │
│   │   ├── App.tsx                # Main app component
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Global styles
│   │
│   ├── public/                     # Static files
│   │   ├── carmella.png
│   │   ├── vite.svg
│   │   ├── main.js
│   │   └── particle-main.js
│   │
│   ├── .env                        # Environment variables (local)
│   ├── .env.local                  # Local overrides
│   ├── .env.example                # Environment template
│   ├── .eslintrc.json             # ESLint config
│   ├── vite.config.ts             # Vite config
│   ├── tsconfig.json              # TypeScript config
│   ├── tsconfig.app.json          # App TypeScript config
│   ├── tsconfig.node.json         # Node TypeScript config
│   ├── package.json               # Dependencies
│   ├── index.html                 # HTML entry
│   └── README.md                  # Frontend readme
│
├── docs/                           # Project documentation
│   ├── IMPLEMENTATION_STATUS.md
│   ├── ADMIN_PANEL_GUIDE.md
│   ├── ADMIN_PANEL_COMPLETE.md
│   ├── FRONTEND_BACKEND_ALIGNMENT.md
│   ├── CRITICAL_GAPS_SUMMARY.md
│   ├── REVIEW_SYSTEM_IMPLEMENTATION.md
│   └── ORGANIZATION_GUIDE.md
│
├── .git/                           # Git repository
├── .gitignore                      # Git ignore rules
├── package.json                    # Root package.json
├── package-lock.json               # Dependency lock
│
└── README.md                       # Project readme

```

## Architecture Layers

### Backend Architecture

```
Request → Routes → Middleware → Controllers → Services → Database
                      ↓
                   Error Handler
```

**Flow:**
1. **Routes** - Define API endpoints
2. **Middleware** - Authentication, validation, error handling
3. **Controllers** - Business logic and request handling
4. **Utils** - Helper functions (JWT, passwords, pricing)
5. **Database** - Supabase (PostgreSQL)

### Frontend Architecture

```
App.tsx → Routes → Pages → Components → Contexts/Hooks → API Client
                                ↓
                            UI Components
```

**Flow:**
1. **App.tsx** - Main router setup
2. **Pages** - Full page components
3. **Components** - Reusable UI components
4. **Contexts** - Global state (Auth, Cart)
5. **Hooks** - Custom React hooks
6. **API Client** - Backend communication

## Key Features by Module

### Authentication Module
- **Backend**: `authController.ts`, `middleware/index.ts`
- **Frontend**: `AuthContext.tsx`, `Login.tsx`, `Signup.tsx`
- **Database**: `users` table with B2B fields

### Cart & Orders Module
- **Backend**: `cartController.ts`, `orderController.ts`
- **Frontend**: `CartContext.tsx`, `Checkout.tsx`, `Orders.tsx`
- **Database**: `carts`, `cart_items`, `orders`, `order_items` tables

### Admin Panel Module
- **Backend**: `adminController.ts`
- **Frontend**: `Admin.tsx`, `admin/` components
- **Features**: Users, Orders, Products, Categories, Analytics, B2B Requests

### Product Catalog Module
- **Backend**: `productController.ts`, `categoryController.ts`
- **Frontend**: `Catalog.tsx`, `ProductDetail.tsx`, `Category.tsx`
- **Database**: `products`, `categories` tables with pricing views

### B2B System Module
- **Backend**: B2B approval logic in `adminController.ts`
- **Frontend**: B2B request forms, approval status display
- **Database**: `b2b_requests` table, user approval status

## Database Schema

### Core Tables
- `users` - User accounts with B2B fields
- `products` - Product catalog with pricing
- `categories` - Product categories
- `carts` - Shopping carts
- `cart_items` - Items in carts
- `orders` - Customer orders
- `order_items` - Items in orders
- `reviews` - Product reviews
- `wishlist` - User wishlists
- `b2b_requests` - B2B approval requests

### Views
- `products_safe` - Secure pricing view (RLS-protected)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/orders` - List all orders
- `PUT /api/admin/orders/:orderId` - Update order status
- `GET /api/admin/b2b-requests` - List B2B requests
- `PUT /api/admin/b2b-requests/:userId/approve` - Approve B2B
- `PUT /api/admin/b2b-requests/:userId/reject` - Reject B2B

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
NODE_ENV=development
PORT=5000
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Development Workflow

1. **Backend Development**
   - Create controller in `src/controllers/`
   - Create routes in `src/routes/`
   - Add middleware if needed
   - Test with API client

2. **Frontend Development**
   - Create page in `src/pages/`
   - Create components in `src/components/`
   - Use contexts for state management
   - Call API via `lib/api.ts`

3. **Database Changes**
   - Create migration in `backend/migrations/`
   - Run migration in Supabase
   - Update types if needed

## Deployment

### Backend
- Deploy to Node.js hosting (Heroku, Railway, Render)
- Set environment variables
- Run migrations

### Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or static hosting
- Set environment variables

### Database
- Supabase PostgreSQL (managed)
- Automatic backups
- RLS policies for security

## Best Practices

1. **Code Organization**
   - Keep controllers focused on business logic
   - Use middleware for cross-cutting concerns
   - Organize components by feature

2. **Type Safety**
   - Use TypeScript for all code
   - Define types in `types/` folder
   - Validate API responses

3. **Error Handling**
   - Use custom error classes
   - Implement error middleware
   - Log errors for debugging

4. **Security**
   - Use RLS policies in database
   - Validate all inputs
   - Protect sensitive routes
   - Use JWT for authentication

5. **Performance**
   - Implement caching where appropriate
   - Optimize database queries
   - Lazy load components
   - Minimize bundle size
