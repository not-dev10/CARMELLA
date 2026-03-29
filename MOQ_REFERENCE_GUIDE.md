# MOQ (Minimum Order Quantity) - Complete Reference Guide

## 📍 Current Status

**MOQ Field Status:**
- ✅ Database: Exists in `products` table
- ✅ Backend API: Included in all product queries
- ✅ Frontend Display: Used in multiple components
- ❌ **Admin Panel: MISSING from product form** ⚠️

---

## 🗄️ Database Schema

**Table:** `products`  
**Column:** `moq` (INT, DEFAULT 1)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  moq INT DEFAULT 1,  -- Minimum Order Quantity for bulk orders
  -- ... other fields
);
```

---

## 🔧 Backend References

### 1. Product Controller
**File:** `carmella/backend/src/controllers/productController.ts`

**Lines where MOQ is used:**
- Line 44: `moq,` - Selected in getAll query
- Line 92: `moq,` - Selected in filtered query  
- Line 167: `moq,` - Selected in getById query
- Line 217: `moq,` - Selected in single product query
- Line 251: `moq` - Extracted from request body in createProduct
- Line 266: `moq: moq || 1,` - Inserted with default value 1
- Line 378: `moq` - Selected in getPricing query
- Line 400: `moq: product.moq,` - Returned in pricing response

### 2. Order Controller
**File:** `carmella/backend/src/controllers/orderController.ts`

**Lines where MOQ is used:**
- Line 50: `products(id, base_price, sale_price, b2b_price, moq, name)` - Selected in cart query
- Line 121-122: MOQ validation for bulk orders
  ```typescript
  if (buyMode === 'bulk' && product.moq && item.quantity < product.moq) {
    throw new Error(`Minimum order quantity for ${product.name} is ${product.moq} units`);
  }
  ```

### 3. Cart Controller
**File:** `carmella/backend/src/controllers/cartController.ts`

**Line 27:** `moq,` - Selected in getCart query

### 4. Homepage Controller
**File:** `carmella/backend/src/controllers/homepageController.ts`

**Line 132:** `moq,` - Selected in featured products query

### 5. Secure Pricing Utility
**File:** `carmella/backend/src/utils/securePricing.ts`

**Lines where MOQ is used:**
- Line 135: `moq` - Selected in secure products query
- Line 162: MOQ validation check
- Line 209: `moq: product.moq,` - Returned in formatted response

---

## 🎨 Frontend References

### 1. Product Detail Page ⭐ PRIMARY USAGE
**File:** `carmella/frontend/src/pages/ProductDetail.tsx`

**Lines where MOQ is displayed/used:**
- Line 27: `moq: number` - Interface definition
- Line 80: `setQuantity(isB2BApproved ? (product.moq || 12) : 1)` - Initial quantity
- Line 172: `setQuantity(product.moq || 12)` - Bulk mode quantity
- Line 487: `💡 Switch to Bulk Buy for better pricing (MOQ: {product.moq} units)` - Display message
- Line 673: `Quantity (MOQ: {product.moq} units)` - Label
- Line 678: `Math.max(product.moq, quantity - product.moq)` - Decrement button
- Line 686: `Math.max(product.moq, parseInt(e.target.value) || product.moq)` - Input validation
- Line 688: `min={product.moq}` - Input min attribute
- Line 689: `step={product.moq}` - Input step attribute
- Line 692: `quantity + product.moq` - Increment button

### 2. Add to Cart Modal ⭐ PRIMARY USAGE
**File:** `carmella/frontend/src/components/product/add-to-cart-modal.tsx`

**Lines where MOQ is used:**
- Line 14: `moq: number` - Interface definition
- Line 33: `(product.moq || 12)` - Initial quantity for approved users
- Line 47: `product.moq || 1` - Minimum quantity for bulk mode
- Line 48: `product.moq || 1` - Step for bulk mode
- Line 52: `product.moq || 12` - Quantity when switching to bulk
- Line 174: `MOQ: {product.moq} units` - Display in pricing info

### 3. Product Showcase Component
**File:** `carmella/frontend/src/components/sections/product-showcase.tsx`

**Lines where MOQ is used:**
- Line 24: `moq: number | null` - Interface definition
- Line 180: `{product.moq}+` - Display in B2B pricing section
- Line 208: `moq: product.moq || 12` - Passed to AddToCartModal

### 4. Product Card Compact Component
**File:** `carmella/frontend/src/components/product/product-card-compact.tsx`

**Lines where MOQ is used:**
- Line 17: `moq?: number | null` - Interface definition
- Line 181: `{product.moq}+` - Display in B2B pricing section
- Line 209: `moq: product.moq || 12` - Passed to AddToCartModal

### 5. Category Page
**File:** `carmella/frontend/src/pages/Category.tsx`

**Line 23:** `moq?: number | null` - Interface definition

### 6. Catalog Page
**File:** `carmella/frontend/src/pages/Catalog.tsx`

**Line 23:** `moq?: number | null` - Interface definition

### 7. ❌ Admin Products Section - MISSING!
**File:** `carmella/frontend/src/components/admin/products-section.tsx`

**Current Status:**
- Line 25: `moq?: number` - Interface definition ✅
- Line 55: `moq: "1",` - Default value in initial state ✅
- Line 107: `moq: "1",` - Reset value ✅
- Line 130: `moq: product.moq?.toString() || "1",` - Edit mode ✅
- Line 158: `moq: parseInt(formData.moq) || 1,` - Save handler ✅
- **❌ MISSING: Input field in the form!**

---

## 🚨 ISSUE: MOQ Field Missing from Admin Panel

### Problem
The admin panel has MOQ in the data structure but **no input field** in the form to edit it!

### Impact
- Admins cannot set MOQ when creating products
- Admins cannot edit MOQ for existing products
- MOQ always defaults to 1
- Bulk pricing features don't work properly

### Solution Required
Add MOQ input field to the admin product form between pricing and images sections.

---

## 🔧 FIX: Add MOQ Field to Admin Panel

Add this code after the B2B pricing fields (around line 540):

```tsx
{/* MOQ and B2B Min Quantity */}
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-semibold text-foreground mb-2">
      MOQ (Bulk) *
      <span className="text-xs font-normal text-muted-foreground ml-1">
        Minimum Order Quantity for bulk orders
      </span>
    </label>
    <input
      type="number"
      value={formData.moq}
      onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
      placeholder="12"
      min="1"
      step="1"
      className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
    />
    <p className="text-xs text-muted-foreground mt-1">
      Minimum units required for bulk/B2B orders
    </p>
  </div>

  <div>
    <label className="block text-sm font-semibold text-foreground mb-2">
      B2B Min Quantity
      <span className="text-xs font-normal text-muted-foreground ml-1">
        Optional tier threshold
      </span>
    </label>
    <input
      type="number"
      value={formData.b2b_min_quantity}
      onChange={(e) => setFormData({ ...formData, b2b_min_quantity: e.target.value })}
      placeholder="1"
      min="1"
      step="1"
      className="w-full px-4 py-3 border border-border dark:border-gray-700 bg-background dark:bg-gray-800 text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
    />
    <p className="text-xs text-muted-foreground mt-1">
      Additional B2B tier minimum (if applicable)
    </p>
  </div>
