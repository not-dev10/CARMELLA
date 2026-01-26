# Apply Database Indexes - Critical for Performance

## Current Status
- Public endpoints: ✅ 196-237ms (excellent)
- Protected endpoints: ✅ 575-822ms (acceptable)
- Admin endpoints: ❌ 953-1679ms (needs indexes)
- Average: 682ms (target: 300-400ms)

## What to Do

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your Carmella project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy & Paste the Index Creation Script
Copy everything below and paste into the SQL Editor:

```sql
-- Database Optimization - Create Indexes
-- This will improve query performance by 50-70%

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Cart items table indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_created_at ON cart_items(created_at DESC);

-- Carts table indexes
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_created_at ON carts(created_at DESC);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Inventory table indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_location);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity_available ON inventory(quantity_available);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory(created_at DESC);

-- Inventory history table indexes
CREATE INDEX IF NOT EXISTS idx_inventory_history_inventory_id ON inventory_history(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_product_id ON inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON inventory_history(created_at DESC);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_b2b_approval_status ON users(b2b_approval_status);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at DESC);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Wishlists table indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_product_warehouse ON inventory(product_id, warehouse_location);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_product ON cart_items(cart_id, product_id);

-- Update table statistics
ANALYZE products;
ANALYZE cart_items;
ANALYZE carts;
ANALYZE orders;
ANALYZE order_items;
ANALYZE inventory;
ANALYZE inventory_history;
ANALYZE users;
ANALYZE categories;
ANALYZE reviews;
ANALYZE wishlists;
```

### Step 3: Run the Query
1. Click the **Run** button (or press Ctrl+Enter)
2. Wait for it to complete (should take 10-30 seconds)
3. You should see "Success" message

### Step 4: Verify Indexes Were Created
Run this query to verify:

```sql
SELECT indexname, indexdef FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;
```

You should see 20+ indexes listed.

### Step 5: Test Performance
After indexes are created, run the latency test:

```bash
node carmella/backend/test-all-apis.js
```

## Expected Results After Indexes

| Endpoint | Before | After | Improvement |
|----------|--------|-------|-------------|
| Get Inventory (Admin) | 953ms | 300-400ms | 60-70% |
| Get Inventory Stats | 1679ms | 400-500ms | 60-70% |
| Get Analytics Dashboard | 1651ms | 500-600ms | 60-70% |
| Average | 682ms | 250-350ms | 60-70% |

## Troubleshooting

**If you get "index already exists" errors:**
- This is normal, the `IF NOT EXISTS` clause prevents duplicates
- Just ignore these warnings

**If indexes don't improve performance:**
1. Check that all indexes were created (run verification query above)
2. Make sure you're testing with real data (1000+ records)
3. Check Supabase query performance with EXPLAIN ANALYZE

## Next Steps After Indexes

Once indexes are applied and performance improves:
1. Commit the code changes
2. Deploy to production
3. Monitor performance in Admin → Performance Monitor
4. If still slow, implement caching layer

---

**Time to apply**: 5-10 minutes
**Expected improvement**: 60-70% faster queries
**Impact**: Critical for production readiness
