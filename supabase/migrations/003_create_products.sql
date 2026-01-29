-- ============================================
-- Migration: Create Products Table
-- Description: Core product catalog with pricing, categories, and metadata
-- Version: 003
-- ============================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0), -- 원 단위
  discount_price INTEGER CHECK (discount_price IS NULL OR discount_price >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'hidden')),
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
  sales_count INTEGER DEFAULT 0 CHECK (sales_count >= 0),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_sales_count ON products(sales_count DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_status_is_featured ON products(status, is_featured) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category_id, status) WHERE status = 'active';

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
CREATE TRIGGER products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view active products
CREATE POLICY "Anyone can view active products"
ON products FOR SELECT
USING (status = 'active');

-- Policy 2: Admins can view all products (including draft/hidden)
CREATE POLICY "Admins can view all products"
ON products FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 3: Admins can insert products
CREATE POLICY "Admins can insert products"
ON products FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 4: Admins can update products
CREATE POLICY "Admins can update products"
ON products FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 5: Admins can delete products
CREATE POLICY "Admins can delete products"
ON products FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE products IS 'Core product catalog with digital goods information';
COMMENT ON COLUMN products.id IS 'Unique product identifier';
COMMENT ON COLUMN products.name IS 'Product display name';
COMMENT ON COLUMN products.slug IS 'URL-friendly identifier (unique)';
COMMENT ON COLUMN products.description IS 'Full product description (supports markdown)';
COMMENT ON COLUMN products.short_description IS 'Brief product summary for cards/listings';
COMMENT ON COLUMN products.price IS 'Base price in KRW (원)';
COMMENT ON COLUMN products.discount_price IS 'Discounted price in KRW (optional)';
COMMENT ON COLUMN products.category_id IS 'Foreign key to categories table';
COMMENT ON COLUMN products.status IS 'Product visibility: draft (not visible), active (visible), hidden (temporarily hidden)';
COMMENT ON COLUMN products.is_featured IS 'Whether product is featured on homepage';
COMMENT ON COLUMN products.view_count IS 'Number of times product page was viewed';
COMMENT ON COLUMN products.sales_count IS 'Number of times product was purchased';
COMMENT ON COLUMN products.metadata IS 'Flexible JSON field for additional product data (tags, specifications, etc.)';
