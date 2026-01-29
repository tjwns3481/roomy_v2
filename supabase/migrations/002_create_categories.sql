-- ============================================
-- Migration: Create Categories Table
-- Description: Hierarchical category structure for products
-- Version: 002
-- ============================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
CREATE TRIGGER categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON categories FOR SELECT
USING (is_active = true);

-- Policy 2: Admins can view all categories (including inactive)
CREATE POLICY "Admins can view all categories"
ON categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 3: Admins can insert categories
CREATE POLICY "Admins can insert categories"
ON categories FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 4: Admins can update categories
CREATE POLICY "Admins can update categories"
ON categories FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 5: Admins can delete categories
CREATE POLICY "Admins can delete categories"
ON categories FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE categories IS 'Hierarchical category structure for organizing products';
COMMENT ON COLUMN categories.id IS 'Unique category identifier';
COMMENT ON COLUMN categories.name IS 'Category display name';
COMMENT ON COLUMN categories.slug IS 'URL-friendly identifier (unique)';
COMMENT ON COLUMN categories.description IS 'Category description';
COMMENT ON COLUMN categories.parent_id IS 'Parent category for hierarchical structure (self-referencing)';
COMMENT ON COLUMN categories.image_url IS 'Category image URL from Supabase Storage';
COMMENT ON COLUMN categories.sort_order IS 'Display order (lower numbers first)';
COMMENT ON COLUMN categories.is_active IS 'Whether category is visible to customers';
