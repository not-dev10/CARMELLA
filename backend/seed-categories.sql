-- Insert sample categories for Carmella
-- Uses ON CONFLICT to handle existing data (upsert pattern)
INSERT INTO public.categories (name, slug, description, image_url) VALUES
(
  'Pet Care',
  'pet-care',
  'Premium pet supplies and accessories for your furry friends',
  'https://images.unsplash.com/photo-1587300411107-ec28081a6461?auto=format&fit=crop&q=80&w=600'
),
(
  'Beverages',
  'beverages',
  'Wide selection of drinks and beverage products',
  'https://images.unsplash.com/photo-1554866585-acbb2f46b34c?auto=format&fit=crop&q=80&w=600'
),
(
  'Pantry Staples',
  'pantry-staples',
  'Essential pantry items and cooking ingredients',
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?auto=format&fit=crop&q=80&w=600'
),
(
  'Party Supplies',
  'party-supplies',
  'Everything you need for celebrations and events',
  'https://images.unsplash.com/photo-1530268729831-4be0ea6c5511?auto=format&fit=crop&q=80&w=600'
),
(
  'Stationery & Office',
  'stationery-office',
  'Office supplies and stationery for work and school',
  'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&q=80&w=600'
),
(
  'Health & Pharmacy',
  'health-pharmacy',
  'Health products and wellness items',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde0f?auto=format&fit=crop&q=80&w=600'
),
(
  'Personal Care & Beauty',
  'personal-care-beauty',
  'Beauty and personal care products',
  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&q=80&w=600'
),
(
  'Baby Care',
  'baby-care',
  'Safe and gentle products for babies and infants',
  'https://images.unsplash.com/photo-1522898657836-e52518ea7513?auto=format&fit=crop&q=80&w=600'
),
(
  'Home & Garden',
  'home-garden',
  'Home improvement and gardening essentials',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600'
),
(
  'Household Essentials',
  'household-essentials',
  'Daily household cleaning and maintenance products',
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=600'
),
(
  'Frozen Food',
  'frozen-food',
  'Quality frozen food products and meals',
  'https://images.unsplash.com/photo-1585518419759-8b0e5c8b8b8b?auto=format&fit=crop&q=80&w=600'
),
(
  'Meat & Seafood',
  'meat-seafood',
  'Fresh and premium meat and seafood selections',
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?auto=format&fit=crop&q=80&w=600'
),
(
  'Bakery & Breads',
  'bakery-breads',
  'Fresh baked goods and artisan breads',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600'
),
(
  'Dairy & Eggs',
  'dairy-eggs',
  'Fresh dairy products and eggs',
  'https://images.unsplash.com/photo-1585518419759-8b0e5c8b8b8b?auto=format&fit=crop&q=80&w=600'
),
(
  'Fresh Produce',
  'fresh-produce',
  'Fresh fruits and vegetables',
  'https://images.unsplash.com/photo-1488459716781-6918f33fc993?auto=format&fit=crop&q=80&w=600'
)
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;
