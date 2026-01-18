-- ============================================================================
-- SECURE PRICING VIEW - PRODUCTION READY
-- ============================================================================
-- This view implements column-level security for pricing data
-- Pricing visibility based on user's B2B approval status
-- 
-- DEPLOYMENT ORDER:
-- 1. Run supabase-setup.sql first (creates base tables)
-- 2. Run this file to create the secure view
-- 3. Update backend to use products_safe instead of products

-- ============================================================================
-- STEP 1: CREATE SECURE PRODUCTS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.products_safe AS
SELECT
  p.id,
  p.category_id,
  p.name,
  p.slug,
  p.description,
  p.long_description,
  p.image_url,
  p.gallery_urls,
  p.badge,
  p.features,
  p.stock_quantity,
  p.is_active,
  p.is_featured,
  p.created_at,
  p.updated_at,

  -- PRICING LOGIC: Show prices ONLY to approved B2B users
  -- For guests and non-approved users, return NULL
  CASE
    WHEN u.b2b_approval_status = 'approved' THEN p.base_price
    ELSE NULL
  END AS base_price,

  CASE
    WHEN u.b2b_approval_status = 'approved' THEN p.sale_price
    ELSE NULL
  END AS sale_price,

  CASE
    WHEN u.b2b_approval_status = 'approved' THEN p.sale_percentage
    ELSE NULL
  END AS sale_percentage,

  CASE
    WHEN u.b2b_approval_status = 'approved' THEN p.b2b_price
    ELSE NULL
  END AS b2b_price,

  CASE
    WHEN u.b2b_approval_status = 'approved' THEN p.b2b_min_quantity
    ELSE NULL
  END AS b2b_min_quantity,

  CASE
    WHEN u.b2b_approval_status = 'approved' THEN p.moq
    ELSE NULL
  END AS moq,

  -- Helper fields for frontend
  CASE
    WHEN auth.uid() IS NULL THEN true  -- Guest user
    WHEN u.b2b_approval_status != 'approved' THEN true  -- Not approved
    ELSE false  -- Approved B2B user
  END AS pricing_locked,

  CASE
    WHEN auth.uid() IS NULL THEN 'guest'
    WHEN u.b2b_approval_status = 'approved' THEN 'b2b_approved'
    WHEN u.b2b_approval_status = 'pending' THEN 'b2b_pending'
    WHEN u.b2b_approval_status = 'rejected' THEN 'b2b_rejected'
    ELSE 'user'
  END AS user_tier

FROM public.products p
LEFT JOIN public.users u ON u.id = auth.uid()
WHERE p.is_active = TRUE;

-- ============================================================================
-- STEP 2: ENABLE RLS ON VIEW (CRITICAL FOR SECURITY)
-- ============================================================================

-- This ensures the view uses the caller's auth context
ALTER VIEW public.products_safe SET (security_invoker = true);

-- ============================================================================
-- STEP 3: GRANT PERMISSIONS
-- ============================================================================

-- Allow all authenticated and anonymous users to query the view
GRANT SELECT ON public.products_safe TO anon, authenticated;

-- ============================================================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Note: Indexes are on the base table (products), not the view
-- These should already exist from supabase-setup.sql
-- Listed here for reference:

-- CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
-- CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
-- CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
-- CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured, is_active);

-- ============================================================================
-- STEP 5: OPTIONAL HARDENING (RECOMMENDED FOR PRODUCTION)
-- ============================================================================

-- Revoke direct access to base products table for non-admin users
-- This prevents SQL injection or direct API access bypassing the view
-- 
-- WARNING: Only enable this AFTER updating your backend to use products_safe
-- 
-- REVOKE SELECT ON public.products FROM anon, authenticated;
-- 
-- Admin users can still access via service role key

-- ============================================================================
-- STEP 6: ADD SECURITY CHECK TO ORDERS
-- ============================================================================

-- Prevent non-approved users from creating orders
-- This ensures users can't bypass pricing checks via cart/order endpoints

DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND b2b_approval_status = 'approved'
    )
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test as guest (no auth)
-- SELECT * FROM public.products_safe LIMIT 5;
-- Expected: pricing_locked = true, all prices = NULL

-- Test as logged-in user (not approved)
-- SELECT * FROM public.products_safe LIMIT 5;
-- Expected: pricing_locked = true, all prices = NULL

-- Test as approved B2B user
-- SELECT * FROM public.products_safe LIMIT 5;
-- Expected: pricing_locked = false, all prices visible

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- To remove the view and restore original policies:
-- 
-- DROP VIEW IF EXISTS public.products_safe;
-- 
-- DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
-- CREATE POLICY "orders_insert_own" ON public.orders
--   FOR INSERT WITH CHECK (auth.uid() = user_id);
