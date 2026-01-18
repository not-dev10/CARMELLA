-- ============================================================================
-- DEPLOYMENT GUIDE: SECURE PRICING IMPLEMENTATION
-- ============================================================================

/**
 * ROLE LOGIC (Matches User Requirements)
 * ========================================
 * 
 * User Type          | Login | Can See Products | Can See Price | Message
 * -------------------|-------|------------------|---------------|---------------------------
 * Guest              | ❌    | ✅               | ❌            | "Login to view pricing"
 * Logged-in (Pending)| ✅    | ✅               | ❌            | "Approval required"
 * Approved User      | ✅    | ✅               | ✅            | Full access
 * 
 * IMPLEMENTATION:
 * - Database VIEW (products_safe) handles pricing visibility via RLS
 * - Backend controllers use the VIEW instead of base products table
 * - Frontend shows appropriate messages based on pricing_locked flag
 */

-- ============================================================================
-- DEPLOYMENT STEPS (IN ORDER)
-- ============================================================================

-- STEP 1: Deploy Base Schema
-- File: supabase-setup.sql
-- Creates: users, products, categories, orders, etc.

-- STEP 2: Deploy Auth Trigger
-- File: supabase-auth-trigger.sql
-- Creates: Auto-sync Google Auth → users table

-- STEP 3: Deploy Secure Pricing View (THIS FILE)
-- File: supabase-secure-pricing-view.sql
-- Creates: products_safe view with RLS pricing logic

-- STEP 4: Migrate Existing Users
-- File: migrate-existing-users.sql
-- Syncs: Existing auth.users → public.users

-- STEP 5: Seed Data (Optional)
-- Files: seed-categories.sql, seed-products.sql

-- STEP 6: Update Backend Code
-- Replace: from("products") → from("products_safe")
-- Use: securePricing.ts utilities

-- ============================================================================
-- VERIFICATION CHECKLIST
-- ============================================================================

-- ✅ 1. Tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'products', 'categories', 'orders');

-- ✅ 2. View created
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'products_safe';

-- ✅ 3. Auth trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- ✅ 4. Test pricing visibility as guest
-- (Run in Supabase SQL Editor without auth)
SELECT 
  id, 
  name, 
  base_price,    -- Should be NULL
  b2b_price,     -- Should be NULL
  pricing_locked, -- Should be TRUE
  user_tier      -- Should be 'guest'
FROM public.products_safe 
LIMIT 3;

-- ✅ 5. Test pricing visibility as approved user
-- (Run with approved user's JWT token)
SELECT 
  id, 
  name, 
  base_price,    -- Should be visible
  b2b_price,     -- Should be visible
  pricing_locked, -- Should be FALSE
  user_tier      -- Should be 'b2b_approved'
FROM public.products_safe 
LIMIT 3;

-- ============================================================================
-- BACKEND MIGRATION CHECKLIST
-- ============================================================================

-- Files to update:
-- ✅ src/controllers/productController.ts
-- ✅ src/controllers/homepageController.ts
-- ✅ src/controllers/orderController.ts
-- ✅ src/controllers/cartController.ts (if it queries products)

-- Changes needed:
-- ❌ OLD: supabase.from("products").select("*")
-- ✅ NEW: supabase.from("products_safe").select("*")

-- ❌ OLD: Manual applyPricingRules() function
-- ✅ NEW: Use products_safe (pricing handled by database)

-- ❌ OLD: Check user.b2b_approval_status in backend
-- ✅ NEW: Trust products_safe.pricing_locked field

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

-- 🔐 Why this is secure:
-- 1. Pricing logic in DATABASE, not application code
-- 2. RLS policies enforce access at row level
-- 3. VIEW enforces access at column level
-- 4. Even SQL injection can't bypass (uses auth.uid())
-- 5. Frontend can't manipulate pricing (server-side calculation)

-- 🔐 Optional hardening (after backend migration):
-- REVOKE SELECT ON public.products FROM anon, authenticated;
-- This prevents direct access to base table, forcing use of products_safe

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- Problem: Prices showing as NULL for approved users
-- Solution: Check user's b2b_approval_status
SELECT id, email, b2b_approval_status FROM public.users WHERE id = 'user-id-here';

-- Problem: View not found
-- Solution: Ensure products_safe view was created
SELECT * FROM information_schema.views WHERE table_name = 'products_safe';

-- Problem: Backend errors after migration
-- Solution: Check all queries use products_safe, not products
-- Search codebase for: from("products")

-- ============================================================================
-- ROLLBACK PLAN (if needed)
-- ============================================================================

-- To revert to old system:
-- 1. DROP VIEW public.products_safe;
-- 2. Restore old RLS policies on products table
-- 3. Revert backend code to use from("products")
-- 4. Re-enable applyPricingRules() functions
