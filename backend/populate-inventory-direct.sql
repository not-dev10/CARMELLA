-- Direct inventory population script
-- Run this if seed-inventory.sql doesn't work

-- First, check how many products exist
SELECT COUNT(*) as product_count FROM public.products;

-- Then run this to populate inventory
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
  notes,
  is_active
)
SELECT
  p.id,
  'Main Warehouse',
  COALESCE(p.stock_quantity, 100),
  0,
  20,
  50,
  'SKU-' || SUBSTRING(COALESCE(p.slug, 'PROD'), 1, 3) || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY p.id)::text, 4, '0'),
  'BAR-' || SUBSTRING(MD5(p.id::text), 1, 12),
  NOW() - INTERVAL '7 days',
  'Initial inventory from products table',
  true
FROM public.products p
WHERE NOT EXISTS (
  SELECT 1 FROM public.inventory WHERE product_id = p.id
);

-- Verify the insert
SELECT COUNT(*) as inventory_count FROM public.inventory;

-- Check a sample
SELECT 
  i.id,
  i.sku,
  i.quantity_on_hand,
  i.reorder_point,
  p.name,
  p.stock_quantity
FROM public.inventory i
LEFT JOIN public.products p ON i.product_id = p.id
LIMIT 5;
