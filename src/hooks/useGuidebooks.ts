// @TASK P4-T4.2 - 가이드북 목록 관리 훅
// @TASK P6-T6.7 - 제한 초과 에러 처리 추가
// @TASK P7-T7.7 - 토스트 알림 통합
// @SPEC docs/planning/06-tasks.md#P4-T4.2

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showToast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/lib/toast-messages';
import type { Guidebook } from '@/types/guidebook';

// 제한 초과 에러 타입
export interface LimitExceededInfo {
  error: 'LIMIT_EXCEEDED';
  message: string;
  current: number;
  limit: number;
  upgradeUrl: string;
  feature: 'guidebook' | 'ai';
}

export function useGuidebooks() {
  const [guidebooks, setGuidebooks] = useState<Guidebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [limitExceeded, setLimitExceeded] = useState<LimitExceededInfo | null>(null);

  const supabase = createClient();

  // 가이드북 목록 조회
  const fetchGuidebooks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다');
      }

      const { data, error: fetchError } = await supabase
        .from('guidebooks')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      setGuidebooks(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch guidebooks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 가이드북 삭제
  const deleteGuidebook = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('guidebooks')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // 로컬 상태 업데이트
      setGuidebooks((prev) => prev.filter((g) => g.id !== id));

      // 성공 토스트
      showToast.success(TOAST_MESSAGES.GUIDEBOOK_DELETE_SUCCESS);
    } catch (err) {
      console.error('Failed to delete guidebook:', err);
      showToast.error(TOAST_MESSAGES.GUIDEBOOK_DELETE_ERROR);
      throw err;
    }
  };

  // 가이드북 보관
  const archiveGuidebook = async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('guidebooks')
        .update({ status: 'archived' })
        .eq('id', id);

      if (updateError) throw updateError;

      // 로컬 상태 업데이트
      setGuidebooks((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status: 'archived' as const } : g))
      );

      // 성공 토스트
      showToast.success(TOAST_MESSAGES.GUIDEBOOK_ARCHIVE_SUCCESS);
    } catch (err) {
      console.error('Failed to archive guidebook:', err);
      showToast.error('가이드북 보관에 실패했습니다');
      throw err;
    }
  };

  // @TASK P6-T6.7 - 가이드북 생성 (제한 체크 포함)
  // @TASK P7-T7.7 - 토스트 알림 추가
  const createGuidebook = useCallback(
    async (data: { title: string; slug: string; theme?: string }): Promise<Guidebook | null> => {
      try {
        setLimitExceeded(null);

        const response = await fetch('/api/guidebooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        // 402 Payment Required - 제한 초과
        if (response.status === 402) {
          const limitInfo: LimitExceededInfo = {
            error: 'LIMIT_EXCEEDED',
            message: result.message,
            current: result.current,
            limit: result.limit,
            upgradeUrl: result.upgradeUrl || '/pricing',
            feature: 'guidebook',
          };
          setLimitExceeded(limitInfo);
          showToast.error(TOAST_MESSAGES.GUIDEBOOK_LIMIT_EXCEEDED, {
            description: result.message,
            action: {
              label: '업그레이드',
              onClick: () => {
                window.location.href = result.upgradeUrl || '/pricing';
              },
            },
          });
          return null;
        }

        if (!response.ok) {
          const errorMsg = result.error || TOAST_MESSAGES.GUIDEBOOK_CREATE_ERROR;
          showToast.error(errorMsg);
          throw new Error(errorMsg);
        }

        // 목록 새로고침
        await fetchGuidebooks();

        // 성공 토스트
        showToast.success(TOAST_MESSAGES.GUIDEBOOK_CREATE_SUCCESS, {
          description: `"${data.title}" 가이드북이 생성되었습니다`,
        });

        return result.guidebook;
      } catch (err) {
        console.error('Failed to create guidebook:', err);
        setError(err as Error);
        if (err instanceof Error && !err.message.includes('업그레이드')) {
          showToast.error(TOAST_MESSAGES.GUIDEBOOK_CREATE_ERROR);
        }
        throw err;
      }
    },
    [fetchGuidebooks]
  );

  // 제한 초과 상태 초기화
  const clearLimitExceeded = useCallback(() => {
    setLimitExceeded(null);
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchGuidebooks();
  }, []);

  return {
    guidebooks,
    isLoading,
    error,
    limitExceeded,
    refetch: fetchGuidebooks,
    createGuidebook,
    deleteGuidebook,
    archiveGuidebook,
    clearLimitExceeded,
  };
}
