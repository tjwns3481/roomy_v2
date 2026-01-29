-- =====================================================
-- Migration: 008_create_reviews.sql
-- Description: 상품 후기 테이블 생성 및 RLS 정책
-- Author: database-specialist
-- Date: 2026-01-25
-- =====================================================

-- =====================================================
-- 1. reviews 테이블 생성
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  images JSONB DEFAULT '[]'::JSONB,
  like_count INTEGER DEFAULT 0 NOT NULL,
  view_count INTEGER DEFAULT 0 NOT NULL,
  is_best BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 2. 인덱스 생성
-- =====================================================

-- 상품별 후기 조회 최적화
CREATE INDEX idx_reviews_product_id ON reviews(product_id);

-- 사용자별 후기 조회
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- 주문당 1개 후기만 작성 가능 (UNIQUE 제약)
CREATE UNIQUE INDEX idx_reviews_order_item_id ON reviews(order_item_id);

-- 상품별 별점 필터링
CREATE INDEX idx_reviews_rating ON reviews(product_id, rating);

-- 베스트 후기 조회
CREATE INDEX idx_reviews_is_best ON reviews(is_best) WHERE is_best = true;

-- 최신순 정렬
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- 좋아요순 정렬
CREATE INDEX idx_reviews_like_count ON reviews(product_id, like_count DESC);

-- =====================================================
-- 3. updated_at 자동 갱신 트리거
-- =====================================================

CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. RLS 정책 활성화
-- =====================================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RLS 정책 생성
-- =====================================================

-- 누구나 후기 조회 가능 (공개 콘텐츠)
CREATE POLICY "Anyone can view reviews"
ON reviews FOR SELECT
USING (true);

-- 구매자만 후기 작성 가능 (order_item_id 검증)
CREATE POLICY "Purchasers can create reviews"
ON reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.id = order_item_id
    AND o.user_id = auth.uid()
    AND o.status IN ('paid', 'completed')
  )
);

-- 본인 후기만 수정 가능 (is_best는 관리자만 수정 가능하도록 추가 정책)
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 본인 후기만 삭제 가능
CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
USING (auth.uid() = user_id);

-- 관리자는 모든 후기 관리 (베스트 선정, 삭제 등)
CREATE POLICY "Admins can manage all reviews"
ON reviews FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 6. 헬퍼 함수: 후기 조회수 증가
-- =====================================================

CREATE OR REPLACE FUNCTION increment_review_view_count(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE reviews SET view_count = view_count + 1 WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECURITY DEFINER: RLS를 우회하여 조회수 증가 (누구나 가능)

-- =====================================================
-- 7. 헬퍼 함수: 상품 평균 별점 계산
-- =====================================================

CREATE OR REPLACE FUNCTION get_product_average_rating(p_product_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT ROUND(AVG(rating)::NUMERIC, 2)
  INTO avg_rating
  FROM reviews
  WHERE product_id = p_product_id;

  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. 헬퍼 함수: 상품 별점별 개수 집계
-- =====================================================

CREATE OR REPLACE FUNCTION get_product_rating_distribution(p_product_id UUID)
RETURNS TABLE(rating INTEGER, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.rating,
    COUNT(*)::BIGINT
  FROM reviews r
  WHERE r.product_id = p_product_id
  GROUP BY r.rating
  ORDER BY r.rating DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. 검증 쿼리
-- =====================================================

-- 테이블 존재 확인
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
    RAISE EXCEPTION 'reviews table not created';
  END IF;

  RAISE NOTICE '✅ reviews table created successfully';
END $$;

-- =====================================================
-- 완료
-- =====================================================

-- 마이그레이션 완료 로그
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 008_create_reviews.sql completed successfully';
  RAISE NOTICE '   - reviews table created with all constraints';
  RAISE NOTICE '   - 7 indexes created for optimization';
  RAISE NOTICE '   - RLS policies enabled (5 policies)';
  RAISE NOTICE '   - 3 helper functions created';
END $$;
