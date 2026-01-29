// @TASK P7-T7.7 - 토스트 알림 유틸리티
// @SPEC docs/planning/06-tasks.md#P7-T7.7

import { toast as sonnerToast, ExternalToast } from 'sonner';

// 토스트 옵션 타입
export type ToastOptions = ExternalToast;

// Promise 메시지 타입
export interface PromiseMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: Error) => string);
}

/**
 * 토스트 알림 유틸리티
 *
 * @example
 * // 성공 알림
 * showToast.success('저장되었습니다');
 *
 * // 에러 알림 (설명 포함)
 * showToast.error('저장 실패', {
 *   description: '네트워크를 확인해주세요'
 * });
 *
 * // Promise 기반 토스트
 * showToast.promise(saveData(), {
 *   loading: '저장 중...',
 *   success: '저장 완료',
 *   error: '저장 실패',
 * });
 */
export const showToast = {
  /**
   * 성공 알림
   */
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      duration: 3000,
      ...options,
    });
  },

  /**
   * 에러 알림
   */
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      duration: 4000,
      ...options,
    });
  },

  /**
   * 정보 알림
   */
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      duration: 3000,
      ...options,
    });
  },

  /**
   * 경고 알림
   */
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      duration: 4000,
      ...options,
    });
  },

  /**
   * 로딩 알림 (수동으로 dismiss해야 함)
   */
  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, options);
  },

  /**
   * Promise 기반 알림 (자동으로 상태 변화)
   */
  promise: <T>(promise: Promise<T>, messages: PromiseMessages<T>) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: (data) => {
        if (typeof messages.success === 'function') {
          return messages.success(data);
        }
        return messages.success;
      },
      error: (error) => {
        if (typeof messages.error === 'function') {
          return messages.error(error as Error);
        }
        return messages.error;
      },
    });
  },

  /**
   * 토스트 닫기
   */
  dismiss: (id?: string | number) => {
    if (id) {
      sonnerToast.dismiss(id);
    } else {
      sonnerToast.dismiss();
    }
  },

  /**
   * 모든 토스트 닫기
   */
  dismissAll: () => {
    sonnerToast.dismiss();
  },
};
