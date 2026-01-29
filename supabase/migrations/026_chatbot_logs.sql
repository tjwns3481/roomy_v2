-- @TASK P8-R1 - chatbot_logs 테이블 생성
-- @SPEC specs/domain/resources.yaml#chatbot_log
-- AI 챗봇 대화 로그 테이블

-- ==========================================
-- 1. chatbot_logs 테이블 생성
-- ==========================================
CREATE TABLE IF NOT EXISTS chatbot_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guidebook_id UUID NOT NULL REFERENCES guidebooks(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  feedback TEXT CHECK (feedback IN ('helpful', 'not_helpful')) DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 2. 인덱스 생성
-- ==========================================
-- 가이드북별 로그 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_guidebook_id
  ON chatbot_logs(guidebook_id);

-- 세션별 대화 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_session_id
  ON chatbot_logs(session_id);

-- 시간순 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_created_at
  ON chatbot_logs(created_at DESC);

-- 가이드북 + 시간순 복합 인덱스 (호스트 대시보드용)
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_guidebook_created
  ON chatbot_logs(guidebook_id, created_at DESC);

-- ==========================================
-- 3. RLS 정책 활성화
-- ==========================================
ALTER TABLE chatbot_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. RLS 정책 생성
-- ==========================================

-- 4.1. 삽입 정책: 공개 (게스트가 챗봇 사용)
DROP POLICY IF EXISTS "chatbot_logs_insert_public" ON chatbot_logs;
CREATE POLICY "chatbot_logs_insert_public"
  ON chatbot_logs
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

-- 4.2. 조회 정책: 호스트는 자신의 가이드북 로그만 조회
DROP POLICY IF EXISTS "chatbot_logs_select_own_guidebook" ON chatbot_logs;
CREATE POLICY "chatbot_logs_select_own_guidebook"
  ON chatbot_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM guidebooks
      WHERE guidebooks.id = chatbot_logs.guidebook_id
        AND guidebooks.user_id = auth.uid()
    )
  );

-- 4.3. 업데이트 정책: 피드백 업데이트만 허용 (공개)
DROP POLICY IF EXISTS "chatbot_logs_update_feedback" ON chatbot_logs;
CREATE POLICY "chatbot_logs_update_feedback"
  ON chatbot_logs
  FOR UPDATE
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- 4.4. 삭제 정책: 호스트는 자신의 가이드북 로그만 삭제
DROP POLICY IF EXISTS "chatbot_logs_delete_own_guidebook" ON chatbot_logs;
CREATE POLICY "chatbot_logs_delete_own_guidebook"
  ON chatbot_logs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM guidebooks
      WHERE guidebooks.id = chatbot_logs.guidebook_id
        AND guidebooks.user_id = auth.uid()
    )
  );

-- ==========================================
-- 5. Helper 함수: 가이드북별 챗봇 통계
-- ==========================================
CREATE OR REPLACE FUNCTION get_chatbot_stats(p_guidebook_id UUID)
RETURNS TABLE (
  total_questions BIGINT,
  helpful_count BIGINT,
  not_helpful_count BIGINT,
  avg_session_length NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_questions,
    COUNT(*) FILTER (WHERE feedback = 'helpful') AS helpful_count,
    COUNT(*) FILTER (WHERE feedback = 'not_helpful') AS not_helpful_count,
    AVG(session_questions.cnt) AS avg_session_length
  FROM chatbot_logs
  LEFT JOIN (
    SELECT session_id, COUNT(*) AS cnt
    FROM chatbot_logs
    WHERE guidebook_id = p_guidebook_id
    GROUP BY session_id
  ) session_questions ON chatbot_logs.session_id = session_questions.session_id
  WHERE chatbot_logs.guidebook_id = p_guidebook_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 마이그레이션 완료
-- ==========================================
-- chatbot_logs 테이블, 인덱스, RLS 정책, Helper 함수 생성 완료
