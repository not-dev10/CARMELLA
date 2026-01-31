-- ============================================================================
-- ADD ADDITIONAL FIELDS TO B2B_REQUESTS TABLE
-- ============================================================================
-- This migration adds comprehensive fields for B2B approval requests

ALTER TABLE public.b2b_requests 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS business_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS order_quantity VARCHAR(50),
ADD COLUMN IF NOT EXISTS purchase_frequency VARCHAR(50),
ADD COLUMN IF NOT EXISTS reason TEXT;

-- Add comment to table
COMMENT ON TABLE public.b2b_requests IS 'Stores B2B approval requests with comprehensive business information';
 
-- Add comments to new columns
COMMENT ON COLUMN public.b2b_requests.company_name IS 'Name of the requesting company';
COMMENT ON COLUMN public.b2b_requests.tax_id IS 'Tax ID or business registration number';
COMMENT ON COLUMN public.b2b_requests.contact_name IS 'Full name of the contact person';
COMMENT ON COLUMN public.b2b_requests.contact_email IS 'Email address of the contact person';
COMMENT ON COLUMN public.b2b_requests.contact_phone IS 'Phone number of the contact person';
COMMENT ON COLUMN public.b2b_requests.business_type IS 'Type of business (retailer, wholesaler, etc.)';
COMMENT ON COLUMN public.b2b_requests.order_quantity IS 'Expected order quantity range';
COMMENT ON COLUMN public.b2b_requests.purchase_frequency IS 'How often they plan to purchase';
COMMENT ON COLUMN public.b2b_requests.reason IS 'Reason for requesting B2B access';
