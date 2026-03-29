-- ============================================================================
-- ADD BUY_MODE TO CART_ITEMS TABLE
-- ============================================================================
-- This migration adds a buy_mode column to track whether items were added
-- in retail or bulk mode, ensuring correct pricing is maintained

-- Add buy_mode column
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS buy_mode VARCHAR(10) DEFAULT 'retail' CHECK (buy_mode IN ('retail', 'bulk'));

-- Add comment
COMMENT ON COLUMN public.cart_items.buy_mode IS 'Purchase mode: retail (single/small qty) or bulk (B2B wholesale)';

-- Update existing rows to 'bulk' if quantity >= product MOQ
UPDATE public.cart_items ci
SET buy_mode = 'bulk'
FROM public.products p
WHERE ci.product_id = p.id 
AND ci.quantity >= p.moq
AND ci.buy_mode = 'retail';

-- Verification query
-- SELECT ci.id, ci.quantity, ci.buy_mode, p.moq, p.name
-- FROM cart_items ci
-- JOIN products p ON ci.product_id = p.id;
