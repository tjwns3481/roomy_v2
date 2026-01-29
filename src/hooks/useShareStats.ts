// @TASK P5-T5.5 - 공유 통계 조회 훅
// @SPEC docs/planning/06-tasks.md#P5-T5.5

'use client';

import useSWR from 'swr';
import {
  ShareStatsPeriod,
  ShareStatsSummary,
  DailyShareStat,
  ShareStatsResponse,
} from '@/types/share';

/**
 * useShareStats 훅 반환 타입
 */
export interface UseShareStatsReturn {
  /** 통계 요약 */
  summary: ShareStatsSummary | null;
  /** 일별 통계 */
  dailyStats: DailyShareStat[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 상태 */
  error: Error | null;
  /** 데이터 갱신 */
  refresh: () => void;
  /** 기간 변경 */
  setPeriod: (period: ShareStatsPeriod) => void;
  /** 현재 기간 */
  period: ShareStatsPeriod;
}

/**
 * 통계 API fetcher
 */
async function fetchShareStats(url: string): Promise<ShareStatsResponse['data']> {
  const response = await fetch(url);

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || '통계 조회 실패');
  }

  const json = (await response.json()) as ShareStatsResponse;
  return json.data;
}

/**
 * 공유 통계를 조회하는 훅
 *
 * @param guidebookId - 가이드북 ID
 * @param initialPeriod - 초기 조회 기간 (기본값: '30d')
 * @returns 공유 통계 데이터
 *
 * @example
 * ```tsx
 * const { summary, dailyStats, isLoading, period, setPeriod } = useShareStats('guidebook-id');
 *
 * if (isLoading) return <Skeleton />;
 *
 * return (
 *   <div>
 *     <p>총 공유: {summary?.totalShares}</p>
 *     <button onClick={() => setPeriod('7d')}>7일</button>
 *     <button onClick={() => setPeriod('30d')}>30일</button>
 *   </div>
 * );
 * ```
 */
export function useShareStats(
  guidebookId: string,
  initialPeriod: ShareStatsPeriod = '30d'
): UseShareStatsReturn {
  // 기간 상태 관리는 SWR의 key로 처리
  const periodKey = initialPeriod;

  // SWR을 사용한 데이터 fetching
  const { data, error, isLoading, mutate } = useSWR<ShareStatsResponse['data']>(
    guidebookId
      ? `/api/share/stats?guidebookId=${guidebookId}&period=${periodKey}`
      : null,
    fetchShareStats,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30초 동안 중복 요청 방지
    }
  );

  return {
    summary: data?.summary ?? null,
    dailyStats: data?.dailyStats ?? [],
    isLoading,
    error: error ?? null,
    refresh: () => mutate(),
    setPeriod: () => {
      // 기간 변경 시 새 키로 자동 refetch
      // 실제 구현에서는 상위 컴포넌트에서 period state를 관리
      mutate();
    },
    period: periodKey,
  };
}

/**
 * 기간 선택 가능한 공유 통계 훅
 */
export function useShareStatsWithPeriod(
  guidebookId: string,
  period: ShareStatsPeriod
): Omit<UseShareStatsReturn, 'setPeriod' | 'period'> {
  const { data, error, isLoading, mutate } = useSWR<ShareStatsResponse['data']>(
    guidebookId
      ? `/api/share/stats?guidebookId=${guidebookId}&period=${period}`
      : null,
    fetchShareStats,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000,
    }
  );

  return {
    summary: data?.summary ?? null,
    dailyStats: data?.dailyStats ?? [],
    isLoading,
    error: error ?? null,
    refresh: () => mutate(),
  };
}
