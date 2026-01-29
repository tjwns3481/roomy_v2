-- @TASK P0-T0.5 - RLS 정책 완성 및 Supabase Storage 설정
-- @SPEC docs/planning/04-database-design.md#storage-setup

-- ============================================================================
-- 1. Storage Bucket: guidebook-images
-- ============================================================================

-- 버킷 생성 (공개 버킷: 게스트 뷰어에서 접근 필요)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guidebook-images',
  'guidebook-images',
  true,
  10485760, -- 10MB 제한
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. Storage RLS 정책
-- ============================================================================

-- 인증된 사용자만 업로드 가능 (경로: user_id/guidebook_id/filename)
DROP POLICY IF EXISTS "authenticated_users_can_upload_images" ON storage.objects;
CREATE POLICY "authenticated_users_can_upload_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'guidebook-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 본인 파일만 수정 가능
DROP POLICY IF EXISTS "users_can_update_own_images" ON storage.objects;
CREATE POLICY "users_can_update_own_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'guidebook-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 본인 파일만 삭제 가능
DROP POLICY IF EXISTS "users_can_delete_own_images" ON storage.objects;
CREATE POLICY "users_can_delete_own_images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'guidebook-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 공개 이미지는 누구나 읽기 가능 (게스트 뷰어에서 접근)
DROP POLICY IF EXISTS "anyone_can_read_public_images" ON storage.objects;
CREATE POLICY "anyone_can_read_public_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'guidebook-images');

-- ============================================================================
-- 3. 조회 통계 테이블 (P2 단계에서 사용)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.view_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guidebook_id UUID NOT NULL REFERENCES public.guidebooks(id) ON DELETE CASCADE,

  -- 날짜별 통계
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,

  -- 고유 제약: 가이드북별 일자 중복 방지
  CONSTRAINT unique_guidebook_date UNIQUE (guidebook_id, date),

  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_view_stats_guidebook_date ON public.view_stats(guidebook_id, date);

-- RLS 정책
ALTER TABLE public.view_stats ENABLE ROW LEVEL SECURITY;

-- 가이드북 소유자만 통계 조회 가능
DROP POLICY IF EXISTS "guidebook_owners_can_view_stats" ON public.view_stats;
CREATE POLICY "guidebook_owners_can_view_stats"
ON public.view_stats FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.guidebooks g
    WHERE g.id = guidebook_id AND g.user_id = auth.uid()
  )
);

-- 시스템(서비스 롤)에서만 통계 업데이트 가능
DROP POLICY IF EXISTS "service_role_can_manage_stats" ON public.view_stats;
CREATE POLICY "service_role_can_manage_stats"
ON public.view_stats FOR ALL
TO service_role
USING (true);

-- view_stats updated_at 트리거
DROP TRIGGER IF EXISTS update_view_stats_updated_at ON public.view_stats;
CREATE TRIGGER update_view_stats_updated_at
  BEFORE UPDATE ON public.view_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 4. Helper 함수: Storage URL 생성
-- ============================================================================

-- Storage URL 생성 헬퍼 함수
DROP FUNCTION IF EXISTS public.get_storage_url(TEXT, TEXT);
CREATE FUNCTION public.get_storage_url(
  bucket_name TEXT,
  file_path TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://bzzdaptscqkshwqehpmc.supabase.co/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 5. 호스트 가이드북 생성 카운트 함수 (제한 확인용)
-- ============================================================================

-- 사용자의 현재 가이드북 개수 반환
DROP FUNCTION IF EXISTS public.get_user_guidebook_count(UUID);
CREATE FUNCTION public.get_user_guidebook_count(user_id UUID)
RETURNS INT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.guidebooks WHERE user_id = $1 AND status != 'archived');
END;
$$ LANGUAGE plpgsql STABLE;

-- 사용자가 새 가이드북을 생성할 수 있는지 확인
DROP FUNCTION IF EXISTS public.can_create_guidebook(UUID);
CREATE FUNCTION public.can_create_guidebook(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT CASE
      WHEN plan = 'free' THEN (SELECT COUNT(*) FROM public.guidebooks WHERE user_id = $1 AND status != 'archived') < 1
      WHEN plan = 'pro' THEN (SELECT COUNT(*) FROM public.guidebooks WHERE user_id = $1 AND status != 'archived') < 5
      ELSE true -- business: unlimited
    END
    FROM public.profiles
    WHERE id = $1
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 6. AI 생성 카운트 함수 (월간 제한 확인용)
-- ============================================================================

-- 현재 월의 AI 생성 횟수 반환
DROP FUNCTION IF EXISTS public.get_user_ai_generation_count_this_month(UUID);
CREATE FUNCTION public.get_user_ai_generation_count_this_month(user_id UUID)
RETURNS INT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.guidebooks
    WHERE user_id = $1
      AND created_at >= DATE_TRUNC('month', NOW())
      AND status != 'archived'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 사용자가 AI로 가이드북을 생성할 수 있는지 확인
DROP FUNCTION IF EXISTS public.can_generate_with_ai(UUID);
CREATE FUNCTION public.can_generate_with_ai(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT CASE
      WHEN plan = 'free' THEN (SELECT public.get_user_ai_generation_count_this_month($1)) < 3
      WHEN plan = 'pro' THEN (SELECT public.get_user_ai_generation_count_this_month($1)) < 30
      ELSE true -- business: unlimited
    END
    FROM public.profiles
    WHERE id = $1
  );
END;
$$ LANGUAGE plpgsql STABLE;
