-- Add order_number column to orders table for systematic order IDs
-- Format: ORD-YYYYMMDD-XXXXXX (6-digit sequential)
-- Example: ORD-20250124-123456
-- Supports up to 1,000,000 orders per day

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(25) UNIQUE NOT NULL DEFAULT '';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- Update existing orders with systematic order numbers using CTE
-- This generates order numbers based on their creation date with 6-digit sequence
WITH numbered_orders AS (
  SELECT 
    id,
    'ORD-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD(ROW_NUMBER() OVER (PARTITION BY DATE(created_at) ORDER BY created_at)::text, 6, '0') as new_order_number
  FROM public.orders
  WHERE order_number = ''
)
UPDATE public.orders
SET order_number = numbered_orders.new_order_number
FROM numbered_orders
WHERE public.orders.id = numbered_orders.id;


