-- @TASK P3-T3.5 - AI 사용량 추적 및 플랜별 제한
-- @SPEC docs/planning/02-trd.md#AI-Usage-Tracking

-- ============================================================================
-- 1. ai_usage 테이블 생성
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guidebook_id UUID REFERENCES public.guidebooks(id) ON DELETE SET NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  model VARCHAR(50) NOT NULL DEFAULT 'gpt-4o',
  action VARCHAR(50) NOT NULL CHECK (action IN ('generate', 'edit', 'chat')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ai_usage 인덱스
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON public.ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON public.ai_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_month ON public.ai_usage(user_id, created_at);

-- 테이블 설명
COMMENT ON TABLE public.ai_usage IS 'AI 기능 사용 이력 추적 테이블';
COMMENT ON COLUMN public.ai_usage.user_id IS '사용자 ID (auth.users 참조)';
COMMENT ON COLUMN public.ai_usage.guidebook_id IS '관련 가이드북 ID (선택적)';
COMMENT ON COLUMN public.ai_usage.tokens_used IS '사용된 토큰 수';
COMMENT ON COLUMN public.ai_usage.model IS '사용된 AI 모델 (gpt-4o, gpt-4o-mini 등)';
COMMENT ON COLUMN public.ai_usage.action IS '작업 유형: generate, edit, chat';

-- ============================================================================
-- 2. 월별 사용량 집계 뷰
-- ============================================================================
CREATE OR REPLACE VIEW public.monthly_ai_usage AS
SELECT
  user_id,
  DATE_TRUNC('month', created_at) AS month,
  SUM(tokens_used) AS total_tokens,
  COUNT(*) AS generation_count,
  COUNT(DISTINCT guidebook_id) AS unique_guidebooks
FROM public.ai_usage
GROUP BY user_id, DATE_TRUNC('month', created_at);

COMMENT ON VIEW public.monthly_ai_usage IS '월별 AI 사용량 집계 뷰';

-- ============================================================================
-- 3. check_ai_limit RPC 함수
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_ai_limit(p_user_id UUID)
RETURNS TABLE (
  can_generate BOOLEAN,
  used_this_month INTEGER,
  limit_this_month INTEGER,
  remaining INTEGER,
  plan TEXT
) AS $$
DECLARE
  v_plan TEXT;
  v_used INTEGER;
  v_limit INTEGER;
BEGIN
  -- 사용자 플랜 조회
  SELECT profiles.plan INTO v_plan
  FROM public.profiles
  WHERE id = p_user_id;

  -- 플랜이 없으면 기본값 'free'
  IF v_plan IS NULL THEN
    v_plan := 'free';
  END IF;

  -- 이번 달 사용량 조회
  SELECT COALESCE(COUNT(*)::INTEGER, 0) INTO v_used
  FROM public.ai_usage
  WHERE user_id = p_user_id
    AND created_at >= DATE_TRUNC('month', NOW())
    AND created_at < DATE_TRUNC('month', NOW()) + INTERVAL '1 month';

  -- 플랜별 제한 설정
  v_limit := CASE v_plan
    WHEN 'free' THEN 3
    WHEN 'pro' THEN 30
    WHEN 'business' THEN 999999  -- 무제한
    ELSE 3
  END;

  RETURN QUERY SELECT
    v_used < v_limit AS can_generate,
    v_used AS used_this_month,
    v_limit AS limit_this_month,
    GREATEST(0, v_limit - v_used) AS remaining,
    v_plan AS plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_ai_limit IS 'AI 사용량 제한 확인 함수 - 플랜별 월간 제한 체크';

-- ============================================================================
-- 4. record_ai_usage RPC 함수 (내부 사용)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.record_ai_usage(
  p_user_id UUID,
  p_guidebook_id UUID DEFAULT NULL,
  p_tokens_used INTEGER DEFAULT 0,
  p_model VARCHAR(50) DEFAULT 'gpt-4o',
  p_action VARCHAR(50) DEFAULT 'generate'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.ai_usage (user_id, guidebook_id, tokens_used, model, action)
  VALUES (p_user_id, p_guidebook_id, p_tokens_used, p_model, p_action)
  RETURNING id INTO v_id;

  -- profiles 테이블의 ai_generation_count 업데이트
  UPDATE public.profiles
  SET ai_generation_count = ai_generation_count + 1
  WHERE id = p_user_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.record_ai_usage IS 'AI 사용량 기록 함수 - 사용 이력 저장 및 카운터 업데이트';

-- ============================================================================
-- 5. get_ai_usage_history RPC 함수
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_ai_usage_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  guidebook_id UUID,
  guidebook_title TEXT,
  tokens_used INTEGER,
  model VARCHAR(50),
  action VARCHAR(50),
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    au.id,
    au.guidebook_id,
    g.title AS guidebook_title,
    au.tokens_used,
    au.model,
    au.action,
    au.created_at
  FROM public.ai_usage au
  LEFT JOIN public.guidebooks g ON au.guidebook_id = g.id
  WHERE au.user_id = p_user_id
  ORDER BY au.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_ai_usage_history IS 'AI 사용 이력 조회 함수';

-- ============================================================================
-- 6. reset_monthly_ai_usage 함수 (관리자용, 선택적)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.reset_monthly_ai_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- profiles 테이블의 월간 카운터 리셋
  UPDATE public.profiles
  SET ai_generation_count = 0
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.reset_monthly_ai_usage IS 'AI 사용량 월간 리셋 함수 (관리자용)';

-- ============================================================================
-- 7. RLS (Row Level Security) 정책
-- ============================================================================
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 조회 가능
CREATE POLICY ai_usage_select_own ON public.ai_usage
  FOR SELECT USING (auth.uid() = user_id);

-- 시스템(서버)에서만 삽입 가능 - Service Role Key 사용
CREATE POLICY ai_usage_insert_system ON public.ai_usage
  FOR INSERT WITH CHECK (true);

-- 삭제 불가 (이력 보존)
-- 업데이트 불가 (이력 보존)

-- ============================================================================
-- 8. 인덱스 추가 (성능 최적화)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ai_usage_action ON public.ai_usage(action);
CREATE INDEX IF NOT EXISTS idx_ai_usage_model ON public.ai_usage(model);

-- ============================================================================
-- Migration Complete
-- ============================================================================
