# Order ID Migration - Systematic Order Numbers

Order IDs are now systematic and human-readable with timestamps!

## Format Options

### Option 1: Date-Based (Recommended for most cases)
`ORD-YYYYMMDD-XXXXXX`

Example: `ORD-20250124-123456`

- `ORD` - Order prefix
- `YYYYMMDD` - Date (Year-Month-Day)
- `XXXXXX` - Sequential 6-digit number (0-999999)
- **Capacity**: Up to 1,000,000 orders per day

### Option 2: Global Sequential (For high-volume scenarios)
`ORD-XXXXXXXXX`

Example: `ORD-1737371234`

- `ORD` - Order prefix
- `XXXXXXXXX` - 9-digit timestamp-based ID
- **Capacity**: Unlimited orders globally
- **Advantage**: Works across multiple days/years seamlessly

## What Changed

1. **Backend**: Updated `generateOrderId()` to use 6-digit sequential numbers
2. **Backend**: Added `generateGlobalOrderId()` for high-volume scenarios
3. **Database**: Updated `order_number` column to VARCHAR(25)
4. **Frontend**: Orders page and Checkout confirmation display order numbers

## Migration Steps

Run this SQL in your Supabase database to add/update the column:

```sql
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(25) UNIQUE NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

UPDATE public.orders 
SET order_number = 'ORD-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD(ROW_NUMBER() OVER (PARTITION BY DATE(created_at) ORDER BY created_at)::text, 6, '0')
WHERE order_number = '';
```

Or simply run the migration file:
- File: `carmella/backend/add-order-number.sql`

## Switching to Global Sequential IDs

If you want to use the global sequential format instead, update the order controller:

```typescript
// In orderController.ts, change:
const orderNumber = generateOrderId();

// To:
const orderNumber = generateGlobalOrderId();
```

## After Migration

- All new orders will have systematic order numbers
- Existing orders will be updated with generated order numbers
- Order numbers are unique and indexed for fast lookups
- Customers can easily reference orders by date and sequence
- Supports 100k+ orders without issues

## Capacity Comparison

| Format | Capacity | Use Case |
|--------|----------|----------|
| Date-Based (6-digit) | 1M orders/day | Most businesses |
| Global Sequential | Unlimited | High-volume platforms |

## Example Order Flow

1. Customer places order on Jan 24, 2025
2. Order number generated: `ORD-20250124-000001`
3. Displayed in confirmation: "Order ID: ORD-20250124-000001"
4. Listed in order history with full order number
5. Easy to reference and track by date

