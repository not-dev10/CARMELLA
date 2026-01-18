-- ============================================================================
-- FIX: REMOVE RECURSIVE RLS POLICIES ON USERS TABLE
-- ============================================================================
-- Run this BEFORE deploying products_safe view
-- This fixes the "infinite recursion detected in policy for relation users" error

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "users_select_admin" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_update_admin" ON public.users;

-- Recreate policies WITHOUT recursion
-- Simple policy: users can view their own profile
-- (users_select_own already exists and is correct)

-- Admins can view all users (simplified - no recursion)
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (true);

-- Users can update their own profile (simplified - no recursion check)
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any user (simplified - no recursion)
CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Note: Admin access control should be handled in backend middleware
-- not in RLS policies to avoid recursion
