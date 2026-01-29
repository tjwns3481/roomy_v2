-- Migration: product_files, tags, product_tags 테이블 생성
-- Description: 디지털 상품 파일 관리 및 태그 시스템
-- Created: 2026-01-25
-- Phase: 0
-- Task: P0-T0.5.5

-- =====================================================
-- 1. product_files (디지털 상품 파일)
-- =====================================================
CREATE TABLE product_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage 경로
  file_size INTEGER, -- bytes
  file_type TEXT, -- MIME type (예: application/pdf)
  version TEXT DEFAULT '1.0',
  download_limit INTEGER DEFAULT 5, -- 다운로드 제한 횟수
  is_preview BOOLEAN DEFAULT false, -- 미리보기 파일 여부
  sort_order INTEGER DEFAULT 0, -- 정렬 순서
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_product_files_product_id ON product_files(product_id);
CREATE INDEX idx_product_files_is_preview ON product_files(product_id, is_preview) WHERE is_preview = true;

-- 코멘트
COMMENT ON TABLE product_files IS '디지털 상품 파일 정보';
COMMENT ON COLUMN product_files.file_path IS 'Supabase Storage 경로 (예: products/uuid/file.pdf)';
COMMENT ON COLUMN product_files.file_size IS '파일 크기 (bytes)';
COMMENT ON COLUMN product_files.file_type IS 'MIME type (예: application/pdf, application/zip)';
COMMENT ON COLUMN product_files.download_limit IS '다운로드 제한 횟수 (기본 5회)';
COMMENT ON COLUMN product_files.is_preview IS '미리보기 파일 여부 (true면 공개)';

-- =====================================================
-- 2. tags (태그)
-- =====================================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_tags_slug ON tags(slug);

-- 코멘트
COMMENT ON TABLE tags IS '상품 태그 마스터 테이블';
COMMENT ON COLUMN tags.slug IS 'URL용 슬러그 (예: next-js)';

-- =====================================================
-- 3. product_tags (상품-태그 다대다)
-- =====================================================
CREATE TABLE product_tags (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- 인덱스
CREATE INDEX idx_product_tags_tag_id ON product_tags(tag_id);

-- 코멘트
COMMENT ON TABLE product_tags IS '상품과 태그의 다대다 관계 테이블';

-- =====================================================
-- 4. RLS 정책
-- =====================================================

-- ▶ product_files
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;

-- 미리보기 파일은 누구나 조회 가능
CREATE POLICY "Anyone can view preview files"
ON product_files FOR SELECT
USING (
  is_preview = true
  AND EXISTS (
    SELECT 1 FROM products
    WHERE id = product_files.product_id AND status = 'active'
  )
);

-- 구매자는 구매한 상품의 파일 조회 가능 (실제 다운로드는 downloads 테이블로 제어)
-- 현재는 관리자만 전체 파일 조회 가능
CREATE POLICY "Purchasers can view purchased files"
ON product_files FOR SELECT
USING (
  -- 관리자는 모든 파일 조회
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
  -- TODO: Phase 1에서 구매 검증 로직 추가
  -- OR EXISTS (
  --   SELECT 1 FROM downloads d
  --   JOIN order_items oi ON d.order_item_id = oi.id
  --   JOIN orders o ON oi.order_id = o.id
  --   WHERE d.product_file_id = product_files.id
  --   AND o.user_id = auth.uid()
  --   AND o.status IN ('paid', 'completed')
  -- )
);

-- 관리자만 파일 관리 (CRUD)
CREATE POLICY "Admins can manage product files"
ON product_files FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ▶ tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 모든 사용자는 태그 조회 가능
CREATE POLICY "Anyone can view tags"
ON tags FOR SELECT
USING (true);

-- 관리자만 태그 관리 (CRUD)
CREATE POLICY "Admins can manage tags"
ON tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ▶ product_tags
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

-- 활성 상품의 태그는 누구나 조회 가능
CREATE POLICY "Anyone can view product tags"
ON product_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE id = product_tags.product_id AND status = 'active'
  )
);

-- 관리자만 상품-태그 관계 관리
CREATE POLICY "Admins can manage product tags"
ON product_tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 5. 시드 데이터 (선택)
-- =====================================================

-- 기본 태그 예시 (Phase 0 테스트용)
INSERT INTO tags (name, slug) VALUES
  ('Next.js', 'next-js'),
  ('React', 'react'),
  ('TypeScript', 'typescript'),
  ('Tailwind CSS', 'tailwind-css'),
  ('Supabase', 'supabase'),
  ('전자책', 'ebook'),
  ('템플릿', 'template'),
  ('소스코드', 'source-code')
ON CONFLICT (slug) DO NOTHING;