</div>
```

---

## 📊 MOQ Usage Flow

### 1. Admin Creates Product
```
Admin Panel → Set MOQ (e.g., 12) → Save to Database
```

### 2. Customer Views Product
```
Product Detail Page → Shows "MOQ: 12 units" → Enforces minimum in quantity selector
```

### 3. Customer Adds to Cart (Bulk Mode)
```
Add to Cart Modal → Validates quantity >= MOQ → Stores with buy_mode='bulk'
```

### 4. Customer Places Order
```
Order Creation → Validates MOQ for bulk items → Creates order
```

---

## ✅ Verification Checklist

After adding MOQ field to admin panel:

- [ ] Admin can see MOQ field in create product form
- [ ] Admin can see MOQ field in edit product form
- [ ] MOQ defaults to 1 for new products
- [ ] MOQ displays existing value when editing
- [ ] MOQ saves correctly to database
- [ ] Product detail page shows correct MOQ
- [ ] Add to cart modal enforces MOQ for bulk mode
- [ ] Order creation validates MOQ for bulk orders

---

## 🎯 Best Practices

### Setting MOQ Values
- **Small items:** MOQ = 12-24 units
- **Medium items:** MOQ = 6-12 units
- **Large items:** MOQ = 1-6 units
- **Custom/Expensive:** MOQ = 1 unit

### Display Guidelines
- Always show MOQ in bulk pricing sections
- Use format: "MOQ: X units" or "Min: X units"
- Enforce MOQ in quantity selectors for bulk mode
- Don't enforce MOQ for retail mode

### Validation Rules
- MOQ must be >= 1
- MOQ should be integer (no decimals)
- Bulk orders must have quantity >= MOQ
- Retail orders ignore MOQ

---

## 📝 Summary

**MOQ is used in:**
- ✅ 5 backend controllers
- ✅ 7 frontend components
- ✅ Database schema
- ❌ Admin panel form (NEEDS FIX)

**Total References:** 30+ locations across codebase

**Action Required:** Add MOQ input field to admin products section form
