/**
 * @TASK P3-T3.3 - AI 생성 진행 상태 UI
 * @SPEC docs/planning/06-tasks.md#P3-T3.3
 */

'use client';

import { cn } from '@/lib/utils';
import {
  Loader2Icon,
  CheckCircle2Icon,
  XCircleIcon,
  CircleIcon,
} from 'lucide-react';
import type { GenerationProgress, GenerationStep } from '@/types/ai-generate';

interface GenerationProgressProps {
  progress: GenerationProgress;
}

/**
 * 단계명 매핑
 */
const STEP_LABELS: Record<GenerationStep, string> = {
  idle: '대기 중',
  parsing: '숙소 정보 분석',
  analyzing: '정보 구조화',
  generating_hero: '히어로 섹션 생성',
  generating_quickInfo: '체크인/Wi-Fi 정보 생성',
  generating_amenities: '편의시설 정리',
  generating_rules: '이용 규칙 작성',
  generating_notice: '공지사항 생성',
  generating_map: '지도 정보 생성',
  complete: '완료',
  error: '에러 발생',
};

/**
 * 단계별 아이콘 표시
 */
function StepIcon({ status }: { status: 'pending' | 'loading' | 'success' | 'error' }) {
  switch (status) {
    case 'loading':
      return <Loader2Icon className="w-5 h-5 text-primary animate-spin" />;
    case 'success':
      return <CheckCircle2Icon className="w-5 h-5 text-green-500" />;
    case 'error':
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    default:
      return <CircleIcon className="w-5 h-5 text-gray-300" />;
  }
}

/**
 * AI 생성 진행 상태 UI
 *
 * 생성 진행 중 각 단계의 상태와 진행률을 표시합니다.
 */
export function GenerationProgress({ progress }: GenerationProgressProps) {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-primary/10 rounded-full">
          <Loader2Icon className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h3 className="text-xl font-semibold mb-2">AI 가이드북 생성 중...</h3>
        <p className="text-sm text-gray-500">
          잠시만 기다려 주세요. 최상의 가이드북을 만들고 있습니다.
        </p>
      </div>

      {/* 진행 바 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{Math.round(progress.progress)}%</span>
          {progress.estimatedTimeRemaining && (
            <span className="text-gray-500">
              약 {progress.estimatedTimeRemaining}초 남음
            </span>
          )}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${progress.progress}%` }}
            role="progressbar"
            aria-valuenow={progress.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* 단계 목록 */}
      <div className="space-y-3">
        {progress.steps.map((step) => (
          <div
            key={step.step}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg transition-colors',
              step.status === 'loading' && 'bg-primary/5',
              step.status === 'success' && 'bg-green-50',
              step.status === 'error' && 'bg-red-50'
            )}
          >
            {/* 아이콘 */}
            <div className="flex-shrink-0 mt-0.5">
              <StepIcon status={step.status} />
            </div>

            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">
                {STEP_LABELS[step.step]}
              </div>
              {step.message && (
                <div className="text-xs text-gray-500 mt-1">{step.message}</div>
              )}
            </div>

            {/* 상태 배지 */}
            {step.status === 'loading' && (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                  진행 중
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 안내 메시지 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> 생성된 블록은 언제든지 수정하거나 삭제할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
