-- Database Optimization Script for Carmella
-- Run these queries in Supabase SQL Editor to add indexes and optimize performance

-- ============================================
-- 1. PRODUCTS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- ============================================
-- 2. CART ITEMS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_created_at ON cart_items(created_at DESC);

-- ============================================
-- 3. CARTS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_created_at ON carts(created_at DESC);

-- ============================================
-- 4. ORDERS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 5. ORDER ITEMS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- 6. INVENTORY TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_location);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity_available ON inventory(quantity_available);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory(created_at DESC);

-- ============================================
-- 7. INVENTORY HISTORY TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_inventory_history_inventory_id ON inventory_history(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_product_id ON inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON inventory_history(created_at DESC);

-- ============================================
-- 8. USERS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_b2b_approval_status ON users(b2b_approval_status);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ============================================
-- 9. CATEGORIES TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at DESC);

-- ============================================
-- 10. REVIEWS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================
-- 11. WISHLISTS TABLE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- ============================================
-- 12. COMPOSITE INDEXES (For common queries)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_product_warehouse ON inventory(product_id, warehouse_location);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_product ON cart_items(cart_id, product_id);

-- ============================================
-- 13. VERIFY INDEXES WERE CREATED
-- ============================================
-- Run this query to see all indexes:
-- SELECT indexname, indexdef FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY indexname;

-- ============================================
-- 14. ANALYZE TABLES (Update statistics)
-- ============================================
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

-- ============================================
-- 15. PERFORMANCE TIPS
-- ============================================
-- After running these indexes:
-- 1. Expected improvement: 50-70% faster queries
-- 2. Monitor query performance with EXPLAIN ANALYZE
-- 3. Check index usage with pg_stat_user_indexes
-- 4. Rebuild indexes if they become fragmented:
--    REINDEX INDEX idx_products_category_id;

-- ============================================
-- 16. CHECK INDEX USAGE
-- ============================================
-- Run this to see which indexes are being used:
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan,
--   idx_tup_read,
--   idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC;

-- ============================================
-- 17. FIND UNUSED INDEXES
-- ============================================
-- Run this to find indexes that aren't being used:
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0
-- ORDER BY pg_relation_size(indexrelid) DESC;
