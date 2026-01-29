-- @TASK P6-T6.1 - 구독 및 결제 테이블 생성
-- @SPEC docs/planning/04-database-design.md#subscriptions

-- ============================================================
-- 1. subscriptions 테이블 생성
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    payment_provider TEXT,  -- 'toss'
    payment_customer_id TEXT,  -- Toss 고객 ID
    payment_subscription_id TEXT,  -- Toss 구독 ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_customer_id ON subscriptions(payment_customer_id) WHERE payment_customer_id IS NOT NULL;

-- updated_at 트리거
CREATE OR REPLACE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. payment_history 테이블 생성
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,  -- 원 단위
    currency TEXT DEFAULT 'KRW',
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    payment_method TEXT,  -- 'card', 'bank_transfer'
    payment_key TEXT,  -- Toss 결제 키
    order_id TEXT UNIQUE,  -- 주문 번호
    receipt_url TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_order_id ON payment_history(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at DESC);

-- ============================================================
-- 3. plan_limits 테이블 생성
-- ============================================================

CREATE TABLE IF NOT EXISTS plan_limits (
    plan TEXT PRIMARY KEY,
    max_guidebooks INTEGER,
    max_ai_generations_per_month INTEGER,
    watermark_removed BOOLEAN DEFAULT FALSE,
    custom_domain BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    price_yearly INTEGER,  -- 연간 가격 (원)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 데이터 삽입 (중복 무시)
INSERT INTO plan_limits (plan, max_guidebooks, max_ai_generations_per_month, watermark_removed, custom_domain, priority_support, price_yearly)
VALUES
    ('free', 1, 3, FALSE, FALSE, FALSE, 0),
    ('pro', 5, 30, TRUE, FALSE, FALSE, 49000),
    ('business', -1, -1, TRUE, TRUE, TRUE, 99000)
ON CONFLICT (plan) DO NOTHING;

-- ============================================================
-- 4. RLS 정책
-- ============================================================

-- subscriptions RLS 활성화
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- subscriptions: 본인 구독 정보만 조회/수정
CREATE POLICY "subscriptions_select_own" ON subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own" ON subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own" ON subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_delete_own" ON subscriptions
    FOR DELETE
    USING (auth.uid() = user_id);

-- payment_history RLS 활성화
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- payment_history: 본인 결제 내역만 조회
CREATE POLICY "payment_history_select_own" ON payment_history
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "payment_history_insert_own" ON payment_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- plan_limits: 모든 사용자 조회 가능 (쓰기는 금지)
ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_limits_select_public" ON plan_limits
    FOR SELECT
    USING (true);

-- ============================================================
-- 5. Helper 함수들
-- ============================================================

-- 사용자 플랜 조회
CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_plan TEXT;
BEGIN
    SELECT plan INTO v_plan
    FROM subscriptions
    WHERE user_id = p_user_id;

    -- 구독이 없으면 'free' 반환
    RETURN COALESCE(v_plan, 'free');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 플랜 제한 조회
CREATE OR REPLACE FUNCTION get_plan_limits(p_plan TEXT)
RETURNS TABLE (
    plan TEXT,
    max_guidebooks INTEGER,
    max_ai_generations_per_month INTEGER,
    watermark_removed BOOLEAN,
    custom_domain BOOLEAN,
    priority_support BOOLEAN,
    price_yearly INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        plan_limits.plan,
        plan_limits.max_guidebooks,
        plan_limits.max_ai_generations_per_month,
        plan_limits.watermark_removed,
        plan_limits.custom_domain,
        plan_limits.priority_support,
        plan_limits.price_yearly
    FROM plan_limits
    WHERE plan_limits.plan = p_plan;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 구독 상태 확인
CREATE OR REPLACE FUNCTION is_subscription_active(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_active BOOLEAN;
BEGIN
    SELECT (
        status = 'active'
        AND (current_period_end IS NULL OR current_period_end > NOW())
    ) INTO v_is_active
    FROM subscriptions
    WHERE user_id = p_user_id;

    RETURN COALESCE(v_is_active, FALSE);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 사용자 플랜 제한 조회 (Helper)
CREATE OR REPLACE FUNCTION get_user_plan_limits(p_user_id UUID)
RETURNS TABLE (
    plan TEXT,
    max_guidebooks INTEGER,
    max_ai_generations_per_month INTEGER,
    watermark_removed BOOLEAN,
    custom_domain BOOLEAN,
    priority_support BOOLEAN,
    price_yearly INTEGER
) AS $$
DECLARE
    v_plan TEXT;
BEGIN
    v_plan := get_user_plan(p_user_id);
    RETURN QUERY
    SELECT * FROM get_plan_limits(v_plan);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 결제 내역 생성 (Service Role용)
CREATE OR REPLACE FUNCTION create_payment_record(
    p_subscription_id UUID,
    p_user_id UUID,
    p_amount INTEGER,
    p_payment_method TEXT,
    p_payment_key TEXT,
    p_order_id TEXT,
    p_receipt_url TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ
) AS $$
DECLARE
    v_id UUID;
    v_created_at TIMESTAMPTZ;
BEGIN
    INSERT INTO payment_history (
        subscription_id,
        user_id,
        amount,
        currency,
        status,
        payment_method,
        payment_key,
        order_id,
        receipt_url,
        paid_at
    )
    VALUES (
        p_subscription_id,
        p_user_id,
        p_amount,
        'KRW',
        'pending',
        p_payment_method,
        p_payment_key,
        p_order_id,
        p_receipt_url,
        NOW()
    )
    RETURNING payment_history.id, payment_history.created_at
    INTO v_id, v_created_at;

    RETURN QUERY SELECT v_id, v_created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 결제 상태 업데이트 (Service Role용)
CREATE OR REPLACE FUNCTION update_payment_status(
    p_payment_id UUID,
    p_status TEXT,
    p_receipt_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE payment_history
    SET status = p_status,
        receipt_url = COALESCE(p_receipt_url, receipt_url)
    WHERE id = p_payment_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 구독 상태 업데이트 (Service Role용)
CREATE OR REPLACE FUNCTION update_subscription_from_payment(
    p_user_id UUID,
    p_plan TEXT,
    p_payment_provider TEXT,
    p_payment_customer_id TEXT,
    p_payment_subscription_id TEXT,
    p_period_start TIMESTAMPTZ,
    p_period_end TIMESTAMPTZ
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    plan TEXT,
    status TEXT
) AS $$
BEGIN
    INSERT INTO subscriptions (
        user_id,
        plan,
        status,
        payment_provider,
        payment_customer_id,
        payment_subscription_id,
        current_period_start,
        current_period_end
    )
    VALUES (
        p_user_id,
        p_plan,
        'active',
        p_payment_provider,
        p_payment_customer_id,
        p_payment_subscription_id,
        p_period_start,
        p_period_end
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
        plan = EXCLUDED.plan,
        status = 'active',
        payment_provider = EXCLUDED.payment_provider,
        payment_customer_id = EXCLUDED.payment_customer_id,
        payment_subscription_id = EXCLUDED.payment_subscription_id,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW()
    RETURNING subscriptions.id, subscriptions.user_id, subscriptions.plan, subscriptions.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. 주석 추가
-- ============================================================

COMMENT ON TABLE subscriptions IS 'P6-T6.1: 구독 정보 - 사용자의 구독 플랜 및 기간 관리';
COMMENT ON TABLE payment_history IS 'P6-T6.1: 결제 이력 - 결제 거래 기록 및 영수증 관리';
COMMENT ON TABLE plan_limits IS 'P6-T6.1: 플랜 제한 - 구독 플랜별 기능 제한 정의';

COMMENT ON FUNCTION get_user_plan IS 'P6-T6.1: 사용자의 현재 구독 플랜 조회 (기본값: free)';
COMMENT ON FUNCTION get_plan_limits IS 'P6-T6.1: 특정 플랜의 제한 사항 조회';
COMMENT ON FUNCTION is_subscription_active IS 'P6-T6.1: 사용자의 유효한 구독 여부 확인';
COMMENT ON FUNCTION get_user_plan_limits IS 'P6-T6.1: 사용자 플랜의 제한 사항 조회 (Helper)';
COMMENT ON FUNCTION create_payment_record IS 'P6-T6.1: 결제 기록 생성 (Toss 결제 후 호출)';
COMMENT ON FUNCTION update_payment_status IS 'P6-T6.1: 결제 상태 업데이트 (성공/실패/환불)';
COMMENT ON FUNCTION update_subscription_from_payment IS 'P6-T6.1: 결제 완료 후 구독 정보 업데이트';
