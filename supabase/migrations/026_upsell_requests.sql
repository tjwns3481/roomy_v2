-- @TASK P8-R4: upsell_requests 테이블 생성
-- 게스트의 Upsell 아이템 요청 관리

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS upsell_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upsell_item_id UUID NOT NULL REFERENCES upsell_items(id) ON DELETE CASCADE,
  guidebook_id UUID NOT NULL REFERENCES guidebooks(id) ON DELETE CASCADE,
  guest_name TEXT,
  guest_contact TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 인덱스
CREATE INDEX IF NOT EXISTS idx_upsell_requests_guidebook_id ON upsell_requests(guidebook_id);
CREATE INDEX IF NOT EXISTS idx_upsell_requests_item_id ON upsell_requests(upsell_item_id);
CREATE INDEX IF NOT EXISTS idx_upsell_requests_status ON upsell_requests(guidebook_id, status);
CREATE INDEX IF NOT EXISTS idx_upsell_requests_created_at ON upsell_requests(guidebook_id, created_at DESC);

-- 3. RLS 활성화
ALTER TABLE upsell_requests ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책: 삽입은 누구나 (게스트), 조회/수정은 호스트만
-- 삽입: 공개 (게스트가 요청 생성)
DROP POLICY IF EXISTS "upsell_requests_insert_policy" ON upsell_requests;
CREATE POLICY "upsell_requests_insert_policy" ON upsell_requests
  FOR INSERT
  WITH CHECK (true); -- 누구나 요청 가능

-- 조회: 호스트 본인의 가이드북 요청만
DROP POLICY IF EXISTS "upsell_requests_select_policy" ON upsell_requests;
CREATE POLICY "upsell_requests_select_policy" ON upsell_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM guidebooks
      WHERE guidebooks.id = upsell_requests.guidebook_id
        AND guidebooks.user_id = auth.uid()
    )
  );

-- 수정: 호스트 본인의 가이드북 요청만
DROP POLICY IF EXISTS "upsell_requests_update_policy" ON upsell_requests;
CREATE POLICY "upsell_requests_update_policy" ON upsell_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM guidebooks
      WHERE guidebooks.id = upsell_requests.guidebook_id
        AND guidebooks.user_id = auth.uid()
    )
  );

-- 삭제: 호스트 본인의 가이드북 요청만
DROP POLICY IF EXISTS "upsell_requests_delete_policy" ON upsell_requests;
CREATE POLICY "upsell_requests_delete_policy" ON upsell_requests
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM guidebooks
      WHERE guidebooks.id = upsell_requests.guidebook_id
        AND guidebooks.user_id = auth.uid()
    )
  );

-- 5. Helper 함수: 가이드북의 upsell_request 통계 조회
CREATE OR REPLACE FUNCTION get_upsell_request_stats(p_guidebook_id UUID)
RETURNS TABLE (
  total_requests BIGINT,
  pending_requests BIGINT,
  confirmed_requests BIGINT,
  cancelled_requests BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_requests,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT AS pending_requests,
    COUNT(*) FILTER (WHERE status = 'confirmed')::BIGINT AS confirmed_requests,
    COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT AS cancelled_requests
  FROM upsell_requests
  WHERE guidebook_id = p_guidebook_id;
END;
$$;

-- 6. 테스트 데이터 (개발 환경용)
COMMENT ON TABLE upsell_requests IS '게스트 Upsell 요청 - 게스트가 자유롭게 생성, 호스트가 관리';
