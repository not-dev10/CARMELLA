-- Query 1: Inventory Stats - Indexes on quantity_available
CREATE INDEX IF NOT EXISTS idx_inventory_quantity_available ON inventory(quantity_available) WHERE is_active = true;

-- Query 2: Inventory - Product ID index
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);

-- Query 3: Inventory - Warehouse location index
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_location);

-- Query 4: Cart - User ID index
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

-- Query 5: Cart Items - Cart ID index
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);

-- Query 6: Cart Items - Product ID index
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Query 7: Orders - Status index
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status) WHERE status IN ('delivered', 'pending', 'cancelled');

-- Query 8: Orders - Created date index
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Query 9: Orders - User ID index
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Query 10: B2B Requests - Status index
CREATE INDEX IF NOT EXISTS idx_b2b_requests_status ON b2b_requests(status) WHERE status = 'pending';

-- Query 11: Products - Category ID index
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Query 12: Inventory History - Inventory ID index
CREATE INDEX IF NOT EXISTS idx_inventory_history_inventory_id ON inventory_history(inventory_id);

-- Query 13: Inventory History - Created date index
CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON inventory_history(created_at DESC);

-- Query 14: Inventory - Composite product+status index
CREATE INDEX IF NOT EXISTS idx_inventory_user_id_status ON inventory(product_id, is_active);
