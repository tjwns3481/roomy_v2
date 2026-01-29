-- @TASK P5-T5.5 - 공유 이벤트 로그 테이블 및 통계 함수
-- @SPEC docs/planning/06-tasks.md#P5-T5.5

-- ============================================================================
-- 1. share_events 테이블 (공유 이벤트 로그)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guidebook_id UUID NOT NULL REFERENCES public.guidebooks(id) ON DELETE CASCADE,

  -- 이벤트 타입
  event_type VARCHAR(50) NOT NULL, -- 'link_copy', 'qr_download', 'social_share', 'short_url_click'

  -- 이벤트 추가 데이터 (예: { platform: 'kakao' })
  event_data JSONB DEFAULT '{}',

  -- 방문자 정보 (익명화)
  visitor_id TEXT,           -- 세션 기반 익명 ID
  ip_hash TEXT,              -- IP 해시 (개인정보 보호)
  user_agent TEXT,           -- 브라우저 정보

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_share_events_guidebook_id ON public.share_events(guidebook_id);
CREATE INDEX IF NOT EXISTS idx_share_events_event_type ON public.share_events(event_type);
CREATE INDEX IF NOT EXISTS idx_share_events_created_at ON public.share_events(created_at);
CREATE INDEX IF NOT EXISTS idx_share_events_guidebook_type ON public.share_events(guidebook_id, event_type);
CREATE INDEX IF NOT EXISTS idx_share_events_guidebook_date ON public.share_events(guidebook_id, created_at);

-- ============================================================================
-- 2. RPC: 공유 이벤트 기록 함수
-- ============================================================================
CREATE OR REPLACE FUNCTION public.track_share_event(
  p_guidebook_id UUID,
  p_event_type VARCHAR(50),
  p_event_data JSONB DEFAULT '{}',
  p_visitor_id TEXT DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.share_events (
    guidebook_id,
    event_type,
    event_data,
    visitor_id,
    ip_hash,
    user_agent
  ) VALUES (
    p_guidebook_id,
    p_event_type,
    p_event_data,
    p_visitor_id,
    p_ip_hash,
    p_user_agent
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. RPC: 공유 통계 요약 조회 함수
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_share_stats_summary(
  p_guidebook_id UUID,
  p_period VARCHAR(10) DEFAULT 'all' -- '7d', '30d', 'all'
)
RETURNS TABLE (
  total_shares BIGINT,
  short_url_clicks BIGINT,
  link_copies BIGINT,
  qr_downloads BIGINT,
  kakao_shares BIGINT,
  twitter_shares BIGINT,
  facebook_shares BIGINT
) AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
BEGIN
  -- 기간 계산
  CASE p_period
    WHEN '7d' THEN v_start_date := NOW() - INTERVAL '7 days';
    WHEN '30d' THEN v_start_date := NOW() - INTERVAL '30 days';
    ELSE v_start_date := '1970-01-01'::TIMESTAMPTZ;
  END CASE;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_shares,
    COUNT(*) FILTER (WHERE se.event_type = 'short_url_click')::BIGINT AS short_url_clicks,
    COUNT(*) FILTER (WHERE se.event_type = 'link_copy')::BIGINT AS link_copies,
    COUNT(*) FILTER (WHERE se.event_type = 'qr_download')::BIGINT AS qr_downloads,
    COUNT(*) FILTER (WHERE se.event_type = 'social_share' AND se.event_data->>'platform' = 'kakao')::BIGINT AS kakao_shares,
    COUNT(*) FILTER (WHERE se.event_type = 'social_share' AND se.event_data->>'platform' = 'twitter')::BIGINT AS twitter_shares,
    COUNT(*) FILTER (WHERE se.event_type = 'social_share' AND se.event_data->>'platform' = 'facebook')::BIGINT AS facebook_shares
  FROM public.share_events se
  WHERE se.guidebook_id = p_guidebook_id
    AND se.created_at >= v_start_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. RPC: 일별 공유 통계 조회 함수
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_share_daily_stats(
  p_guidebook_id UUID,
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  share_date DATE,
  share_count BIGINT,
  link_copies BIGINT,
  qr_downloads BIGINT,
  social_shares BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(se.created_at) AS share_date,
    COUNT(*)::BIGINT AS share_count,
    COUNT(*) FILTER (WHERE se.event_type = 'link_copy')::BIGINT AS link_copies,
    COUNT(*) FILTER (WHERE se.event_type = 'qr_download')::BIGINT AS qr_downloads,
    COUNT(*) FILTER (WHERE se.event_type = 'social_share')::BIGINT AS social_shares
  FROM public.share_events se
  WHERE se.guidebook_id = p_guidebook_id
    AND se.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(se.created_at)
  ORDER BY share_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. RLS 정책
-- ============================================================================
ALTER TABLE public.share_events ENABLE ROW LEVEL SECURITY;

-- 이벤트 삽입: 누구나 가능 (공개 API)
DROP POLICY IF EXISTS share_events_insert_public ON public.share_events;
CREATE POLICY share_events_insert_public ON public.share_events
  FOR INSERT WITH CHECK (TRUE);

-- 이벤트 조회: 가이드북 소유자만
DROP POLICY IF EXISTS share_events_select_owner ON public.share_events;
CREATE POLICY share_events_select_owner ON public.share_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.guidebooks g
      WHERE g.id = guidebook_id AND g.user_id = auth.uid()
    )
  );

-- 삭제: 가이드북 소유자만
DROP POLICY IF EXISTS share_events_delete_owner ON public.share_events;
CREATE POLICY share_events_delete_owner ON public.share_events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.guidebooks g
      WHERE g.id = guidebook_id AND g.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. 마이그레이션 완료 확인
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'P5-T5.5: share_events 테이블 및 RPC 함수 생성 완료';
END $$;
