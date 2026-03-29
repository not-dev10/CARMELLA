# Frontend Pricing Logic Audit - Complete Analysis
**Date:** March 29, 2026  
**Focus:** Cart, Mini-Cart, Checkout, and Price Calculations

---

## 🎯 Executive Summary

**Status:** ⚠️ **ISSUES FOUND** - Price calculations are inconsistent across components

### Critical Findings:
1. ✅ **CartContext** - Correctly implements buy_mode logic
2. ✅ **Mini-Cart** - Displays buy_mode badges and correct prices
3. ❌ **Checkout Page** - Uses `item.price` instead of `item.discountPrice`
4. ⚠️ **MOQ Enforcement** - Not validated in cart quantity updates

---

## 📊 Component-by-Component Analysis

### 1. CartContext.tsx ✅ CORRECT

**File:** `carmella/frontend/src/contexts/CartContext.tsx`

#### Price Calculation Logic (Lines 52-72)
```typescript
// ✅ CORRECT: Respects buy_mode when syncing from database
const buyMode = item.buy_mode || 'retail'
let discountPrice: number | undefined

if (buyMode === 'bulk' && item.products?.b2b_price) {
  discountPrice = item.products.b2b_price
} else if (buyMode === 'retail' && item.products?.sale_price) {
  discountPrice = item.products.sale_price
} else {
  discountPrice = item.products?.base_price
}
```

**Logic:**
- ✅ Bulk mode → uses `b2b_price`
- ✅ Retail mode → uses `sale_price` or `base_price`
- ✅ Stores `buyMode` in cart item
- ✅ Passes `buyMode` to backend API

#### Subtotal Calculation (Lines 227-232)
```typescript
const getSubtotal = () => {
  return items.reduce((total, item) => {
    const price = item.discountPrice || item.price  // ✅ CORRECT
    return total + price * item.quantity
  }, 0)
}
```

**Status:** ✅ **CORRECT** - Uses `discountPrice` which contains the correct price based on buy_mode

---

### 2. Mini-Cart Component ✅ MOSTLY CORRECT

**File:** `carmella/frontend/src/components/layout/mini-cart.tsx`

#### Buy Mode Display (Lines 147-157)
```typescript
{item.buyMode && (
  <span className={cn(
    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold",
    item.buyMode === 'bulk' 
      ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
      : "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400"
  )}>
    {item.buyMode === 'bulk' ? '📦 Bulk' : '🛒 Retail'}
  </span>
)}
```

**Status:** ✅ **CORRECT** - Shows buy_mode badge for each item

#### Price Display (Lines 160-174)
```typescript
<span className="text-lg font-bold text-primary">
  ${(item.discountPrice || item.price).toFixed(2)}  // ✅ CORRECT
</span>
{item.discountPrice && item.discountPrice < item.price && (
  <>
    <span className="text-sm text-muted-foreground line-through">
      ${item.price.toFixed(2)}
    </span>
    <span className="inline-flex items-center px-2 py-1 rounded bg-red-500 text-white text-[10px] font-bold">
      {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
    </span>
  </>
)}
```

**Status:** ✅ **CORRECT** - Uses `discountPrice` for display

#### Subtotal Calculation (Lines 253-256)
```typescript
const subtotal = getSubtotal()  // ✅ Uses CartContext.getSubtotal()
```

**Status:** ✅ **CORRECT** - Delegates to CartContext which has correct logic

#### ⚠️ Issue: Quantity Update Without MOQ Validation
```typescript
<button
  onClick={() => updateQuantity(item.id, item.quantity - 1)}
  className="w-6 h-6 rounded flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
>
  <Minus className="w-3 h-3" />
</button>
```

**Problem:** 
- Allows decrementing quantity below MOQ for bulk items
- No validation of MOQ when updating quantity
- User can manually set quantity < MOQ

**Impact:** Medium - Backend will reject order, but UX is poor

---

### 3. Checkout Page ❌ CRITICAL ISSUE

**File:** `carmella/frontend/src/pages/Checkout.tsx`

#### ❌ Issue 1: Cart Display Uses Wrong Price (Lines 244-252)
```typescript
<div className="flex justify-between items-end">
  <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
  <span className="font-semibold text-primary">
    ${(item.price * item.quantity).toFixed(2)}  // ❌ WRONG!
  </span>
</div>
```

