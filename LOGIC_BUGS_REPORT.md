# Logic Bugs & Security Issues Report
**Generated:** March 29, 2026  
**Codebase:** Carmella E-commerce Platform  
**Severity Levels:** 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low

---

## Executive Summary

This report identifies **23 logic bugs and security issues** across the Carmella codebase, categorized by severity and component. The most critical issues involve pricing security leaks, cart state management inconsistencies, and missing authorization checks.

### Critical Issues Summary
- **5 Critical** (🔴): Pricing leaks, cart buy_mode missing, order validation gaps
- **8 High** (🟠): Authorization issues, data consistency problems
- **7 Medium** (🟡): Edge cases, validation gaps
- **3 Low** (🔵): Minor inconsistencies, optimization opportunities

---

## 🔴 CRITICAL ISSUES

### 1. Price Leak in ProductDetail.tsx
**Severity:** 🔴 Critical  
**File:** `carmella/frontend/src/pages/ProductDetail.tsx`  
**Lines:** ~396-450

**Issue:**  
The product detail page shows pricing to ANY logged-in user, not just B2B approved users. This violates the security model where only approved B2B users should see prices.

**Current Logic:**
```typescript
{isApproved ? (
  // B2B pricing
) : user ? (  // ❌ Shows prices to ANY logged-in user
  // Regular user pricing with sale_price, base_price
) : (
  // Guest
)}
```

**Expected Logic:**
```typescript
{isApproved ? (
  // B2B approved: Show all pricing
) : (
  // Everyone else: Hide prices, show "Request Approval"
)}
```

**Impact:**  
- Guest users can login and immediately see all retail prices
- Bypasses B2B approval requirement
- Violates business model of approval-gated pricing

**Fix Required:**  
Remove pricing display for non-approved users. Only show "Request B2B Approval" or "Login" messages.

---

### 2. Cart Missing buy_mode Column
**Severity:** 🔴 Critical  
**File:** Database schema, `cart_items` table  
**Related:** `carmella/backend/add-buy-mode-to-cart.sql`

**Issue:**  
The `cart_items` table doesn't have a `buy_mode` column to track whether items were added in retail or bulk mode. This causes:
- Cart can't persist purchase intent across sessions
- Price calculation becomes ambiguous after page refresh
- Users lose their bulk/retail selection

**Current State:**
```sql
-- cart_items table MISSING buy_mode column
CREATE TABLE cart_items (
  id UUID,
  cart_id UUID,
  product_id UUID,
  quantity INT
  -- ❌ No buy_mode column
);
```

**Required Migration:**
```sql
ALTER TABLE cart_items 
ADD COLUMN buy_mode VARCHAR(10) DEFAULT 'retail' 
CHECK (buy_mode IN ('retail', 'bulk'));
```

**Impact:**  
- Bulk orders may be priced as retail after refresh
- B2B customers lose bulk pricing benefits
- Cart total calculations become incorrect

**Fix Required:**  
1. Run database migration to add `buy_mode` column
2. Update backend cart API to accept and store `buy_mode`
3. Update frontend to pass `buy_mode` when adding to cart

---

### 3. Cart Sync Price Logic Incorrect
**Severity:** 🔴 Critical  
**File:** `carmella/frontend/src/contexts/CartContext.tsx`  
**Lines:** 52-75

**Issue:**  
When syncing cart from database, the price calculation doesn't properly respect the `buy_mode`. It always prefers `sale_price` over `b2b_price`, even for bulk orders.

**Current Logic:**
```typescript
// ❌ WRONG: Always picks sale_price first
if (buyMode === 'bulk' && item.products?.b2b_price) {
  discountPrice = item.products.b2b_price
} else if (item.products?.sale_price) {
  discountPrice = item.products.sale_price
}
```

**Problem:**  
If a product has both `sale_price` and `b2b_price`, and the item was added in bulk mode, it should use `b2b_price`. But the current logic falls through to `sale_price` in the else clause.

**Correct Logic:**
```typescript
if (buyMode === 'bulk' && item.products?.b2b_price) {
  discountPrice = item.products.b2b_price
} else if (buyMode === 'retail' && item.products?.sale_price) {
  discountPrice = item.products.sale_price
} else {
  discountPrice = item.products?.base_price
}
```

**Impact:**  
- Bulk orders may show wrong prices
- B2B customers charged incorrect amounts
- Revenue loss or customer disputes

---

### 4. Backend Cart API Doesn't Accept buy_mode
**Severity:** 🔴 Critical  
**File:** `carmella/backend/src/controllers/cartController.ts`  
**Lines:** 66-150

