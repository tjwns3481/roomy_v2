/**
 * @TASK P6-T6.3 - 구독 관리 유틸리티
 * @SPEC docs/planning/04-database-design.md#subscriptions
 *
 * 구독 관련 서버사이드 유틸리티 함수
 */

import { createAdminClient, createServerClient } from '@/lib/supabase/server';
import type {
  Subscription,
  SubscriptionPlan,
  PlanLimits,
  PaymentHistory,
  PLAN_LIMITS_DEFAULTS,
} from '@/types/subscription';

// ============================================================
// 타입 정의
// ============================================================

export interface UsageInfo {
  guidebooks: number;
  aiGenerations: number;
  limits: {
    maxGuidebooks: number;
    maxAiGenerations: number;
  };
}

export interface PlanLimitCheck {
  allowed: boolean;
  current: number;
  limit: number;
}

// DB 스키마 매핑 타입
interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  payment_provider: string | null;
  payment_customer_id: string | null;
  payment_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

interface PlanLimitsRow {
  plan: string;
  max_guidebooks: number;
  max_ai_generations_per_month: number;
  watermark_removed: boolean;
  custom_domain: boolean;
  priority_support: boolean;
  price_yearly: number;
  created_at: string;
}

// ============================================================
// 헬퍼 함수
// ============================================================

/**
 * DB 구독 행을 TypeScript 구독 객체로 변환
 */
function mapSubscriptionRow(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    plan: row.plan as SubscriptionPlan,
    status: row.status as Subscription['status'],
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    paymentProvider: row.payment_provider as Subscription['paymentProvider'],
    paymentCustomerId: row.payment_customer_id,
    paymentSubscriptionId: row.payment_subscription_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * DB 플랜 제한 행을 TypeScript 플랜 제한 객체로 변환
 */
function mapPlanLimitsRow(row: PlanLimitsRow): PlanLimits {
  return {
    plan: row.plan as SubscriptionPlan,
    maxGuidebooks: row.max_guidebooks,
    maxAiGenerationsPerMonth: row.max_ai_generations_per_month,
    watermarkRemoved: row.watermark_removed,
    customDomain: row.custom_domain,
    prioritySupport: row.priority_support,
    priceYearly: row.price_yearly,
    createdAt: row.created_at,
  };
}

// ============================================================
// 구독 조회
// ============================================================

/**
 * 사용자 구독 정보 조회
 *
 * @param userId - 사용자 ID
 * @returns 구독 정보 (없으면 null)
 *
 * @example
 * ```ts
 * const subscription = await getUserSubscription(userId);
 * if (subscription?.plan === 'pro') {
 *   // Pro 기능 제공
 * }
 * ```
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    console.error('Error fetching subscription:', error);
    return null;
  }

  return mapSubscriptionRow(data);
}

/**
 * 사용자 플랜 조회 (구독이 없으면 'free')
 *
 * @param userId - 사용자 ID
 * @returns 플랜 이름
 */
export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('get_user_plan', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error fetching user plan:', error);
    return 'free';
  }

  return (data as SubscriptionPlan) || 'free';
}

// ============================================================
// 플랜 제한 조회
// ============================================================

/**
 * 플랜별 제한 사항 조회
 *
 * @param plan - 플랜 이름
 * @returns 플랜 제한 정보
 */
export async function getPlanLimits(plan: SubscriptionPlan): Promise<PlanLimits> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('plan_limits')
    .select('*')
    .eq('plan', plan)
    .single();

  if (error || !data) {
    console.error('Error fetching plan limits:', error);
    // 기본값 반환
    return {
      plan: 'free',
      maxGuidebooks: 1,
      maxAiGenerationsPerMonth: 3,
      watermarkRemoved: false,
      customDomain: false,
      prioritySupport: false,
      priceYearly: 0,
      createdAt: new Date().toISOString(),
    };
  }

  return mapPlanLimitsRow(data);
}

/**
 * 사용자 플랜의 제한 사항 조회
 *
 * @param userId - 사용자 ID
 * @returns 플랜 제한 정보
 */
export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('get_user_plan_limits', {
    p_user_id: userId,
  });

  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    console.error('Error fetching user plan limits:', error);
    return getPlanLimits('free');
  }

  const row = Array.isArray(data) ? data[0] : data;
  return mapPlanLimitsRow(row);
}

