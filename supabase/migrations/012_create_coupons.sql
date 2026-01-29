-- =====================================================
-- Migration: 012_create_coupons.sql
-- Description: 쿠폰/할인 시스템 테이블 생성
-- Author: database-specialist
-- Date: 2026-01-25
-- =====================================================

-- =====================================================
-- 1. coupons 테이블 생성
-- =====================================================

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percent', 'fixed', 'free_shipping')),
  value INTEGER NOT NULL CHECK (value > 0),
  min_order_amount INTEGER DEFAULT 0 NOT NULL CHECK (min_order_amount >= 0),
  max_discount INTEGER CHECK (max_discount IS NULL OR max_discount > 0),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
  usage_limit_per_user INTEGER DEFAULT 1 NOT NULL CHECK (usage_limit_per_user > 0),
  used_count INTEGER DEFAULT 0 NOT NULL CHECK (used_count >= 0),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- 시작일이 종료일보다 앞서야 함
  CONSTRAINT coupons_date_check CHECK (start_at < end_at),

  -- 사용 횟수가 제한을 초과할 수 없음
  CONSTRAINT coupons_usage_count_check CHECK (usage_limit IS NULL OR used_count <= usage_limit)
);

-- =====================================================
-- 2. user_coupons 테이블 생성
-- =====================================================

CREATE TABLE IF NOT EXISTS user_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT false NOT NULL,
  used_at TIMESTAMPTZ,

  -- 사용된 쿠폰은 used_at이 NULL이 아니어야 함
  CONSTRAINT user_coupons_used_check CHECK (
    (is_used = false AND used_at IS NULL) OR
    (is_used = true AND used_at IS NOT NULL)
  )
);

-- =====================================================
-- 3. coupon_usages 테이블 생성
-- =====================================================

CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount INTEGER NOT NULL CHECK (discount_amount > 0),
  used_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 4. coupons 인덱스 생성
-- =====================================================

-- 쿠폰 코드 조회 (유니크 제약으로 자동 생성되지만 명시적으로 생성)
CREATE INDEX idx_coupons_code ON coupons(code);

-- 활성 쿠폰 조회
CREATE INDEX idx_coupons_is_active ON coupons(is_active) WHERE is_active = true;

-- 기간별 쿠폰 조회
CREATE INDEX idx_coupons_dates ON coupons(start_at, end_at);

-- 쿠폰 타입별 조회
CREATE INDEX idx_coupons_type ON coupons(type);

-- 생성일 정렬
CREATE INDEX idx_coupons_created_at ON coupons(created_at DESC);

-- =====================================================
-- 5. user_coupons 인덱스 생성
-- =====================================================

-- 사용자별 쿠폰 조회
CREATE INDEX idx_user_coupons_user_id ON user_coupons(user_id);

-- 쿠폰별 사용자 조회
CREATE INDEX idx_user_coupons_coupon_id ON user_coupons(coupon_id);

-- 만료일 조회 (만료 임박 쿠폰)
CREATE INDEX idx_user_coupons_expires_at ON user_coupons(expires_at);

-- 미사용 쿠폰 조회
CREATE INDEX idx_user_coupons_is_used ON user_coupons(user_id, is_used) WHERE is_used = false;

-- 발급일 정렬
CREATE INDEX idx_user_coupons_issued_at ON user_coupons(issued_at DESC);

-- =====================================================
-- 6. coupon_usages 인덱스 생성
-- =====================================================

-- 쿠폰별 사용 이력 조회
CREATE INDEX idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);

-- 사용자별 사용 이력 조회
CREATE INDEX idx_coupon_usages_user_id ON coupon_usages(user_id);

-- 주문별 사용 쿠폰 조회
CREATE INDEX idx_coupon_usages_order_id ON coupon_usages(order_id);

-- 사용일 정렬
CREATE INDEX idx_coupon_usages_used_at ON coupon_usages(used_at DESC);

-- 사용자별 쿠폰 사용 횟수 조회 (중복 사용 체크)
CREATE INDEX idx_coupon_usages_user_coupon ON coupon_usages(user_id, coupon_id);

