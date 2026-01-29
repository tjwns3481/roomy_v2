// @TASK P5-T5.5 - 공유 이벤트 추적 훅
// @SPEC docs/planning/06-tasks.md#P5-T5.5

'use client';

import { useCallback, useState } from 'react';
import {
  ShareEventType,
  ShareEventData,
  SocialPlatform,
} from '@/types/share';

/**
 * useTrackShare 훅 반환 타입
 */
export interface UseTrackShareReturn {
  /** 일반 이벤트 추적 */
  trackEvent: (eventType: ShareEventType, eventData?: ShareEventData) => Promise<void>;
  /** 링크 복사 이벤트 추적 */
  trackLinkCopy: () => Promise<void>;
  /** QR 다운로드 이벤트 추적 */
  trackQrDownload: () => Promise<void>;
  /** 소셜 공유 이벤트 추적 */
  trackSocialShare: (platform: SocialPlatform) => Promise<void>;
  /** 단축 URL 클릭 이벤트 추적 */
  trackShortUrlClick: () => Promise<void>;
  /** 로딩 상태 */
  isTracking: boolean;
  /** 에러 상태 */
  error: string | null;
}

/**
 * 공유 이벤트를 추적하는 훅
 *
 * @param guidebookId - 가이드북 ID
 * @returns 이벤트 추적 함수들
 *
 * @example
 * ```tsx
 * const { trackLinkCopy, trackSocialShare } = useTrackShare('guidebook-id');
 *
 * const handleCopy = async () => {
 *   await navigator.clipboard.writeText(url);
 *   await trackLinkCopy();
 * };
 *
 * const handleKakaoShare = async () => {
 *   await kakaoShare();
 *   await trackSocialShare('kakao');
 * };
 * ```
 */
export function useTrackShare(guidebookId: string): UseTrackShareReturn {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 이벤트 추적 API 호출
   */
  const trackEvent = useCallback(
    async (eventType: ShareEventType, eventData?: ShareEventData) => {
      if (!guidebookId) {
        console.warn('useTrackShare: guidebookId가 없습니다');
        return;
      }

      setIsTracking(true);
      setError(null);

      try {
        const response = await fetch('/api/share/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            guidebookId,
            eventType,
            eventData,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '이벤트 기록 실패');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류';
        console.error('공유 이벤트 추적 실패:', message);
        setError(message);
        // 이벤트 추적 실패는 사용자 경험에 영향을 주지 않도록 조용히 실패
      } finally {
        setIsTracking(false);
      }
    },
    [guidebookId]
  );

  /**
   * 링크 복사 이벤트 추적
   */
  const trackLinkCopy = useCallback(async () => {
    await trackEvent('link_copy');
  }, [trackEvent]);

  /**
   * QR 다운로드 이벤트 추적
   */
  const trackQrDownload = useCallback(async () => {
    await trackEvent('qr_download');
  }, [trackEvent]);

  /**
   * 소셜 공유 이벤트 추적
   */
  const trackSocialShare = useCallback(
    async (platform: SocialPlatform) => {
      await trackEvent('social_share', { platform });
    },
    [trackEvent]
  );

  /**
   * 단축 URL 클릭 이벤트 추적
   */
  const trackShortUrlClick = useCallback(async () => {
    await trackEvent('short_url_click');
  }, [trackEvent]);

  return {
    trackEvent,
    trackLinkCopy,
    trackQrDownload,
    trackSocialShare,
    trackShortUrlClick,
    isTracking,
    error,
  };
}
