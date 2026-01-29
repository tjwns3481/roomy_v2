-- ============================================
-- @TASK P8-R5 - 알림톡 발송 로그 테이블
-- ============================================
-- 카카오 알림톡 발송 이력을 저장하고 추적합니다.
-- Business 플랜 전용 기능

-- alimtalk_logs 테이블 생성
DROP TABLE IF EXISTS alimtalk_logs CASCADE;

CREATE TABLE alimtalk_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guidebook_id UUID NOT NULL REFERENCES guidebooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- 발송 정보
  template_code VARCHAR(100) NOT NULL, -- 카카오 템플릿 코드
  recipient_phone VARCHAR(20) NOT NULL, -- 수신자 전화번호 (암호화 권장)
  recipient_name VARCHAR(100), -- 수신자 이름

  -- 상태 추적
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ, -- 발송 시간
  delivered_at TIMESTAMPTZ, -- 전달 완료 시간

  -- 에러 처리
  error_message TEXT,
  error_code VARCHAR(50),

  -- 메타데이터
  message_content TEXT, -- 실제 발송된 메시지 내용
  kakao_message_id VARCHAR(100), -- 카카오 메시지 ID
  template_params JSONB, -- 템플릿 변수

  -- 비용 추적
  cost_krw INTEGER DEFAULT 0, -- 발송 비용 (원)

  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_alimtalk_logs_guidebook_id ON alimtalk_logs(guidebook_id);
CREATE INDEX idx_alimtalk_logs_user_id ON alimtalk_logs(user_id);
CREATE INDEX idx_alimtalk_logs_status ON alimtalk_logs(status);
CREATE INDEX idx_alimtalk_logs_sent_at ON alimtalk_logs(sent_at DESC);
CREATE INDEX idx_alimtalk_logs_recipient_phone ON alimtalk_logs(recipient_phone);

-- 타임스탬프 자동 업데이트 트리거
CREATE TRIGGER update_alimtalk_logs_updated_at
  BEFORE UPDATE ON alimtalk_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS 정책
-- ============================================

ALTER TABLE alimtalk_logs ENABLE ROW LEVEL SECURITY;

-- 조회: 본인 가이드북의 로그만 조회 가능
CREATE POLICY "Users can view their own alimtalk logs"
  ON alimtalk_logs
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- 삽입: Business 플랜 사용자만 가능 (서버에서 체크)
CREATE POLICY "Business users can insert alimtalk logs"
  ON alimtalk_logs
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND plan = 'business'
    )
  );

-- 업데이트: 본인 로그만 상태 업데이트 가능
CREATE POLICY "Users can update their own alimtalk logs"
  ON alimtalk_logs
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 삭제: 본인 로그만 삭제 가능
CREATE POLICY "Users can delete their own alimtalk logs"
  ON alimtalk_logs
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- Helper Functions
-- ============================================

-- 가이드북별 발송 횟수 조회
CREATE OR REPLACE FUNCTION get_alimtalk_count_for_guidebook(
  p_guidebook_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM alimtalk_logs
  WHERE guidebook_id = p_guidebook_id
    AND (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date);

  RETURN COALESCE(v_count, 0);
END;
$$;

-- 사용자별 발송 통계 조회
CREATE OR REPLACE FUNCTION get_alimtalk_stats_for_user(p_user_id UUID)
RETURNS TABLE (
  total_sent INTEGER,
  total_delivered INTEGER,
  total_failed INTEGER,
  total_cost_krw INTEGER,
  last_sent_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status IN ('sent', 'delivered'))::INTEGER,
    COUNT(*) FILTER (WHERE status = 'delivered')::INTEGER,
    COUNT(*) FILTER (WHERE status = 'failed')::INTEGER,
    COALESCE(SUM(cost_krw), 0)::INTEGER,
    MAX(sent_at)
  FROM alimtalk_logs
  WHERE user_id = p_user_id;
END;
$$;

-- ============================================
-- 코멘트
-- ============================================

COMMENT ON TABLE alimtalk_logs IS '@TASK P8-R5 - 카카오 알림톡 발송 로그 (Business 플랜 전용)';
COMMENT ON COLUMN alimtalk_logs.template_code IS '카카오 비즈니스에 등록된 템플릿 코드';
COMMENT ON COLUMN alimtalk_logs.recipient_phone IS '수신자 전화번호 (010-1234-5678 형식)';
COMMENT ON COLUMN alimtalk_logs.status IS 'pending: 대기, sent: 발송완료, delivered: 전달완료, failed: 실패';
COMMENT ON COLUMN alimtalk_logs.cost_krw IS '발송 비용 (원 단위)';