**Problem:** Uses `item.price` (base_price) instead of `item.discountPrice`

**Should Be:**
```typescript
${((item.discountPrice || item.price) * item.quantity).toFixed(2)}
```

#### ❌ Issue 2: Review Step Uses Wrong Price (Lines 363-367)
```typescript
{items.map((item) => (
  <div key={item.id} className="flex justify-between text-sm">
    <span>{item.name} x {item.quantity}</span>
    <span className="font-medium">
      ${(item.price * item.quantity).toFixed(2)}  // ❌ WRONG!
    </span>
  </div>
))}
```

**Problem:** Same issue - uses `item.price` instead of `item.discountPrice`

#### ❌ Issue 3: Order Summary Sidebar Uses Wrong Price (Lines 476-481)
```typescript
{items.map((item) => (
  <div key={item.id} className="flex justify-between text-sm">
    <span className="text-muted-foreground">{item.name}</span>
    <span className="font-medium">
      ${(item.price * item.quantity).toFixed(2)}  // ❌ WRONG!
    </span>
  </div>
))}
```

**Problem:** Same issue again

#### ✅ Subtotal Calculation is Correct (Line 96)
```typescript
const subtotal = getSubtotal()  // ✅ Uses CartContext.getSubtotal()
```

**Status:** ✅ **CORRECT** - Uses CartContext which has correct logic

**Impact:** 🔴 **CRITICAL**
- Checkout page shows wrong item prices (base_price instead of discounted price)
- Subtotal is correct (from CartContext)
- Creates confusion: individual items show wrong prices but total is correct
- Customer sees different prices in cart vs checkout

---

### 4. Product Detail Page ✅ CORRECT

**File:** `carmella/frontend/src/pages/ProductDetail.tsx`

#### Add to Cart Logic (Lines 195-210)
```typescript
const cartItem = {
  id: `${product.id}-${Date.now()}`,
  productId: product.id,
  name: product.name,
  sku: `SKU-${product.id}`,
  image: productImages[0],
  price: product.base_price,  // ✅ Base price for reference
  quantity: quantity,
  discountPrice: finalPrice !== product.base_price ? finalPrice : undefined,  // ✅ Actual price
  discountPercentage: finalPrice !== product.base_price 
    ? Math.round(((product.base_price - finalPrice) / product.base_price) * 100)
    : undefined,
  buyMode  // ✅ Include buy mode
}
```

**Status:** ✅ **CORRECT** - Properly sets discountPrice based on buy_mode

---

### 5. Add to Cart Modal ✅ CORRECT

**File:** `carmella/frontend/src/components/product/add-to-cart-modal.tsx`

#### Price Calculation (Lines 38-46)
```typescript
const displayPrice = product.sale_price || product.base_price
const hasRetailDiscount = product.sale_price && product.sale_price < product.base_price

const currentPrice = buyMode === 'bulk' && isApproved 
    ? (product.b2b_price || displayPrice)  // ✅ CORRECT
    : displayPrice
```

**Status:** ✅ **CORRECT** - Respects buy_mode

#### MOQ Enforcement (Lines 47-48)
```typescript
const minQty = buyMode === 'bulk' ? (product.moq || 1) : 1
const step = buyMode === 'bulk' ? (product.moq || 1) : 1
```

**Status:** ✅ **CORRECT** - Enforces MOQ for bulk mode

---

## 🐛 Issues Summary

### Critical Issues (🔴)

#### 1. Checkout Page Price Display
**Locations:**
- Line 248: Cart step item price
- Line 365: Review step item price  
- Line 478: Order summary sidebar item price

**Problem:** All use `item.price` instead of `item.discountPrice`

**Fix Required:**
```typescript
// Change from:
${(item.price * item.quantity).toFixed(2)}

// To:
${((item.discountPrice || item.price) * item.quantity).toFixed(2)}
```

**Impact:**
- Customer sees wrong prices in checkout
- Confusion about pricing
- Trust issues
- Potential disputes

### Medium Issues (⚠️)

#### 2. Mini-Cart Quantity Update Without MOQ Validation
**Location:** `mini-cart.tsx` lines 182-195

**Problem:** 
- Users can decrement quantity below MOQ for bulk items
- No client-side validation

