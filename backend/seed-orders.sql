-- Seed sample orders for testing
-- This creates realistic orders with various statuses and dates

-- First, get a sample user ID (you may need to adjust this based on your actual user)
-- For this script, we'll use placeholder UUIDs that you should replace with real user IDs

INSERT INTO public.orders (
  id,
  user_id,
  order_number,
  total_amount,
  status,
  items_count,
  shipping_address,
  created_at,
  updated_at
) VALUES
-- Recent orders (last 3 days)
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1),
  'ORD-20250124-000001',
  4210.00,
  'shipped',
  12,
  '123 Main St, New York, NY 10001',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1 OFFSET 1),
  'ORD-20250124-000002',
  1850.50,
  'pending',
  5,
  '456 Oak Ave, Los Angeles, CA 90001',
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '4 hours'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1 OFFSET 2),
  'ORD-20250124-000003',
  3200.75,
  'confirmed',
  8,
  '789 Pine Rd, Chicago, IL 60601',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '5 hours'
),
-- Yesterday's orders
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1),
  'ORD-20250123-000001',
  920.00,
  'processing',
  3,
  '321 Elm St, Houston, TX 77001',
  NOW() - INTERVAL '1 day 2 hours',
  NOW() - INTERVAL '1 day 1 hour'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1 OFFSET 1),
  'ORD-20250123-000002',
  12400.00,
  'shipped',
  28,
  '654 Maple Dr, Phoenix, AZ 85001',
  NOW() - INTERVAL '1 day 8 hours',
  NOW() - INTERVAL '1 day 6 hours'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1 OFFSET 2),
  'ORD-20250123-000003',
  2150.25,
  'delivered',
  6,
  '987 Cedar Ln, Philadelphia, PA 19101',
  NOW() - INTERVAL '1 day 12 hours',
  NOW() - INTERVAL '1 day 10 hours'
),
-- 2 days ago
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1),
  'ORD-20250122-000001',
  3560.00,
  'delivered',
  8,
  '111 Birch Way, San Antonio, TX 78201',
  NOW() - INTERVAL '2 days 3 hours',
  NOW() - INTERVAL '2 days 1 hour'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1 OFFSET 1),
  'ORD-20250122-000002',
  1200.50,
  'cancelled',
  4,
  '222 Spruce St, San Diego, CA 92101',
  NOW() - INTERVAL '2 days 6 hours',
  NOW() - INTERVAL '2 days 4 hours'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1 OFFSET 2),
  'ORD-20250122-000003',
  5890.00,
  'shipped',
  15,
  '333 Ash Ave, Dallas, TX 75201',
  NOW() - INTERVAL '2 days 10 hours',
  NOW() - INTERVAL '2 days 8 hours'
),
-- 3 days ago
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1),
  'ORD-20250121-000001',
  2340.75,
  'delivered',
  7,
  '444 Willow Rd, San Jose, CA 95101',
  NOW() - INTERVAL '3 days 2 hours',
  NOW() - INTERVAL '3 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1 OFFSET 1),
  'ORD-20250121-000002',
  4560.00,
  'delivered',
  11,
  '555 Poplar Dr, Austin, TX 78701',
  NOW() - INTERVAL '3 days 8 hours',
  NOW() - INTERVAL '3 days 6 hours'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1 OFFSET 2),
  'ORD-20250121-000003',
  1675.50,
  'delivered',
  5,
  '666 Sycamore Ln, Jacksonville, FL 32099',
  NOW() - INTERVAL '3 days 12 hours',
  NOW() - INTERVAL '3 days 10 hours'
),
-- Older orders
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1),
  'ORD-20250120-000001',
  3890.00,
  'delivered',
  9,
  '777 Chestnut St, Fort Worth, TX 76102',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '3 days 22 hours'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1 OFFSET 1),
  'ORD-20250120-000002',
  2100.25,
  'delivered',
  6,
  '888 Hickory Ave, Columbus, OH 43085',
  NOW() - INTERVAL '4 days 6 hours',
  NOW() - INTERVAL '4 days 4 hours'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.users LIMIT 1 OFFSET 2),
  'ORD-20250119-000001',
  5430.00,
  'delivered',
  13,
  '999 Dogwood Dr, Charlotte, NC 28202',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '4 days 22 hours'
)
ON CONFLICT DO NOTHING;

-- Also seed order items for the orders
-- Get product IDs first
WITH order_data AS (
  SELECT 
    o.id as order_id,
    p.id as product_id,
    (RANDOM() * 5 + 1)::INT as quantity,
    COALESCE(p.b2b_price, p.sale_price, p.base_price) as price
  FROM public.orders o
  CROSS JOIN public.products p
  WHERE o.order_number LIKE 'ORD-%'
  LIMIT 50  -- Limit to avoid too many items
)
INSERT INTO public.order_items (
  order_id,
  product_id,
  quantity,
  price_at_purchase,
  created_at
)
SELECT 
  order_id,
  product_id,
  quantity,
  price,
  NOW()
FROM order_data
ON CONFLICT DO NOTHING;
