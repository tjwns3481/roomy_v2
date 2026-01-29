-- @TASK P0-T0.4 - Roomy Core DB 스키마 생성
-- @SPEC docs/planning/04-database-design.md

-- ============================================================================
-- 1. profiles 테이블 (auth.users 확장)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,

  -- Roomy 전용 필드: 플랜 및 제한
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  guidebook_count INT DEFAULT 0,
  max_guidebooks INT DEFAULT 1, -- free: 1, pro: 5, business: unlimited(-1)
  ai_generation_count INT DEFAULT 0,
  max_ai_generations INT DEFAULT 3, -- free: 3/month, pro: 30/month, business: unlimited

  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- profiles 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================================================
-- 2. guidebooks 테이블
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.guidebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 기본 정보
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- /g/[slug]로 접근
  description TEXT,

  -- 숙소 정보
  airbnb_url TEXT, -- AI 생성 시 원본 URL
  property_type TEXT, -- apartment, house, pension, etc.
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- 상태 및 설정
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_password_protected BOOLEAN DEFAULT FALSE,
  password_hash TEXT, -- bcrypt 해시

  -- 테마
  theme TEXT DEFAULT 'modern' CHECK (theme IN ('modern', 'cozy', 'minimal', 'nature', 'luxury')),
  primary_color TEXT DEFAULT '#2563EB',
  secondary_color TEXT DEFAULT '#F97316',

  -- 이미지
  hero_image_url TEXT,
  og_image_url TEXT, -- 소셜 공유용

  -- 통계
  view_count INT DEFAULT 0,

  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- guidebooks 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_guidebooks_slug ON public.guidebooks(slug);
CREATE INDEX IF NOT EXISTS idx_guidebooks_user_id ON public.guidebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_guidebooks_status ON public.guidebooks(status);

-- ============================================================================
-- 3. blocks 테이블
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guidebook_id UUID NOT NULL REFERENCES public.guidebooks(id) ON DELETE CASCADE,

  -- 블록 타입 (8종)
  type TEXT NOT NULL CHECK (type IN (
    'hero',      -- 히어로 섹션
    'quickInfo', -- 체크인/와이파이/도어락 등
    'amenities', -- 편의시설
    'rules',     -- 이용 규칙
    'map',       -- 지도
    'gallery',   -- 갤러리
    'notice',    -- 공지사항
    'custom'     -- 커스텀 섹션
  )),

  -- 순서
  order_index INT NOT NULL DEFAULT 0,

  -- 콘텐츠 (블록별 JSON 구조)
  content JSONB NOT NULL DEFAULT '{}',

  -- 상태
  is_visible BOOLEAN DEFAULT TRUE,

  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- blocks 인덱스
CREATE INDEX IF NOT EXISTS idx_blocks_guidebook_order ON public.blocks(guidebook_id, order_index);
CREATE INDEX IF NOT EXISTS idx_blocks_type ON public.blocks(type);

-- ============================================================================
-- 4. block_images 테이블
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.block_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,

  -- 이미지 정보
  storage_path TEXT NOT NULL, -- Supabase Storage 경로
  file_name TEXT,
  file_size INT,
  mime_type TEXT,

  -- 메타
  alt_text TEXT,
  caption TEXT,
  order_index INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- block_images 인덱스
CREATE INDEX IF NOT EXISTS idx_block_images_block_order ON public.block_images(block_id, order_index);

-- ============================================================================
-- 5. Trigger: updated_at 자동 업데이트
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles 트리거
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- guidebooks 트리거
DROP TRIGGER IF EXISTS update_guidebooks_updated_at ON public.guidebooks;
CREATE TRIGGER update_guidebooks_updated_at
  BEFORE UPDATE ON public.guidebooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- blocks 트리거
DROP TRIGGER IF EXISTS update_blocks_updated_at ON public.blocks;
CREATE TRIGGER update_blocks_updated_at
  BEFORE UPDATE ON public.blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. RLS (Row Level Security) 정책
-- ============================================================================

-- profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- guidebooks RLS
ALTER TABLE public.guidebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY guidebooks_select_own ON public.guidebooks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY guidebooks_select_published ON public.guidebooks
  FOR SELECT USING (status = 'published');

CREATE POLICY guidebooks_insert_own ON public.guidebooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY guidebooks_update_own ON public.guidebooks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY guidebooks_delete_own ON public.guidebooks
  FOR DELETE USING (auth.uid() = user_id);

-- blocks RLS
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY blocks_select_own_guidebook ON public.blocks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.guidebooks WHERE id = guidebook_id AND user_id = auth.uid())
  );

CREATE POLICY blocks_select_published_guidebook ON public.blocks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.guidebooks WHERE id = guidebook_id AND status = 'published')
  );

CREATE POLICY blocks_insert_own_guidebook ON public.blocks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.guidebooks WHERE id = guidebook_id AND user_id = auth.uid())
  );

CREATE POLICY blocks_update_own_guidebook ON public.blocks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.guidebooks WHERE id = guidebook_id AND user_id = auth.uid())
  );

CREATE POLICY blocks_delete_own_guidebook ON public.blocks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.guidebooks WHERE id = guidebook_id AND user_id = auth.uid())
  );

-- block_images RLS
ALTER TABLE public.block_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY block_images_select_own ON public.block_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blocks b
      JOIN public.guidebooks g ON b.guidebook_id = g.id
      WHERE b.id = block_id AND g.user_id = auth.uid()
    )
  );

CREATE POLICY block_images_select_published ON public.block_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blocks b
      JOIN public.guidebooks g ON b.guidebook_id = g.id
      WHERE b.id = block_id AND g.status = 'published'
    )
  );

CREATE POLICY block_images_insert_own ON public.block_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.blocks b
      JOIN public.guidebooks g ON b.guidebook_id = g.id
      WHERE b.id = block_id AND g.user_id = auth.uid()
    )
  );

CREATE POLICY block_images_update_own ON public.block_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.blocks b
      JOIN public.guidebooks g ON b.guidebook_id = g.id
      WHERE b.id = block_id AND g.user_id = auth.uid()
    )
  );

CREATE POLICY block_images_delete_own ON public.block_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.blocks b
      JOIN public.guidebooks g ON b.guidebook_id = g.id
      WHERE b.id = block_id AND g.user_id = auth.uid()
    )
  );
