/**
 * @TASK P6-T6.8 - 배너 닫기 상태 관리 훅
 * @SPEC docs/planning/06-tasks.md#P6-T6.8
 *
 * 배너 닫기 상태를 localStorage에 저장하고 관리
 * 7일 후 자동으로 다시 표시
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================================
// 상수
// ============================================================

const BANNER_DISMISSED_KEY = 'roomy_upgrade_banner_dismissed';
const DISMISS_DURATION_DAYS = 7;

// ============================================================
// 타입 정의
// ============================================================

interface DismissState {
  dismissed: boolean;
  timestamp: number;
}

interface UseBannerDismissReturn {
  isDismissed: boolean;
  dismiss: () => void;
  reset: () => void;
}

// ============================================================
// 유틸리티 함수
// ============================================================

/**
 * localStorage에서 닫기 상태를 불러옴
 */
function loadDismissState(): DismissState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (!stored) {
      return null;
    }

    const state = JSON.parse(stored) as DismissState;
    const now = Date.now();
    const daysSinceDismiss = (now - state.timestamp) / (1000 * 60 * 60 * 24);

    // 7일이 지나면 상태 초기화
    if (daysSinceDismiss >= DISMISS_DURATION_DAYS) {
      localStorage.removeItem(BANNER_DISMISSED_KEY);
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load banner dismiss state:', error);
    return null;
  }
}

/**
 * localStorage에 닫기 상태 저장
 */
function saveDismissState(dismissed: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const state: DismissState = {
      dismissed,
      timestamp: Date.now(),
    };
    localStorage.setItem(BANNER_DISMISSED_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save banner dismiss state:', error);
  }
}

/**
 * localStorage에서 닫기 상태 제거
 */
function clearDismissState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(BANNER_DISMISSED_KEY);
  } catch (error) {
    console.error('Failed to clear banner dismiss state:', error);
  }
}

// ============================================================
// 훅 구현
// ============================================================

/**
 * 배너 닫기 상태를 관리하는 훅
 *
 * @example
 * ```tsx
 * const { isDismissed, dismiss, reset } = useBannerDismiss();
 *
 * if (isDismissed) {
 *   return null;
 * }
 *
 * return (
 *   <Banner onDismiss={dismiss} />
 * );
 * ```
 */
export function useBannerDismiss(): UseBannerDismissReturn {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // 초기 상태 로드
  useEffect(() => {
    const state = loadDismissState();
    setIsDismissed(state?.dismissed ?? false);
  }, []);

  // 배너 닫기
  const dismiss = useCallback(() => {
    setIsDismissed(true);
    saveDismissState(true);
  }, []);

  // 상태 초기화 (테스트용)
  const reset = useCallback(() => {
    setIsDismissed(false);
    clearDismissState();
  }, []);

  return {
    isDismissed,
    dismiss,
    reset,
  };
}

export default useBannerDismiss;
