-- =============================================
-- Migration: Create product_images Table
-- Description: 상품 이미지 관리 (다중 이미지 지원)
-- Dependencies: 003_create_products.sql
-- =============================================

-- 1. 테이블 생성
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_is_primary ON product_images(product_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_product_images_sort_order ON product_images(product_id, sort_order);

-- 3. 트리거: 상품당 is_primary=true는 하나만 가능
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  -- 새로운 이미지를 primary로 설정할 때, 같은 상품의 다른 이미지들의 primary를 false로 변경
  IF NEW.is_primary = true THEN
    UPDATE product_images
    SET is_primary = false
    WHERE product_id = NEW.product_id
      AND id != NEW.id
      AND is_primary = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_primary_image
  BEFORE INSERT OR UPDATE ON product_images
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_image();

-- 4. RLS 활성화
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책: 활성 상품의 이미지는 누구나 조회
CREATE POLICY "Anyone can view active product images"
ON product_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE id = product_images.product_id
    AND status = 'active'
  )
);

-- 6. RLS 정책: 관리자만 CRUD
CREATE POLICY "Admins can manage product images"
ON product_images FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 7. 코멘트 추가
COMMENT ON TABLE product_images IS '상품 이미지 테이블 - 다중 이미지 지원';
COMMENT ON COLUMN product_images.id IS '이미지 ID';
COMMENT ON COLUMN product_images.product_id IS '상품 ID (FK)';
COMMENT ON COLUMN product_images.url IS '이미지 URL (Supabase Storage 경로)';
COMMENT ON COLUMN product_images.alt IS '이미지 대체 텍스트 (접근성)';
COMMENT ON COLUMN product_images.is_primary IS '대표 이미지 여부 (상품당 1개만 true)';
COMMENT ON COLUMN product_images.sort_order IS '정렬 순서 (낮을수록 먼저 표시)';
COMMENT ON COLUMN product_images.created_at IS '생성 시각';
