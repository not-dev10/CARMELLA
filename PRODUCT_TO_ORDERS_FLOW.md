# Product Details → Cart → Checkout → Orders Flow

## Overview
Complete end-to-end flow for B2B product ordering, from product discovery through order placement and tracking.

---

## 1. PRODUCT DETAILS PAGE (ProductDetail.tsx)

### What Changed
✅ **FIXED**: Replaced hardcoded product data with dynamic API fetching

### Flow
```
User clicks product link
    ↓
URL: /product/:id
    ↓
useEffect fetches product from API
    ↓
productsAPI.getById(id)
    ↓
Backend returns product data with:
  - name, description, images
  - base_price, sale_price, b2b_price
  - tier_pricing (volume discounts)
  - moq (minimum order quantity)
  - features, rating, review_count
    ↓
Display product with dynamic data
    ↓
User selects quantity (must be >= MOQ)
    ↓
User clicks "Add to Cart"
```

### Add to Cart Process
```
handleAddToCart()
    ↓
1. Create CartItem object with:
   - productId, name, sku, image
   - price (base_price)
   - discountPrice (if tier pricing applies)
   - quantity
    ↓
2. Call addItem() from CartContext
    ↓
3. Update local state (localStorage)
    ↓
4. If user is logged in:
   - Call cartAPI.add(productId, quantity)
   - Backend saves to database
    ↓
5. Show "Added to Cart!" confirmation
```

### Key Features
- ✅ Fetches real product data from database
- ✅ Displays tier pricing based on quantity
- ✅ Calculates discounts dynamically
- ✅ Syncs to backend cart if user is logged in
- ✅ Respects B2B approval status
- ✅ Shows loading/error states

---

## 2. CART CONTEXT (CartContext.tsx)

### What Changed
✅ **FIXED**: Added backend synchronization and async methods

### State Management
```
CartContext provides:
  - items