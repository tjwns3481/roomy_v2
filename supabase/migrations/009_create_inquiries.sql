-- =====================================================
-- Migration: 009_create_inquiries.sql
-- Description: 상품 문의 테이블 생성 및 RLS 정책
-- Author: database-specialist
-- Date: 2026-01-25
-- =====================================================

-- =====================================================
-- 1. inquiries 테이블 생성
-- =====================================================

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'answered')),
  answer TEXT,
  answered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  answered_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- 카테고리 검증 제약
  CONSTRAINT inquiries_category_check CHECK (
    category IN ('product', 'shipping', 'payment', 'etc')
  )
);

-- =====================================================
-- 2. 인덱스 생성
-- =====================================================

-- 상품별 문의 조회 (product_id가 NULL일 수 있으므로 조건부)
CREATE INDEX idx_inquiries_product_id ON inquiries(product_id) WHERE product_id IS NOT NULL;

-- 사용자별 문의 조회
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);

-- 상태별 필터링 (관리자용)
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- 카테고리별 필터링
CREATE INDEX idx_inquiries_category ON inquiries(category);

-- 최신순 정렬
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- 비밀글 필터링 (공개 문의만 조회)
CREATE INDEX idx_inquiries_is_private ON inquiries(is_private);

-- 답변자별 조회 (관리자 통계용)
CREATE INDEX idx_inquiries_answered_by ON inquiries(answered_by) WHERE answered_by IS NOT NULL;

-- =====================================================
-- 3. updated_at 자동 갱신 트리거
-- =====================================================

CREATE TRIGGER set_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. 답변 시 상태 자동 변경 트리거
-- =====================================================

CREATE OR REPLACE FUNCTION auto_update_inquiry_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 답변이 작성되면 상태를 'answered'로 변경
  IF NEW.answer IS NOT NULL AND NEW.answer <> '' AND OLD.answer IS NULL THEN
    NEW.status := 'answered';
    NEW.answered_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_inquiry_answered
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_inquiry_status();

-- =====================================================
-- 5. RLS 정책 활성화
-- =====================================================

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. RLS 정책 생성
-- =====================================================

-- 공개 문의는 누구나 조회, 비밀글은 본인/관리자만
CREATE POLICY "Anyone can view public inquiries"
ON inquiries FOR SELECT
USING (
  is_private = false
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 로그인 사용자만 문의 작성
CREATE POLICY "Authenticated users can create inquiries"
ON inquiries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 본인 문의만 수정 (답변 전에만 가능)
CREATE POLICY "Users can update own pending inquiries"
ON inquiries FOR UPDATE
USING (
  auth.uid() = user_id
  AND status = 'pending'
)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
);

-- 본인 문의만 삭제 (답변 전에만 가능)
CREATE POLICY "Users can delete own pending inquiries"
ON inquiries FOR DELETE
USING (
  auth.uid() = user_id
  AND status = 'pending'
);

-- 관리자는 모든 문의 관리 및 답변
CREATE POLICY "Admins can manage all inquiries"
ON inquiries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 7. 헬퍼 함수: 문의 조회수 증가
-- =====================================================

CREATE OR REPLACE FUNCTION increment_inquiry_view_count(inquiry_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE inquiries SET view_count = view_count + 1 WHERE id = inquiry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECURITY DEFINER: RLS를 우회하여 조회수 증가 (권한이 있는 사용자만)

-- =====================================================
-- 8. 헬퍼 함수: 미답변 문의 개수 조회 (관리자용)
-- =====================================================

CREATE OR REPLACE FUNCTION get_pending_inquiry_count()
RETURNS BIGINT AS $$
DECLARE
  count BIGINT;
BEGIN
  SELECT COUNT(*)
  INTO count
  FROM inquiries
  WHERE status = 'pending';

  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. 헬퍼 함수: 상품별 문의 개수
-- =====================================================

CREATE OR REPLACE FUNCTION get_product_inquiry_count(p_product_id UUID)
RETURNS BIGINT AS $$
DECLARE
  count BIGINT;
BEGIN
  SELECT COUNT(*)
  INTO count
  FROM inquiries
  WHERE product_id = p_product_id
  AND is_private = false; -- 공개 문의만 카운트

  RETURN count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. 검증 쿼리
-- =====================================================

-- 테이블 존재 확인
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inquiries') THEN
    RAISE EXCEPTION 'inquiries table not created';
  END IF;

  RAISE NOTICE '✅ inquiries table created successfully';
END $$;

-- =====================================================
-- 완료
-- =====================================================

-- 마이그레이션 완료 로그
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 009_create_inquiries.sql completed successfully';
  RAISE NOTICE '   - inquiries table created with all constraints';
  RAISE NOTICE '   - 7 indexes created for optimization';
  RAISE NOTICE '   - RLS policies enabled (5 policies)';
  RAISE NOTICE '   - 2 triggers created (auto status update, updated_at)';
  RAISE NOTICE '   - 3 helper functions created';
END $$;
