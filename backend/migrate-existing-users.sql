-- ============================================================================
-- MIGRATE EXISTING AUTH USERS TO PUBLIC.USERS TABLE
-- ============================================================================
-- This script syncs users who signed up BEFORE the auth trigger was deployed
-- Run this ONCE after deploying supabase-auth-trigger.sql
-- Safe to run multiple times (uses INSERT ... ON CONFLICT DO NOTHING)

-- ============================================================================
-- STEP 1: Migrate all existing auth.users to public.users
-- ============================================================================

INSERT INTO public.users (
  id,
  email,
  google_id,
  google_name,
  google_email,
  google_picture,
  user_type,
  is_b2b_user,
  b2b_approval_status,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'sub' as google_id,
  au.raw_user_meta_data->>'name' as google_name,
  au.raw_user_meta_data->>'email' as google_email,
  au.raw_user_meta_data->>'picture' as google_picture,
  'user' as user_type,
  false as is_b2b_user,
  'none' as b2b_approval_status,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
WHERE NOT EXISTS (
  -- Only insert if user doesn't already exist in public.users
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2: Verify the migration
-- ============================================================================

-- Show count of users in auth.users vs public.users
DO $$
DECLARE
  auth_count INT;
  public_count INT;
  missing_count INT;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO public_count FROM public.users;
  missing_count := auth_count - public_count;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Users in auth.users:    %', auth_count;
  RAISE NOTICE 'Users in public.users:  %', public_count;
  RAISE NOTICE 'Missing users:          %', missing_count;
  RAISE NOTICE '========================================';
  
  IF missing_count = 0 THEN
    RAISE NOTICE '✅ All users successfully migrated!';
  ELSE
    RAISE WARNING '⚠️  % users are missing from public.users', missing_count;
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Show sample migrated users (first 5)
-- ============================================================================

SELECT 
  id,
  email,
  google_name,
  user_type,
  b2b_approval_status,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If you need to see which auth users are missing from public.users:
-- 
-- SELECT 
--   au.id,
--   au.email,
--   au.created_at
-- FROM auth.users au
-- WHERE NOT EXISTS (
--   SELECT 1 FROM public.users pu WHERE pu.id = au.id
-- );

-- If you need to manually fix a specific user:
--
-- INSERT INTO public.users (id, email, user_type, created_at, updated_at)
-- VALUES (
--   'user-uuid-here',
--   'user@example.com',
--   'user',
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   email = EXCLUDED.email,
--   updated_at = NOW();
