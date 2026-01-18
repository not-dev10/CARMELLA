-- ============================================================================
-- REVIEWS TABLE & ACTIVITY LOGS - PRODUCTION READY
-- ============================================================================
-- Complete schema for product reviews and admin activity tracking

-- ============================================================================
-- 1. REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can view reviews
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true);

-- RLS: Users can create reviews
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS: Users can update their own reviews
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS: Users can delete their own reviews
CREATE POLICY "reviews_delete_own" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- RLS: Admins can delete any review
CREATE POLICY "reviews_delete_admin" ON public.reviews
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- ============================================================================
-- 2. ACTIVITY LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Only admins can view activity logs
CREATE POLICY "activity_logs_select_admin" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS: Only admins can insert activity logs
CREATE POLICY "activity_logs_insert_admin" ON public.activity_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON public.activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target_type ON public.activity_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

-- ============================================================================
-- 4. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.reviews IS 'Product reviews with ratings from users';
COMMENT ON COLUMN public.reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN public.reviews.helpful_count IS 'Number of users who found this review helpful';
COMMENT ON TABLE public.activity_logs IS 'Admin activity tracking for audit purposes';
COMMENT ON COLUMN public.activity_logs.action IS 'Action performed (create, update, delete, approve, reject)';
COMMENT ON COLUMN public.activity_logs.target_type IS 'Type of target (product, order, user, b2b_request, review)';
COMMENT ON COLUMN public.activity_logs.details IS 'Additional details about the action in JSON format';
