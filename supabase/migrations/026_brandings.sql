-- @TASK P8-R2: Brandings Table Migration
-- @SPEC specs/domain/resources.yaml - branding resource
-- @DESCRIPTION 가이드북 커스텀 브랜딩 설정 (로고, 색상, 폰트)
-- @PLAN_REQUIREMENT Pro+ 플랜만 브랜딩 설정 가능

-- ==========================================
-- ENUM: Font Presets
-- ==========================================
DO $$ BEGIN
  CREATE TYPE font_preset AS ENUM (
    'pretendard',
    'noto_sans',
    'nanum_gothic',
    'gmarket_sans',
    'spoqa_han_sans'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ==========================================
-- TABLE: brandings
-- ==========================================
CREATE TABLE IF NOT EXISTS brandings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guidebook_id UUID NOT NULL UNIQUE REFERENCES guidebooks(id) ON DELETE CASCADE,

  -- 브랜딩 설정
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT CHECK (primary_color IS NULL OR primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color TEXT CHECK (secondary_color IS NULL OR secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  font_preset font_preset DEFAULT 'pretendard',
  custom_css TEXT, -- Business 플랜 전용

  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- INDEX: 성능 최적화
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_brandings_guidebook_id ON brandings(guidebook_id);

-- ==========================================
-- RLS: Row Level Security
-- ==========================================
ALTER TABLE brandings ENABLE ROW LEVEL SECURITY;

-- 소유자만 브랜딩 조회 가능
DROP POLICY IF EXISTS "Users can view their own branding" ON brandings;
CREATE POLICY "Users can view their own branding" ON brandings
  FOR SELECT
  USING (
    guidebook_id IN (
      SELECT id FROM guidebooks WHERE user_id = auth.uid()
    )
  );

-- 소유자만 브랜딩 생성/수정 가능 (Pro+ 플랜)
DROP POLICY IF EXISTS "Pro+ users can upsert their own branding" ON brandings;
CREATE POLICY "Pro+ users can upsert their own branding" ON brandings
  FOR ALL
  USING (
    guidebook_id IN (
      SELECT g.id
      FROM guidebooks g
      JOIN users u ON u.id = g.user_id
      WHERE g.user_id = auth.uid()
        AND u.plan IN ('pro', 'business')
    )
  )
  WITH CHECK (
    guidebook_id IN (
      SELECT g.id
      FROM guidebooks g
      JOIN users u ON u.id = g.user_id
      WHERE g.user_id = auth.uid()
        AND u.plan IN ('pro', 'business')
    )
  );

-- ==========================================
-- TRIGGER: Auto Update Timestamp
-- ==========================================
DROP TRIGGER IF EXISTS set_brandings_updated_at ON brandings;
CREATE TRIGGER set_brandings_updated_at
  BEFORE UPDATE ON brandings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- HELPER FUNCTION: 브랜딩 사용 가능 여부 확인
-- ==========================================
CREATE OR REPLACE FUNCTION can_use_branding(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
BEGIN
  SELECT plan INTO user_plan FROM users WHERE id = p_user_id;
  RETURN user_plan IN ('pro', 'business');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- COMMENT: 테이블 및 컬럼 설명
-- ==========================================
COMMENT ON TABLE brandings IS '가이드북 커스텀 브랜딩 설정 (Pro+ 플랜 전용)';
COMMENT ON COLUMN brandings.logo_url IS '브랜드 로고 이미지 URL';
COMMENT ON COLUMN brandings.favicon_url IS '파비콘 URL';
COMMENT ON COLUMN brandings.primary_color IS '주 색상 (HEX 형식, 예: #1E40AF)';
COMMENT ON COLUMN brandings.secondary_color IS '보조 색상 (HEX 형식)';
COMMENT ON COLUMN brandings.font_preset IS '폰트 프리셋 (pretendard, noto_sans 등)';
COMMENT ON COLUMN brandings.custom_css IS '커스텀 CSS (Business 플랜 전용)';
