# Comprehensive System Audit Report

## Database Schema ✅ CORRECT

**Products Table** (`carmella/backend/supabase-setup.sql`):
```sql
CREATE TABLE public.products (
  -- Pricing fields
  base_price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  sale_percentage DECIMAL(5, 2),
  b2b_price DECIMAL(10, 2),
  b2b_min_quantity INT DEFAULT 1,
  moq INT DEFAULT 1,  -- ✅ MOQ field exists
  ...
)
```

## Admin Panel ✅ CORRECT

**Products Section** (`carmella/frontend/src/components/admin/products-section.tsx`):
- ✅ MOQ field in form data
- ✅ MOQ field in edit/create modal
- ✅ MOQ saved to database
- ✅ Default value: 1

## Backend API ✅ CORRECT

**Product Controller** (`carmella/backend/src/controllers/productController.ts`):

### getAll() - Line 35-50:
```typescript
let query = userSupabase.from("products_safe").select(`
  id, name, slug, category_id,
  base_price, sale_price, sale_percentage,
  b2b_price,
  moq,  // ✅ MOQ included
  image_url, stock_quantity, is_featured,
  pricing_locked, user_tier
`)
```

### getById() - Line 206-225:
```typescript
.select(`
  id, name, slug, category_id, description,
  base_price, sale_price, sale_percentage,
  b2b_price,
  moq,  // ✅ MOQ included
  image_url, stock_quantity, is_featured,
  pricing_locked, user_tier
`)
```

### Homepage Featured Products - Line 123-135:
```typescript
.select(`
  id, name, slug, image_url,
  base_price, sale_price,
  b2b_price,
  pricing_locked, user_tier
`)
```
⚠️ **ISSUE**: MOQ NOT included in featured products!

## Frontend Components

### 1. ProductDetail.tsx ✅ CORRECT
- ✅ MOQ used for bulk mode quantity
- ✅ Bulk/Retail toggle implemented
- ✅ Price calculation based on mode

### 2. AddToCartModal.tsx ✅ CORRECT
- ✅ MOQ field in product interface
- ✅ MOQ used for bulk mode minimum
- ✅ Quantity validation

### 3. ProductCardCompact.tsx ✅ CORRECT
- ✅ MOQ in product interface
- ✅ Passed to modal

### 4. Catalog.tsx ❌ ISSUE FOUND
**Problem**: `handleAddToCart` price calculation
```typescript
const price = buyMode === 'bulk' && product.b2b_price 
    ? product.b2b_price 
    : (product.sale_price || product.base_price || 0)
```
This is correct, BUT the cartItem structure might be wrong.

### 5. CartContext.tsx ❌ MAJOR ISSUE
**Problem**: When syncing from database, it doesn't preserve the buy mode or correct discount price

Line 52-62:
```typescript
const dbItems: CartItem[] = response.items.map((item: any) => ({
  id: item.id,
  productId: item.product_id,
  name: item.products?.name || 'Product',
  price: item.products?.base_price || 0,
  quantity: item.quantity,
  discountPrice: item.products?.sale_price || item.products?.b2b_price,
  // ❌ ISSUE: Always picks sale_price first, then b2b_price
  // Should respect the original buy mode
}))
```

## Critical Issues Found

### Issue #1: Homepage Featured Products Missing MOQ
**Location**: `carmella/backend/src/controllers/homepageController.ts`
**Impact**: Featured products on homepage don't have MOQ data
**Fix**: Add `moq` to select query

### Issue #2: Cart Doesn't Store Buy Mode
**Location**: `carmella/frontend/src/contexts/CartContext.tsx`
**Impact**: When cart is synced from database, it doesn't know if item was added in bulk or retail mode
**Fix**: Need to store buy mode in cart items

### Issue #3: Backend Cart Table Missing Buy Mode
**Location**: Database schema
**Impact**: Can't persist buy mode preference
**Fix**: Add `buy_mode` column to cart_items table

### Issue #4: Price Calculation in Cart Sync
**Location**: `CartContext.tsx` line 58
**Impact**: Always prefers sale_price over b2b_price, even for bulk orders
**Fix**: Need proper logic to determine which price to use

## Recommended Fixes

### Priority 1: Add Buy Mode to Cart
1. Add `buy_mode` column to `cart_items` table
2. Update CartContext to store/retrieve buy mode
3. Update cart API to handle buy mode

### Priority 2: Fix Homepage MOQ
Add `moq` to featured products query

### Priority 3: Fix Cart Price Logic
Update cart sync to use correct price based on buy mode

### Priority 4: Add Buy Mode Indicator in Cart UI
Show badge in mini-cart: "🛒 Retail" or "📦 Bulk"

## Testing Checklist
- [ ] Admin can set MOQ when creating product
- [ ] MOQ appears in product detail page
- [ ] Bulk mode enforces MOQ
- [ ] Retail mode allows quantity 1
- [ ] Cart stores correct price for bulk items
- [ ] Cart stores correct price for retail items
- [ ] Mini-cart displays correct prices
- [ ] Checkout shows correct prices
- [ ] Database cart persists buy mode
- [ ] Cart sync preserves buy mode and prices
