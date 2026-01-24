# Inventory Management Setup Guide

## Overview
This guide walks you through setting up the inventory management system that connects to your existing products table.

## Step 1: Create Inventory Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- File: create-inventory-table.sql
-- Copy and paste the entire contents into Supabase SQL Editor
```

**Location:** `carmella/backend/create-inventory-table.sql`

This creates:
- `inventory` table - tracks stock per warehouse
- `inventory_history` table - audit trail
- Automatic triggers to sync with products table
- RLS policies for admin access

## Step 2: Seed Inventory Data

After creating the tables, run this SQL:

```sql
-- File: seed-inventory.sql
-- Copy and paste the entire contents into Supabase SQL Editor
```

**Location:** `carmella/backend/seed-inventory.sql`

This creates inventory records for all existing products with:
- Current stock from products.stock_quantity
- Automatic SKU generation
- Reorder points based on stock levels
- Main Warehouse location

## Step 3: Verify Setup

Check that inventory was created:

```sql
SELECT COUNT(*) as inventory_count FROM public.inventory;
SELECT COUNT(*) as history_count FROM public.inventory_history;
```

You should see:
- `inventory_count` = number of products (should match products table)
- `history_count` = 0 (no history yet)

## Step 4: Test the Integration

1. Go to Admin Panel → Inventory Alerts
2. You should see all products with their stock levels
3. Try adjusting stock with +/- buttons
4. Check that products.stock_quantity updates automatically

## Step 5: Backend Routes

The backend is already configured. Routes available:

```
GET  /api/admin/inventory              - Get all inventory
GET  /api/admin/inventory/stats        - Get inventory statistics
GET  /api/admin/inventory/low-stock    - Get low stock items
PUT  /api/admin/inventory/:id          - Update inventory details
POST /api/admin/inventory/:id/adjust   - Adjust stock quantity
GET  /api/admin/inventory/:id/history  - Get adjustment history
```

## Database Schema

### inventory table
```
- id (UUID, primary key)
- product_id (UUID, foreign key → products)
- warehouse_location (VARCHAR)
- quantity_on_hand (INT)
- quantity_reserved (INT)
- quantity_available (INT, computed)
- reorder_point (INT)
- reorder_quantity (INT)
- sku (VARCHAR, unique)
- barcode (VARCHAR, unique)
- last_restock_date (TIMESTAMP)
- last_stock_check (TIMESTAMP)
- notes (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### inventory_history table
```
- id (UUID, primary key)
- inventory_id (UUID, foreign key)
- product_id (UUID, foreign key)
- transaction_type (VARCHAR) - 'stock_in', 'stock_out', 'adjustment', 'recount'
- quantity_change (INT)
- quantity_before (INT)
- quantity_after (INT)
- reference_id (UUID) - links to orders, returns, etc.
- reference_type (VARCHAR) - 'order', 'return', 'adjustment', 'recount'
- notes (TEXT)
- created_by (UUID, foreign key → users)
- created_at (TIMESTAMP)
```

## Automatic Triggers

### update_product_stock_quantity
- Fires when inventory is inserted or updated
- Automatically updates products.stock_quantity
- Sums all inventory.quantity_available for that product

### log_inventory_change
- Fires when inventory quantity_on_hand changes
- Creates audit trail entry in inventory_history
- Tracks who made the change and when

## Frontend Integration

The inventory section in Admin Panel includes:

- **Real-time data** from database
- **Stock adjustments** with +/- buttons
- **Edit mode** for quantity and reorder points
- **Search & filter** by warehouse and status
- **Statistics** dashboard
- **Audit trail** of all changes

## Troubleshooting

### Inventory not showing in Admin Panel
1. Check that inventory table was created: `SELECT * FROM public.inventory LIMIT 1;`
2. Check that seed script ran: `SELECT COUNT(*) FROM public.inventory;`
3. Verify RLS policies: Check that your admin user has access

### Stock not syncing to products
1. Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_product_stock';`
2. Check trigger function: `SELECT * FROM pg_proc WHERE proname = 'update_product_stock_quantity';`
3. Manually update inventory to test trigger

### History not recording
1. Check history table exists: `SELECT * FROM public.inventory_history LIMIT 1;`
2. Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_log_inventory_change';`
3. Make a stock adjustment and check if history entry appears

## Next Steps

After setup is complete, you can:

1. **Integrate with Orders** - Auto-reserve stock when orders placed
2. **Barcode Scanning** - Add barcode scanning for quick stock checks
3. **Multi-warehouse** - Add transfers between warehouses
4. **Bulk Import** - Import inventory from CSV
5. **Low Stock Alerts** - Email notifications when stock falls below reorder point
