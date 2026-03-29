-- ============================================================================
-- CREATE ATOMIC INCREMENT FUNCTION FOR REVIEW HELPFUL COUNT
-- ============================================================================
-- This function provides atomic increment for review helpful_count
-- to prevent race conditions when multiple users mark a review as helpful

CREATE OR REPLACE FUNCTION public.increment_review_helpful(review_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.reviews
  SET helpful_count = COALESCE(helpful_count, 0) + 1
  WHERE id = review_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_review_helpful(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.increment_review_helpful IS 'Atomically increments the helpful_count for a review to prevent race conditions';
