// @TASK P5-T5.5 - useTrackShare 훅 테스트
// @SPEC docs/planning/06-tasks.md#P5-T5.5

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTrackShare } from '@/hooks/useTrackShare';

// Fetch 모킹
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useTrackShare', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { eventId: 'test-id' } }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('trackLinkCopy가 올바른 이벤트를 전송한다', async () => {
    const { result } = renderHook(() => useTrackShare('test-guidebook-id'));

    await act(async () => {
      await result.current.trackLinkCopy();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/share/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guidebookId: 'test-guidebook-id',
        eventType: 'link_copy',
        eventData: undefined,
      }),
    });
  });

  it('trackQrDownload가 올바른 이벤트를 전송한다', async () => {
    const { result } = renderHook(() => useTrackShare('test-guidebook-id'));

    await act(async () => {
      await result.current.trackQrDownload();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/share/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guidebookId: 'test-guidebook-id',
        eventType: 'qr_download',
        eventData: undefined,
      }),
    });
  });

  it('trackSocialShare가 플랫폼 정보와 함께 이벤트를 전송한다', async () => {
    const { result } = renderHook(() => useTrackShare('test-guidebook-id'));

    await act(async () => {
      await result.current.trackSocialShare('kakao');
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/share/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guidebookId: 'test-guidebook-id',
        eventType: 'social_share',
        eventData: { platform: 'kakao' },
      }),
    });
  });

  it('trackShortUrlClick이 올바른 이벤트를 전송한다', async () => {
    const { result } = renderHook(() => useTrackShare('test-guidebook-id'));

    await act(async () => {
      await result.current.trackShortUrlClick();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/share/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guidebookId: 'test-guidebook-id',
        eventType: 'short_url_click',
        eventData: undefined,
      }),
    });
  });

  it('guidebookId가 없으면 API를 호출하지 않는다', async () => {
    const { result } = renderHook(() => useTrackShare(''));

    await act(async () => {
      await result.current.trackLinkCopy();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('API 에러가 발생해도 예외를 던지지 않는다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: '서버 에러' }),
    });

    const { result } = renderHook(() => useTrackShare('test-guidebook-id'));

    // 에러가 발생해도 예외를 던지지 않아야 함
    await act(async () => {
      await result.current.trackLinkCopy();
    });

    expect(result.current.error).toBe('서버 에러');
  });

  it('isTracking 상태가 올바르게 변경된다', async () => {
    const { result } = renderHook(() => useTrackShare('test-guidebook-id'));

    expect(result.current.isTracking).toBe(false);

    const trackPromise = act(async () => {
      await result.current.trackLinkCopy();
    });

    await trackPromise;

    expect(result.current.isTracking).toBe(false);
  });

  it('여러 플랫폼 공유 추적이 가능하다', async () => {
    const { result } = renderHook(() => useTrackShare('test-guidebook-id'));

    await act(async () => {
      await result.current.trackSocialShare('kakao');
      await result.current.trackSocialShare('twitter');
      await result.current.trackSocialShare('facebook');
    });

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
