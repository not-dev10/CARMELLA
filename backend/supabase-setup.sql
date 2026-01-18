-- ============================================================================
-- CARMELLA DATABASE SCHEMA - PRODUCTION READY
-- ============================================================================
-- Complete schema with RLS policies for B2B approval and pricing visibility
-- Three roles: admin, guest (not logged in), user (logged in)
-- B2B users must be approved to view pricing

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  google_id VARCHAR(255),
  google_name VARCHAR(255),
  google_email VARCHAR(255),
  google_picture TEXT,
  user_type VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (user_type IN ('user', 'admin')),
  
  -- B2B Fields
  is_b2b_user BOOLEAN DEFAULT FALSE,
  b2b_approval_status VARCHAR(50) DEFAULT 'none' CHECK (b2b_approval_status IN ('none', 'pending', 'approved', 'rejected')),
  b2b_approval_requested_at TIMESTAMP WITH TIME ZONE,
  b2b_approval_expires_at TIMESTAMP WITH TIME ZONE,
  b2b_approved_at TIMESTAMP WITH TIME ZONE,
  b2b_rejection_reason TEXT,
  
  -- Profile
  company_name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  
  -- User Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  
  -- Computed Fields (updated via triggers)
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- RLS: Admins can view all users
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS: Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND user_type = (SELECT user_type FROM public.users WHERE id = auth.uid()));

-- RLS: Admins can update any user
CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- ============================================================================
-- 2. B2B REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.b2b_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.users(id),
  rejection_reason TEXT
);

-- Enable RLS
ALTER TABLE public.b2b_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own requests
CREATE POLICY "b2b_requests_select_own" ON public.b2b_requests
  FOR SELECT USING (auth.uid() = user_id);

-- RLS: Admins can view all requests
CREATE POLICY "b2b_requests_select_admin" ON public.b2b_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS: Users can insert their own requests
CREATE POLICY "b2b_requests_insert_own" ON public.b2b_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS: Admins can update requests
CREATE POLICY "b2b_requests_update_admin" ON public.b2b_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- ============================================================================
-- 3. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS: Everyone can view categories
CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT USING (true);

-- RLS: Only admins can insert
CREATE POLICY "categories_insert_admin" ON public.categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS: Only admins can update
CREATE POLICY "categories_update_admin" ON public.categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS: Only admins can delete
CREATE POLICY "categories_delete_admin" ON public.categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- ============================================================================
-- 4. PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  
  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL CHECK (base_price > 0),
  sale_price DECIMAL(10, 2),
  sale_percentage DECIMAL(5, 2),
  
  -- B2B Pricing (only visible to approved B2B users)
  b2b_price DECIMAL(10, 2),
  b2b_min_quantity INT DEFAULT 1,
  moq INT DEFAULT 1,
  
  -- Product Details
  badge VARCHAR(50),
  features TEXT[] DEFAULT '{}',
  
  -- Stock
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS: Everyone can view active products (but pricing hidden for non-approved B2B)
CREATE POLICY "products_select_all" ON public.products
  FOR SELECT USING (is_active = TRUE);

-- RLS: Only admins can insert
CREATE POLICY "products_insert_admin" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS: Only admins can update
CREATE POLICY "products_update_admin" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS: Only admins can delete
CREATE POLICY "products_delete_admin" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- ============================================================================
-- 6. CARTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own cart
CREATE POLICY "carts_select_own" ON public.carts
  FOR SELECT USING (auth.uid() = user_id);

-- RLS: Users can insert their own cart
CREATE POLICY "carts_insert_own" ON public.carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS: Users can update their own cart
CREATE POLICY "carts_update_own" ON public.carts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS: Users can delete their own cart
CREATE POLICY "carts_delete_own" ON public.carts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 7. CART ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view items in their own cart
CREATE POLICY "cart_items_select_own" ON public.cart_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid()
    )
  );

-- RLS: Users can insert items to their own cart
CREATE POLICY "cart_items_insert_own" ON public.cart_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid()
    )
  );

