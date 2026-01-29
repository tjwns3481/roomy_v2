/**
 * @TASK P3-T3.3 - AI 가이드북 생성 모달
 * @SPEC docs/planning/06-tasks.md#P3-T3.3
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ListingInputForm } from './ListingInputForm';
import { GenerationProgress } from './GenerationProgress';
import { GeneratedPreview } from './GeneratedPreview';
import { useAiGenerate } from '@/hooks/useAiGenerate';
import { XCircleIcon, AlertCircleIcon, RefreshCwIcon } from 'lucide-react';
import type { Block } from '@/types/guidebook';
import type { GenerationInputData } from '@/types/ai-generate';

interface AiGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (blocks: Block[]) => void;
  guidebookId: string;
}

/**
 * AI 가이드북 생성 모달
 *
 * 3단계 플로우:
 * 1. 입력: URL 또는 수동 입력
 * 2. 생성: 진행 상태 표시
 * 3. 결과: 미리보기 및 적용
 */
export function AiGenerateModal({
  isOpen,
  onClose,
  onComplete,
  guidebookId,
}: AiGenerateModalProps) {
  const { status, progress, blocks, error, generate, cancel, reset } = useAiGenerate();

  const handleSubmit = async (input: GenerationInputData) => {
    await generate(guidebookId, input);
  };

  const handleApply = (selectedBlocks: Block[]) => {
    onComplete(selectedBlocks);
    reset();
    onClose();
  };

  const handleClose = () => {
    if (status === 'loading') {
      cancel();
    }
    reset();
    onClose();
  };

  const handleRetry = () => {
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI 가이드북 생성</DialogTitle>
          <DialogDescription>
            에어비앤비 URL 또는 숙소 정보를 입력하면 AI가 자동으로 가이드북을 생성합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* 에러 상태 */}
          {status === 'error' && error && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <XCircleIcon className="w-4 h-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">생성 실패</div>
                  <div className="text-sm">{error.message}</div>
                </AlertDescription>
              </Alert>

              {/* 에러별 안내 */}
              {error.code === 'API_KEY_MISSING' && (
                <Alert>
                  <AlertCircleIcon className="w-4 h-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-1">API 키가 설정되지 않았습니다</div>
                    <div className="text-sm">
                      설정에서 OpenAI API 키를 등록해주세요.
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {error.code === 'RATE_LIMIT_EXCEEDED' && (
                <Alert>
                  <AlertCircleIcon className="w-4 h-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-1">요청 한도 초과</div>
                    <div className="text-sm">
                      잠시 후 다시 시도해주세요.
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {error.code === 'TOKEN_LIMIT_EXCEEDED' && (
                <Alert>
                  <AlertCircleIcon className="w-4 h-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-1">플랜 한도 초과</div>
                    <div className="text-sm">
                      무료 플랜은 월 3회까지 AI 생성이 가능합니다. 프리미엄 플랜으로 업그레이드하세요.
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* 재시도 버튼 */}
              {error.retryable && (
                <Button onClick={handleRetry} variant="outline" className="w-full">
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  다시 시도
                </Button>
              )}
            </div>
          )}

          {/* 입력 단계 */}
          {status === 'idle' && (
            <ListingInputForm onSubmit={handleSubmit} />
          )}

          {/* 생성 중 단계 */}
          {status === 'loading' && progress && (
            <div className="space-y-4">
              <GenerationProgress progress={progress} />

              {/* 취소 버튼 */}
              <Button
                onClick={cancel}
                variant="outline"
                className="w-full"
              >
                생성 취소
              </Button>
            </div>
          )}

          {/* 완료 단계 */}
          {status === 'success' && blocks.length > 0 && (
            <GeneratedPreview
              blocks={blocks}
              onApply={handleApply}
              onCancel={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
