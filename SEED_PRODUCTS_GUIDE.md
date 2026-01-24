# Seeding Products to Database

If you're getting "Pricing not available" errors when trying to create orders, it means the products table is empty or doesn't have pricing data.

## Quick Fix

Run the seed SQL file in your Supabase database:

1. Go to Supabase Dashboard → Your Project
2. Navigate to SQL Editor
3. Click "New Query"
4. Copy and paste the contents of `carmella/backend/seed-products.sql`
5. Click "Run"

This will insert 15 sample products with full pricing data (base_price, sale_price, b2b_price, MOQ, etc.)

## What Gets Seeded

The seed file creates products across all categories:
- Pet Care (Premium Dog Food)
- Beverages (Organic Coffee Beans)
- Pantry Staples (Extra Virgin Olive Oil)
- Party Supplies (Party Decoration Set)
- Stationery & Office (Premium Notebook Set)
- Health & Pharmacy (Vitamin C Supplement)
- Personal Care & Beauty (Natural Face Moisturizer)
- Baby Care (Gentle Baby Shampoo)
- Home & Garden (Indoor Plant Starter Kit)
- Household Essentials (Eco-Friendly Cleaning Set)
- Frozen Food (Organic Frozen Vegetables)
- Meat & Seafood (Wild Caught Salmon)
- Bakery & Breads (Artisan Sourdough Bread)
- Dairy & Eggs (Free Range Eggs)
- Fresh Produce (Organic Mixed Salad Box)

Each product has:
- Base price
- Sale price (with discount percentage)
- B2B price (for approved B2B users)
- Minimum Order Quantity (MOQ)
- Features and badges
- Stock quantity

## Verify It Worked

After seeding, you should be able to:
1. View products in the catalog
2. See pricing when logged in as an approved B2B user
3. Add items to cart
4. Complete orders without "Pricing not available" errors

## If You Still Get Errors

Check the backend logs for detailed error messages. The order controller now logs:
- Product IDs being fetched
- Pricing data for each product
- Any missing products or pricing issues

Look for logs starting with `[ORDER]` in your backend console.
