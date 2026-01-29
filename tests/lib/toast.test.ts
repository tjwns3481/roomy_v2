// @TASK P7-T7.7 - 토스트 유틸리티 테스트
// @SPEC docs/planning/06-tasks.md#P7-T7.7

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { showToast } from '@/lib/toast';
import { toast as sonnerToast } from 'sonner';

// sonner mock
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    promise: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('showToast 유틸리티', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('success', () => {
    it('성공 토스트를 표시한다', () => {
      showToast.success('저장되었습니다');

      expect(sonnerToast.success).toHaveBeenCalledWith('저장되었습니다', {
        duration: 3000,
      });
    });

    it('옵션을 전달할 수 있다', () => {
      showToast.success('저장되었습니다', {
        description: '가이드북이 저장되었습니다',
      });

      expect(sonnerToast.success).toHaveBeenCalledWith('저장되었습니다', {
        duration: 3000,
        description: '가이드북이 저장되었습니다',
      });
    });
  });

  describe('error', () => {
    it('에러 토스트를 표시한다', () => {
      showToast.error('저장 실패');

      expect(sonnerToast.error).toHaveBeenCalledWith('저장 실패', {
        duration: 4000,
      });
    });
  });

  describe('info', () => {
    it('정보 토스트를 표시한다', () => {
      showToast.info('알림 메시지');

      expect(sonnerToast.info).toHaveBeenCalledWith('알림 메시지', {
        duration: 3000,
      });
    });
  });

  describe('warning', () => {
    it('경고 토스트를 표시한다', () => {
      showToast.warning('주의 사항');

      expect(sonnerToast.warning).toHaveBeenCalledWith('주의 사항', {
        duration: 4000,
      });
    });
  });

  describe('loading', () => {
    it('로딩 토스트를 표시한다', () => {
      showToast.loading('처리 중...');

      expect(sonnerToast.loading).toHaveBeenCalledWith('처리 중...', undefined);
    });
  });

  describe('promise', () => {
    it('Promise 기반 토스트를 표시한다', async () => {
      const promise = Promise.resolve('결과');
      const messages = {
        loading: '저장 중...',
        success: '저장 완료',
        error: '저장 실패',
      };

      showToast.promise(promise, messages);

      expect(sonnerToast.promise).toHaveBeenCalledWith(
        promise,
        expect.objectContaining({
          loading: '저장 중...',
        })
      );
    });

    it('함수 형태의 메시지를 지원한다', async () => {
      const promise = Promise.resolve({ count: 5 });
      const messages = {
        loading: '생성 중...',
        success: (data: { count: number }) => `${data.count}개 생성 완료`,
        error: (error: Error) => `에러: ${error.message}`,
      };

      showToast.promise(promise, messages);

      expect(sonnerToast.promise).toHaveBeenCalledWith(
        promise,
        expect.objectContaining({
          loading: '생성 중...',
        })
      );
    });
  });

  describe('dismiss', () => {
    it('특정 토스트를 닫는다', () => {
      showToast.dismiss('toast-id');

      expect(sonnerToast.dismiss).toHaveBeenCalledWith('toast-id');
    });

    it('모든 토스트를 닫는다', () => {
      showToast.dismiss();

      expect(sonnerToast.dismiss).toHaveBeenCalledWith();
    });
  });

  describe('dismissAll', () => {
    it('모든 토스트를 닫는다', () => {
      showToast.dismissAll();

      expect(sonnerToast.dismiss).toHaveBeenCalledWith();
    });
  });
});
