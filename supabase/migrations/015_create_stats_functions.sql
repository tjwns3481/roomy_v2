-- @TASK P4-T4.5 - 호스트 통계 RPC 함수
-- @SPEC docs/planning/06-tasks.md#P4-T4.5

-- ============================================================================
-- 1. 사용자별 일별 조회수 조회
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_daily_views(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  view_date DATE,
  view_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(gv.viewed_at) AS view_date,
    COUNT(*) AS view_count
  FROM guidebook_views gv
  INNER JOIN guidebooks g ON g.id = gv.guidebook_id
  WHERE g.user_id = p_user_id
    AND gv.viewed_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(gv.viewed_at)
  ORDER BY DATE(gv.viewed_at) DESC;
END;
$$;

COMMENT ON FUNCTION get_user_daily_views IS '사용자의 모든 가이드북에 대한 일별 조회수를 반환합니다.';


-- ============================================================================
-- 2. 사용자별 가이드북별 오늘 조회수 조회
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_today_views_by_guidebook(
  p_user_id UUID
)
RETURNS TABLE (
  guidebook_id UUID,
  view_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gv.guidebook_id,
    COUNT(*) AS view_count
  FROM guidebook_views gv
  INNER JOIN guidebooks g ON g.id = gv.guidebook_id
  WHERE g.user_id = p_user_id
    AND DATE(gv.viewed_at) = CURRENT_DATE
  GROUP BY gv.guidebook_id
  ORDER BY COUNT(*) DESC;
END;
$$;

COMMENT ON FUNCTION get_user_today_views_by_guidebook IS '사용자의 각 가이드북별 오늘 조회수를 반환합니다.';


-- ============================================================================
-- 3. 가이드북별 마지막 조회 시간 조회
-- ============================================================================

CREATE OR REPLACE FUNCTION get_guidebooks_last_viewed(
  p_user_id UUID
)
RETURNS TABLE (
  guidebook_id UUID,
  last_viewed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gv.guidebook_id,
    MAX(gv.viewed_at) AS last_viewed_at
  FROM guidebook_views gv
  INNER JOIN guidebooks g ON g.id = gv.guidebook_id
  WHERE g.user_id = p_user_id
  GROUP BY gv.guidebook_id
  ORDER BY MAX(gv.viewed_at) DESC;
END;
$$;

COMMENT ON FUNCTION get_guidebooks_last_viewed IS '사용자의 각 가이드북별 마지막 조회 시간을 반환합니다.';


-- ============================================================================
-- 4. 인덱스 추가 (성능 최적화)
-- ============================================================================

-- guidebook_views 테이블에 viewed_at 인덱스 추가 (이미 있다면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'guidebook_views'
    AND indexname = 'idx_guidebook_views_viewed_at'
  ) THEN
    CREATE INDEX idx_guidebook_views_viewed_at ON guidebook_views(viewed_at DESC);
  END IF;
END $$;

-- guidebook_views 테이블에 guidebook_id, viewed_at 복합 인덱스
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'guidebook_views'
    AND indexname = 'idx_guidebook_views_guidebook_viewed'
  ) THEN
    CREATE INDEX idx_guidebook_views_guidebook_viewed
    ON guidebook_views(guidebook_id, viewed_at DESC);
  END IF;
END $$;

COMMENT ON INDEX idx_guidebook_views_viewed_at IS '일별 조회수 조회 성능 최적화';
COMMENT ON INDEX idx_guidebook_views_guidebook_viewed IS '가이드북별 통계 조회 성능 최적화';
