-- @TASK P2-T2.7 - 조회 통계 테이블 및 RPC 함수
-- @SPEC docs/planning/04-database-design.md#조회-통계

-- ============================================================================
-- 1. guidebook_views 테이블 (세부 조회 로그)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.guidebook_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guidebook_id UUID NOT NULL REFERENCES public.guidebooks(id) ON DELETE CASCADE,

  -- 방문자 정보 (익명화)
  visitor_id TEXT, -- 쿠키/세션 기반 익명 ID
  ip_hash TEXT,    -- IP 해시 (개인정보 보호)
  user_agent TEXT,
  referrer TEXT,

  -- 타임스탬프
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_guidebook_views_guidebook_id ON public.guidebook_views(guidebook_id);
CREATE INDEX IF NOT EXISTS idx_guidebook_views_viewed_at ON public.guidebook_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_guidebook_views_guidebook_date ON public.guidebook_views(guidebook_id, viewed_at);

-- ============================================================================
-- 2. RPC: 조회수 증가 함수
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_guidebook_view_count(
  p_guidebook_id UUID,
  p_visitor_id TEXT DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- 1. guidebooks 테이블의 view_count 증가
  UPDATE public.guidebooks
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = p_guidebook_id;

  -- 2. guidebook_views 테이블에 로그 삽입
  INSERT INTO public.guidebook_views (
    guidebook_id,
    visitor_id,
    ip_hash,
    user_agent,
    referrer
  ) VALUES (
    p_guidebook_id,
    p_visitor_id,
    p_ip_hash,
    p_user_agent,
    p_referrer
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. RPC: 가이드북 통계 조회 함수 (일별 조회수)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_guidebook_daily_views(
  p_guidebook_id UUID,
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  view_date DATE,
  view_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(gv.viewed_at) AS view_date,
    COUNT(*)::BIGINT AS view_count
  FROM public.guidebook_views gv
  WHERE gv.guidebook_id = p_guidebook_id
    AND gv.viewed_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(gv.viewed_at)
  ORDER BY view_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. RPC: 가이드북 통계 요약 조회
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_guidebook_stats_summary(
  p_guidebook_id UUID
)
RETURNS TABLE (
  total_views BIGINT,
  today_views BIGINT,
  week_views BIGINT,
  month_views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT view_count FROM public.guidebooks WHERE id = p_guidebook_id)::BIGINT AS total_views,
    COUNT(*) FILTER (WHERE gv.viewed_at >= DATE_TRUNC('day', NOW()))::BIGINT AS today_views,
    COUNT(*) FILTER (WHERE gv.viewed_at >= NOW() - INTERVAL '7 days')::BIGINT AS week_views,
    COUNT(*) FILTER (WHERE gv.viewed_at >= NOW() - INTERVAL '30 days')::BIGINT AS month_views
  FROM public.guidebook_views gv
  WHERE gv.guidebook_id = p_guidebook_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. RLS 정책
-- ============================================================================
ALTER TABLE public.guidebook_views ENABLE ROW LEVEL SECURITY;

-- 조회 로그 삽입: 누구나 가능 (공개 API)
CREATE POLICY guidebook_views_insert_public ON public.guidebook_views
  FOR INSERT WITH CHECK (TRUE);

-- 조회 로그 조회: 가이드북 소유자만
CREATE POLICY guidebook_views_select_owner ON public.guidebook_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.guidebooks g
      WHERE g.id = guidebook_id AND g.user_id = auth.uid()
    )
  );

-- 삭제: 가이드북 소유자만
CREATE POLICY guidebook_views_delete_owner ON public.guidebook_views
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.guidebooks g
      WHERE g.id = guidebook_id AND g.user_id = auth.uid()
    )
  );
