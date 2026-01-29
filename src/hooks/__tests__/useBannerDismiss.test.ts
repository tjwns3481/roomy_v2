/**
 * @TASK P6-T6.8 - useBannerDismiss 훅 테스트
 * @SPEC docs/planning/06-tasks.md#P6-T6.8
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBannerDismiss } from '../useBannerDismiss';

const BANNER_DISMISSED_KEY = 'roomy_upgrade_banner_dismissed';

describe('useBannerDismiss', () => {
  beforeEach(() => {
    // localStorage 초기화
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('초기 상태', () => {
    it('초기에는 닫히지 않은 상태다', () => {
      const { result } = renderHook(() => useBannerDismiss());

      expect(result.current.isDismissed).toBe(false);
    });

    it('localStorage에 닫기 상태가 있으면 닫힌 상태로 시작한다', () => {
      localStorage.setItem(
        BANNER_DISMISSED_KEY,
        JSON.stringify({
          dismissed: true,
          timestamp: Date.now(),
        })
      );

      const { result } = renderHook(() => useBannerDismiss());

      expect(result.current.isDismissed).toBe(true);
    });
  });

  describe('dismiss 함수', () => {
    it('dismiss 호출 시 isDismissed가 true가 된다', () => {
      const { result } = renderHook(() => useBannerDismiss());

      act(() => {
        result.current.dismiss();
      });

      expect(result.current.isDismissed).toBe(true);
    });

    it('dismiss 호출 시 localStorage에 저장된다', () => {
      const { result } = renderHook(() => useBannerDismiss());

      act(() => {
        result.current.dismiss();
      });

      const stored = localStorage.getItem(BANNER_DISMISSED_KEY);
      expect(stored).not.toBeNull();

      const state = JSON.parse(stored!);
      expect(state.dismissed).toBe(true);
      expect(state.timestamp).toBeGreaterThan(0);
    });
  });

  describe('reset 함수', () => {
    it('reset 호출 시 isDismissed가 false가 된다', () => {
      const { result } = renderHook(() => useBannerDismiss());

      act(() => {
        result.current.dismiss();
      });

      expect(result.current.isDismissed).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.isDismissed).toBe(false);
    });

    it('reset 호출 시 localStorage에서 제거된다', () => {
      const { result } = renderHook(() => useBannerDismiss());

      act(() => {
        result.current.dismiss();
      });

      expect(localStorage.getItem(BANNER_DISMISSED_KEY)).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(localStorage.getItem(BANNER_DISMISSED_KEY)).toBeNull();
    });
  });

  describe('7일 만료', () => {
    it('7일이 지나면 자동으로 닫기 상태가 해제된다', () => {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      localStorage.setItem(
        BANNER_DISMISSED_KEY,
        JSON.stringify({
          dismissed: true,
          timestamp: sevenDaysAgo,
        })
      );

      const { result } = renderHook(() => useBannerDismiss());

      expect(result.current.isDismissed).toBe(false);
      expect(localStorage.getItem(BANNER_DISMISSED_KEY)).toBeNull();
    });

    it('6일 경과 시에는 닫기 상태가 유지된다', () => {
      const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;

      localStorage.setItem(
        BANNER_DISMISSED_KEY,
        JSON.stringify({
          dismissed: true,
          timestamp: sixDaysAgo,
        })
      );

      const { result } = renderHook(() => useBannerDismiss());

      expect(result.current.isDismissed).toBe(true);
    });
  });

  describe('에러 처리', () => {
    it('localStorage 읽기 실패 시 닫히지 않은 상태로 간주한다', () => {
      localStorage.setItem(BANNER_DISMISSED_KEY, 'invalid json');

      const { result } = renderHook(() => useBannerDismiss());

      expect(result.current.isDismissed).toBe(false);
    });

    it('localStorage 쓰기 실패 시 에러가 발생하지 않는다', () => {
      // localStorage quota 초과 시뮬레이션
      vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      const { result } = renderHook(() => useBannerDismiss());

      expect(() => {
        act(() => {
          result.current.dismiss();
        });
      }).not.toThrow();
    });
  });
});
