# Inventory Troubleshooting - Empty Inventory Issue

## Problem
API returns 200 but inventory shows 0 items in admin panel.

## Root Cause
The inventory table exists but has no records. The seed script either:
1. Hasn't been run yet
2. Failed silently
3. Products table is empty

## Solution

### Step 1: Check if Products Exist

Run this in Supabase SQL Editor:
```sql
SELECT COUNT(*) as product_count FROM public.products;
```

**Expected:** Should show a number > 0 (e.g., 15)

If it shows 0, you need to seed products first:
```sql
-- Run the seed-products.sql file
```

---

### Step 2: Check if Inventory Table Exists

```sql
SELECT COUNT(*) as inventory_count FROM public.inventory;
```

**Expected:** Should show a number > 0 after seeding

If it shows 0, proceed to Step 3.

---

### Step 3: Populate Inventory

Use the direct population script:

**File:** `carmella/backend/populate-inventory-direct.sql`

Copy and paste the entire contents into Supabase SQL Editor and run.

This will:
1. Check product count
2. Create inventory records for all products
3. Verify the insert
4. Show a sample of created records

---

### Step 4: Verify in Admin Panel

1. Go to Admin Panel
2. Click "Inventory Alerts" in sidebar
3. You should now see products with stock levels

---

## If Still Empty

### Check RLS Policies

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'inventory';
```

Should show `rowsecurity = true`

### Check Admin User Permissions

Make sure your user is marked as admin:
```sql
SELECT id, email, user_type FROM public.users WHERE user_type = 'admin';
```

### Check Inventory Records Directly

```sql
SELECT * FROM public.inventory LIMIT 5;
```

If this returns data but admin panel shows 0, it's a frontend issue.

---

## Frontend Debugging

Check browser console for errors:
1. Open Admin Panel
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for red errors

Common issues:
- **"Cannot read property 'products' of undefined"** - Product join failed
- **"RLS policy violation"** - User doesn't have permission
- **"Empty array"** - Inventory table is actually empty

---

## Quick Fix Checklist

- [ ] Products table has data: `SELECT COUNT(*) FROM public.products;`
- [ ] Inventory table exists: `SELECT COUNT(*) FROM public.inventory;`
- [ ] Inventory has records: `SELECT COUNT(*) FROM public.inventory;` > 0
- [ ] RLS is enabled: `SELECT rowsecurity FROM pg_tables WHERE tablename = 'inventory';`
- [ ] Admin user exists: `SELECT * FROM public.users WHERE user_type = 'admin';`
- [ ] Browser console has no errors (F12)

---

## Nuclear Option - Reset Everything

If nothing works, reset and start fresh:

```sql
-- Delete all inventory records
DELETE FROM public.inventory_history;
DELETE FROM public.inventory;

-- Re-run the populate script
-- (Copy from populate-inventory-direct.sql)
```

Then refresh admin panel.

---

## Still Stuck?

Check the backend logs:
1. Look for `[INVENTORY]` log messages
2. Check if `getInventory` is being called
3. Verify the response includes `inventory: []` or `inventory: [...]`

If API returns empty array but database has records, it's a query issue in the controller.
