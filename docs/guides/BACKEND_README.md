# Carmella Backend API

RESTful backend for the Carmella B2B ceramics platform built with Express.js and Supabase.

## Setup

### Prerequisites
- Node.js 18+
- npm/yarn
- Supabase account with database set up

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the backend root:

```dotenv
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_secret_key_min_32_chars

# Server
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

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

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with filtering)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (admin only)

### B2B Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/approvals` - Get B2B approval status
- `POST /api/users/:id/request-b2b` - Request B2B access

### Admin
- `GET /api/admin/b2b-requests` - List B2B approval requests
- `PUT /api/admin/b2b-requests/:userId/approve` - Approve B2B user
- `PUT /api/admin/b2b-requests/:userId/reject` - Reject B2B user

## Project Structure

```
src/
├── index.ts              # Entry point
├── config/              # Configuration files
├── middleware/          # Express middleware
├── routes/              # API routes
├── controllers/         # Request handlers
├── services/           # Business logic
├── utils/              # Utility functions
├── types/              # TypeScript types
└── db/                 # Database models
```

## Authentication

The API uses JWT for authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## License

MIT
