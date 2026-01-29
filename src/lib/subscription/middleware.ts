/**
 * @TASK P6-T6.7 - 플랜별 가이드북/AI 생성 제한 체크 미들웨어
 * @SPEC docs/planning/04-database-design.md#subscriptions
 *
 * 가이드북 및 AI 생성 제한을 체크하는 미들웨어 함수
 */

import { checkPlanLimit, getUserPlanLimits } from '@/lib/subscription';
import type { SubscriptionPlan } from '@/types/subscription';

// ============================================================
// 타입 정의
// ============================================================

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  message?: string;
  upgradeUrl?: string;
}

export interface LimitExceededError {
  error: 'LIMIT_EXCEEDED';
  message: string;
  current: number;
  limit: number;
  upgradeUrl: string;
  feature: 'guidebook' | 'ai';
}

// ============================================================
// 플랜별 메시지
// ============================================================

const UPGRADE_MESSAGES: Record<SubscriptionPlan, string> = {
  free: 'Pro 플랜으로 업그레이드하면 더 많은 기능을 사용할 수 있습니다.',
  pro: 'Business 플랜으로 업그레이드하면 무제한으로 사용할 수 있습니다.',
  business: '', // Business는 무제한
};

const GUIDEBOOK_LIMIT_MESSAGES: Record<SubscriptionPlan, string> = {
  free: '무료 플랜은 가이드북을 1개만 생성할 수 있습니다. Pro 플랜으로 업그레이드하세요.',
  pro: 'Pro 플랜은 가이드북을 5개까지 생성할 수 있습니다. Business 플랜으로 업그레이드하세요.',
  business: '', // Business는 무제한
};

const AI_LIMIT_MESSAGES: Record<SubscriptionPlan, string> = {
  free: '무료 플랜은 월 3회만 AI 생성이 가능합니다. Pro 플랜으로 업그레이드하세요.',
  pro: 'Pro 플랜은 월 30회까지 AI 생성이 가능합니다. Business 플랜으로 업그레이드하세요.',
  business: '', // Business는 무제한
};

// ============================================================
// 가이드북 제한 체크
// ============================================================

/**
 * 가이드북 생성 제한 체크
 *
 * @param userId - 사용자 ID
 * @returns 제한 체크 결과 (allowed, current, limit, message)
 *
 * @example
 * ```ts
 * const result = await checkGuidebookLimit(userId);
 * if (!result.allowed) {
 *   return { error: 'LIMIT_EXCEEDED', ...result };
 * }
 * ```
 */
export async function checkGuidebookLimit(userId: string): Promise<LimitCheckResult> {
  try {
    // 플랜 제한 정보 및 현재 사용량 조회
    const [limitCheck, planLimits] = await Promise.all([
      checkPlanLimit(userId, 'guidebooks'),
      getUserPlanLimits(userId),
    ]);

    const { allowed, current, limit } = limitCheck;
    const plan = planLimits.plan;

    // 무제한인 경우 (-1)
    if (limit === -1) {
      return {
        allowed: true,
        current,
        limit: -1,
        message: undefined,
      };
    }

    // 제한 초과인 경우
    if (!allowed) {
      return {
        allowed: false,
        current,
        limit,
        message: GUIDEBOOK_LIMIT_MESSAGES[plan] || '가이드북 생성 한도를 초과했습니다.',
        upgradeUrl: '/pricing',
      };
    }

    // 남은 횟수가 적은 경우 경고 메시지
    const remaining = limit - current;
    let message: string | undefined;

    if (remaining <= 1 && plan !== 'business') {
      message = `가이드북 생성 가능 횟수가 ${remaining}개 남았습니다. ${UPGRADE_MESSAGES[plan]}`;
    }

    return {
      allowed: true,
      current,
      limit,
      message,
      upgradeUrl: remaining <= 1 ? '/pricing' : undefined,
    };
  } catch (error) {
    console.error('Error checking guidebook limit:', error);
    // 에러 시 안전하게 거부
    return {
      allowed: false,
      current: 0,
      limit: 1,
      message: '플랜 제한을 확인할 수 없습니다. 잠시 후 다시 시도하세요.',
    };
  }
}

// ============================================================
// AI 생성 제한 체크
// ============================================================

