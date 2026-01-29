// @TASK P1-T1.8 - 자동저장 훅 (3초 디바운스)
// @TASK P7-T7.7 - 토스트 알림 통합
// @SPEC docs/planning/06-tasks.md#P1-T1.8

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { showToast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/lib/toast-messages';

// ============================================================================
// Types
// ============================================================================

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveOptions<T> {
  /** 디바운스 딜레이 (ms) - 기본 3000ms */
  delay?: number;
  /** 저장 함수 */
  onSave: (data: T) => Promise<void>;
  /** 에러 핸들러 */
  onError?: (error: Error) => void;
  /** 저장 성공 콜백 */
  onSuccess?: () => void;
  /** 자동저장 활성화 여부 - 기본 true */
  enabled?: boolean;
}

export interface UseAutoSaveReturn<T> {
  /** 현재 저장 상태 */
  status: AutoSaveStatus;
  /** 데이터 변경 시 호출 (디바운스됨) */
  save: (data: T) => void;
  /** 즉시 저장 (디바운스 무시) */
  saveNow: (data: T) => Promise<void>;
  /** 마지막 저장 시간 */
  lastSavedAt: Date | null;
  /** 에러 메시지 */
  error: string | null;
  /** 저장 대기 중 여부 (디바운스 중) */
  isPending: boolean;
  /** 상태 초기화 */
  reset: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useAutoSave<T = unknown>(
  options: UseAutoSaveOptions<T>
): UseAutoSaveReturn<T> {
  const {
    delay = 3000,
    onSave,
    onError,
    onSuccess,
    enabled = true,
  } = options;

  // State
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Refs
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<T | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * 실제 저장 실행
   */
  const executeSave = useCallback(
    async (data: T) => {
      if (!isMountedRef.current) return;

      setStatus('saving');
      setError(null);

      try {
        await onSave(data);

        if (!isMountedRef.current) return;

        setStatus('saved');
        setLastSavedAt(new Date());
        onSuccess?.();

        // 3초 후 idle 상태로 복귀
        setTimeout(() => {
          if (isMountedRef.current) {
            setStatus('idle');
          }
        }, 3000);
      } catch (err) {
        if (!isMountedRef.current) return;

        const errorMessage =
          err instanceof Error ? err.message : '저장 중 오류가 발생했습니다';
        setStatus('error');
        setError(errorMessage);

        // 에러 토스트
        showToast.error(TOAST_MESSAGES.SAVE_ERROR, {
          description: errorMessage,
        });

        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    },
    [onSave, onError, onSuccess]
  );

  /**
   * 디바운스된 저장 (자동저장)
   */
  const save = useCallback(
    (data: T) => {
      if (!enabled) return;

      // 이전 타이머 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 대기 중 데이터 저장
      pendingDataRef.current = data;
      setIsPending(true);

      // 디바운스 타이머 설정
      timeoutRef.current = setTimeout(() => {
        if (pendingDataRef.current !== null) {
          executeSave(pendingDataRef.current);
          pendingDataRef.current = null;
          setIsPending(false);
        }
      }, delay);
    },
    [enabled, delay, executeSave]
  );

  /**
   * 즉시 저장 (디바운스 무시)
   */
  const saveNow = useCallback(
    async (data: T) => {
      // 대기 중인 타이머 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      pendingDataRef.current = null;
      setIsPending(false);

      await executeSave(data);
    },
    [executeSave]
  );

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingDataRef.current = null;
    setStatus('idle');
    setError(null);
    setIsPending(false);
  }, []);

  return {
    status,
    save,
    saveNow,
    lastSavedAt,
    error,
    isPending,
    reset,
  };
}

// ============================================================================
// Utility: Status Label
// ============================================================================

export function getAutoSaveStatusLabel(
  status: AutoSaveStatus,
  isPending: boolean
): string {
  if (isPending) return '변경사항 감지...';

  switch (status) {
    case 'idle':
      return '';
    case 'saving':
      return '저장 중...';
    case 'saved':
      return '저장됨';
    case 'error':
      return '저장 실패';
    default:
      return '';
  }
}

export default useAutoSave;