**Issue:**  
The `addToCart` endpoint doesn't accept or store the `buy_mode` parameter. Frontend passes it, but backend ignores it.

**Current Code:**
```typescript
export const addToCart = async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  // ❌ buy_mode not extracted from req.body
  
  await supabaseAdmin
    .from("cart_items")
    .insert([{ cart_id: cart.id, product_id: productId, quantity }])
    // ❌ buy_mode not inserted
}
```

**Required Fix:**
```typescript
const { productId, quantity, buyMode } = req.body;

await supabaseAdmin
  .from("cart_items")
  .insert([{ 
    cart_id: cart.id, 
    product_id: productId, 
    quantity,
    buy_mode: buyMode || 'retail'
  }])
```

**Impact:**  
- Buy mode never persists to database
- Cart sync always defaults to retail mode
- Bulk pricing lost on refresh

---

### 5. Order Creation Doesn't Validate buy_mode
**Severity:** 🔴 Critical  
**File:** `carmella/backend/src/controllers/orderController.ts`  
**Lines:** 70-110

**Issue:**  
When creating an order, the price calculation doesn't consider the `buy_mode` from cart items. It uses a simple fallback: `b2b_price || sale_price || base_price`.

**Current Logic:**
```typescript
const price = product.b2b_price !== null && product.b2b_price !== undefined 
  ? product.b2b_price 
  : product.sale_price !== null && product.sale_price !== undefined
  ? product.sale_price 
  : product.base_price;
```

**Problem:**  
- Always uses B2B price if available, even for retail orders
- Doesn't check the cart item's `buy_mode`
- Could charge wrong price at checkout

**Correct Logic:**
```typescript
// Get buy_mode from cart item
const buyMode = item.buy_mode || 'retail';

const price = buyMode === 'bulk' && product.b2b_price
  ? product.b2b_price
  : (product.sale_price || product.base_price);
```

**Impact:**  
- Customers may be charged incorrect prices
- Revenue loss if B2B price applied to retail orders
- Legal/compliance issues with pricing

---

## 🟠 HIGH SEVERITY ISSUES

### 6. Homepage Featured Products Missing MOQ
**Severity:** 🟠 High  
**File:** `carmella/backend/src/controllers/homepageController.ts`  
**Lines:** ~123-135

**Issue:**  
Featured products query doesn't include the `moq` (Minimum Order Quantity) field.

**Current Query:**
```typescript
.select(`
  id, name, slug, image_url,
  base_price, sale_price,
  b2b_price,
  pricing_locked, user_tier
`)
// ❌ MOQ missing
```

**Impact:**  
- Frontend can't enforce MOQ for featured products
- Users can add less than MOQ to cart
- Business rules violated

**Fix:**  
Add `moq` to the select query.

---

### 7. Cart Total Calculation Ignores buy_mode
**Severity:** 🟠 High  
**File:** `carmella/backend/src/controllers/cartController.ts`  
**Lines:** 48-52

**Issue:**  
The `getCart` endpoint calculates total using `sale_price || base_price`, ignoring whether items are bulk or retail.

**Current Code:**
```typescript
const total = items.reduce((sum, item: any) => {
  const price = item.products?.sale_price || item.products?.base_price || 0;
  // ❌ Doesn't check buy_mode or b2b_price
  return sum + (price * item.quantity);
}, 0);
```

**Impact:**  
- Cart total may be incorrect
- Checkout shows wrong amount
- Customer confusion

---

### 8. Review System Missing Purchase Verification
**Severity:** 🟠 High  
**File:** `carmella/backend/src/controllers/reviewController.ts`  
**Lines:** 28-95

**Issue:**  
Users can review products they've never purchased. The `createReview` function only checks if the product exists and if the user already reviewed it, but doesn't verify purchase history.

**Current Validation:**
```typescript
// Check if product exists
const { data: product } = await supabase
  .from("products")
  .select("id")
  .eq("id", productId)
  .single();

// Check if user already reviewed
const { data: existing } = await supabase
  .from("reviews")
  .select("id")
  .eq("user_id", userId)
  .eq("product_id", productId)
  .single();

// ❌ No purchase verification
```

**Required Check:**
```typescript
// Verify user purchased this product
const { data: purchase } = await supabase
  .from("order_items")
  .select("id")
  .eq("product_id", productId)
  .eq("order_id", supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "delivered")
  )
  .single();

if (!purchase) {
  return res.status(403).json({ 
    error: "You can only review products you've purchased" 
  });
}
```

