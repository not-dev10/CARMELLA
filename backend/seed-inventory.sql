-- Seed inventory data for all products
-- Creates inventory records linked to products with realistic stock levels
-- Simpler version that works reliably

INSERT INTO public.inventory (
  product_id,
  warehouse_location,
  quantity_on_hand,
  quantity_reserved,
  reorder_point,
  reorder_quantity,
  sku,
  barcode,
  last_restock_date,
  notes
)
SELECT
  p.id,
  'Main Warehouse',
  COALESCE(p.stock_quantity, 0),
  0,
  CASE
    WHEN COALESCE(p.stock_quantity, 0) < 100 THEN 20
    WHEN COALESCE(p.stock_quantity, 0) < 300 THEN 50
    ELSE 100
  END as reorder_point,
  CASE
    WHEN COALESCE(p.stock_quantity, 0) < 100 THEN 50
    WHEN COALESCE(p.stock_quantity, 0) < 300 THEN 100
    ELSE 200
  END as reorder_quantity,
  'SKU-' || UPPER(SUBSTRING(COALESCE(p.slug, 'PROD'), 1, 3)) || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY p.id)::text, 4, '0'),
  'BAR-' || SUBSTRING(MD5(COALESCE(p.id::text, 'default')), 1, 12),
  NOW() - INTERVAL '7 days',
  'Initial inventory from products table'
FROM public.products p
WHERE NOT EXISTS (
  SELECT 1 FROM public.inventory WHERE product_id = p.id
)
ON CONFLICT (product_id, warehouse_location) DO NOTHING;
