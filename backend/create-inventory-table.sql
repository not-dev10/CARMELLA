-- Create inventory management table
-- This table tracks stock levels, reorder points, and warehouse locations
-- Links to products table for centralized inventory management

CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_location VARCHAR(100),
  quantity_on_hand INT NOT NULL DEFAULT 0,
  quantity_reserved INT NOT NULL DEFAULT 0,
  quantity_available INT GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  reorder_point INT NOT NULL DEFAULT 20,
  reorder_quantity INT NOT NULL DEFAULT 50,
  last_restock_date TIMESTAMP WITH TIME ZONE,
  last_stock_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100) UNIQUE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, warehouse_location)
);

-- Create inventory history table for audit trail
CREATE TABLE IF NOT EXISTS public.inventory_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- 'stock_in', 'stock_out', 'adjustment', 'recount'
  quantity_change INT NOT NULL,
  quantity_before INT NOT NULL,
  quantity_after INT NOT NULL,
  reference_id UUID, -- Links to orders, returns, etc.
  reference_type VARCHAR(50), -- 'order', 'return', 'adjustment', 'recount'
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON public.inventory(warehouse_location);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_barcode ON public.inventory(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_history_product_id ON public.inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_inventory_id ON public.inventory_history(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON public.inventory_history(created_at);

-- Enable RLS on inventory tables
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory (admins only)
DROP POLICY IF EXISTS "Admins can view all inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can delete inventory" ON public.inventory;

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

-- RLS Policies for inventory history (admins only)
DROP POLICY IF EXISTS "Admins can view inventory history" ON public.inventory_history;
DROP POLICY IF EXISTS "Admins can insert inventory history" ON public.inventory_history;

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

-- Trigger to update products.stock_quantity when inventory changes
CREATE OR REPLACE FUNCTION update_product_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = (
    SELECT COALESCE(SUM(quantity_available), 0)
    FROM public.inventory
    WHERE product_id = NEW.product_id
  )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_stock
AFTER INSERT OR UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION update_product_stock_quantity();

-- Trigger to log inventory changes to history
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.quantity_on_hand != OLD.quantity_on_hand THEN
      INSERT INTO public.inventory_history (
        inventory_id,
        product_id,
        transaction_type,
        quantity_change,
        quantity_before,
        quantity_after,
        notes,
        created_by
      ) VALUES (
        NEW.id,
        NEW.product_id,
        'adjustment',
        NEW.quantity_on_hand - OLD.quantity_on_hand,
        OLD.quantity_on_hand,
        NEW.quantity_on_hand,
        'Manual adjustment',
        auth.uid()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_inventory_change
AFTER UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION log_inventory_change();
