# API Optimization Guide - Performance Troubleshooting

## 🚨 Quick Diagnosis

If APIs are slow, follow this checklist in order:

### 1. Identify Slow Endpoints
- Go to Admin → Performance Monitor
- Click "Start Monitoring"
- Make API calls
- Look for endpoints with latency > 300ms
- Note which endpoints are slowest

### 2. Common Causes & Quick Fixes

## 🔴 CRITICAL ISSUES (Fix First)

### Issue 1: Multiple Database Queries Instead of Joins
**Symptom**: Endpoint latency 400-800ms
**Location**: `inventoryController.ts`, `orderController.ts`

**Problem**:
```typescript
// ❌ BAD: 2 separate queries
const { data: inventory } = await supabaseAdmin.from("inventory").select("*");
const { data: products } = await supabaseAdmin.from("products").select("*");
// Total: ~200ms + ~150ms = 350ms+
```

**Solution**:
```typescript
// ✅ GOOD: Single query with join
const { data } = await supabaseAdmin
  .from("inventory")
  .select(`
    *,
    products:product_id(id, name, image_url, base_price)
  `);
// Total: ~150ms
```

**Files to Fix**:
- `backend/src/controllers/inventoryController.ts` - Line 30-50
- `backend/src/controllers/orderController.ts` - Line 60-80

---

### Issue 2: N+1 Query Problem
**Symptom**: Latency increases with data size
**Location**: `adminController.ts`, `cartController.ts`

**Problem**:
```typescript
// ❌ BAD: Loop queries
const users = await getUsers(); // 1 query
users.forEach(user => {
  const orders = await getOrders(user.id); // N queries
});
// Total: 1 + N queries
```

**Solution**:
```typescript
// ✅ GOOD: Batch query
const users = await getUsers();
const userIds = users.map(u => u.id);
const orders = await getOrders(userIds); // 1 query
```

---

### Issue 3: Fetching Unnecessary Fields
**Symptom**: Large response payloads, slow serialization
**Location**: All controllers

**Problem**:
```typescript
// ❌ BAD: Select all fields
const { data } = await supabaseAdmin
  .from("products")
  .select("*"); // Includes long_description, features array, etc.
```

**Solution**:
```typescript
// ✅ GOOD: Select only needed fields
const { data } = await supabaseAdmin
  .from("products")
  .select("id, name, slug, image_url, base_price, sale_price");
```

---

## 🟠 HIGH PRIORITY ISSUES

### Issue 4: Missing Database Indexes
**Symptom**: Queries slow down as data grows
**Location**: Supabase database

**Check Current Indexes**:
```sql
-- Run in Supabase SQL Editor
SELECT indexname, indexdef FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;
```

**Add Missing Indexes**:
```sql
-- Products table
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_slug ON products(slug);

-- Cart items table
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Orders table
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Inventory table
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_location);

-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_b2b_status ON users(b2b_approval_status);
```

---

### Issue 5: Inefficient RLS Policies
**Symptom**: Auth checks add 50-100ms per query
**Location**: Supabase RLS policies

**Current Problem**:
- Every query checks RLS policies
- Complex policies with multiple joins
- Policies run on every row

**Solution**:
```sql
-- Use supabaseAdmin for internal operations (bypasses RLS)
-- Only use regular supabase for user-facing queries

-- ✅ GOOD: Admin operations bypass RLS
const { data } = await supabaseAdmin
  .from("products")
  .select("*");

-- ✅ GOOD: User queries use RLS
const { data } = await supabase
  .from("products_safe")
  .select("*");
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### Issue 6: Pagination Not Implemented
**Symptom**: Loading all 1000+ records when only need 20
**Location**: `productController.ts`, `adminController.ts`

**Problem**:
```typescript
// ❌ BAD: No pagination
const { data } = await supabaseAdmin
  .from("products")
  .select("*"); // Loads ALL products
```

**Solution**:
```typescript
// ✅ GOOD: Pagination
const limit = 20;
const offset = (page - 1) * limit;
const { data, count } = await supabaseAdmin
  .from("products")
  .select("*", { count: "exact" })
  .range(offset, offset + limit - 1);
```

---

### Issue 7: Caching Not Implemented
**Symptom**: Same data fetched repeatedly
**Location**: Frontend components

**Solution - Add Response Caching**:
```typescript
// ✅ GOOD: Cache API responses
const cache = new Map();

