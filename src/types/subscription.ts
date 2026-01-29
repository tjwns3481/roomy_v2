/**
 * @TASK P6-T6.1 - 구독 및 결제 타입 정의
 * @SPEC docs/planning/04-database-design.md#subscriptions
 */

// ============================================================
// 플랜 타입
// ============================================================

export type SubscriptionPlan = 'free' | 'pro' | 'business';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export type PaymentMethod = 'card' | 'bank_transfer';

export type PaymentProvider = 'toss';

// ============================================================
// 구독 정보
// ============================================================

export interface Subscription {
    id: string;
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    paymentProvider: PaymentProvider | null;
    paymentCustomerId: string | null;
    paymentSubscriptionId: string | null;
    createdAt: string;
    updatedAt: string;
}

// ============================================================
// 결제 이력
// ============================================================

export interface PaymentHistory {
    id: string;
    subscriptionId: string | null;
    userId: string;
    amount: number; // 원 단위
    currency: string; // 'KRW'
    status: PaymentStatus;
    paymentMethod: PaymentMethod | null;
    paymentKey: string | null;
    orderId: string | null;
    receiptUrl: string | null;
    paidAt: string;
    createdAt: string;
}

// ============================================================
// 플랜 제한
// ============================================================

export interface PlanLimits {
    plan: SubscriptionPlan;
    maxGuidebooks: number; // -1: 무제한
    maxAiGenerationsPerMonth: number; // -1: 무제한
    watermarkRemoved: boolean;
    customDomain: boolean;
    prioritySupport: boolean;
    priceYearly: number; // 원
    createdAt: string;
}

// ============================================================
// 플랜별 기본 설정
// ============================================================

export const PLAN_LIMITS_DEFAULTS: Record<SubscriptionPlan, PlanLimits> = {
    free: {
        plan: 'free',
        maxGuidebooks: 1,
        maxAiGenerationsPerMonth: 3,
        watermarkRemoved: false,
        customDomain: false,
        prioritySupport: false,
        priceYearly: 0,
        createdAt: new Date().toISOString(),
    },
    pro: {
        plan: 'pro',
        maxGuidebooks: 5,
        maxAiGenerationsPerMonth: 30,
        watermarkRemoved: true,
        customDomain: false,
        prioritySupport: false,
        priceYearly: 49000,
        createdAt: new Date().toISOString(),
    },
    business: {
        plan: 'business',
        maxGuidebooks: -1,
        maxAiGenerationsPerMonth: -1,
        watermarkRemoved: true,
        customDomain: true,
        prioritySupport: true,
        priceYearly: 99000,
        createdAt: new Date().toISOString(),
    },
};

// ============================================================
// 결제 요청 관련
// ============================================================

export interface PaymentRequest {
    orderId: string; // 주문 번호
    orderName: string; // 상품명 (예: "Roomy Pro 년간 구독")
    amount: number; // 결제 금액 (원)
    customerId: string; // Toss 고객 ID
    paymentKey?: string; // Toss 결제 키 (콜백 응답에서 받음)
    successUrl: string; // 성공 콜백 URL
    failUrl: string; // 실패 콜백 URL
}

export interface PaymentConfirmRequest {
    paymentKey: string; // Toss 결제 키
    orderId: string; // 주문 번호
    amount: number; // 결제 금액 (원)
}

// ============================================================
// 결제 응답
// ============================================================

export interface PaymentResponse {
    id: string;
    orderId: string;
    paymentKey: string;
    amount: number;
    status: PaymentStatus;
    receiptUrl: string | null;
    createdAt: string;
}

// ============================================================
// 구독 관련 요청/응답
// ============================================================

export interface UpgradeSubscriptionRequest {
    plan: Exclude<SubscriptionPlan, 'free'>; // pro 또는 business
    paymentMethod: PaymentMethod;
}

export interface CancelSubscriptionRequest {
    immediately?: boolean; // true: 즉시 취소, false: 주기 종료 시 취소
    reason?: string; // 취소 사유
}

// ============================================================
// 구독 정보 (UI용)
// ============================================================

export interface SubscriptionInfo {
    currentPlan: SubscriptionPlan;
    isActive: boolean;
    limits: PlanLimits;
    currentPeriodEnd: string | null;
    canUpgrade: boolean;
    nextBillingDate: string | null;
}

// ============================================================
// 구독 상태 조회
// ============================================================

export interface SubscriptionStatus {
    subscription: Subscription | null;
    limits: PlanLimits;
    isActive: boolean;
    daysUntilExpiry: number | null;
}

// ============================================================
// 가격 정보 (UI용)
// ============================================================

export interface PricingCard {
    plan: SubscriptionPlan;
    name: string;
    description: string;
    price: number; // 연간 가격
    monthlyPrice: number; // 월간 가격 (연간/12)
    features: string[];
    limits: PlanLimits;
    cta: string;
    isPopular?: boolean;
}

export const PRICING_CARDS: PricingCard[] = [
    {
        plan: 'free',
        name: 'Free',
        description: '시작하기에 딱 좋은 플랜',
        price: 0,
        monthlyPrice: 0,
        features: [
            '가이드북 1개',
            'AI 생성 3회/월',
            '기본 블록 세트',
            'QR 코드 공유',
        ],
        limits: PLAN_LIMITS_DEFAULTS.free,
        cta: '무료로 시작',
    },
    {
        plan: 'pro',
        name: 'Pro',
        description: '전문가를 위한 플랜',
        price: 49000,
        monthlyPrice: Math.round(49000 / 12),
        features: [
            '가이드북 5개',
            'AI 생성 30회/월',
            '모든 블록 및 테마',
            '워터마크 제거',
            '통계 및 분석',
            'API 접근',
        ],
        limits: PLAN_LIMITS_DEFAULTS.pro,
        cta: 'Pro 업그레이드',
        isPopular: true,
    },
    {
        plan: 'business',
        name: 'Business',
        description: '기업용 플랜',
        price: 99000,
        monthlyPrice: Math.round(99000 / 12),
        features: [
            '무제한 가이드북',
            '무제한 AI 생성',
            '커스텀 도메인',
            '워터마크 제거',
            '우선 지원',
            'API 접근',
            '팀 협업',
        ],
        limits: PLAN_LIMITS_DEFAULTS.business,
        cta: 'Business 연락하기',
    },
];
