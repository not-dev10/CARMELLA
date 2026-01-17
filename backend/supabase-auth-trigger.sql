-- ============================================================================
-- AUTO-CREATE USER PROFILE ON GOOGLE OAUTH SIGNUP
-- ============================================================================
-- Three roles: admin, guest (not logged in), user (logged in)
-- This trigger creates an entry in public.users with user_type = 'user'

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    google_id,
    google_name,
    google_email,
    google_picture,
    user_type,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'sub',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'email',
    NEW.raw_user_meta_data->>'picture',
    'user',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROLE DEFINITIONS
-- ============================================================================
-- guest: Not logged in, no database entry, limited access (browse only)
-- user: Logged in via Google, database entry with user_type = 'user', full access
-- admin: user_type = 'admin', full control over system

