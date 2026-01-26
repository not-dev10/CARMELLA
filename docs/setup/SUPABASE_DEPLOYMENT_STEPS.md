# Supabase Database Deployment Guide

## Overview
This guide walks through deploying the Carmella database schema to Supabase. The schema includes 15 tables with complete RLS policies, triggers, and indexes.

## Prerequisites
- Supabase project created (Project ID: `wrfagwidnhxrafemqwkq`)
- Access to Supabase dashboard
- SQL scripts ready:
  - `supabase-setup.sql` - Main schema (12 tables)
  - `supabase-reviews.sql` - Reviews & activity logs (3 tables)
  - `supabase-auth-trigger.sql` - Auto-populate user profile on OAuth signup

## Deployment Steps

### Step 1: Deploy Main Schema
1. Go to Supabase Dashboard → Your Project
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy entire content from `supabase-setup.sql`
5. Paste into the SQL editor
6. Click **Run** (or Cmd+Enter)
7. Wait for completion (should see ✅ success message)

**What gets created:**
- `users` table with B2B approval tracking
- `b2b_requests` table with 24-hour expiration
- `categories` table
- `products` table with pricing & B2B fields
- `carts` & `cart_items` tables
- `orders` & `order_items` tables
- `wishlists` table
- `contacts` table (for contact form)
- `admin_content` table (for homepage sections)
- 30+ RLS policies
- 2 triggers (sale percentage calculation)
- 14 performance indexes

### Step 2: Deploy Reviews Schema
1. Click **New Query** again
2. Copy entire content from `supabase-reviews.sql`
3. Paste into the SQL editor
4. Click **Run**
5. Wait for completion

**What gets created:**
- `reviews` table with ratings
- `activity_logs` table for audit trail
- 2 views for aggregated data
- 7 performance indexes

### Step 3: Deploy Auth Trigger
1. Click **New Query** again
2. Copy entire content from `supabase-auth-trigger.sql`
3. Paste into the SQL editor
4. Click **Run**
5. Wait for completion

**What gets created:**
- PostgreSQL trigger to auto-populate `users` table on Google OAuth signup
- Extracts Google profile data (name, email, picture)

## Verification

### Check Tables Created
1. Go to **Table Editor** in Supabase
2. You should see all 15 tables:
   - users
   - b2b_requests
   - categories
   - products
   - carts
   - cart_items
   - orders
   - order_items
   - wishlists
   - contacts
   - admin_content
   - reviews
   - activity_logs

### Check RLS Policies
1. Click on any table
2. Go to **RLS** tab
3. You should see multiple policies for SELECT, INSERT, UPDATE, DELETE

### Test Auth Trigger
1. Sign up with Google OAuth in the frontend
2. Go to Supabase → **Table Editor** → `users`
3. You should see your entry with:
   - `id` (from auth.users)
   - `email`
   - `google_id`
   - `google_name`
   - `google_picture`
   - `user_type = 'user'`

## Troubleshooting

### Error: "relation already exists"
- Schema was already deployed
- Safe to ignore or drop tables first:
  ```sql
  DROP TABLE IF EXISTS public.activity_logs CASCADE;
  DROP TABLE IF EXISTS public.reviews CASCADE;
  DROP TABLE IF EXISTS public.admin_content CASCADE;
  DROP TABLE IF EXISTS public.contacts CASCADE;
  DROP TABLE IF EXISTS public.wishlists CASCADE;
  DROP TABLE IF EXISTS public.order_items CASCADE;
  DROP TABLE IF EXISTS public.orders CASCADE;
  DROP TABLE IF EXISTS public.cart_items CASCADE;
  DROP TABLE IF EXISTS public.carts CASCADE;
  DROP TABLE IF EXISTS public.b2b_requests CASCADE;
  DROP TABLE IF EXISTS public.products CASCADE;
  DROP TABLE IF EXISTS public.categories CASCADE;
  DROP TABLE IF EXISTS public.users CASCADE;
  ```

### Error: "permission denied"
- Check RLS policies are correct
- Ensure you're logged in as admin user
- Verify auth token is valid

### Trigger not firing
- Check PostgreSQL trigger exists: `SELECT * FROM pg_trigger WHERE tgname LIKE '%auth%'`
- Verify auth.users table has entries
- Check Supabase logs for errors

## Next Steps

1. **Test API Endpoints**: Run backend server and test all endpoints
2. **Frontend Integration**: Update frontend to use real API instead of mock data
3. **Admin Panel**: Connect admin panel to real database
4. **Payment Integration**: Add Stripe/payment processing
5. **Production Deployment**: Deploy to production environment

## Database Statistics

- **Tables**: 15
- **RLS Policies**: 30+
- **Indexes**: 21
- **Triggers**: 2
- **Views**: 3
- **Endpoints**: 26

## Important Notes

- All tables have RLS enabled for security
- B2B pricing is hidden from non-approved users
- Sale percentage auto-calculated from sale_price
- B2B requests expire after 24 hours
- User profile auto-populated on Google OAuth signup
- Admin activity logged for audit trail
