'use client';

/**
 * @TASK P7-T7.10 프로젝트 문서화 및 사용자 온보딩
 *
 * FeatureTour 컴포넌트
 * - 주요 기능 안내용 투어
 * - 특정 UI 요소 위에 표시되는 툴팁
 * - 단계별 진행 가능
 * - localStorage에 완료 여부 저장
 */

import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS 선택자
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlightClass?: string;
}

export const dashboardTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '대시보드에 오신 것을 환영합니다',
    description: '여기서 모든 가이드북을 관리할 수 있습니다. "새 가이드북" 버튼을 클릭하여 시작하세요.',
    target: '[data-tour-target="new-guidebook-button"]',
    position: 'bottom',
  },
  {
    id: 'guidebook-list',
    title: '가이드북 목록',
    description: '생성한 모든 가이드북이 여기에 나타납니다. 각 가이드북을 클릭하여 편집하거나 통계를 볼 수 있습니다.',
    target: '[data-tour-target="guidebook-list"]',
    position: 'top',
  },
  {
    id: 'stats',
    title: '통계',
    description: '조회수, 클릭, 사용자 정보 등 자세한 통계를 확인하세요.',
    target: '[data-tour-target="stats-link"]',
    position: 'right',
  },
  {
    id: 'settings',
    title: '설정',
    description: '프로필, 결제, 알림 등을 관리할 수 있습니다.',
    target: '[data-tour-target="settings-link"]',
    position: 'right',
  },
];

export const editorTourSteps: TourStep[] = [
  {
    id: 'add-block',
    title: '블록 추가',
    description: '"+" 버튼을 클릭하여 새로운 블록을 추가하세요. 히어로, 갤러리, 맵 등 7가지 타입이 있습니다.',
    target: '[data-tour-target="add-block-button"]',
    position: 'bottom',
  },
  {
    id: 'block-list',
    title: '블록 목록',
    description: '추가된 블록들이 여기 표시됩니다. 드래그하여 순서를 변경할 수 있습니다.',
    target: '[data-tour-target="block-list"]',
    position: 'right',
  },
  {
    id: 'preview',
    title: '미리보기',
    description: '우측 패널에서 가이드북이 게스트에게 어떻게 보이는지 실시간으로 확인할 수 있습니다.',
    target: '[data-tour-target="preview-panel"]',
    position: 'left',
  },
  {
    id: 'save-publish',
    title: '저장 & 공개',
    description: '변경사항을 저장하고 게스트와 공유하세요. "공개" 버튼으로 활성화합니다.',
    target: '[data-tour-target="save-button"]',
    position: 'bottom',
  },
];

interface FeatureTourProps {
  steps: TourStep[];
  tourId: string; // localStorage 키 접두어
  autoStart?: boolean;
  onComplete?: () => void;
}

export function FeatureTour({
  steps,
  tourId,
  autoStart = true,
  onComplete,
}: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 투어 시작/초기화
  useEffect(() => {
    const hasCompleted = localStorage.getItem(`${tourId}_completed`);
    if (autoStart && !hasCompleted) {
      setIsActive(true);
      updateHighlight(0);
    }
  }, [tourId, autoStart]);

  // 요소 위치 계산
  const updateHighlight = (stepIndex: number) => {
    const step = steps[stepIndex];
    const targetElement = document.querySelector(step.target);

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      updateHighlight(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      updateHighlight(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`${tourId}_completed`, 'true');
    setIsActive(false);
    onComplete?.();
  };

  const handleComplete = () => {
    localStorage.setItem(`${tourId}_completed`, 'true');
    setIsActive(false);
    onComplete?.();
  };

  if (!isActive || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];

  // 숨겨진 요소 찾기
  const tooltipPosition = position ? calculateTooltipPosition(position, step.position) : null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className="pointer-events-none fixed inset-0 z-40 bg-black/20 transition-opacity"
        onClick={handleSkip}
      />

      {/* 하이라이트 */}
      {position && (
        <div
          className="pointer-events-none fixed z-40 border-2 border-blue-500 rounded-lg shadow-lg"
          style={{
            top: position.top - 4,
            left: position.left - 4,
            width: position.width + 8,
            height: position.height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.2)',
          }}
        />
      )}

      {/* 툴팁 */}
      {tooltipPosition && (
        <div
          ref={tooltipRef}
          className="pointer-events-auto fixed z-50 w-80 rounded-lg bg-white p-4 shadow-xl"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{step.description}</p>

              {/* 진행 표시 */}
              <div className="mb-4 flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded ${
                      index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* 버튼 */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  건너뛰기
                </Button>
                {currentStep > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrevious}
                  >
                    이전
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  {currentStep === steps.length - 1 ? '완료' : '다음'}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>

            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// 툴팁 위치 계산
function calculateTooltipPosition(
  target: { top: number; left: number; width: number; height: number },
  position?: 'top' | 'bottom' | 'left' | 'right'
): { top: number; left: number } {
  const offset = 16;
  const tooltipWidth = 320; // w-80

  const targetCenter = target.left + target.width / 2;

  switch (position) {
    case 'top':
      return {
        top: target.top - 16 - 120, // 추정 높이
        left: targetCenter - tooltipWidth / 2,
      };
    case 'bottom':
      return {
        top: target.top + target.height + offset,
        left: targetCenter - tooltipWidth / 2,
      };
    case 'left':
      return {
        top: target.top + target.height / 2 - 60, // 추정 높이 절반
        left: target.left - tooltipWidth - offset,
      };
    case 'right':
    default:
      return {
        top: target.top + target.height / 2 - 60,
        left: target.left + target.width + offset,
      };
  }
}

/**
 * 사용 예시:
 *
 * 대시보드에서:
 * <FeatureTour
 *   steps={dashboardTourSteps}
 *   tourId="dashboard-tour"
 *   autoStart={true}
 *   onComplete={() => console.log('투어 완료')}
 * />
 *
 * 에디터에서:
 * <FeatureTour
 *   steps={editorTourSteps}
 *   tourId="editor-tour"
 *   autoStart={true}
 * />
 *
 * HTML 예시:
 * <button data-tour-target="new-guidebook-button">새 가이드북</button>
 * <div data-tour-target="guidebook-list">...</div>
 */
