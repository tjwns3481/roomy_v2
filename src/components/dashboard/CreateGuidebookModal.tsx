// @TASK P4-T4.3 - 가이드북 생성 모달 (2단계 플로우)
// @SPEC docs/planning/03-user-flow.md#가이드북-생성-플로우

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GuidebookForm, GuidebookFormData } from './GuidebookForm';
import { toast } from 'sonner';

interface CreateGuidebookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'basic' | 'method';
type GenerationMethod = 'ai' | 'manual';

export function CreateGuidebookModal({ open, onOpenChange }: CreateGuidebookModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('basic');
  const [formData, setFormData] = useState<GuidebookFormData | null>(null);
  const [method, setMethod] = useState<GenerationMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Step 1: 기본 정보 제출
   */
  const handleBasicInfoSubmit = async (data: GuidebookFormData) => {
    setFormData(data);
    setStep('method');
  };

  /**
   * Step 2: 생성 방식 선택
   */
  const handleMethodSelect = async (selectedMethod: GenerationMethod) => {
    if (!formData) return;

    setMethod(selectedMethod);
    setIsLoading(true);

    try {
      // 가이드북 생성
      const response = await fetch('/api/guidebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '가이드북 생성에 실패했습니다');
      }

      toast.success('가이드북이 생성되었습니다');

      // 생성 방식에 따라 다른 페이지로 이동
      if (selectedMethod === 'ai') {
        // AI 생성 모달로 이동 (P3-T3.3)
        router.push(`/dashboard/editor/${result.guidebook.id}?ai=true`);
      } else {
        // 에디터로 바로 이동
        router.push(`/dashboard/editor/${result.guidebook.id}`);
      }

      // 모달 닫기
      onOpenChange(false);
      resetModal();
    } catch (error) {
      console.error('가이드북 생성 오류:', error);
      toast.error(error instanceof Error ? error.message : '가이드북 생성에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 모달 초기화
   */
  const resetModal = () => {
    setStep('basic');
    setFormData(null);
    setMethod(null);
  };

  /**
   * 이전 단계로
   */
  const handleBack = () => {
    if (step === 'method') {
      setStep('basic');
      setMethod(null);
    }
  };

  /**
   * 모달 닫기 시 초기화
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetModal();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        {/* Step 1: 기본 정보 입력 */}
        {step === 'basic' && (
          <>
            <DialogHeader>
              <DialogTitle>새 가이드북 만들기</DialogTitle>
              <DialogDescription>
                숙소 이름과 URL을 설정하세요. URL은 나중에 변경할 수 없습니다.
              </DialogDescription>
            </DialogHeader>

            <GuidebookForm
              onSubmit={handleBasicInfoSubmit}
              onCancel={() => handleOpenChange(false)}
              isLoading={isLoading}
            />
          </>
        )}

        {/* Step 2: 콘텐츠 생성 방식 선택 */}
        {step === 'method' && (
          <>
            <DialogHeader>
              <DialogTitle>콘텐츠 생성 방식 선택</DialogTitle>
              <DialogDescription>
                AI가 자동으로 가이드북을 생성하거나, 직접 작성할 수 있습니다.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* AI 자동 생성 */}
              <button
                onClick={() => handleMethodSelect('ai')}
                disabled={isLoading}
                className={`
                  w-full p-6 rounded-xl border-2 transition-all text-left
                  ${
                    method === 'ai'
                      ? 'border-primary bg-primary-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      🤖 AI로 자동 생성 (권장)
                    </h3>
                    <p className="text-sm text-gray-600">
                      에어비앤비 URL이나 숙소 정보를 입력하면 AI가 가이드북을 자동으로
                      생성합니다.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        약 30초 소요
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                        한국어 최적화
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* 직접 작성 */}
              <button
                onClick={() => handleMethodSelect('manual')}
                disabled={isLoading}
                className={`
                  w-full p-6 rounded-xl border-2 transition-all text-left
                  ${
                    method === 'manual'
                      ? 'border-primary bg-primary-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      ✏️ 직접 작성
                    </h3>
                    <p className="text-sm text-gray-600">
                      빈 템플릿으로 시작하여 직접 내용을 작성합니다.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        커스터마이징 자유
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                이전
              </Button>
              <Button onClick={() => handleOpenChange(false)} variant="ghost" disabled={isLoading}>
                취소
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
