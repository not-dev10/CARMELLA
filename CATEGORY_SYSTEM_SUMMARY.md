# Category System Summary

## How It Works

The category system is fully dynamic and managed through the admin panel. Here's the complete flow:

### 1. Admin Creates Categories
**Location:** Admin Panel → Categories Tab

- Admin creates categories with:
  - Name (e.g., "Vases", "Bowls", "Mugs")
  - Description (optional)
  - Image (uploaded to Cloudinary)
  - Slug (auto-generated from name)

**Example:**
- Name: "Coffee Mugs" → Slug: "coffee-mugs"
- Name: "Vases & Bowls" → Slug: "vases-bowls"

### 2. Categories Display on Homepage
**Location:** Homepage → Categories Section

- Fetches all categories from database
- Displays as 3D cards with:
  - Category image
  - Category name
  - Description
  - "SHOP NOW" button linking to `/category/:slug`

### 3. User Clicks Category
**Action:** Navigates to `/category/:slug`

Example: Clicking "Coffee Mugs" → `/category/coffee-mugs`

### 4. Category Page Loads
**Location:** `Category.tsx`

**Process:**
1. Extracts slug from URL (`useParams`)
2. Fetches all categories from API
3. Finds category matching the slug
4. Fetches all products from API
5. Filters products where `product.category_id === category.id`
6. Displays filtered products

### 5. Products Display
**Features:**
- Grid or List view toggle
- Sort options (Featured, Price, Name)
- Product cards with:
  - Image
  - Name
  - Price (with B2B pricing if approved)
  - Stock status
  - "View Details" button

## Database Schema

```sql
-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,  -- Auto-generated from name
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id),  -- Links to category
  name VARCHAR(255),
  slug VARCHAR(255),
  base_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  b2b_price DECIMAL(10,2),
  image_url TEXT,
  stock_quantity INT,
  is_featured BOOLEAN,
  -- ... other fields
);
```

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Products
- `GET /api/products?category=<category_id>` - Get products by category
- `GET /api/products` - Get all products

## Frontend Routes

```
/                           → Homepage (shows all categories)
/category/:slug             → Category page (shows products in category)
/product/:id                → Product detail page
/catalog                    → All products page
/admin                      → Admin panel (manage categories)
```

## Key Features

### 1. Dynamic Slug Generation
Backend automatically generates URL-friendly slugs:
```typescript
const slug = name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
```

### 2. Category Filtering
Frontend filters products by category:
```typescript
const categoryProducts = products.filter(p => p.category_id === category.id)
```

### 3. SEO-Friendly URLs
- `/category/coffee-mugs` (readable)
- Not `/category/123e4567-e89b-12d3-a456-426614174000` (UUID)

### 4. Responsive Design
- Desktop: Grid layout with 3D cards
- Mobile: Horizontal scroll with swipe

### 5. Admin Management
- Create/Edit/Delete categories
- Upload images to Cloudinary
- Auto-generate slugs
- Real-time updates

## Example Flow

1. **Admin creates "Ceramic Vases" category**
   - Name: "Ceramic Vases"
   - Slug: "ceramic-vases" (auto-generated)
   - Description: "Handcrafted ceramic vases"
   - Image: Uploaded to Cloudinary

2. **Category appears on homepage**
   - 3D card with image and name
   - "SHOP NOW" button

3. **User clicks "SHOP NOW"**
   - Navigates to `/category/ceramic-vases`

4. **Category page loads**
   - Shows "Ceramic Vases" header
   - Displays all products where `category_id` matches
   - User can sort, filter, and view products

5. **User clicks product**
   - Navigates to `/product/:id`
   - Shows full product details

## Benefits

✅ **Fully Dynamic** - No hardcoded categories
✅ **Admin Controlled** - Manage via admin panel
✅ **SEO Friendly** - Readable URLs with slugs
✅ **Scalable** - Add unlimited categories
✅ **Responsive** - Works on all devices
✅ **Fast** - Cached API responses
✅ **Secure** - RLS policies on database

## Files Involved

### Frontend
- `src/pages/Category.tsx` - Category page component
- `src/components/sections/categories.tsx` - Homepage categories section
- `src/lib/api.ts` - API calls for categories and products
- `src/App.tsx` - Route configuration

### Backend
- `src/controllers/categoryController.ts` - Category CRUD operations
- `src/controllers/productController.ts` - Product filtering by category
- `src/routes/categories.ts` - Category API routes
- `backend/supabase-setup.sql` - Database schema

### Admin
- `src/components/admin/categories-section.tsx` - Category management UI
- `src/pages/Admin.tsx` - Admin panel

## Testing

1. **Create a category in admin panel**
2. **Verify it appears on homepage**
3. **Click the category card**
4. **Verify it navigates to `/category/:slug`**
5. **Verify products in that category are displayed**
6. **Test sorting and filtering**
7. **Test on mobile (swipe)**

## Troubleshooting

### Category not showing on homepage
- Check if category was created successfully in admin
- Check browser console for API errors
- Verify backend server is running

### Products not showing on category page
- Verify products have correct `category_id`
- Check if products are marked as `is_active: true`
- Check browser console for filtering errors

### Slug conflicts
- Each category must have unique name
- Backend auto-generates unique slugs
- If conflict, add number suffix (e.g., "vases-2")
