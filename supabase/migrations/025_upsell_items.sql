-- @TASK P8-R3: upsell_items 테이블 생성
-- Upsell 아이템 관리 (추가 서비스, 상품 판매)

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS upsell_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guidebook_id UUID NOT NULL REFERENCES guidebooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0), -- 원 단위
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 인덱스
CREATE INDEX IF NOT EXISTS idx_upsell_items_guidebook_id ON upsell_items(guidebook_id);
CREATE INDEX IF NOT EXISTS idx_upsell_items_guidebook_active ON upsell_items(guidebook_id, is_active);
CREATE INDEX IF NOT EXISTS idx_upsell_items_sort_order ON upsell_items(guidebook_id, sort_order);

-- 3. Updated_at 트리거
CREATE TRIGGER set_upsell_items_updated_at
  BEFORE UPDATE ON upsell_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS 활성화
ALTER TABLE upsell_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책: 호스트 본인 가이드북만 CRUD
-- 조회: 호스트 본인 + 게스트(is_active=true만)
DROP POLICY IF EXISTS "upsell_items_select_policy" ON upsell_items;
CREATE POLICY "upsell_items_select_policy" ON upsell_items
  FOR SELECT
  USING (
    -- 호스트는 자신의 가이드북 모든 아이템 조회
    EXISTS (
      SELECT 1 FROM guidebooks
      WHERE guidebooks.id = upsell_items.guidebook_id
        AND guidebooks.user_id = auth.uid()
    )
    OR
    -- 게스트는 활성화된 아이템만 조회
    (is_active = true)
  );

-- 삽입: 호스트 본인 가이드북만 (Business 플랜 체크는 애플리케이션에서)
DROP POLICY IF EXISTS "upsell_items_insert_policy" ON upsell_items;
CREATE POLICY "upsell_items_insert_policy" ON upsell_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM guidebooks
      WHERE guidebooks.id = upsell_items.guidebook_id
        AND guidebooks.user_id = auth.uid()
    )
  );

-- 수정: 호스트 본인 가이드북만
DROP POLICY IF EXISTS "upsell_items_update_policy" ON upsell_items;
CREATE POLICY "upsell_items_update_policy" ON upsell_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM guidebooks
      WHERE guidebooks.id = upsell_items.guidebook_id
        AND guidebooks.user_id = auth.uid()
    )
  );

-- 삭제: 호스트 본인 가이드북만
DROP POLICY IF EXISTS "upsell_items_delete_policy" ON upsell_items;
CREATE POLICY "upsell_items_delete_policy" ON upsell_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM guidebooks
      WHERE guidebooks.id = upsell_items.guidebook_id
        AND guidebooks.user_id = auth.uid()
    )
  );

-- 6. Helper 함수: Business 플랜 체크
CREATE OR REPLACE FUNCTION can_create_upsell_item(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_name TEXT;
BEGIN
  -- 사용자 플랜 조회
  SELECT subscription_plan INTO v_plan_name
  FROM users
  WHERE id = p_user_id;

  -- Business 플랜만 허용
  RETURN v_plan_name = 'business';
END;
$$;

-- 7. 테스트 데이터 (개발 환경용)
-- 실제 production에서는 실행하지 않음
COMMENT ON TABLE upsell_items IS 'Upsell 아이템 (추가 서비스, 상품 판매) - Business 플랜 전용';
