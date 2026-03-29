# Price Leak Security Analysis

## Current Status: ⚠️ CRITICAL ISSUES FOUND

### Backend Security: ✅ SECURE
The backend is properly secured using `products_safe` view with RLS:
- Prices return NULL for non-approved users
- `pricing_locked` flag indicates if prices are hidden
- `user_tier` field shows user's approval status
- Orders can only be created by approved users

### Frontend Issues: ❌ PRICE LEAKS DETECTED

## Issue #1: ProductDetail.tsx - MAJOR LEAK
**Location**: `carmella/frontend/src/pages/ProductDetail.tsx`

**Problem**: Regular logged-in users (non-B2B) can see ALL pricing
- Lines 396-450: Shows pricing to ANY logged-in user (`user ? ...`)
- Should only show pricing to APPROVED B2B users
- Currently: Guest → Login → See Prices ❌
- Should be: Guest → Login → Request Approval → See Prices ✅

**Current Logic**:
```typescript
{isApproved ? (
  // B2B pricing
) : user ? (  // ❌ LEAK: Shows prices to ANY logged-in user
  // Regular user pricing with sale_price, base_price
) : (
  // Guest
)}
```

**Required Logic**:
```typescript
{isApproved ? (
  // B2B approved: Show all pricing
) : (
  // Everyone else (guest, logged-in, pending, rejected): Hide prices
  // Show "Request Approval" or "Login" message
)}
```

## Issue #2: product-showcase.tsx - CONDITIONAL LEAK
**Location**: `carmella/frontend/src/components/sections/product-showcase.tsx`

**Problem**: Displays prices if `pricingLocked` is false
- Lines 150-170: Shows `displayPrice` and `base_price`
- Relies on backend `pricingLocked` flag (currently secure)
- BUT: If backend fails or is bypassed, prices leak

**Risk Level**: Medium (depends on backend)

## Issue #3: product-card-compact.tsx - CONDITIONAL LEAK
**Location**: `carmella/frontend/src/components/product/product-card-compact.tsx`

**Problem**: Same as product-showcase.tsx
- Lines 139-175: Shows prices when `pricingLocked === false`
- Relies entirely on backend flag

**Risk Level**: Medium (depends on backend)

## Issue #4: Catalog.tsx - SORTING LEAK
**Location**: `carmella/frontend/src/pages/Catalog.tsx`

**Problem**: Sorts by `base_price` even when prices are hidden
- Lines 90-95: Sorts using `base_price` field
- If prices are NULL, sorting breaks
- Reveals relative pricing even when hidden

**Risk Level**: Low (sorting issue, not direct leak)

## Required User Flow

### Correct Flow:
1. **Guest User**: 
   - Cannot see ANY prices
   - Must login to proceed
   
2. **Logged-in User (No Approval)**:
   - Cannot see ANY prices
   - Sees "Request B2B Approval" message
   - Can submit approval request
   
3. **Pending Approval**:
   - Cannot see ANY prices
   - Sees "Approval Pending" message
   
4. **Rejected**:
   - Cannot see ANY prices
   - Sees "Access Restricted" message
   
5. **Approved B2B User**:
   - Can see ALL prices (retail, sale, B2B)
   - Can add to cart
   - Can place orders

### Optional: Bulk vs Regular Toggle
For approved users, add a toggle to switch between:
- **Regular Mode**: Show retail/sale prices, quantity = 1
- **Bulk Mode**: Show B2B prices, quantity = MOQ

## Fixes Required

### Priority 1: ProductDetail.tsx
- Remove pricing display for non-approved users
- Show only "Request Approval" or "Login" messages
- Add bulk/regular toggle for approved users

### Priority 2: Product Cards
- Add frontend validation of `pricingLocked`
- Never display prices if `pricingLocked === true`
- Add defensive checks

### Priority 3: Catalog Sorting
- Disable price sorting when prices are hidden
- Show message: "Login to sort by price"

## Testing Checklist
- [ ] Guest user: No prices visible anywhere
- [ ] Logged-in (no approval): No prices visible
- [ ] Pending approval: No prices visible
- [ ] Rejected: No prices visible
- [ ] Approved: All prices visible
- [ ] Backend RLS: Verify NULL prices for non-approved
- [ ] Cart: Only approved users can add items
- [ ] Orders: Only approved users can create orders