export const cachedAPI = {
  getCategories: async () => {
    if (cache.has('categories')) {
      return cache.get('categories');
    }
    const data = await categoriesAPI.getAll();
    cache.set('categories', data);
    return data;
  }
};
```

---

### Issue 8: Large JSON Responses
**Symptom**: Response parsing takes 100-200ms
**Location**: All controllers

**Problem**:
```typescript
// ❌ BAD: Returning nested objects
{
  id: "123",
  name: "Product",
  products: { id, name, image_url, ... }, // Nested
  inventory_history: [ ... ], // Large array
  features: [ ... ] // Large array
}
```

**Solution**:
```typescript
// ✅ GOOD: Flatten and minimize
{
  id: "123",
  name: "Product",
  productName: "...",
  productImage: "..."
  // No nested objects
}
```

---

## 🟢 OPTIMIZATION CHECKLIST

### Backend Optimizations

- [ ] **Add Database Indexes** (Biggest impact: 50-70% faster)
  ```bash
  # Run in Supabase SQL Editor
  # Copy all CREATE INDEX statements above
  ```

- [ ] **Fix N+1 Queries** (Impact: 30-50% faster)
  - [ ] `inventoryController.ts` - Use joins instead of separate queries
  - [ ] `orderController.ts` - Batch product fetches
  - [ ] `adminController.ts` - Batch user queries

- [ ] **Select Only Needed Fields** (Impact: 20-30% faster)
  - [ ] `productController.ts` - Remove long_description, features
  - [ ] `inventoryController.ts` - Remove unnecessary fields
  - [ ] `orderController.ts` - Minimize response size

- [ ] **Implement Query Timeouts** (Impact: Prevent hangs)
  ```typescript
  const timeout = 5000; // 5 seconds
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  ```

- [ ] **Add Response Compression** (Impact: 40-60% smaller payloads)
  ```typescript
  app.use(compression());
  ```

### Frontend Optimizations

- [ ] **Implement Request Caching** (Impact: 80-90% faster for repeated requests)
- [ ] **Add Request Debouncing** (Impact: Reduce duplicate requests)
- [ ] **Lazy Load Data** (Impact: Faster initial page load)
- [ ] **Implement Pagination** (Impact: Smaller payloads)

---

## 📊 Performance Targets After Optimization

| Endpoint | Current | Target | Improvement |
|----------|---------|--------|-------------|
| GET /products | 300-500ms | 100-150ms | 60-70% |
| GET /admin/inventory | 400-600ms | 150-200ms | 60-70% |
| POST /orders | 500-800ms | 200-300ms | 60-70% |
| GET /admin/users | 300-400ms | 100-150ms | 60-70% |
| GET /cart | 200-300ms | 50-100ms | 60-70% |

---

## 🔧 Implementation Priority

### Phase 1 (Do First - 1 hour)
1. Add database indexes
2. Fix N+1 queries in inventory controller
3. Select only needed fields

**Expected Result**: 50-60% performance improvement

### Phase 2 (Do Next - 2 hours)
1. Fix N+1 queries in order controller
2. Implement response compression
3. Add request caching

**Expected Result**: Additional 20-30% improvement

### Phase 3 (Do Later - 3 hours)
1. Implement pagination everywhere
2. Add query timeouts
3. Optimize RLS policies

**Expected Result**: Additional 10-15% improvement

---

## 🚀 Quick Wins (5-10 minutes each)

### Quick Win 1: Add Compression
```typescript
// backend/src/index.ts
import compression from 'compression';
app.use(compression());
```

### Quick Win 2: Add Request Timeout
```typescript
// frontend/src/lib/api.ts
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);
const response = await fetch(url, { signal: controller.signal });
```

### Quick Win 3: Cache Categories
```typescript
// frontend/src/lib/api.ts
let categoriesCache = null;
export const categoriesAPI = {
  getAll: async () => {
    if (categoriesCache) return categoriesCache;
    categoriesCache = await apiRequest("/categories");
    return categoriesCache;
  }
};
```

---

## 📈 Monitoring Performance

### Before Optimization
1. Go to Admin → Performance Monitor
2. Click "Start Monitoring"
3. Make API calls
4. Note average latency

### After Optimization
1. Repeat same steps
2. Compare latency
3. Calculate improvement percentage

### Expected Metrics
- **Before**: 300-600ms average
- **After**: 100-200ms average
- **Improvement**: 60-70%

---

## 🐛 Debugging Slow Queries

### Check Supabase Query Performance
```sql
-- Run in Supabase SQL Editor
EXPLAIN ANALYZE
SELECT * FROM products WHERE category_id = 'some-id';
```

### Check Backend Logs
```
[LATENCY] GET /api/products - Status: 200 - 450ms
[PRODUCTS] getProducts completed - Query: 380ms, Total: 450ms
```

### Check Frontend Logs
```
[API] Success response: {endpoint: '/products', latency: "450ms"}
```

---

## 💡 Pro Tips

1. **Use Supabase Admin Client for Internal Operations**
   - Bypasses RLS policies
   - 30-50ms faster per query

2. **Batch Operations**
   - Instead of 10 queries, use 1 batch query
   - 80-90% faster

3. **Use Indexes Wisely**
   - Index columns used in WHERE, JOIN, ORDER BY
   - Don't index every column

4. **Monitor Regularly**
   - Check performance weekly
   - Catch regressions early

5. **Test with Real Data**
   - Performance changes with data size
   - Test with 1000+ records

---

## 📞 Need Help?

If APIs are still slow after these optimizations:

1. Check Performance Monitor for slowest endpoints
2. Look at backend logs for query times
3. Check Supabase query performance with EXPLAIN ANALYZE
4. Profile with browser DevTools Network tab
5. Check server CPU/memory usage

---

## Next Steps

1. **Immediate** (Now): Add database indexes
2. **Short-term** (Today): Fix N+1 queries
3. **Medium-term** (This week): Implement caching
4. **Long-term** (Next week): Full optimization pass
