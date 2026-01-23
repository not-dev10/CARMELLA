-- Set a user as admin
-- Replace 'your-email@example.com' with your actual email
UPDATE public.users
SET user_type = 'admin'
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, user_type FROM public.users WHERE email = 'your-email@example.com';