/**
 * AI 생성 제한 체크
 *
 * @param userId - 사용자 ID
 * @returns 제한 체크 결과 (allowed, current, limit, message)
 *
 * @example
 * ```ts
 * const result = await checkAIGenerationLimit(userId);
 * if (!result.allowed) {
 *   return { error: 'LIMIT_EXCEEDED', ...result };
 * }
 * ```
 */
export async function checkAIGenerationLimit(userId: string): Promise<LimitCheckResult> {
  try {
    // 플랜 제한 정보 및 현재 사용량 조회
    const [limitCheck, planLimits] = await Promise.all([
      checkPlanLimit(userId, 'ai'),
      getUserPlanLimits(userId),
    ]);

    const { allowed, current, limit } = limitCheck;
    const plan = planLimits.plan;

    // 무제한인 경우 (-1)
    if (limit === -1) {
      return {
        allowed: true,
        current,
        limit: -1,
        message: undefined,
      };
    }

    // 제한 초과인 경우
    if (!allowed) {
      return {
        allowed: false,
        current,
        limit,
        message: AI_LIMIT_MESSAGES[plan] || 'AI 생성 한도를 초과했습니다.',
        upgradeUrl: '/pricing',
      };
    }

    // 남은 횟수가 적은 경우 경고 메시지
    const remaining = limit - current;
    let message: string | undefined;

    if (remaining <= 3 && plan !== 'business') {
      message = `AI 생성 가능 횟수가 ${remaining}회 남았습니다. ${UPGRADE_MESSAGES[plan]}`;
    }

    return {
      allowed: true,
      current,
      limit,
      message,
      upgradeUrl: remaining <= 3 ? '/pricing' : undefined,
    };
  } catch (error) {
    console.error('Error checking AI generation limit:', error);
    // 에러 시 안전하게 거부
    return {
      allowed: false,
      current: 0,
      limit: 3,
      message: '플랜 제한을 확인할 수 없습니다. 잠시 후 다시 시도하세요.',
    };
  }
}

// ============================================================
// 제한 초과 에러 응답 생성
// ============================================================

/**
 * 제한 초과 에러 응답 생성
 *
 * @param feature - 기능 타입 ('guidebook' | 'ai')
 * @param result - 제한 체크 결과
 * @returns 제한 초과 에러 객체
 */
export function createLimitExceededResponse(
  feature: 'guidebook' | 'ai',
  result: LimitCheckResult
): LimitExceededError {
  return {
    error: 'LIMIT_EXCEEDED',
    message: result.message || `${feature === 'guidebook' ? '가이드북' : 'AI'} 생성 한도를 초과했습니다.`,
    current: result.current,
    limit: result.limit,
    upgradeUrl: result.upgradeUrl || '/pricing',
    feature,
  };
}

// ============================================================
// 미들웨어 Wrapper
// ============================================================

/**
 * API Route에서 사용할 가이드북 제한 체크 미들웨어
 *
 * @param userId - 사용자 ID
 * @returns { success: true } 또는 { success: false, response: Response }
 *
 * @example
 * ```ts
 * const limitResult = await withGuidebookLimit(userId);
 * if (!limitResult.success) {
 *   return limitResult.response;
 * }
 * ```
 */
export async function withGuidebookLimit(
  userId: string
): Promise<
  | { success: true; limitInfo: LimitCheckResult }
  | { success: false; response: LimitExceededError }
> {
  const result = await checkGuidebookLimit(userId);

  if (!result.allowed) {
    return {
      success: false,
      response: createLimitExceededResponse('guidebook', result),
    };
  }

  return { success: true, limitInfo: result };
}

/**
 * API Route에서 사용할 AI 생성 제한 체크 미들웨어
 *
 * @param userId - 사용자 ID
 * @returns { success: true } 또는 { success: false, response: Response }
 *
 * @example
 * ```ts
 * const limitResult = await withAIGenerationLimit(userId);
 * if (!limitResult.success) {
 *   return limitResult.response;
 * }
 * ```
 */
export async function withAIGenerationLimit(
  userId: string
): Promise<
  | { success: true; limitInfo: LimitCheckResult }
  | { success: false; response: LimitExceededError }
> {
  const result = await checkAIGenerationLimit(userId);

  if (!result.allowed) {
    return {
      success: false,
      response: createLimitExceededResponse('ai', result),
    };
  }

  return { success: true, limitInfo: result };
}