**Impact:**  
- Fake reviews from non-customers
- Review manipulation
- Trust issues with review system

---

### 9. Inventory Not Checked During Order Creation
**Severity:** 🟠 High  
**File:** `carmella/backend/src/controllers/orderController.ts`  
**Lines:** 70-120

**Issue:**  
Order creation doesn't verify product availability in inventory before creating the order.

**Current Flow:**
```typescript
// Get cart items
const cartItems = cartWithItems.cart_items || [];

// Calculate total and create order items
const orderItems = cartItems.map((item: any) => {
  // ❌ No inventory check
  return {
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: price,
  };
});

// Create order (may fail if out of stock)
```

**Required Check:**
```typescript
// Verify inventory availability
const { data: inventory } = await supabaseAdmin
  .from("inventory")
  .select("quantity_available")
  .eq("product_id", item.product_id)
  .single();

if (!inventory || inventory.quantity_available < item.quantity) {
  throw new Error(`Insufficient stock for ${product.name}`);
}
```

**Impact:**  
- Orders created for out-of-stock items
- Fulfillment failures
- Customer dissatisfaction

---

### 10. No Rate Limiting on B2B Approval Requests
**Severity:** 🟠 High  
**File:** Backend API routes (B2B request endpoint)

**Issue:**  
Users can spam B2B approval requests without any rate limiting or cooldown period.

**Current State:**  
No rate limiting middleware on `/api/users/request-b2b-approval` endpoint.

**Impact:**  
- Database spam
- Admin queue flooding
- Potential DoS attack vector

**Fix Required:**  
Add rate limiting middleware (e.g., 1 request per hour per user).

---

### 11. Admin Middleware Doesn't Check Session Validity
**Severity:** 🟠 High  
**File:** `carmella/backend/src/middleware/index.ts`  
**Lines:** 90-102

**Issue:**  
The `adminMiddleware` only checks `req.userType === 'admin'` but doesn't verify the user's session is still valid or that the user hasn't been demoted/banned.

**Current Code:**
```typescript
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.userType !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
```

**Problem:**  
- Doesn't re-check user status in database
- Relies on JWT claims which may be stale
- Demoted admins can still access admin endpoints until token expires

**Fix Required:**
```typescript
export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  // Re-verify admin status from database
  const { data: user } = await supabase
    .from("users")
    .select("user_type, status")
    .eq("id", req.userId)
    .single();
  
  if (!user || user.user_type !== "admin" || user.status !== "active") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
```

---

### 12. Catalog Sorting by Price When Prices Hidden
**Severity:** 🟠 High  
**File:** `carmella/frontend/src/pages/Catalog.tsx`  
**Lines:** ~90-95

**Issue:**  
Users can sort products by price even when prices are hidden (non-approved users). This reveals relative pricing information.

**Current Behavior:**
```typescript
// Sort by base_price even when pricing_locked === true
if (sort === 'price_asc') {
  sorted.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
}
```

**Problem:**  
- Reveals which products are more/less expensive
- Partial information leak
- Violates pricing security model

**Fix Required:**  
Disable price sorting when user is not approved, or sort by other criteria.

---

### 13. Missing Transaction Rollback on Order Creation Failure
**Severity:** 🟠 High  
**File:** `carmella/backend/src/controllers/orderController.ts`  
**Lines:** 120-170

**Issue:**  
Order creation involves multiple database operations (create order, create order_items, clear cart) but doesn't use transactions. If one step fails, previous steps aren't rolled back.

**Current Flow:**
```typescript
// 1. Create order
const { data: order } = await supabaseAdmin
  .from("orders")
  .insert([orderData])
  .select()
  .single();

// 2. Create order items (may fail)
const { error: itemsError } = await supabaseAdmin
  .from("order_items")
  .insert(orderItems);

// 3. Clear cart (may fail)
await supabaseAdmin
  .from("cart_items")
  .delete()
  .eq("cart_id", cartWithItems.id);

// ❌ No transaction - partial state if any step fails
```

**Impact:**  
- Orphaned orders without items
- Cart cleared but order failed
- Data inconsistency

**Fix Required:**  
Use Supabase RPC with PostgreSQL transactions or implement compensating transactions.

---

## 🟡 MEDIUM SEVERITY ISSUES

### 14. AuthContext Clears Cache on Every Auth Change
**Severity:** 🟡 Medium  
**File:** `carmella/frontend/src/contexts/AuthContext.tsx`  
**Lines:** 56-58

**Issue:**  
The auth state change listener clears pricing-dependent caches on EVERY auth event, including token refreshes.