/**
 * 모든 플랜 정보 조회
 *
 * @returns 모든 플랜 제한 정보 배열
 */
export async function getAllPlans(): Promise<PlanLimits[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('plan_limits')
    .select('*')
    .order('price_yearly', { ascending: true });

  if (error || !data) {
    console.error('Error fetching all plans:', error);
    return [];
  }

  return data.map(mapPlanLimitsRow);
}

// ============================================================
// 사용량 체크
// ============================================================

/**
 * 플랜 제한 체크
 *
 * @param userId - 사용자 ID
 * @param feature - 체크할 기능 ('guidebooks' | 'ai')
 * @returns 사용 가능 여부, 현재 사용량, 제한
 *
 * @example
 * ```ts
 * const { allowed, current, limit } = await checkPlanLimit(userId, 'guidebooks');
 * if (!allowed) {
 *   return { error: 'LIMIT_EXCEEDED' };
 * }
 * ```
 */
export async function checkPlanLimit(
  userId: string,
  feature: 'guidebooks' | 'ai'
): Promise<PlanLimitCheck> {
  const supabase = await createServerClient();

  if (feature === 'guidebooks') {
    // 가이드북 수 체크
    const { data: limits } = await supabase.rpc('get_user_plan_limits', {
      p_user_id: userId,
    });

    const planLimits = Array.isArray(limits) ? limits[0] : limits;
    const maxGuidebooks = planLimits?.max_guidebooks ?? 1;

    // 현재 가이드북 수 조회
    const { count, error } = await supabase
      .from('guidebooks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error counting guidebooks:', error);
      return { allowed: false, current: 0, limit: maxGuidebooks };
    }

    const currentCount = count ?? 0;
    // -1은 무제한
    const allowed = maxGuidebooks === -1 || currentCount < maxGuidebooks;

    return {
      allowed,
      current: currentCount,
      limit: maxGuidebooks,
    };
  } else {
    // AI 사용량 체크
    const { data, error } = await supabase.rpc('check_ai_limit', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error checking AI limit:', error);
      return { allowed: false, current: 0, limit: 3 };
    }

    const result = Array.isArray(data) ? data[0] : data;

    return {
      allowed: result?.can_generate ?? false,
      current: result?.used_this_month ?? 0,
      limit: result?.limit_this_month ?? 3,
    };
  }
}

/**
 * 현재 월 사용량 조회
 *
 * @param userId - 사용자 ID
 * @returns 사용량 정보
 */
export async function getUsageInfo(userId: string): Promise<UsageInfo> {
  const supabase = await createServerClient();

  // 플랜 제한 조회
  const limits = await getUserPlanLimits(userId);

  // 가이드북 수 조회
  const { count: guidebookCount } = await supabase
    .from('guidebooks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // AI 사용량 조회
  const { data: aiLimitData } = await supabase.rpc('check_ai_limit', {
    p_user_id: userId,
  });

  const aiResult = Array.isArray(aiLimitData) ? aiLimitData[0] : aiLimitData;

  return {
    guidebooks: guidebookCount ?? 0,
    aiGenerations: aiResult?.used_this_month ?? 0,
    limits: {
      maxGuidebooks: limits.maxGuidebooks,
      maxAiGenerations: limits.maxAiGenerationsPerMonth,
    },
  };
}

// ============================================================
// 구독 생성/업그레이드
// ============================================================

/**
 * 구독 업그레이드
 *
 * @param userId - 사용자 ID
 * @param plan - 업그레이드할 플랜
 * @param paymentInfo - 결제 정보 (선택)
 * @returns 업데이트된 구독 정보
 *
 * @example
 * ```ts
 * const subscription = await upgradePlan(userId, 'pro', {
 *   paymentProvider: 'toss',
 *   paymentCustomerId: 'cus_xxx',
 * });
 * ```
 */
export async function upgradePlan(
  userId: string,
  plan: SubscriptionPlan,
  paymentInfo?: {
    paymentProvider?: string;
    paymentCustomerId?: string;
    paymentSubscriptionId?: string;
  }
): Promise<Subscription | null> {
  const supabase = createAdminClient();

  // 구독 기간 계산 (1년)
  const periodStart = new Date();
  const periodEnd = new Date();
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  const { data, error } = await supabase.rpc('update_subscription_from_payment', {
    p_user_id: userId,
    p_plan: plan,
    p_payment_provider: paymentInfo?.paymentProvider ?? null,
    p_payment_customer_id: paymentInfo?.paymentCustomerId ?? null,
    p_payment_subscription_id: paymentInfo?.paymentSubscriptionId ?? null,
    p_period_start: periodStart.toISOString(),
    p_period_end: periodEnd.toISOString(),
  });

  if (error) {
    console.error('Error upgrading plan:', error);
    return null;
  }

  // RPC 반환값에서 구독 조회
  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.id) {
    return null;
  }

  // 전체 구독 정보 조회
  return getUserSubscription(userId);
}