-- =====================================================
-- 7. updated_at 자동 갱신 트리거 (coupons)
-- =====================================================

CREATE TRIGGER set_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. 쿠폰 사용 카운트 자동 증가 트리거
-- =====================================================

CREATE OR REPLACE FUNCTION increment_coupon_used_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 쿠폰 사용 횟수 증가
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE id = NEW.coupon_id;

  -- user_coupons에서 사용 처리 (첫 번째 미사용 쿠폰만)
  UPDATE user_coupons
  SET is_used = true, used_at = NEW.used_at
  WHERE id = (
    SELECT id
    FROM user_coupons
    WHERE user_id = NEW.user_id
    AND coupon_id = NEW.coupon_id
    AND is_used = false
    ORDER BY issued_at ASC
    LIMIT 1
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_coupon_usage_insert
  AFTER INSERT ON coupon_usages
  FOR EACH ROW
  EXECUTE FUNCTION increment_coupon_used_count();

-- =====================================================
-- 9. 쿠폰 유효성 검증 함수
-- =====================================================

-- 쿠폰 사용 가능 여부 확인
CREATE OR REPLACE FUNCTION validate_coupon(
  p_coupon_code VARCHAR(50),
  p_user_id UUID,
  p_order_amount INTEGER
)
RETURNS TABLE (
  is_valid BOOLEAN,
  error_message TEXT,
  discount_amount INTEGER,
  coupon_id UUID
) AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
  v_user_usage_count INTEGER;
  v_user_coupon_count INTEGER;
  v_discount INTEGER;
BEGIN
  -- 1. 쿠폰 존재 및 활성화 확인
  SELECT * INTO v_coupon
  FROM coupons
  WHERE code = p_coupon_code;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, '유효하지 않은 쿠폰 코드입니다.'::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  IF v_coupon.is_active = false THEN
    RETURN QUERY SELECT false, '비활성화된 쿠폰입니다.'::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  -- 2. 기간 확인
  IF NOW() < v_coupon.start_at THEN
    RETURN QUERY SELECT false, '쿠폰 사용 기간이 아직 시작되지 않았습니다.'::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  IF NOW() > v_coupon.end_at THEN
    RETURN QUERY SELECT false, '쿠폰 사용 기간이 만료되었습니다.'::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  -- 3. 전체 사용 횟수 확인
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
    RETURN QUERY SELECT false, '쿠폰 사용 가능 횟수가 모두 소진되었습니다.'::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  -- 4. 사용자별 사용 횟수 확인
  SELECT COUNT(*) INTO v_user_usage_count
  FROM coupon_usages
  WHERE coupon_id = v_coupon.id
  AND user_id = p_user_id;

  IF v_user_usage_count >= v_coupon.usage_limit_per_user THEN
    RETURN QUERY SELECT false, '이미 사용한 쿠폰입니다.'::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  -- 5. 사용자가 해당 쿠폰을 보유하고 있는지 확인
  SELECT COUNT(*) INTO v_user_coupon_count
  FROM user_coupons
  WHERE coupon_id = v_coupon.id
  AND user_id = p_user_id
  AND is_used = false
  AND expires_at > NOW();

  IF v_user_coupon_count = 0 THEN
    RETURN QUERY SELECT false, '보유하지 않은 쿠폰이거나 만료된 쿠폰입니다.'::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  -- 6. 최소 주문금액 확인
  IF p_order_amount < v_coupon.min_order_amount THEN
    RETURN QUERY SELECT
      false,
      FORMAT('최소 주문금액 %s원 이상부터 사용 가능합니다.', v_coupon.min_order_amount)::TEXT,
      0,
      NULL::UUID;
    RETURN;
  END IF;

  -- 7. 할인 금액 계산
  IF v_coupon.type = 'percent' THEN
    v_discount := FLOOR(p_order_amount * v_coupon.value / 100.0);
    IF v_coupon.max_discount IS NOT NULL THEN
      v_discount := LEAST(v_discount, v_coupon.max_discount);
    END IF;
  ELSIF v_coupon.type = 'fixed' THEN
    v_discount := LEAST(v_coupon.value, p_order_amount);
  ELSIF v_coupon.type = 'free_shipping' THEN
    v_discount := 0; -- 배송비는 별도 처리
  END IF;

  -- 8. 유효한 쿠폰
  RETURN QUERY SELECT true, NULL::TEXT, v_discount, v_coupon.id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. 쿠폰 코드 자동 생성 함수
-- =====================================================

CREATE OR REPLACE FUNCTION generate_coupon_code(length INTEGER DEFAULT 10)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 혼동 가능한 문자 제외 (I, O, 0, 1)
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
  END LOOP;

  -- 중복 체크
  WHILE EXISTS (SELECT 1 FROM coupons WHERE code = result) LOOP
    result := '';
    FOR i IN 1..length LOOP
      result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
    END LOOP;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. RLS 정책 - coupons
-- =====================================================

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- 활성 쿠폰은 누구나 조회 (기간 내)
CREATE POLICY "Anyone can view active coupons"
ON coupons FOR SELECT
USING (
  is_active = true
  AND start_at <= NOW()
  AND end_at >= NOW()
);

-- 관리자는 모든 쿠폰 관리 (CRUD)
CREATE POLICY "Admins can manage all coupons"
ON coupons FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 12. RLS 정책 - user_coupons
-- =====================================================

ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

-- 본인 보유 쿠폰만 조회
CREATE POLICY "Users can view own coupons"
ON user_coupons FOR SELECT
USING (auth.uid() = user_id);

-- 관리자는 모든 사용자 쿠폰 조회
CREATE POLICY "Admins can view all user coupons"
ON user_coupons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 관리자만 쿠폰 발급 (INSERT)
CREATE POLICY "Admins can issue coupons"
ON user_coupons FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 관리자만 쿠폰 수정/삭제
CREATE POLICY "Admins can manage user coupons"
ON user_coupons FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete user coupons"
ON user_coupons FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 13. RLS 정책 - coupon_usages
-- =====================================================

ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;

-- 본인 사용 이력만 조회
CREATE POLICY "Users can view own coupon usages"
ON coupon_usages FOR SELECT
USING (auth.uid() = user_id);

-- 관리자는 모든 사용 이력 조회
CREATE POLICY "Admins can view all coupon usages"
ON coupon_usages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 쿠폰 사용 기록은 시스템/관리자만 생성 가능
CREATE POLICY "System can create coupon usage"
ON coupon_usages FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 14. 코멘트
-- =====================================================

COMMENT ON TABLE coupons IS '쿠폰 정보 테이블';
COMMENT ON COLUMN coupons.code IS '쿠폰 코드 (유니크)';
COMMENT ON COLUMN coupons.type IS '쿠폰 타입: percent(정률), fixed(정액), free_shipping(무료배송)';
COMMENT ON COLUMN coupons.value IS '할인값 (percent: %, fixed: 원)';
COMMENT ON COLUMN coupons.min_order_amount IS '최소 주문금액';
COMMENT ON COLUMN coupons.max_discount IS '최대 할인금액 (정률 할인 시)';
COMMENT ON COLUMN coupons.usage_limit IS '전체 사용 가능 횟수 (NULL = 무제한)';
COMMENT ON COLUMN coupons.usage_limit_per_user IS '1인당 사용 가능 횟수';
COMMENT ON COLUMN coupons.used_count IS '현재까지 사용된 횟수';

COMMENT ON TABLE user_coupons IS '사용자 보유 쿠폰 테이블';
COMMENT ON COLUMN user_coupons.issued_at IS '쿠폰 발급일';
COMMENT ON COLUMN user_coupons.expires_at IS '쿠폰 만료일';

COMMENT ON TABLE coupon_usages IS '쿠폰 사용 이력 테이블';
COMMENT ON COLUMN coupon_usages.discount_amount IS '실제 할인된 금액';

-- =====================================================
-- End of Migration
-- =====================================================
