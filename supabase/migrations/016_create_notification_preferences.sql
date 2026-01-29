-- @TASK P4-T4.6 - 알림 설정 테이블 및 avatars 버킷 생성
-- @SPEC docs/planning/06-tasks.md#P4-T4.6

-- ==========================================
-- notification_preferences 테이블
-- ==========================================

-- 기존 테이블 삭제 (멱등성)
DROP TABLE IF EXISTS public.notification_preferences;

-- 알림 설정 테이블 생성
CREATE TABLE public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dailyStats BOOLEAN DEFAULT TRUE,
  newFeatures BOOLEAN DEFAULT TRUE,
  marketing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- RLS 활성화
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 본인의 알림 설정만 조회 가능
DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: 본인의 알림 설정만 업데이트 가능
DROP POLICY IF EXISTS "Users can update own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS 정책: 본인의 알림 설정만 삽입 가능
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- avatars Storage 버킷
-- ==========================================

-- avatars 버킷 생성 (이미 존재하면 무시)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS 정책: 모든 사용자가 아바타 조회 가능
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Storage RLS 정책: 본인의 아바타만 업로드 가능
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS 정책: 본인의 아바타만 업데이트 가능
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS 정책: 본인의 아바타만 삭제 가능
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ==========================================
-- 완료 메시지
-- ==========================================

COMMENT ON TABLE public.notification_preferences IS 'P4-T4.6: 사용자 알림 설정 테이블';