**Current Code:**
```typescript
supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session)
  // ❌ Clears cache even on token refresh
  cache.clear('featured_products');
  cache.clear('products_');
  // ...
})
```

**Problem:**  
- Unnecessary cache invalidation
- Performance degradation
- Increased API calls

**Fix Required:**  
Only clear cache on actual login/logout events, not token refreshes.

---

### 15. Product MOQ Not Enforced in Frontend Quantity Input
**Severity:** 🟡 Medium  
**File:** `carmella/frontend/src/components/product/add-to-cart-modal.tsx`  
**Lines:** 180-190

**Issue:**  
While the modal sets minimum quantity to MOQ for bulk mode, users can manually type a value below MOQ in the input field.

**Current Code:**
```typescript
<input
  type="number"
  value={quantity}
  onChange={(e) => setQuantity(Math.max(minQty, parseInt(e.target.value) || minQty))}
  min={minQty}
  step={step}
/>
```

**Problem:**  
- `Math.max` prevents going below MOQ, but...
- If user types "5" when MOQ is 12, it accepts 5 temporarily
- Only corrected on blur or submit

**Fix Required:**  
Add real-time validation and visual feedback.

---

### 16. Dashboard Stats Cache May Show Stale Data
**Severity:** 🟡 Medium  
**File:** `carmella/backend/src/controllers/analyticsController.ts`  
**Lines:** 10-20

**Issue:**  
Dashboard stats are cached for 15 minutes, but there's no cache invalidation when relevant data changes (new order, new user, etc.).

**Current Implementation:**
```typescript
const cachedStats = cache.get(CACHE_KEYS.DASHBOARD_STATS);
if (cachedStats) {
  return res.json(cachedStats);
}
// ❌ No invalidation on data changes
```

**Impact:**  
- Admins see outdated statistics
- New orders don't reflect immediately
- Misleading business metrics

**Fix Required:**  
Implement cache invalidation on relevant data mutations or reduce TTL.

---

### 17. Review Helpful Count Race Condition
**Severity:** 🟡 Medium  
**File:** `carmella/backend/src/controllers/reviewController.ts`  
**Lines:** 200-230

**Issue:**  
The `markHelpful` function has a race condition when incrementing the helpful count.

**Current Code:**
```typescript
// 1. Read current count
const { data: review } = await supabase
  .from("reviews")
  .select("helpful_count")
  .eq("id", id)
  .single();

// 2. Increment and update (race condition window)
await supabase
  .from("reviews")
  .update({ helpful_count: (review.helpful_count || 0) + 1 })
  .eq("id", id);
```

**Problem:**  
If two users mark helpful simultaneously:
- Both read count = 5
- Both write count = 6
- Should be 7

**Fix Required:**  
Use atomic increment: `UPDATE reviews SET helpful_count = helpful_count + 1`

---

### 18. Missing Pagination on Product Reviews
**Severity:** 🟡 Medium  
**File:** `carmella/backend/src/controllers/reviewController.ts`  
**Lines:** 7-25

**Issue:**  
The `getProductReviews` endpoint returns ALL reviews for a product without pagination.

**Current Code:**
```typescript
const { data: reviews } = await supabase
  .from("reviews")
  .select("*, users(first_name, last_name, google_id)")
  .eq("product_id", productId)
  .eq("status", "approved")
  .order("created_at", { ascending: false });
// ❌ No limit or pagination
```

**Impact:**  
- Performance issues for popular products
- Large response payloads
- Slow page loads

**Fix Required:**  
Add pagination with default limit of 10-20 reviews.

---

### 19. Cloudinary Image Deletion Not Verified
**Severity:** 🟡 Medium  
**File:** `carmella/backend/src/utils/cloudinary.ts`

**Issue:**  
When deleting products, the code attempts to delete images from Cloudinary but doesn't verify success or handle failures gracefully.

**Impact:**  
- Orphaned images in Cloudinary
- Storage costs increase
- No cleanup mechanism

**Fix Required:**  
Add verification and retry logic for failed deletions.

---

### 20. Frontend Cart Sync Timeout Too Short
**Severity:** 🟡 Medium  
**File:** `carmella/frontend/src/contexts/CartContext.tsx`  
**Lines:** 95-98

**Issue:**  
Cart loading has a 5-second timeout, which may be too short for slow connections.

**Current Code:**
```typescript
loadingTimeoutRef.current = setTimeout(() => {
  console.warn('[Cart] Loading timeout - forcing loading to false')
  setLoading(false)
}, 5000) // ❌ May be too short
```

**Impact:**  
- Cart appears empty on slow connections
- User experience degradation
- Premature timeout

