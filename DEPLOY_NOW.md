# 🚀 DEPLOY DATABASE NOW

## Quick Deployment (5 Minutes)

### Step 1: Open Supabase Dashboard
Go to: https://app.supabase.com/projects

### Step 2: Select Project
Click on project: **wrfagwidnhxrafemqwkq**

### Step 3: Open SQL Editor
Left sidebar → **SQL Editor** → **New Query**

---

## Deploy File 1: Main Schema

### Copy This
Open: `carmella/backend/supabase-setup.sql`
Copy entire file content

### Paste & Run
1. Paste into SQL Editor
2. Click **Run** (or Cmd+Enter)
3. Wait for ✅ success message

**What it creates:**
- 12 tables (users, products, orders, etc.)
- 30+ RLS policies
- 2 triggers
- 14 indexes

---

## Deploy File 2: Reviews Schema

### Copy This
Open: `carmella/backend/supabase-reviews.sql`
Copy entire file content

### Paste & Run
1. Click **New Query**
2. Paste into SQL Editor
3. Click **Run**
4. Wait for ✅ success message

**What it creates:**
- Reviews table
- Activity logs table
- 2 views
- 7 indexes

---

## Deploy File 3: Auth Trigger

### Copy This
Open: `carmella/backend/supabase-auth-trigger.sql`
Copy entire file content

### Paste & Run
1. Click **New Query**
2. Paste into SQL Editor
3. Click **Run**
4. Wait for ✅ success message

**What it creates:**
- PostgreSQL trigger
- Auto-populates user profile on Google OAuth

---

## Verify Deployment

### Check Tables
1. Left sidebar → **Table Editor**
2. You should see 15 tables:
   - users ✅
   - b2b_requests ✅
   - categories ✅
   - products ✅
   - carts ✅
   - cart_items ✅
   - orders ✅
   - order_items ✅
   - wishlists ✅
   - contacts ✅
   - admin_content ✅
   - reviews ✅
   - activity_logs ✅

### Check RLS Policies
1. Click any table
2. Go to **RLS** tab
3. Should see multiple policies

### Test Auth Trigger
1. Sign up with Google in frontend
2. Go to **Table Editor** → `users`
3. Should see your entry with Google data

---

## Troubleshooting

### Error: "relation already exists"
- Schema already deployed
- Safe to ignore or drop tables first

### Error: "permission denied"
- Check you're logged in
- Verify auth token

### Trigger not firing
- Check PostgreSQL trigger exists
- Verify auth.users has entries

---

## Next Steps After Deployment

1. **Start Backend**
   ```bash
   cd carmella/backend
   npm run dev
   ```

2. **Test Endpoints**
   - Use Postman or cURL
   - See `API_ENDPOINTS.md` for examples

3. **Connect Frontend**
   - Replace mock data with API calls
   - See `FRONTEND_BACKEND_INTEGRATION.md`

4. **Deploy to Production**
   - See `SUPABASE_DEPLOYMENT_STEPS.md`

---

## Files Reference

- `supabase-setup.sql` - Main schema (12 tables)
- `supabase-reviews.sql` - Reviews & activity logs
- `supabase-auth-trigger.sql` - Auth trigger
- `API_ENDPOINTS.md` - API reference
- `SUPABASE_DEPLOYMENT_STEPS.md` - Full deployment guide
- `QUICK_START.md` - Developer guide

---

## Status

✅ Backend: 100% Complete  
✅ Database Schema: Ready  
⏳ Database Deployment: **START HERE**  
⏳ API Testing: Next  
⏳ Frontend Integration: After testing  

---

**Time to Deploy**: 5 minutes  
**Time to Test**: 1-2 hours  
**Time to Full Production**: 1-2 days

Let's go! 🚀
