-- @TASK P8-S12-T1 - 리뷰 설정 테이블 생성
-- @SPEC P8 Screen 12 - Review Settings

-- 리뷰 설정 테이블
CREATE TABLE IF NOT EXISTS review_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guidebook_id UUID NOT NULL REFERENCES guidebooks(id) ON DELETE CASCADE,

  -- 활성화 여부
  is_enabled BOOLEAN NOT NULL DEFAULT false,

  -- 리뷰 플랫폼 링크
  airbnb_review_url TEXT,
  naver_place_url TEXT,
  google_maps_url TEXT,

  -- 팝업 타이밍 설정 (체크아웃 기준)
  show_timing TEXT NOT NULL DEFAULT 'checkout_day', -- 'checkout_before', 'checkout_day', 'checkout_after_1d', 'checkout_after_2d'

  -- 커스텀 메시지
  popup_title TEXT NOT NULL DEFAULT '즐거운 시간 보내셨나요?',
  popup_message TEXT NOT NULL DEFAULT '경험을 공유해주시면 더 많은 분들이 좋은 추억을 만들 수 있어요!',

  -- 통계
  total_shown INTEGER NOT NULL DEFAULT 0,
  total_clicked INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 가이드북당 하나의 설정만
  UNIQUE(guidebook_id)
);

-- RLS 정책
ALTER TABLE review_settings ENABLE ROW LEVEL SECURITY;

-- 소유자는 자신의 가이드북 리뷰 설정을 모두 조회 가능
CREATE POLICY "Users can view their own review settings"
  ON review_settings
  FOR SELECT
  USING (
    guidebook_id IN (
      SELECT id FROM guidebooks WHERE user_id = auth.uid()
    )
  );

-- 소유자는 자신의 가이드북 리뷰 설정을 생성 가능
CREATE POLICY "Users can create their own review settings"
  ON review_settings
  FOR INSERT
  WITH CHECK (
    guidebook_id IN (
      SELECT id FROM guidebooks WHERE user_id = auth.uid()
    )
  );

-- 소유자는 자신의 가이드북 리뷰 설정을 업데이트 가능
CREATE POLICY "Users can update their own review settings"
  ON review_settings
  FOR UPDATE
  USING (
    guidebook_id IN (
      SELECT id FROM guidebooks WHERE user_id = auth.uid()
    )
  );

-- 소유자는 자신의 가이드북 리뷰 설정을 삭제 가능
CREATE POLICY "Users can delete their own review settings"
  ON review_settings
  FOR DELETE
  USING (
    guidebook_id IN (
      SELECT id FROM guidebooks WHERE user_id = auth.uid()
    )
  );

-- 게스트는 published 가이드북의 활성화된 리뷰 설정 조회 가능 (통계 업데이트용)
CREATE POLICY "Anyone can view enabled review settings for published guidebooks"
  ON review_settings
  FOR SELECT
  USING (
    is_enabled = true
    AND guidebook_id IN (
      SELECT id FROM guidebooks WHERE status = 'published'
    )
  );

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_review_settings_guidebook_id ON review_settings(guidebook_id);

-- updated_at 자동 갱신 트리거
CREATE TRIGGER update_review_settings_updated_at
  BEFORE UPDATE ON review_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 리뷰 클릭 로그 테이블 (통계용)
CREATE TABLE IF NOT EXISTS review_click_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guidebook_id UUID NOT NULL REFERENCES guidebooks(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'airbnb', 'naver', 'google'
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_hash TEXT
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_review_click_logs_guidebook_id ON review_click_logs(guidebook_id);
CREATE INDEX IF NOT EXISTS idx_review_click_logs_clicked_at ON review_click_logs(clicked_at);

-- RLS 정책 (로그는 누구나 삽입 가능, 조회는 소유자만)
ALTER TABLE review_click_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert review click logs"
  ON review_click_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own review click logs"
  ON review_click_logs
  FOR SELECT
  USING (
    guidebook_id IN (
      SELECT id FROM guidebooks WHERE user_id = auth.uid()
    )
  );

-- RPC 함수: 리뷰 팝업 표시 기록
CREATE OR REPLACE FUNCTION track_review_popup_shown(p_guidebook_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE review_settings
  SET total_shown = total_shown + 1
  WHERE guidebook_id = p_guidebook_id;
END;
$$;

-- RPC 함수: 리뷰 링크 클릭 기록
CREATE OR REPLACE FUNCTION track_review_click(
  p_guidebook_id UUID,
  p_platform TEXT,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 클릭 로그 삽입
  INSERT INTO review_click_logs (guidebook_id, platform, user_agent, ip_hash)
  VALUES (p_guidebook_id, p_platform, p_user_agent, p_ip_hash);

  -- 통계 업데이트
  UPDATE review_settings
  SET total_clicked = total_clicked + 1
  WHERE guidebook_id = p_guidebook_id;
END;
$$;