**Fix Required:**  
Increase to 10-15 seconds or implement exponential backoff.

---

## 🔵 LOW SEVERITY ISSUES

### 21. Inconsistent Error Messages
**Severity:** 🔵 Low  
**Files:** Multiple controllers

**Issue:**  
Error messages are inconsistent across the API. Some return `{ error: "message" }`, others return `{ message: "error" }`, and some include `details`.

**Example Inconsistencies:**
```typescript
// cartController.ts
return res.status(500).json({ error: "Failed to fetch cart" });

// orderController.ts  
return res.status(403).json({
  error: "B2B approval required",
  message: "Please request B2B approval..."
});

// authController.ts
return res.status(400).json({ error: authError.message });
```

**Impact:**  
- Frontend error handling complexity
- Inconsistent user experience
- Harder to debug

**Fix Required:**  
Standardize error response format across all endpoints.

---

### 22. Unused b2bMiddleware Function
**Severity:** 🔵 Low  
**File:** `carmella/backend/src/middleware/index.ts`  
**Lines:** 104-110

**Issue:**  
The `b2bMiddleware` function is defined but never used in any routes.

**Current Code:**
```typescript
export function b2bMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.userType !== "b2b_approved" && req.userType !== "admin") {
    return res.status(403).json({ error: "B2B access required" });
  }
  next();
}
// ❌ Never imported or used
```

**Impact:**  
- Dead code
- Maintenance confusion
- Potential security gap if intended to be used

**Fix Required:**  
Either use it on appropriate routes or remove it.

---

### 23. Performance Tracker Stores Metrics in Memory
**Severity:** 🔵 Low  
**File:** `carmella/backend/src/utils/performanceTracker.ts`

**Issue:**  
Performance metrics are stored in memory and lost on server restart. No persistence or aggregation.

**Impact:**  
- Metrics lost on restart
- No historical analysis
- Limited monitoring capability

**Fix Required:**  
Persist metrics to database or external monitoring service.

---

## Recommendations by Priority

### Immediate Action Required (🔴 Critical)
1. **Fix ProductDetail.tsx price leak** - Deploy within 24 hours
2. **Add buy_mode column to cart_items** - Run migration ASAP
3. **Update cart sync price logic** - Deploy with migration
4. **Update backend cart API** - Accept and store buy_mode
5. **Fix order creation price calculation** - Validate buy_mode

### High Priority (🟠 High) - Deploy within 1 week
6. Add MOQ to homepage featured products query
7. Fix cart total calculation to respect buy_mode
8. Add purchase verification to review system
9. Add inventory checks during order creation
10. Implement rate limiting on B2B approval requests
11. Enhance admin middleware with session validation
12. Disable price sorting for non-approved users
13. Implement transactions for order creation

### Medium Priority (🟡 Medium) - Address within 2 weeks
14. Optimize auth cache invalidation
15. Enforce MOQ in frontend quantity input
16. Implement cache invalidation for dashboard stats
17. Fix review helpful count race condition
18. Add pagination to product reviews
19. Verify Cloudinary image deletions
20. Increase cart sync timeout

### Low Priority (🔵 Low) - Address in next sprint
21. Standardize error message format
22. Remove or implement b2bMiddleware
23. Persist performance metrics

---

## Testing Recommendations

### Critical Path Testing
1. **Pricing Security**
   - Test as guest, logged-in, pending, rejected, approved users
   - Verify prices hidden/shown correctly
   - Test cart pricing with different buy modes

2. **Cart Operations**
   - Add items in retail and bulk modes
   - Refresh page and verify prices persist
   - Login/logout and verify cart sync

3. **Order Creation**
   - Create orders with mixed retail/bulk items
   - Verify correct prices captured
   - Test inventory deduction

### Regression Testing
- Run full test suite after each critical fix
- Test all user roles and approval statuses
- Verify database constraints and RLS policies

---

## Conclusion

The Carmella platform has a solid foundation but requires immediate attention to critical pricing security and cart management issues. The most urgent fixes involve:

1. Closing the pricing visibility loophole in ProductDetail.tsx
2. Implementing buy_mode persistence throughout the cart flow
3. Ensuring order creation uses correct prices based on buy_mode

Once these critical issues are resolved, the platform will have a secure and consistent pricing model that properly enforces B2B approval requirements.

**Estimated Fix Time:**
- Critical issues: 2-3 days
- High priority: 1 week
- Medium priority: 1-2 weeks
- Low priority: 1 week

**Total:** ~3-4 weeks for complete resolution
