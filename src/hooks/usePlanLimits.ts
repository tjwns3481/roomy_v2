/**
 * @TASK P6-T6.3 - 플랜 정보 훅
 * @SPEC docs/planning/06-tasks.md#P6-T6.3
 *
 * 플랜 정보 및 가격 조회를 위한 클라이언트 훅
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SubscriptionPlan } from '@/types/subscription';

// ============================================================
// 타입 정의
// ============================================================

interface PlanInfo {
  plan: SubscriptionPlan;
  name: string;
  description: string;
  priceYearly: number;
  priceMonthly: number;
  features: string[];
  limits: {
    maxGuidebooks: number;
    maxAiGenerationsPerMonth: number;
    watermarkRemoved: boolean;
    customDomain: boolean;
    prioritySupport: boolean;
  };
  cta: string;
  isPopular: boolean;
  isUnlimited: {
    guidebooks: boolean;
    aiGenerations: boolean;
  };
}

interface PriceComparison {
  name: string;
  priceYearly: number;
  priceMonthly: number;
  savings: number;
}

interface PlansData {
  plans: PlanInfo[];
  priceComparison: Record<SubscriptionPlan, PriceComparison>;
  currency: string;
  billingCycle: string;
}

interface UsePlanLimitsReturn {
  // 데이터
  plans: PlanInfo[];
  priceComparison: Record<SubscriptionPlan, PriceComparison> | null;
  currency: string;
  billingCycle: string;

  // 상태
  isLoading: boolean;
  error: Error | null;

  // 헬퍼
  getPlan: (plan: SubscriptionPlan) => PlanInfo | undefined;
  getFeatureDiff: (from: SubscriptionPlan, to: SubscriptionPlan) => string[];
  getSavings: (plan: SubscriptionPlan) => number;

  // 액션
  refetch: () => Promise<void>;
}

// ============================================================
// 훅 구현
// ============================================================

export function usePlanLimits(): UsePlanLimitsReturn {
  const [data, setData] = useState<PlansData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 플랜 정보 조회
  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/plans');

      if (!response.ok) {
        throw new Error('플랜 정보를 불러오는데 실패했습니다');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch plans:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 특정 플랜 조회
  const getPlan = useCallback(
    (plan: SubscriptionPlan): PlanInfo | undefined => {
      return data?.plans.find((p) => p.plan === plan);
    },
    [data?.plans]
  );

  // 플랜 간 기능 차이 조회
  const getFeatureDiff = useCallback(
    (from: SubscriptionPlan, to: SubscriptionPlan): string[] => {
      const fromPlan = getPlan(from);
      const toPlan = getPlan(to);

      if (!fromPlan || !toPlan) return [];

      // to 플랜에만 있는 기능
      return toPlan.features.filter((feature) => !fromPlan.features.includes(feature));
    },
    [getPlan]
  );

  // 절약 금액 조회
  const getSavings = useCallback(
    (plan: SubscriptionPlan): number => {
      return data?.priceComparison?.[plan]?.savings ?? 0;
    },
    [data?.priceComparison]
  );

  // 초기 로드
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    // 데이터
    plans: data?.plans ?? [],
    priceComparison: data?.priceComparison ?? null,
    currency: data?.currency ?? 'KRW',
    billingCycle: data?.billingCycle ?? 'yearly',

    // 상태
    isLoading,
    error,

    // 헬퍼
    getPlan,
    getFeatureDiff,
    getSavings,

    // 액션
    refetch: fetchPlans,
  };
}

export default usePlanLimits;
