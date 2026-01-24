-- Check if inventory table has data
SELECT COUNT(*) as inventory_count FROM public.inventory;

-- Check if products table has data
SELECT COUNT(*) as products_count FROM public.products WHERE is_active = true;

-- If inventory is empty, populate it
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

-- Verify inventory was populated
SELECT COUNT(*) as final_inventory_count FROM public.inventory;
