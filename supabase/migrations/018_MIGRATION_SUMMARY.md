# P6-T6.1 구독 및 결제 마이그레이션 요약

## 개요
구독 및 결제 기능을 지원하는 PostgreSQL 테이블 및 함수를 생성합니다.
- Toss Payments 연동을 위한 결제 정보 저장
- 플랜별 기능 제한 관리
- 구독 상태 추적 및 검증

## 생성된 테이블

### 1. subscriptions
**목적**: 사용자의 구독 정보 관리

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY
    user_id UUID REFERENCES auth.users(id) -- 1:1 관계
    plan TEXT ('free', 'pro', 'business')
    status TEXT ('active', 'canceled', 'past_due', 'trialing')
    current_period_start TIMESTAMPTZ
    current_period_end TIMESTAMPTZ
    cancel_at_period_end BOOLEAN
    payment_provider TEXT ('toss')
    payment_customer_id TEXT -- Toss 고객 ID
    payment_subscription_id TEXT -- Toss 구독 ID
    created_at TIMESTAMPTZ
    updated_at TIMESTAMPTZ
)
```

**인덱스**:
- `idx_subscriptions_user_id` - 빠른 사용자 조회
- `idx_subscriptions_payment_customer_id` - Toss 고객 ID로 구독 조회

**RLS 정책**:
- SELECT/INSERT/UPDATE/DELETE: 본인 구독 정보만 가능

---

### 2. payment_history
**목적**: 결제 거래 기록 추적

```sql
CREATE TABLE payment_history (
    id UUID PRIMARY KEY
    subscription_id UUID REFERENCES subscriptions(id) -- 구독과 연결
    user_id UUID REFERENCES auth.users(id)
    amount INTEGER -- 원 단위
    currency TEXT ('KRW')
    status TEXT ('pending', 'succeeded', 'failed', 'refunded')
    payment_method TEXT ('card', 'bank_transfer')
    payment_key TEXT -- Toss 결제 키
    order_id TEXT UNIQUE -- 주문 번호
    receipt_url TEXT -- 영수증 URL
    paid_at TIMESTAMPTZ
    created_at TIMESTAMPTZ
)
```

**인덱스**:
- `idx_payment_history_user_id` - 사용자별 결제 조회
- `idx_payment_history_subscription_id` - 구독별 결제 조회
- `idx_payment_history_order_id` - 주문번호로 조회
- `idx_payment_history_status` - 상태별 필터링
- `idx_payment_history_created_at` - 최신 결제부터 조회

**RLS 정책**:
- SELECT/INSERT: 본인 결제 내역만 가능

---

### 3. plan_limits
**목적**: 각 플랜의 기능 제한 정의 (정적 데이터)

```sql
CREATE TABLE plan_limits (
    plan TEXT PRIMARY KEY ('free', 'pro', 'business')
    max_guidebooks INTEGER
    max_ai_generations_per_month INTEGER
    watermark_removed BOOLEAN
    custom_domain BOOLEAN
    priority_support BOOLEAN
    price_yearly INTEGER (원)
    created_at TIMESTAMPTZ
)
```

**초기 데이터**:
- **free**: 가이드북 1개, AI 3회/월, 무료
- **pro**: 가이드북 5개, AI 30회/월, 워터마크 제거, 49,000원/년
- **business**: 무제한, 우선 지원, 커스텀 도메인, 99,000원/년

**RLS 정책**:
- SELECT: 모든 사용자 조회 가능 (쓰기 금지)

---

## 생성된 함수

### 1. get_user_plan(p_user_id UUID) → TEXT
**목적**: 사용자의 현재 플랜 조회
**반환**: 플랜명 (기본값: 'free')

```sql
SELECT get_user_plan('user-id'::uuid); -- 'pro'
```

---

### 2. get_plan_limits(p_plan TEXT) → TABLE
**목적**: 특정 플랜의 제한 사항 조회
**반환**: plan_limits 테이블의 전체 행

```sql
SELECT * FROM get_plan_limits('pro');
```

---

### 3. is_subscription_active(p_user_id UUID) → BOOLEAN
**목적**: 사용자의 유효한 구독 여부 확인
**조건**:
- status = 'active'
- current_period_end IS NULL OR current_period_end > NOW()

```sql
SELECT is_subscription_active('user-id'::uuid); -- true/false
```

---

### 4. get_user_plan_limits(p_user_id UUID) → TABLE
**목적**: 사용자 플랜의 제한 사항 조회 (Helper)
**반환**: 사용자의 플랜에 해당하는 plan_limits

```sql
SELECT * FROM get_user_plan_limits('user-id'::uuid);
```

---

### 5. create_payment_record(...) → TABLE
**목적**: Toss 결제 후 결제 기록 생성
**필수 권한**: Service Role (RLS 우회)
**입력**:
- subscription_id, user_id, amount, payment_method
- payment_key, order_id, receipt_url (선택)
**반환**: (id, created_at)

```sql
SELECT * FROM create_payment_record(
    'sub-id'::uuid, 'user-id'::uuid, 49000,
    'card', 'toss-key', 'order-123'
);
```

---

### 6. update_payment_status(p_payment_id UUID, p_status TEXT, ...) → BOOLEAN
**목적**: 결제 상태 업데이트 (성공/실패/환불)
**필수 권한**: Service Role
**반환**: 성공 여부

```sql
SELECT update_payment_status(
    'payment-id'::uuid,
    'succeeded',
    'https://receipt.toss.im/...'
);
```

---

### 7. update_subscription_from_payment(...) → TABLE
**목적**: 결제 완료 후 구독 정보 업데이트
**필수 권한**: Service Role
**동작**: INSERT ON CONFLICT로 기존 구독 업데이트
**반환**: (id, user_id, plan, status)

```sql
SELECT * FROM update_subscription_from_payment(
    'user-id'::uuid,
    'pro',
    'toss',
    'cust-123',
    'sub-123',
    NOW(),
    NOW() + INTERVAL '1 year'
);
```

---

## 데이터 흐름

### 결제 플로우

1. **프론트엔드**: 결제 요청 (plan, payment_method)
2. **API Route**: POST /api/payments/request
   - order_id 생성
   - Toss 결제 페이지로 리다이렉트
3. **Toss 콜백**: POST /api/payments/confirm
   - `update_payment_status()` 호출 → 결제 상태 'pending' → 'succeeded'
   - `update_subscription_from_payment()` 호출 → subscriptions 테이블 업데이트
4. **프론트엔드**: 성공 페이지 표시

### 구독 상태 확인 플로우

1. **컴포넌트**: `useSubscription()` hook
2. **API Route**: GET /api/subscriptions
   - `get_user_plan()` 호출 → 현재 플랜
   - `get_plan_limits()` 호출 → 제한 사항
   - `is_subscription_active()` 호출 → 활성 여부
3. **UI**: 플랜 표시, 기능 접근 제어

---

## 마이그레이션 검증 체크리스트

- [x] subscriptions 테이블 생성
- [x] payment_history 테이블 생성
- [x] plan_limits 테이블 생성 (초기 데이터 포함)
- [x] 모든 인덱스 생성
- [x] updated_at 트리거 설정
- [x] RLS 정책 설정 (4개 테이블)
- [x] Helper 함수 생성 (7개)
- [x] ON CONFLICT 패턴으로 멱등성 확보

---

## 타입 정의 (TypeScript)

### 주요 타입

```typescript
// src/types/subscription.ts

type SubscriptionPlan = 'free' | 'pro' | 'business';
type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
type PaymentMethod = 'card' | 'bank_transfer';

interface Subscription { ... }
interface PaymentHistory { ... }
interface PlanLimits { ... }

// 상수 (프론트엔드 모드)
const PLAN_LIMITS_DEFAULTS: Record<SubscriptionPlan, PlanLimits>
const PRICING_CARDS: PricingCard[]
```

---

## 다음 태스크

**P6-T6.2**: 결제 API Route 구현
- POST /api/payments/request
- POST /api/payments/confirm
- GET /api/subscriptions

**P6-T6.3**: 구독 UI 컴포넌트
- PricingCard 컴포넌트
- SubscriptionForm 컴포넌트
- PaymentConfirm 컴포넌트
