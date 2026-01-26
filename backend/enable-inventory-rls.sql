-- Enable RLS on inventory tables
-- This ensures only admins can access inventory data

-- Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admins can view all inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can delete inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can view inventory history" ON public.inventory_history;
DROP POLICY IF EXISTS "Admins can insert inventory history" ON public.inventory_history;
DROP POLICY IF EXISTS "Admins can update inventory history" ON public.inventory_history;
DROP POLICY IF EXISTS "Admins can delete inventory history" ON public.inventory_history;

-- RLS Policies for inventory table (admins only)
CREATE POLICY "Admins can view all inventory" ON public.inventory
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can insert inventory" ON public.inventory
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update inventory" ON public.inventory
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can delete inventory" ON public.inventory
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

-- RLS Policies for inventory_history table (admins only)
CREATE POLICY "Admins can view inventory history" ON public.inventory_history
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can insert inventory history" ON public.inventory_history
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update inventory history" ON public.inventory_history
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can delete inventory history" ON public.inventory_history
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('inventory', 'inventory_history') AND schemaname = 'public';
