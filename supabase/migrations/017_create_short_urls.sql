-- @TASK P5-T5.4 - 단축 URL 테이블 및 RPC 함수
-- @SPEC docs/planning/06-tasks.md#P5-T5.4

-- ============================================================
-- 1. short_urls 테이블 생성
-- ============================================================

CREATE TABLE IF NOT EXISTS short_urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guidebook_id UUID NOT NULL REFERENCES guidebooks(id) ON DELETE CASCADE,
    short_code VARCHAR(10) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ,
    clicks INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_short_urls_short_code ON short_urls(short_code);
CREATE INDEX IF NOT EXISTS idx_short_urls_guidebook_id ON short_urls(guidebook_id);
CREATE INDEX IF NOT EXISTS idx_short_urls_expires_at ON short_urls(expires_at) WHERE expires_at IS NOT NULL;

-- updated_at 트리거
CREATE OR REPLACE TRIGGER update_short_urls_updated_at
    BEFORE UPDATE ON short_urls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. RLS 정책
-- ============================================================

ALTER TABLE short_urls ENABLE ROW LEVEL SECURITY;

-- 공개 조회: 단축 코드로 조회 (리다이렉트용)
CREATE POLICY "short_urls_public_select" ON short_urls
    FOR SELECT
    USING (true);

-- 소유자 관리: 자신의 가이드북에 대한 단축 URL만 관리
CREATE POLICY "short_urls_owner_insert" ON short_urls
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM guidebooks
            WHERE guidebooks.id = guidebook_id
            AND guidebooks.user_id = auth.uid()
        )
    );

CREATE POLICY "short_urls_owner_update" ON short_urls
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM guidebooks
            WHERE guidebooks.id = guidebook_id
            AND guidebooks.user_id = auth.uid()
        )
    );

CREATE POLICY "short_urls_owner_delete" ON short_urls
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM guidebooks
            WHERE guidebooks.id = guidebook_id
            AND guidebooks.user_id = auth.uid()
        )
    );

-- ============================================================
-- 3. RPC 함수: 클릭 수 증가
-- ============================================================

CREATE OR REPLACE FUNCTION increment_short_url_clicks(p_code VARCHAR)
RETURNS TABLE (
    guidebook_slug TEXT,
    is_expired BOOLEAN
) AS $$
DECLARE
    v_guidebook_id UUID;
    v_expires_at TIMESTAMPTZ;
    v_is_active BOOLEAN;
    v_slug TEXT;
BEGIN
    -- 단축 URL 정보 조회 및 클릭 수 증가
    UPDATE short_urls
    SET clicks = clicks + 1,
        updated_at = NOW()
    WHERE short_code = p_code
    RETURNING guidebook_id, expires_at, is_active
    INTO v_guidebook_id, v_expires_at, v_is_active;

    -- 존재하지 않는 코드
    IF v_guidebook_id IS NULL THEN
        RETURN QUERY SELECT NULL::TEXT, NULL::BOOLEAN;
        RETURN;
    END IF;

    -- 비활성화된 링크
    IF NOT v_is_active THEN
        RETURN QUERY SELECT NULL::TEXT, true;
        RETURN;
    END IF;

    -- 만료 체크
    IF v_expires_at IS NOT NULL AND v_expires_at < NOW() THEN
        RETURN QUERY SELECT NULL::TEXT, true;
        RETURN;
    END IF;

    -- 가이드북 slug 조회
    SELECT slug INTO v_slug
    FROM guidebooks
    WHERE id = v_guidebook_id
    AND status = 'published';

    -- 가이드북이 없거나 미공개
    IF v_slug IS NULL THEN
        RETURN QUERY SELECT NULL::TEXT, NULL::BOOLEAN;
        RETURN;
    END IF;

    RETURN QUERY SELECT v_slug, false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. 단축 코드 생성 함수
-- ============================================================

CREATE OR REPLACE FUNCTION generate_short_code(p_length INTEGER DEFAULT 6)
RETURNS VARCHAR AS $$
DECLARE
    v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    v_code VARCHAR := '';
    v_i INTEGER;
BEGIN
    FOR v_i IN 1..p_length LOOP
        v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    END LOOP;
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 5. 단축 URL 생성 헬퍼 함수
-- ============================================================

CREATE OR REPLACE FUNCTION create_short_url(
    p_guidebook_id UUID,
    p_expires_in_days INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    short_code VARCHAR,
    expires_at TIMESTAMPTZ
) AS $$
DECLARE
    v_code VARCHAR;
    v_expires TIMESTAMPTZ;
    v_id UUID;
BEGIN
    -- 고유한 단축 코드 생성
    LOOP
        v_code := generate_short_code(6);
        EXIT WHEN NOT EXISTS (SELECT 1 FROM short_urls WHERE short_urls.short_code = v_code);
    END LOOP;

    -- 만료일 계산
    IF p_expires_in_days IS NOT NULL THEN
        v_expires := NOW() + (p_expires_in_days || ' days')::INTERVAL;
    END IF;

    -- 삽입
    INSERT INTO short_urls (guidebook_id, short_code, expires_at)
    VALUES (p_guidebook_id, v_code, v_expires)
    RETURNING short_urls.id, short_urls.short_code, short_urls.expires_at
    INTO v_id, v_code, v_expires;

    RETURN QUERY SELECT v_id, v_code, v_expires;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 완료 메시지
-- ============================================================

COMMENT ON TABLE short_urls IS 'P5-T5.4: 단축 URL 테이블 - 가이드북 공유용 단축 링크 관리';
COMMENT ON FUNCTION increment_short_url_clicks IS 'P5-T5.4: 단축 URL 클릭 수 증가 및 리다이렉트 정보 반환';
COMMENT ON FUNCTION generate_short_code IS 'P5-T5.4: 단축 코드 생성 (충돌 방지 문자셋)';
COMMENT ON FUNCTION create_short_url IS 'P5-T5.4: 단축 URL 생성 헬퍼';
