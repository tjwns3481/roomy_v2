/**
 * @TASK P3-T3.3 - AI 생성 훅
 * @TASK P6-T6.7 - 제한 초과 에러 처리 추가
 * @TASK P7-T7.7 - 토스트 알림 통합
 * @SPEC docs/planning/06-tasks.md#P3-T3.3
 * @TEST tests/hooks/useAiGenerate.test.ts
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { showToast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/lib/toast-messages';
import type {
  GenerationInputData,
  GenerationProgress,
  GenerationResult,
  GenerationError,
  GenerateSSEEvent,
} from '@/types/ai-generate';
import type { Block } from '@/types/guidebook';

/**
 * AI 생성 상태
 */
type GenerationStatus = 'idle' | 'loading' | 'success' | 'error' | 'limit_exceeded';

/**
 * 제한 초과 정보
 */
export interface AiLimitExceededInfo {
  error: 'LIMIT_EXCEEDED';
  message: string;
  current: number;
  limit: number;
  upgradeUrl: string;
  feature: 'ai';
}

/**
 * useAiGenerate 반환 타입
 */
interface UseAiGenerateReturn {
  status: GenerationStatus;
  progress: GenerationProgress | null;
  blocks: Block[];
  error: GenerationError | null;
  limitExceeded: AiLimitExceededInfo | null;
  generate: (guidebookId: string, input: GenerationInputData) => Promise<void>;
  cancel: () => void;
  reset: () => void;
  clearLimitExceeded: () => void;
}

/**
 * AI 가이드북 생성 훅
 *
 * @example
 * ```tsx
 * const { status, progress, blocks, generate } = useAiGenerate();
 *
 * const handleGenerate = async () => {
 *   await generate('guidebook-id', {
 *     mode: 'url',
 *     url: 'https://airbnb.com/rooms/123'
 *   });
 * };
 * ```
 */
export function useAiGenerate(): UseAiGenerateReturn {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [error, setError] = useState<GenerationError | null>(null);
  const [limitExceeded, setLimitExceeded] = useState<AiLimitExceededInfo | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * AI 생성 시작
   */
  const generate = useCallback(
    async (guidebookId: string, input: GenerationInputData) => {
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 새 AbortController 생성
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // 초기화
      setStatus('loading');
      setProgress(null);
      setBlocks([]);
      setError(null);
      setLimitExceeded(null);

      try {
        // API 호출
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ guidebookId, input }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          // HTTP 에러 처리
          const errorData = await response.json();

          // @TASK P6-T6.7 - 402 Payment Required (제한 초과) 처리
          if (response.status === 402 && errorData.error === 'LIMIT_EXCEEDED') {
            const limitInfo: AiLimitExceededInfo = {
              error: 'LIMIT_EXCEEDED',
              message: errorData.message || 'AI 생성 한도를 초과했습니다.',
              current: errorData.current || 0,
              limit: errorData.limit || 3,
              upgradeUrl: errorData.upgradeUrl || '/pricing',
              feature: 'ai',
            };
            setLimitExceeded(limitInfo);
            setStatus('limit_exceeded');

            // 토스트 알림
            showToast.error(TOAST_MESSAGES.AI_LIMIT_EXCEEDED, {
              description: limitInfo.message,
              action: {
                label: '업그레이드',
                onClick: () => {
                  window.location.href = limitInfo.upgradeUrl;
                },
              },
              duration: 5000,
            });
            return;
          }

          throw new Error(errorData.error?.message || 'API 요청 실패');
        }

        // SSE 스트림 처리
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('응답 스트림을 읽을 수 없습니다');
        }

        const generatedBlocks: Block[] = [];

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // 청크 디코딩
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) {
              continue;
            }

            // SSE 데이터 파싱
            const data = line.replace('data: ', '');

            try {
              const event: GenerateSSEEvent = JSON.parse(data);

              switch (event.type) {
                case 'progress':
                  setProgress(event.data);
                  break;

                case 'block':
                  generatedBlocks.push(event.data);
                  setBlocks([...generatedBlocks]);
                  break;

                case 'complete':
                  setStatus('success');
                  setProgress(null);
                  if (event.data.blocks) {
                    setBlocks(event.data.blocks);
                  }
                  // 성공 토스트
                  showToast.success(TOAST_MESSAGES.AI_SUCCESS, {
                    description: `${event.data.blocks?.length || 0}개의 블록이 생성되었습니다`,
                  });
                  break;

                case 'error':
                  setStatus('error');
                  setError(event.data);
                  setProgress(null);
                  // 에러 토스트
                  showToast.error(TOAST_MESSAGES.AI_ERROR, {
                    description: event.data.message,
                  });
                  break;
              }
            } catch (parseError) {
              console.error('[useAiGenerate] SSE 파싱 에러:', parseError);
            }
          }
        }
      } catch (err) {
        // 취소된 요청은 에러로 처리하지 않음
        if (err instanceof Error && err.name === 'AbortError') {
          setStatus('idle');
          return;
        }

        // 에러 처리
        const errorMessage =
          err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다';

        setStatus('error');
        setError({
          code: 'GENERATION_FAILED',
          message: errorMessage,
          retryable: true,
        });
        setProgress(null);

        // 에러 토스트
        showToast.error(TOAST_MESSAGES.AI_ERROR, {
          description: errorMessage,
        });
      }
    },
    []
  );

  /**
   * 생성 취소
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('idle');
    setProgress(null);
  }, []);

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    cancel();
    setBlocks([]);
    setError(null);
    setLimitExceeded(null);
  }, [cancel]);

  /**
   * @TASK P6-T6.7 - 제한 초과 상태 초기화
   */
  const clearLimitExceeded = useCallback(() => {
    setLimitExceeded(null);
    if (status === 'limit_exceeded') {
      setStatus('idle');
    }
  }, [status]);

  return {
    status,
    progress,
    blocks,
    error,
    limitExceeded,
    generate,
    cancel,
    reset,
    clearLimitExceeded,
  };
}
