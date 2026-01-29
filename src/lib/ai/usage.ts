/**
 * @TASK P3-T3.5 - AI 사용량 추적 유틸리티
 * @SPEC docs/planning/02-trd.md#AI-Usage-Tracking
 *
 * AI 사용량 체크 및 기록을 위한 서버사이드 유틸리티 함수
 */

import { createAdminClient, createServerClient } from '@/lib/supabase/server';

/**
 * AI 사용량 제한 정보
 */
export interface AiLimitInfo {
  canGenerate: boolean;
  usedThisMonth: number;
  limitThisMonth: number;
  remaining: number;
  plan: string;
}

/**
 * AI 사용량 기록 파라미터
 */
export interface RecordAiUsageParams {
  userId: string;
  guidebookId?: string;
  tokensUsed: number;
  model: string;
  action: 'generate' | 'edit' | 'chat';
}

/**
 * AI 사용 이력 항목
 */
export interface AiUsageHistoryItem {
  id: string;
  guidebookId: string | null;
  guidebookTitle: string | null;
  tokensUsed: number;
  model: string;
  action: string;
  createdAt: string;
}

/**
 * 사용자의 AI 사용량 제한 체크
 *
 * @param userId - 사용자 ID
 * @returns AI 사용량 제한 정보
 *
 * @example
 * ```ts
 * const { canGenerate, remaining } = await checkAiLimit(userId);
 * if (!canGenerate) {
 *   return { error: 'AI_LIMIT_EXCEEDED' };
 * }
 * ```
 */
export async function checkAiLimit(userId: string): Promise<AiLimitInfo> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('check_ai_limit', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error checking AI limit:', error);
    // 에러 시 기본 제한 적용 (안전 모드)
    return {
      canGenerate: false,
      usedThisMonth: 0,
      limitThisMonth: 3,
      remaining: 0,
      plan: 'free',
    };
  }

  // RPC 함수는 배열로 반환
  const result = Array.isArray(data) ? data[0] : data;

  return {
    canGenerate: result?.can_generate ?? false,
    usedThisMonth: result?.used_this_month ?? 0,
    limitThisMonth: result?.limit_this_month ?? 3,
    remaining: result?.remaining ?? 0,
    plan: result?.plan ?? 'free',
  };
}

/**
 * AI 사용량 기록
 *
 * Service Role Key를 사용하여 RLS를 우회하고 사용량을 기록
 *
 * @param params - 사용량 기록 파라미터
 * @returns 생성된 기록 ID
 *
 * @example
 * ```ts
 * await recordAiUsage({
 *   userId: user.id,
 *   guidebookId: guidebook.id,
 *   tokensUsed: response.usage.total_tokens,
 *   model: 'gpt-4o',
 *   action: 'generate',
 * });
 * ```
 */
export async function recordAiUsage(params: RecordAiUsageParams): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('record_ai_usage', {
    p_user_id: params.userId,
    p_guidebook_id: params.guidebookId ?? undefined,
    p_tokens_used: params.tokensUsed,
    p_model: params.model,
    p_action: params.action,
  });

  if (error) {
    console.error('Error recording AI usage:', error);
    return null;
  }

  return data;
}

/**
 * AI 사용 이력 조회
 *
 * @param userId - 사용자 ID
 * @param limit - 조회 개수 (기본값: 10)
 * @param offset - 오프셋 (기본값: 0)
 * @returns AI 사용 이력 배열
 */
export async function getAiUsageHistory(
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<AiUsageHistoryItem[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('get_ai_usage_history', {
    p_user_id: userId,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error('Error fetching AI usage history:', error);
    return [];
  }

  return (data || []).map((item: {
    id: string;
    guidebook_id: string | null;
    guidebook_title: string | null;
    tokens_used: number;
    model: string;
    action: string;
    created_at: string;
  }) => ({
    id: item.id,
    guidebookId: item.guidebook_id,
    guidebookTitle: item.guidebook_title,
    tokensUsed: item.tokens_used,
    model: item.model,
    action: item.action,
    createdAt: item.created_at,
  }));
}

/**
 * 플랜별 제한 정보 조회
 *
 * @param plan - 플랜 이름
 * @returns 플랜별 제한 정보
 */
export function getPlanLimits(plan: string): {
  maxGenerations: number;
  maxGuidebooks: number;
  features: string[];
} {
  const plans: Record<string, { maxGenerations: number; maxGuidebooks: number; features: string[] }> = {
    free: {
      maxGenerations: 3,
      maxGuidebooks: 1,
      features: ['Basic AI generation', '1 guidebook'],
    },
    pro: {
      maxGenerations: 30,
      maxGuidebooks: 5,
      features: ['30 AI generations/month', '5 guidebooks', 'Priority support'],
    },
    business: {
      maxGenerations: 999999,
      maxGuidebooks: -1, // unlimited
      features: ['Unlimited AI generations', 'Unlimited guidebooks', 'API access', 'Dedicated support'],
    },
  };

  return plans[plan] || plans.free;
}

/**
 * AI 제한 초과 에러 응답 생성
 *
 * @param limitInfo - AI 제한 정보
 * @returns 에러 응답 객체
 */
export function createLimitExceededError(limitInfo: AiLimitInfo) {
  return {
    error: 'AI_LIMIT_EXCEEDED',
    message: `Monthly AI generation limit reached. You have used ${limitInfo.usedThisMonth}/${limitInfo.limitThisMonth} generations this month.`,
    usedThisMonth: limitInfo.usedThisMonth,
    limitThisMonth: limitInfo.limitThisMonth,
    remaining: limitInfo.remaining,
    plan: limitInfo.plan,
    upgradeUrl: '/settings/billing',
  };
}
