/**
 * @TASK P6-T6.3 - 사용량 조회 훅
 * @SPEC docs/planning/06-tasks.md#P6-T6.3
 *
 * 현재 월 사용량 조회를 위한 클라이언트 훅
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SubscriptionPlan } from '@/types/subscription';

// ============================================================
// 타입 정의
// ============================================================

interface ResourceUsage {
  used: number;
  limit: number;
  remaining: number;
  canCreate?: boolean;
  canGenerate?: boolean;
  usagePercent: number;
  isUnlimited: boolean;
}

interface UsagePeriod {
  currentMonth: string;
  daysLeftInMonth: number;
  resetsAt: string;
}

interface UsageData {
  plan: SubscriptionPlan;
  guidebooks: ResourceUsage;
  aiGenerations: ResourceUsage;
  period: UsagePeriod;
}

interface UseUsageReturn {
  // 데이터
  plan: SubscriptionPlan;
  guidebooks: ResourceUsage | null;
  aiGenerations: ResourceUsage | null;
  period: UsagePeriod | null;

  // 상태
  isLoading: boolean;
  error: Error | null;

  // 헬퍼
  canCreateGuidebook: boolean;
  canGenerateAi: boolean;
  isNearGuidebookLimit: boolean;
  isNearAiLimit: boolean;
  guidebookUsageText: string;
  aiUsageText: string;

  // 액션
  refetch: () => Promise<void>;
}

// ============================================================
// 훅 구현
// ============================================================

export function useUsage(): UseUsageReturn {
  const [data, setData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 사용량 정보 조회
  const fetchUsage = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/subscriptions/usage');

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('로그인이 필요합니다');
        }
        throw new Error('사용량 정보를 불러오는데 실패했습니다');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch usage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // 헬퍼 값 계산
  const canCreateGuidebook = data?.guidebooks?.canCreate ?? false;
  const canGenerateAi = data?.aiGenerations?.canGenerate ?? false;

  // 제한에 가까운지 확인 (80% 이상)
  const isNearGuidebookLimit =
    !data?.guidebooks?.isUnlimited && (data?.guidebooks?.usagePercent ?? 0) >= 80;
  const isNearAiLimit =
    !data?.aiGenerations?.isUnlimited && (data?.aiGenerations?.usagePercent ?? 0) >= 80;

  // 사용량 텍스트
  const guidebookUsageText = data?.guidebooks
    ? data.guidebooks.isUnlimited
      ? `${data.guidebooks.used}개 사용 중 (무제한)`
      : `${data.guidebooks.used} / ${data.guidebooks.limit}개`
    : '로딩 중...';

  const aiUsageText = data?.aiGenerations
    ? data.aiGenerations.isUnlimited
      ? `${data.aiGenerations.used}회 사용 (무제한)`
      : `${data.aiGenerations.used} / ${data.aiGenerations.limit}회`
    : '로딩 중...';

  return {
    // 데이터
    plan: data?.plan ?? 'free',
    guidebooks: data?.guidebooks ?? null,
    aiGenerations: data?.aiGenerations ?? null,
    period: data?.period ?? null,

    // 상태
    isLoading,
    error,

    // 헬퍼
    canCreateGuidebook,
    canGenerateAi,
    isNearGuidebookLimit,
    isNearAiLimit,
    guidebookUsageText,
    aiUsageText,

    // 액션
    refetch: fetchUsage,
  };
}

export default useUsage;
