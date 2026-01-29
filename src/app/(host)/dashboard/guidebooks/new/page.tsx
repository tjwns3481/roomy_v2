// @TASK P4-T4.3 - 새 가이드북 생성 페이지
// @SPEC docs/planning/03-user-flow.md#가이드북-생성-플로우

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GuidebookForm, GuidebookFormData } from '@/components/dashboard/GuidebookForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

type Step = 'basic' | 'method';
type GenerationMethod = 'ai' | 'manual';

export default function NewGuidebookPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('basic');
  const [formData, setFormData] = useState<GuidebookFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBasicInfoSubmit = (data: GuidebookFormData) => {
    setFormData(data);
    setStep('method');
  };

  const handleMethodSelect = async (method: GenerationMethod) => {
    if (!formData) return;

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
      if (method === 'ai') {
        router.push(`/editor/${result.guidebook.id}?ai=true`);
      } else {
        router.push(`/editor/${result.guidebook.id}`);
      }
    } catch (error) {
      console.error('가이드북 생성 오류:', error);
      toast.error(error instanceof Error ? error.message : '가이드북 생성에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">새 가이드북 만들기</h1>
              <p className="text-gray-600 mt-1">
                {step === 'basic'
                  ? '기본 정보를 입력하세요'
                  : '콘텐츠 생성 방식을 선택하세요'}
              </p>
            </div>
          </div>

          {/* 진행 단계 표시 */}
          <div className="flex items-center gap-2">
            <div
              className={`flex-1 h-2 rounded-full ${
                step === 'basic' ? 'bg-primary' : 'bg-primary'
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full ${
                step === 'method' ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          </div>
        </div>

        {/* Step 1: 기본 정보 */}
        {step === 'basic' && (
          <Card className="p-6">
            <GuidebookForm
              onSubmit={handleBasicInfoSubmit}
              onCancel={() => router.back()}
              isLoading={isLoading}
            />
          </Card>
        )}

        {/* Step 2: 생성 방식 선택 */}
        {step === 'method' && (
          <div className="space-y-4">
            {/* AI 자동 생성 */}
            <Card
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => !isLoading && handleMethodSelect('ai')}
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
            </Card>

            {/* 직접 작성 */}
            <Card
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => !isLoading && handleMethodSelect('manual')}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">✏️ 직접 작성</h3>
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
            </Card>

            {/* 이전 버튼 */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('basic')} disabled={isLoading}>
                이전
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
