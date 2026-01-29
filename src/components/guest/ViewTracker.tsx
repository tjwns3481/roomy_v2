// @TASK P2-T2.7 - 조회수 추적 컴포넌트
// @SPEC docs/planning/06-tasks.md#P2-T2.7

'use client';

import { useEffect, useRef } from 'react';

interface ViewTrackerProps {
  guidebookId: string;
}

/**
 * 세션 스토리지 키 생성
 */
function getViewedKey(guidebookId: string): string {
  return `roomy_viewed_${guidebookId}`;
}

/**
 * 방문자 ID 생성 또는 가져오기
 */
function getOrCreateVisitorId(): string {
  const storageKey = 'roomy_visitor_id';

  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem(storageKey);
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(storageKey, visitorId);
  }
  return visitorId;
}

/**
 * 오늘 이미 조회했는지 확인
 */
function hasViewedToday(guidebookId: string): boolean {
  if (typeof window === 'undefined') return false;

  const key = getViewedKey(guidebookId);
  const viewedAt = sessionStorage.getItem(key);

  if (!viewedAt) return false;

  // 세션 스토리지는 탭 닫으면 삭제되므로, 같은 세션 내 중복 방지
  return true;
}

/**
 * 조회 기록 저장
 */
function markAsViewed(guidebookId: string): void {
  if (typeof window === 'undefined') return;

  const key = getViewedKey(guidebookId);
  sessionStorage.setItem(key, new Date().toISOString());
}

/**
 * ViewTracker
 *
 * 페이지 로드 시 조회수 증가 API를 호출하는 클라이언트 컴포넌트
 * - 세션당 1회만 조회수 증가 (중복 방지)
 * - 에러 발생 시 무시 (사용자 경험에 영향 없음)
 */
export function ViewTracker({ guidebookId }: ViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // 이미 추적했으면 무시
    if (hasTracked.current) return;

    // 세션 내 중복 조회 방지
    if (hasViewedToday(guidebookId)) {
      hasTracked.current = true;
      return;
    }

    const trackView = async () => {
      try {
        hasTracked.current = true;

        const visitorId = getOrCreateVisitorId();

        const response = await fetch(`/api/guidebooks/${guidebookId}/views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visitor_id: visitorId,
          }),
        });

        if (response.ok) {
          // 조회 기록 저장
          markAsViewed(guidebookId);
        }
      } catch (error) {
        // 조회수 증가 실패는 무시 (사용자 경험에 영향 없음)
        console.debug('View tracking failed:', error);
      }
    };

    trackView();
  }, [guidebookId]);

  // 렌더링할 UI 없음
  return null;
}

export default ViewTracker;