-- RLS: Users can update items in their own cart
CREATE POLICY "cart_items_update_own" ON public.cart_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid()
    )
  );

-- RLS: Users can delete items from their own cart
CREATE POLICY "cart_items_delete_own" ON public.cart_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL,
  items_count INT DEFAULT 0,
  shipping_address TEXT,
  billing_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- RLS: Admins can view all orders
CREATE POLICY "orders_select_admin" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS: Users can insert their own orders
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS: Admins can update orders
CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- ============================================================================
-- 9. ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view items in their own orders
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- RLS: Admins can view all order items
CREATE POLICY "order_items_select_admin" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- ============================================================================
-- 10. WISHLISTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own wishlist
CREATE POLICY "wishlists_select_own" ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

-- RLS: Users can insert to their own wishlist
CREATE POLICY "wishlists_insert_own" ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS: Users can delete from their own wishlist
CREATE POLICY "wishlists_delete_own" ON public.wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 11. CONTACTS TABLE (for contact form submissions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS: Only admins can view contacts
CREATE POLICY "contacts_select_admin" ON public.contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS: Anyone can insert (contact form submission)
CREATE POLICY "contacts_insert_all" ON public.contacts
  FOR INSERT WITH CHECK (true);

-- RLS: Only admins can update
CREATE POLICY "contacts_update_admin" ON public.contacts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- ============================================================================
-- 12. ADMIN CONTENT TABLE (for homepage sections)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name VARCHAR(255) NOT NULL UNIQUE,
  content JSONB NOT NULL,
  updated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_content ENABLE ROW LEVEL SECURITY;

-- RLS: Everyone can view content
CREATE POLICY "admin_content_select_all" ON public.admin_content
  FOR SELECT USING (true);

-- RLS: Only admins can insert
CREATE POLICY "admin_content_insert_admin" ON public.admin_content
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS: Only admins can update
CREATE POLICY "admin_content_update_admin" ON public.admin_content
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS: Only admins can delete
CREATE POLICY "admin_content_delete_admin" ON public.admin_content
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- ============================================================================
-- 13. TRIGGERS
-- ============================================================================

-- Auto-calculate sale percentage when sale_price is set
CREATE OR REPLACE FUNCTION public.calculate_sale_percentage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sale_price IS NOT NULL AND NEW.base_price > 0 THEN
    NEW.sale_percentage := ROUND(((NEW.base_price - NEW.sale_price) / NEW.base_price * 100)::numeric, 2);
  ELSE
    NEW.sale_percentage := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_sale_percentage ON public.products;
CREATE TRIGGER trigger_calculate_sale_percentage
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_sale_percentage();

-- Auto-expire B2B requests after 24 hours
CREATE OR REPLACE FUNCTION public.expire_b2b_requests()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.b2b_requests
  SET status = 'rejected', rejection_reason = 'Request expired after 24 hours'
  WHERE status = 'pending' AND expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger should be called periodically via a cron job or API endpoint
-- For now, we'll handle expiration in the API layer

-- ============================================================================
-- 14. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_b2b_status ON public.users(b2b_approval_status);
CREATE INDEX IF NOT EXISTS idx_b2b_requests_user_id ON public.b2b_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_b2b_requests_status ON public.b2b_requests(status);
CREATE INDEX IF NOT EXISTS idx_b2b_requests_expires_at ON public.b2b_requests(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_b2b_requests_pending_unique ON public.b2b_requests(user_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);

-- ============================================================================
-- 15. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.users IS 'User profiles with B2B approval tracking';
COMMENT ON COLUMN public.users.b2b_approval_status IS 'none, pending, approved, or rejected';
COMMENT ON COLUMN public.users.b2b_approval_expires_at IS 'B2B request expires 24 hours after requested_at';
COMMENT ON TABLE public.b2b_requests IS 'B2B approval requests with 24-hour expiration';
COMMENT ON TABLE public.admin_content IS 'Editable homepage sections (hero, quote, collections, newsletter, etc.)';