/**
 * Free 플랜으로 구독 생성 (신규 사용자용)
 *
 * @param userId - 사용자 ID
 * @returns 생성된 구독 정보
 */
export async function createFreeSubscription(userId: string): Promise<Subscription | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan: 'free',
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    // 이미 존재하는 경우 기존 구독 반환
    if (error.code === '23505') {
      return getUserSubscription(userId);
    }
    console.error('Error creating free subscription:', error);
    return null;
  }

  return mapSubscriptionRow(data);
}

// ============================================================
// 구독 취소
// ============================================================

/**
 * 구독 취소
 *
 * @param userId - 사용자 ID
 * @param immediately - 즉시 취소 여부 (기본: false = 기간 종료 시 취소)
 * @returns 업데이트된 구독 정보
 *
 * @example
 * ```ts
 * // 기간 종료 시 취소
 * const subscription = await cancelSubscription(userId);
 *
 * // 즉시 취소
 * const subscription = await cancelSubscription(userId, true);
 * ```
 */
export async function cancelSubscription(
  userId: string,
  immediately: boolean = false
): Promise<Subscription | null> {
  const supabase = createAdminClient();

  if (immediately) {
    // 즉시 취소: status를 canceled로, plan을 free로 변경
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        plan: 'free',
        cancel_at_period_end: false,
        payment_subscription_id: null,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error canceling subscription immediately:', error);
      return null;
    }

    return mapSubscriptionRow(data);
  } else {
    // 기간 종료 시 취소: cancel_at_period_end를 true로 설정
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error scheduling subscription cancellation:', error);
      return null;
    }

    return mapSubscriptionRow(data);
  }
}

/**
 * 구독 취소 예약 해제 (cancel_at_period_end = false)
 *
 * @param userId - 사용자 ID
 * @returns 업데이트된 구독 정보
 */
export async function reactivateSubscription(userId: string): Promise<Subscription | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: false,
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error reactivating subscription:', error);
    return null;
  }

  return mapSubscriptionRow(data);
}

// ============================================================
// 결제 내역
// ============================================================

/**
 * 결제 내역 조회
 *
 * @param userId - 사용자 ID
 * @param page - 페이지 번호 (1부터 시작)
 * @param limit - 페이지당 항목 수
 * @returns 결제 내역 및 페이지네이션 정보
 */
export async function getPaymentHistory(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  payments: PaymentHistory[];
  total: number;
  hasMore: boolean;
}> {
  const supabase = await createServerClient();
  const offset = (page - 1) * limit;

  // 총 개수 조회
  const { count } = await supabase
    .from('payment_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // 결제 내역 조회
  const { data, error } = await supabase
    .from('payment_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching payment history:', error);
    return { payments: [], total: 0, hasMore: false };
  }

  const total = count ?? 0;
  const payments: PaymentHistory[] = (data || []).map((row) => ({
    id: row.id,
    subscriptionId: row.subscription_id,
    userId: row.user_id,
    amount: row.amount,
    currency: row.currency || 'KRW',
    status: row.status as PaymentHistory['status'],
    paymentMethod: row.payment_method as PaymentHistory['paymentMethod'],
    paymentKey: row.payment_key,
    orderId: row.order_id,
    receiptUrl: row.receipt_url,
    paidAt: row.paid_at || row.created_at,
    createdAt: row.created_at,
  }));

  return {
    payments,
    total,
    hasMore: offset + payments.length < total,
  };
}
