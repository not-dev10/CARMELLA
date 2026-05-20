-- Fix hero section data structure to match component expectations
UPDATE admin_content 
SET content = jsonb_build_object(
  'badge', 'EST. 2024',
  'title', 'Premium Indian Products',
  'subtitle', 'Authentic flavors and quality essentials for every home. Discover our curated B2B collections of premium Indian products.',
  'cta1Text', 'Shop Wholesale',
  'cta1Link', '/shop',
  'cta2Text', 'View Lookbook',
  'cta2Link', '/lookbook',
  'badge1Text', '500+ Retailers',
  'badge1Subtext', 'Worldwide',
  'badge2Text', 'Premium Quality',
  'badge2Subtext', 'Authentic',
  'badge3Text', 'B2B Ready',
  'badge3Subtext', 'Fast Delivery',
  'images', jsonb_build_array(
    jsonb_build_object(
      'desktopImage', 'https://carmella-bucket.s3.amazonaws.com/hero/desktop/hero-products.jpeg',
      'mobileImage', 'https://carmella-bucket.s3.amazonaws.com/hero/mobile/hero-products.jpeg'
    )
  )
)
WHERE section_name = 'hero';
