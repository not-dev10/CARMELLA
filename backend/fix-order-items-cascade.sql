-- Migration: Fix foreign key constraint for order_items -> products
-- Allows deletion of products that have associated order items
-- Run this in Supabase SQL Editor after updating supabase-setup.sql

BEGIN;

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Step 2: Add the new constraint with ON DELETE CASCADE
ALTER TABLE public.order_items
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE CASCADE;

-- Verify the constraint was updated
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_name = 'order_items' AND column_name = 'product_id';

COMMIT;
