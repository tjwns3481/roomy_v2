/**
 * @TASK P6-T6.3 - 구독 정보 훅
 * @SPEC docs/planning/06-tasks.md#P6-T6.3
 *
 * 구독 정보 조회 및 관리를 위한 클라이언트 훅
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import type { Subscription, PlanLimits, SubscriptionPlan } from '@/types/subscription';

// ============================================================
// 타입 정의
// ============================================================

interface SubscriptionUsage {
  guidebooks: number;
  aiGenerations: number;
  limits: {
    maxGuidebooks: number;
    maxAiGenerations: number;
  };
}

interface SubscriptionData {
  subscription: Subscription | null;
  planLimits: PlanLimits | null;
  usage: SubscriptionUsage | null;
  isActive: boolean;
  daysUntilExpiry: number | null;
}

interface UseSubscriptionReturn {
  // 데이터
  subscription: Subscription | null;
  planLimits: PlanLimits | null;
  usage: SubscriptionUsage | null;
  isActive: boolean;
  daysUntilExpiry: number | null;

  // 상태
  isLoading: boolean;
  error: Error | null;

  // 헬퍼
  currentPlan: SubscriptionPlan;
  isPro: boolean;
  isBusiness: boolean;
  isFree: boolean;
  canUpgrade: boolean;
  isCanceling: boolean;

  // 액션
  refetch: () => Promise<void>;
  upgrade: (plan: 'pro' | 'business') => Promise<boolean>;
  cancel: (immediately?: boolean) => Promise<boolean>;
  reactivate: () => Promise<boolean>;
}

// ============================================================
// 훅 구현
// ============================================================

export function useSubscription(): UseSubscriptionReturn {
  const { isLoaded, isSignedIn } = useAuth();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 구독 정보 조회
  const fetchSubscription = useCallback(async () => {
    // 인증되지 않은 상태면 API 호출 안 함
    if (!isLoaded || !isSignedIn) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/subscriptions');

      if (!response.ok) {
        if (response.status === 401) {
          // 인증 오류 - 조용히 처리 (로그인 페이지로 리다이렉트는 상위에서 처리)
          setIsLoading(false);
          return;
        }
        throw new Error('구독 정보를 불러오는데 실패했습니다');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch subscription:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  // 구독 업그레이드
  const upgrade = useCallback(async (plan: 'pro' | 'business'): Promise<boolean> => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '업그레이드에 실패했습니다');
      }

      // 구독 정보 새로고침
      await fetchSubscription();
      return true;
    } catch (err) {
      console.error('Failed to upgrade:', err);
      return false;
    }
  }, [fetchSubscription]);

  // 구독 취소
  const cancel = useCallback(async (immediately = false): Promise<boolean> => {
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ immediately }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '구독 취소에 실패했습니다');
      }

      // 구독 정보 새로고침
      await fetchSubscription();
      return true;
    } catch (err) {
      console.error('Failed to cancel:', err);
      return false;
    }
  }, [fetchSubscription]);

  // 취소 예약 해제
  const reactivate = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reactivate: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '구독 복원에 실패했습니다');
      }

      // 구독 정보 새로고침
      await fetchSubscription();
      return true;
    } catch (err) {
      console.error('Failed to reactivate:', err);
      return false;
    }
  }, [fetchSubscription]);

  // 초기 로드
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // 헬퍼 값 계산
  const currentPlan: SubscriptionPlan = data?.subscription?.plan ?? 'free';
  const isPro = currentPlan === 'pro';
  const isBusiness = currentPlan === 'business';
  const isFree = currentPlan === 'free';
  const canUpgrade = isFree || isPro; // business는 업그레이드 불가
  const isCanceling = data?.subscription?.cancelAtPeriodEnd ?? false;

  return {
    // 데이터
    subscription: data?.subscription ?? null,
    planLimits: data?.planLimits ?? null,
    usage: data?.usage ?? null,
    isActive: data?.isActive ?? false,
    daysUntilExpiry: data?.daysUntilExpiry ?? null,

    // 상태
    isLoading,
    error,

    // 헬퍼
    currentPlan,
    isPro,
    isBusiness,
    isFree,
    canUpgrade,
    isCanceling,

    // 액션
    refetch: fetchSubscription,
    upgrade,
    cancel,
    reactivate,
  };
}

export default useSubscription;
