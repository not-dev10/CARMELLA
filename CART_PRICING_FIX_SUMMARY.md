# Cart Pricing Fix - Complete Summary

## Issues Fixed

### 1. ✅ Homepage Featured Products Missing MOQ
**File**: `carmella/backend/src/controllers/homepageController.ts`
**Fix**: Added `moq` field to the select query for featured products

### 2. ✅ Cart Doesn't Store Buy Mode
**Files Modified**:
- `carmella/frontend/src/contexts/CartContext.tsx` - Added `buyMode` to CartItem interface
- `carmella/frontend/src/pages/Catalog.tsx` - Pass buyMode when adding to cart
- `carmella/frontend/src/pages/ProductDetail.tsx` - Pass buyMode when adding to cart

### 3. ✅ Cart Sync Price Logic Fixed
**File**: `carmella/frontend/src/contexts/CartContext.tsx`
**Fix**: Updated `syncCartFromDatabase` to use correct price based on buy_mode:
- If `buy_mode === 'bulk'` → use `b2b_price`
- Otherwise → use `sale_price` if available

### 4. ✅ Buy Mode Indicator in Mini-Cart
**File**: `carmella/frontend/src/components/layout/mini-cart.tsx`
**Fix**: Added badge showing "📦 Bulk" or "🛒 Retail" for each cart item

### 5. ✅ Database Migration Created
**File**: `carmella/backend/add-buy-mode-to-cart.sql`
**Purpose**: Adds `buy_mode` column to `cart_items` table

## Database Migration Required

Run this SQL to add buy_mode support:

```sql
-- Add buy_mode column to cart_items
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS buy_mode VARCHAR(10) DEFAULT 'retail' 
CHECK (buy_mode IN ('retail', 'bulk'));

-- Update existing rows based on quantity vs MOQ
UPDATE public.cart_items ci
SET buy_mode = 'bulk'
FROM public.products p
WHERE ci.product_id = p.id 
AND ci.quantity >= p.moq
AND ci.buy_mode = 'retail';
```

## How It Works Now

### Adding to Cart:
1. User selects Retail or Bulk mode in modal
2. Correct price is calculated:
   - **Retail**: `sale_price` || `base_price`
   - **Bulk**: `b2b_price` || `sale_price` || `base_price`
3. CartItem includes:
   - `price`: base_price (for reference)
   - `discountPrice`: actual price based on mode
   - `buyMode`: 'retail' or 'bulk'

### Cart Display:
1. Mini-cart shows buy mode badge for each item
2. Price displayed is `discountPrice` || `price`
3. Savings calculated correctly

### Cart Sync:
1. When syncing from database, buy_mode is read
2. Correct price is applied based on buy_mode
3. Local cart matches database cart

## Testing Checklist

### Before Migration:
- [ ] Backup database
- [ ] Note current cart items

### After Migration:
- [ ] Run migration SQL
- [ ] Verify cart_items table has buy_mode column
- [ ] Test adding retail item - should show "🛒 Retail"
- [ ] Test adding bulk item - should show "📦 Bulk"
- [ ] Verify retail item uses sale_price/base_price
- [ ] Verify bulk item uses b2b_price
- [ ] Test cart sync after login
- [ ] Verify prices persist correctly
- [ ] Check mini-cart displays correct prices
- [ ] Check checkout page displays correct prices

## Backend API Updates Needed

The backend cart API needs to be updated to:
1. Accept `buy_mode` parameter in add/update endpoints
2. Store `buy_mode` in database
3. Return `buy_mode` when fetching cart

**Files to Update**:
- `carmella/backend/src/controllers/cartController.ts`
- `carmella/backend/src/routes/cart.ts`

## Price Calculation Logic

```typescript
// Frontend (when adding to cart)
const price = buyMode === 'bulk' && product.b2b_price 
    ? product.b2b_price 
    : (product.sale_price || product.base_price)

// Frontend (when syncing from DB)
if (buyMode === 'bulk' && item.products?.b2b_price) {
    discountPrice = item.products.b2b_price
} else if (item.products?.sale_price) {
    discountPrice = item.products.sale_price
}
```

## Visual Indicators

### Mini-Cart:
- 📦 Bulk - Green badge for bulk items
- 🛒 Retail - Blue badge for retail items

### Product Detail:
- Toggle buttons: "🛒 Retail Buy" | "📦 Bulk Buy"
- Active mode highlighted

### Add to Cart Modal:
- Mode selector at top
- Price updates based on selection
- Quantity enforces MOQ for bulk

## Benefits

1. ✅ **Accurate Pricing**: Bulk items always show B2B price
2. ✅ **Transparency**: Users see which mode each item was added in
3. ✅ **Persistence**: Buy mode survives page refresh and login
4. ✅ **Flexibility**: Users can mix retail and bulk items in same cart
5. ✅ **Audit Trail**: Database tracks purchase intent

## Known Limitations

1. Backend cart API doesn't yet accept buy_mode parameter
2. Existing cart items will default to 'retail' mode
3. Migration will auto-detect bulk items based on quantity >= MOQ

## Next Steps

1. Run database migration
2. Update backend cart API to handle buy_mode
3. Test thoroughly with both retail and bulk items
4. Monitor for any pricing discrepancies
