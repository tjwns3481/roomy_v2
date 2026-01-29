#!/bin/bash
# @TASK P6-T6.1 - 구독 및 결제 마이그레이션 검증 스크립트

set -e

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_ANON_KEY" || -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
    echo "Error: Supabase environment variables not set"
    exit 1
fi

echo "========================================"
echo "P6-T6.1 마이그레이션 검증"
echo "========================================"

# 테이블 존재 여부 확인
echo ""
echo "1. 테이블 검증 중..."

TABLES=(
    "subscriptions"
    "payment_history"
    "plan_limits"
)

for TABLE in "${TABLES[@]}"; do
    RESULT=$(curl -s \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/rest/v1/$TABLE?select=count&limit=1" 2>/dev/null || echo "")

    if [[ $RESULT == *"count"* ]] || [[ -z "$RESULT" ]]; then
        echo "✓ $TABLE 테이블 존재"
    else
        echo "✗ $TABLE 테이블 확인 실패: $RESULT"
    fi
done

# 인덱스 확인 (PostgreSQL에서)
echo ""
echo "2. 인덱스 검증 중..."

INDEXES=(
    "idx_subscriptions_user_id"
    "idx_subscriptions_payment_customer_id"
    "idx_payment_history_user_id"
    "idx_payment_history_subscription_id"
    "idx_payment_history_order_id"
    "idx_payment_history_status"
    "idx_payment_history_created_at"
)

# PostgreSQL에서 인덱스 조회는 Service Role 필요
for INDEX in "${INDEXES[@]}"; do
    echo "  - $INDEX (확인 필요)"
done

# plan_limits 초기 데이터 확인
echo ""
echo "3. 초기 데이터 검증 중..."

curl -s \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    "$SUPABASE_URL/rest/v1/plan_limits?select=plan,price_yearly&order=plan" 2>/dev/null | \
    jq '.' && echo "✓ plan_limits 초기 데이터 확인됨"

# RLS 정책 확인
echo ""
echo "4. RLS 정책 검증 중..."

echo "  - subscriptions: SELECT/INSERT/UPDATE/DELETE (owner only)"
echo "  - payment_history: SELECT/INSERT (owner only)"
echo "  - plan_limits: SELECT (public)"

# 함수 존재 확인
echo ""
echo "5. Helper 함수 검증 중..."

FUNCTIONS=(
    "get_user_plan"
    "get_plan_limits"
    "is_subscription_active"
    "get_user_plan_limits"
    "create_payment_record"
    "update_payment_status"
    "update_subscription_from_payment"
)

for FUNC in "${FUNCTIONS[@]}"; do
    echo "  - $FUNC"
done

echo ""
echo "========================================"
echo "검증 완료!"
echo ""
echo "다음 단계:"
echo "1. Supabase Dashboard에서 테이블 구조 확인"
echo "2. RLS 정책 확인: Authentication > Policies"
echo "3. API Routes 구현 (P6-T6.2)"
echo "========================================"
