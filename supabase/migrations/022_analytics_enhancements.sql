-- @TASK P8-S8-T1 - 통계 고도화 (유입 경로, 시간대별 분석)
-- @SPEC specs/screens/s-08-analytics.yaml

-- ============================================================================
-- 1. 유입 경로별 통계 조회 함수
-- ============================================================================
CREATE OR REPLACE FUNCTION get_referrer_stats(
  p_guidebook_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  referrer_type TEXT,
  view_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN referrer IS NULL OR referrer = '' THEN '직접 접속'
      WHEN referrer LIKE '%qr%' THEN 'QR 코드'
      WHEN referrer LIKE '%/s/%' THEN '단축 URL'
      ELSE '링크 공유'
    END AS referrer_type,
    COUNT(*) AS view_count
  FROM guidebook_views
  WHERE guidebook_id = p_guidebook_id
    AND viewed_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY referrer_type
  ORDER BY view_count DESC;
END;
$$;

COMMENT ON FUNCTION get_referrer_stats IS '가이드북의 유입 경로별 통계를 반환합니다.';

-- ============================================================================
-- 2. 시간대별 접속 통계 조회 함수
-- ============================================================================
CREATE OR REPLACE FUNCTION get_hourly_stats(
  p_guidebook_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  day_of_week INTEGER,
  hour_of_day INTEGER,
  view_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(DOW FROM viewed_at)::INTEGER AS day_of_week,
    EXTRACT(HOUR FROM viewed_at)::INTEGER AS hour_of_day,
    COUNT(*) AS view_count
  FROM guidebook_views
  WHERE guidebook_id = p_guidebook_id
    AND viewed_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY day_of_week, hour_of_day
  ORDER BY day_of_week, hour_of_day;
END;
$$;

COMMENT ON FUNCTION get_hourly_stats IS '가이드북의 요일별/시간대별 접속 통계를 반환합니다.';

-- ============================================================================
-- 3. 사용자별 유입 경로 통계 조회 함수
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_referrer_stats(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  referrer_type TEXT,
  view_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN gv.referrer IS NULL OR gv.referrer = '' THEN '직접 접속'
      WHEN gv.referrer LIKE '%qr%' THEN 'QR 코드'
      WHEN gv.referrer LIKE '%/s/%' THEN '단축 URL'
      ELSE '링크 공유'
    END AS referrer_type,
    COUNT(*) AS view_count
  FROM guidebook_views gv
  INNER JOIN guidebooks g ON g.id = gv.guidebook_id
  WHERE g.user_id = p_user_id
    AND gv.viewed_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY referrer_type
  ORDER BY view_count DESC;
END;
$$;

COMMENT ON FUNCTION get_user_referrer_stats IS '사용자의 모든 가이드북에 대한 유입 경로별 통계를 반환합니다.';

-- ============================================================================
-- 4. 챗봇 질문 통계 조회 함수 (Pro 플랜 이상)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_chatbot_stats(
  p_guidebook_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_questions BIGINT,
  helpful_count BIGINT,
  not_helpful_count BIGINT,
  top_questions TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_questions,
    COUNT(*) FILTER (WHERE feedback = 'helpful')::BIGINT AS helpful_count,
    COUNT(*) FILTER (WHERE feedback = 'not_helpful')::BIGINT AS not_helpful_count,
    ARRAY(
      SELECT question
      FROM chatbot_logs
      WHERE guidebook_id = p_guidebook_id
        AND created_at >= NOW() - (p_days || ' days')::INTERVAL
      GROUP BY question
      ORDER BY COUNT(*) DESC
      LIMIT 5
    ) AS top_questions
  FROM chatbot_logs
  WHERE guidebook_id = p_guidebook_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$;

COMMENT ON FUNCTION get_chatbot_stats IS '가이드북의 챗봇 질문 통계를 반환합니다 (Pro 플랜 이상).';