**Fix Required:**
```typescript
// Add MOQ check
const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
  const item = items.find(i => i.id === itemId)
  if (item && item.buyMode === 'bulk' && item.moq) {
    if (newQuantity < item.moq) {
      // Show error or prevent update
      return
    }
  }
  updateQuantity(itemId, newQuantity)
}
```

**Impact:**
- Poor UX (backend will reject)
- Confusing error messages
- Extra API calls

---

## ✅ What's Working Correctly

### 1. CartContext Price Logic ✅
- Correctly determines price based on buy_mode
- Properly syncs from database
- Calculates subtotal correctly

### 2. Mini-Cart Display ✅
- Shows buy_mode badges
- Displays correct prices
- Shows discount percentages

### 3. Product Detail & Modal ✅
- Calculates prices based on buy_mode
- Enforces MOQ for bulk mode
- Passes correct data to cart

### 4. Backend Integration ✅
- Sends buy_mode to API
- Stores buy_mode in database
- Retrieves buy_mode correctly

---

## 🔧 Required Fixes

### Priority 1: Fix Checkout Page Prices (CRITICAL)

**File:** `carmella/frontend/src/pages/Checkout.tsx`

**Fix 1 - Cart Step (Line 248):**
```typescript
<span className="font-semibold text-primary">
  ${((item.discountPrice || item.price) * item.quantity).toFixed(2)}
</span>
```

**Fix 2 - Review Step (Line 365):**
```typescript
<span className="font-medium">
  ${((item.discountPrice || item.price) * item.quantity).toFixed(2)}
</span>
```

**Fix 3 - Order Summary (Line 478):**
```typescript
<span className="font-medium">
  ${((item.discountPrice || item.price) * item.quantity).toFixed(2)}
</span>
```

### Priority 2: Add MOQ Validation to Mini-Cart (MEDIUM)

**File:** `carmella/frontend/src/components/layout/mini-cart.tsx`

Add validation before quantity updates for bulk items.

---

## 🧪 Testing Checklist

### After Fixes Applied:

**Checkout Page:**
- [ ] Add bulk item to cart
- [ ] Go to checkout
- [ ] Verify item shows B2B price (not base price)
- [ ] Verify subtotal matches item prices
- [ ] Proceed to review step
- [ ] Verify prices still correct
- [ ] Check order summary sidebar
- [ ] Verify all prices match

**Mini-Cart:**
- [ ] Add bulk item (MOQ = 12)
- [ ] Open mini-cart
- [ ] Verify shows "📦 Bulk" badge
- [ ] Verify shows B2B price
- [ ] Try to decrement below MOQ
- [ ] Should show error or prevent

**Price Consistency:**
- [ ] Product detail → shows correct price
- [ ] Add to cart modal → shows correct price
- [ ] Mini-cart → shows correct price
- [ ] Checkout cart step → shows correct price
- [ ] Checkout review step → shows correct price
- [ ] Order summary → shows correct price
- [ ] All prices should match!

---

## 📊 Price Flow Diagram

```
Product Detail Page
  ↓ (user selects buy_mode)
Add to Cart Modal
  ↓ (calculates finalPrice based on buy_mode)
CartContext.addItem()
  ↓ (stores item with discountPrice and buyMode)
Mini-Cart
  ↓ (displays discountPrice ✅)
Checkout Page
  ↓ (should display discountPrice ❌ currently shows price)
Order Creation
  ↓ (backend uses buy_mode to calculate ✅)
Order Confirmation
```

---

## 🎯 Conclusion

**Overall Status:** ⚠️ **NEEDS FIXES**

**What's Good:**
- ✅ Core pricing logic in CartContext is correct
- ✅ Buy_mode tracking works properly
- ✅ Mini-cart displays correctly
- ✅ Backend integration solid

**What Needs Fixing:**
- 🔴 Checkout page shows wrong prices (3 locations)
- ⚠️ MOQ validation missing in mini-cart

**Estimated Fix Time:** 30 minutes
**Risk Level:** Low (simple display fixes)
**Testing Time:** 1 hour

---

**Next Steps:**
1. Fix checkout page price displays (3 locations)
2. Add MOQ validation to mini-cart
3. Test all price flows end-to-end
4. Verify with different buy_modes
5. Deploy and monitor

---

**Report Generated:** March 29, 2026  
**Status:** READY FOR FIXES
