# Quick Setup - Run These SQL Queries

## Step 1: Create Tables & Triggers

Go to your Supabase Dashboard → SQL Editor → New Query

Copy and paste the entire contents of:
**`carmella/backend/create-inventory-table.sql`**

Then click "Run"

Expected output: No errors, just "Success"

---

## Step 2: Seed Inventory Data

In the same SQL Editor, create a new query

Copy and paste the entire contents of:
**`carmella/backend/seed-inventory.sql`**

Then click "Run"

Expected output: Should show something like:
```
INSERT 0 15
```
(15 = number of products, may vary)

---

## Step 3: Verify

Run this query to check:

```sql
SELECT 
  COUNT(*) as total_inventory_items,
  SUM(quantity_on_hand) as total_stock,
  COUNT(CASE WHEN quantity_available <= reorder_point THEN 1 END) as low_stock_count
FROM public.inventory;
```

You should see:
- `total_inventory_items` = number of products
- `total_stock` = sum of all stock quantities
- `low_stock_count` = items below reorder point

---

## Step 4: Test in Admin Panel

1. Go to Admin Panel
2. Click "Inventory Alerts" in sidebar
3. You should see all products with stock levels
4. Try clicking +/- to adjust stock
5. Check that changes appear instantly

---

## Troubleshooting

**"Table already exists" error?**
- The tables might already exist from a previous run
- That's fine, the SQL has `IF NOT EXISTS` clauses
- Just run it again, it will skip existing tables

**No inventory items showing?**
- Make sure you ran BOTH SQL files
- Check that products table has data: `SELECT COUNT(*) FROM public.products;`
- Verify inventory table: `SELECT COUNT(*) FROM public.inventory;`

**Stock not updating in products table?**
- The trigger should auto-sync
- Try manually updating: `UPDATE public.inventory SET quantity_on_hand = 100 WHERE id = 'some-id';`
- Then check: `SELECT stock_quantity FROM public.products WHERE id = 'product-id';`

---

## Files to Run

1. **create-inventory-table.sql** - Creates tables, indexes, triggers, RLS policies
2. **seed-inventory.sql** - Populates inventory from existing products

Both files are in: `carmella/backend/`
