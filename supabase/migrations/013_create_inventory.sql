-- ============================================
-- Migration: Create Inventory Management System
-- Description: Stock tracking, automatic deduction, and inventory logs
-- Version: 013
-- ============================================

-- ============================================
-- Step 1: Extend products table with stock fields
-- ============================================

-- Add stock columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0 CHECK (stock >= 0),
ADD COLUMN IF NOT EXISTS stock_alert_threshold INTEGER DEFAULT 5 CHECK (stock_alert_threshold >= 0);

-- Add index for low stock queries
CREATE INDEX IF NOT EXISTS idx_products_low_stock
ON products(stock)
WHERE stock <= stock_alert_threshold AND status = 'active';

-- Comments for new columns
COMMENT ON COLUMN products.stock IS 'Current available stock quantity';
COMMENT ON COLUMN products.stock_alert_threshold IS 'Minimum stock level before alert (default: 5)';

-- ============================================
-- Step 2: Create inventory_logs table
-- ============================================

CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjust')),
  quantity INTEGER NOT NULL CHECK (quantity != 0), -- Positive for in/adjust up, negative for out/adjust down
  reason TEXT,
  reference_id UUID, -- Order ID for 'out' type, or other reference
  reference_type TEXT, -- 'order', 'manual', 'return', etc.
  stock_before INTEGER NOT NULL CHECK (stock_before >= 0),
  stock_after INTEGER NOT NULL CHECK (stock_after >= 0),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for inventory_logs
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_type ON inventory_logs(type);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_reference ON inventory_logs(reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_by ON inventory_logs(created_by);

-- ============================================
-- RLS Policies for inventory_logs
-- ============================================

ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all inventory logs
CREATE POLICY "Admins can view all inventory logs"
ON inventory_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admins can insert inventory logs
CREATE POLICY "Admins can insert inventory logs"
ON inventory_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE inventory_logs IS 'Audit trail for all inventory movements (in/out/adjust)';
COMMENT ON COLUMN inventory_logs.id IS 'Unique log entry identifier';
COMMENT ON COLUMN inventory_logs.product_id IS 'Product being modified';
COMMENT ON COLUMN inventory_logs.type IS 'Type of inventory movement: in (stock added), out (stock removed), adjust (manual correction)';
COMMENT ON COLUMN inventory_logs.quantity IS 'Quantity changed (positive for increase, negative for decrease)';
COMMENT ON COLUMN inventory_logs.reason IS 'Human-readable reason for inventory change';
COMMENT ON COLUMN inventory_logs.reference_id IS 'Related entity ID (e.g., order_id for automatic deductions)';
COMMENT ON COLUMN inventory_logs.reference_type IS 'Type of reference: order, manual, return, damage, etc.';
COMMENT ON COLUMN inventory_logs.stock_before IS 'Stock quantity before this change';
COMMENT ON COLUMN inventory_logs.stock_after IS 'Stock quantity after this change';
COMMENT ON COLUMN inventory_logs.created_by IS 'Admin user who made the change (NULL for automatic deductions)';

-- ============================================
-- Function: Check stock availability before order
-- ============================================

CREATE OR REPLACE FUNCTION check_stock_availability(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INTEGER;
BEGIN
  -- Get current stock
  SELECT stock INTO v_current_stock
  FROM products
  WHERE id = p_product_id;

  -- Check if stock is sufficient
  IF v_current_stock IS NULL OR v_current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION check_stock_availability IS 'Validates if sufficient stock exists for a given quantity';

-- ============================================
-- Function: Deduct stock and log
-- ============================================

CREATE OR REPLACE FUNCTION deduct_stock(
  p_product_id UUID,
  p_quantity INTEGER,
  p_reference_id UUID,
  p_reference_type TEXT DEFAULT 'order',
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INTEGER;
  v_new_stock INTEGER;
BEGIN
  -- Lock the product row for update
  SELECT stock INTO v_current_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  -- Check if we have enough stock
  IF v_current_stock IS NULL OR v_current_stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Required: %',
      p_product_id, COALESCE(v_current_stock, 0), p_quantity;
  END IF;

  -- Calculate new stock
  v_new_stock := v_current_stock - p_quantity;

  -- Update product stock
  UPDATE products
  SET stock = v_new_stock,
      updated_at = NOW()
  WHERE id = p_product_id;

  -- Log the inventory change
  INSERT INTO inventory_logs (
    product_id,
    type,
    quantity,
    reason,
    reference_id,
    reference_type,
    stock_before,
    stock_after,
    created_by
  ) VALUES (
    p_product_id,
    'out',
    -p_quantity, -- Negative for outgoing stock
    COALESCE(p_reason, 'Stock deducted for ' || p_reference_type),
    p_reference_id,
    p_reference_type,
    v_current_stock,
    v_new_stock,
    auth.uid() -- May be NULL for automatic deductions
  );

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION deduct_stock IS 'Deducts stock and creates inventory log entry (used for order processing)';

-- ============================================
-- Function: Add stock and log
-- ============================================

CREATE OR REPLACE FUNCTION add_stock(
  p_product_id UUID,
  p_quantity INTEGER,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT 'manual',
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INTEGER;
  v_new_stock INTEGER;
BEGIN
  -- Lock the product row for update
  SELECT stock INTO v_current_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  -- Calculate new stock
  v_new_stock := COALESCE(v_current_stock, 0) + p_quantity;

  -- Update product stock
  UPDATE products
  SET stock = v_new_stock,
      updated_at = NOW()
  WHERE id = p_product_id;

  -- Log the inventory change
  INSERT INTO inventory_logs (
    product_id,
    type,
    quantity,
    reason,
    reference_id,
    reference_type,
    stock_before,
    stock_after,
    created_by
  ) VALUES (
    p_product_id,
    'in',
    p_quantity, -- Positive for incoming stock
    COALESCE(p_reason, 'Stock added via ' || p_reference_type),
    p_reference_id,
    p_reference_type,
    COALESCE(v_current_stock, 0),
    v_new_stock,
    auth.uid()
  );

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION add_stock IS 'Adds stock and creates inventory log entry (used for restocking)';

-- ============================================
-- Function: Adjust stock and log
-- ============================================

CREATE OR REPLACE FUNCTION adjust_stock(
  p_product_id UUID,
  p_new_quantity INTEGER,
  p_reason TEXT DEFAULT 'Manual inventory adjustment'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INTEGER;
  v_quantity_change INTEGER;
BEGIN
  -- Validate new quantity
  IF p_new_quantity < 0 THEN
    RAISE EXCEPTION 'Stock quantity cannot be negative';
  END IF;

  -- Lock the product row for update
  SELECT stock INTO v_current_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  -- Calculate change
  v_quantity_change := p_new_quantity - COALESCE(v_current_stock, 0);

  -- Update product stock
  UPDATE products
  SET stock = p_new_quantity,
      updated_at = NOW()
  WHERE id = p_product_id;

  -- Log the inventory change
  INSERT INTO inventory_logs (
    product_id,
    type,
    quantity,
    reason,
    reference_type,
    stock_before,
    stock_after,
    created_by
  ) VALUES (
    p_product_id,
    'adjust',
    v_quantity_change,
    p_reason,
    'manual',
    COALESCE(v_current_stock, 0),
    p_new_quantity,
    auth.uid()
  );

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION adjust_stock IS 'Sets stock to exact quantity with logging (used for inventory corrections)';

-- ============================================
-- Trigger: Auto-deduct stock on order item insert
-- ============================================

CREATE OR REPLACE FUNCTION auto_deduct_stock_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_status TEXT;
BEGIN
  -- Get order status
  SELECT status INTO v_order_status
  FROM orders
  WHERE id = NEW.order_id;

  -- Only deduct stock for paid/completed orders
  -- This prevents deduction for pending/cancelled orders
  IF v_order_status IN ('paid', 'completed') THEN
    -- Deduct stock using the helper function
    PERFORM deduct_stock(
      NEW.product_id,
      NEW.quantity,
      NEW.order_id,
      'order',
      'Automatic stock deduction for order item'
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If stock deduction fails (e.g., insufficient stock), prevent order creation
    RAISE EXCEPTION 'Cannot create order: %', SQLERRM;
END;
$$;

CREATE TRIGGER order_items_auto_deduct_stock
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION auto_deduct_stock_on_order();

COMMENT ON FUNCTION auto_deduct_stock_on_order IS 'Automatically deducts stock when order item is created for paid/completed orders';

-- ============================================
-- Trigger: Restore stock on order cancellation
-- ============================================

CREATE OR REPLACE FUNCTION restore_stock_on_order_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Only restore stock when order status changes to 'cancelled' or 'refunded'
  IF NEW.status IN ('cancelled', 'refunded') AND OLD.status NOT IN ('cancelled', 'refunded') THEN
    -- Loop through all order items and restore stock
    FOR v_item IN
      SELECT product_id, quantity
      FROM order_items
      WHERE order_id = NEW.id
    LOOP
      PERFORM add_stock(
        v_item.product_id,
        v_item.quantity,
        NEW.id,
        'order_cancel',
        'Stock restored due to order ' || NEW.status
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_restore_stock_on_cancel
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (NEW.status IN ('cancelled', 'refunded'))
EXECUTE FUNCTION restore_stock_on_order_cancel();

COMMENT ON FUNCTION restore_stock_on_order_cancel IS 'Automatically restores stock when order is cancelled or refunded';

-- ============================================
-- Function: Get low stock products
-- ============================================

CREATE OR REPLACE FUNCTION get_low_stock_products()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  stock INTEGER,
  stock_alert_threshold INTEGER,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.stock,
    p.stock_alert_threshold,
    p.status
  FROM products p
  WHERE p.stock <= p.stock_alert_threshold
    AND p.status = 'active'
  ORDER BY (p.stock::FLOAT / NULLIF(p.stock_alert_threshold, 0)) ASC, p.name;
END;
$$;

COMMENT ON FUNCTION get_low_stock_products IS 'Returns list of products with stock at or below alert threshold';

-- ============================================
-- Function: Get inventory summary for a product
-- ============================================

CREATE OR REPLACE FUNCTION get_product_inventory_summary(p_product_id UUID)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  current_stock INTEGER,
  total_in INTEGER,
  total_out INTEGER,
  total_adjustments INTEGER,
  last_movement TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.stock,
    COALESCE(SUM(CASE WHEN il.type = 'in' THEN il.quantity ELSE 0 END), 0)::INTEGER,
    COALESCE(SUM(CASE WHEN il.type = 'out' THEN ABS(il.quantity) ELSE 0 END), 0)::INTEGER,
    COALESCE(SUM(CASE WHEN il.type = 'adjust' THEN il.quantity ELSE 0 END), 0)::INTEGER,
    MAX(il.created_at)
  FROM products p
  LEFT JOIN inventory_logs il ON p.id = il.product_id
  WHERE p.id = p_product_id
  GROUP BY p.id, p.name, p.stock;
END;
$$;

COMMENT ON FUNCTION get_product_inventory_summary IS 'Provides detailed inventory statistics for a specific product';

-- ============================================
-- Grant permissions
-- ============================================

-- Grant execute permissions on functions to authenticated users
-- (RLS policies will still control who can actually use them)
GRANT EXECUTE ON FUNCTION check_stock_availability TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_stock TO authenticated;
GRANT EXECUTE ON FUNCTION add_stock TO authenticated;
GRANT EXECUTE ON FUNCTION adjust_stock TO authenticated;
GRANT EXECUTE ON FUNCTION get_low_stock_products TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_inventory_summary TO authenticated;

-- ============================================
-- Initial data: Set default stock for existing products
-- ============================================

-- Set default stock to 0 for any existing products that don't have it
UPDATE products
SET stock = 0
WHERE stock IS NULL;

-- Set default alert threshold to 5 for any existing products
UPDATE products
SET stock_alert_threshold = 5
WHERE stock_alert_threshold IS NULL;

-- ============================================
-- End of migration
-- ============================================
