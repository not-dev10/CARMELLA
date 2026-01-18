-- Insert sample categories for Carmella
-- Uses ON CONFLICT to handle existing data (upsert pattern)
INSERT INTO public.categories (name, slug, description, image_url) VALUES
(
  'Bowls & Vessels',
  'bowls-vessels',
  'Handcrafted ceramic bowls and vessels for everyday use and display',
  'https://images.unsplash.com/photo-1578500494198-246f612d03b3?auto=format&fit=crop&q=80&w=600'
),
(
  'Dinnerware',
  'dinnerware',
  'Complete dinnerware sets and individual pieces for your table',
  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600'
),
(
  'Decorative Pieces',
  'decorative-pieces',
  'Unique ceramic art and decorative objects for your home',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=600'
),
(
  'Planters & Vases',
  'planters-vases',
  'Beautiful ceramic planters and vases for flowers and plants',
  'https://images.unsplash.com/photo-1578500494198-246f612d03b3?auto=format&fit=crop&q=80&w=600'
)
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;
