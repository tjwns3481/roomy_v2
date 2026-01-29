'use client';

/**
 * @TASK P7-T7.10 프로젝트 문서화 및 사용자 온보딩
 *
 * WelcomeModal 컴포넌트
 * - 첫 로그인 시 표시되는 환영 모달
 * - 3단계 튜토리얼 (Roomy 소개, 주요 기능, 시작하기)
 * - 건너뛰기 옵션 제공
 * - localStorage에 표시 여부 저장
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Zap } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Roomy에 오신 것을 환영합니다!',
    description: '게스트 가이드북 작성을 쉽게 만드는 SaaS',
    icon: <Zap className="h-12 w-12 text-blue-500" />,
    details: [
      '📱 모바일 최적화된 디지털 가이드북',
      '🤖 AI 기반 자동 생성',
      '🎨 직관적인 블록 에디터',
      '📊 상세한 통계 분석',
    ],
  },
  {
    id: 2,
    title: '주요 기능',
    description: 'Roomy의 강력한 기능들을 살펴보세요',
    icon: <CheckCircle className="h-12 w-12 text-green-500" />,
    details: [
      '✨ AI로 Airbnb 링크만으로 가이드북 자동 생성',
      '🧩 7가지 블록 타입으로 자유로운 커스터마이징',
      '🔗 QR 코드 기반 빠른 공유',
      '💬 AI 챗봇으로 게스트 질문 자동 답변',
    ],
  },
  {
    id: 3,
    title: '시작하기',
    description: '첫 번째 가이드북을 만들어보세요',
    icon: <ArrowRight className="h-12 w-12 text-purple-500" />,
    details: [
      '1️⃣ 대시보드에서 "새 가이드북" 클릭',
      '2️⃣ Airbnb 링크 입력 또는 수동 작성 선택',
      '3️⃣ 블록 에디터로 커스터마이징',
      '4️⃣ QR 코드로 게스트와 공유',
    ],
  },
];

interface WelcomeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function WelcomeModal({ isOpen: controlledIsOpen, onClose }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? false);
  const [hasShownBefore, setHasShownBefore] = useState(false);

  // 초기화: localStorage에서 표시 여부 확인
  useEffect(() => {
    const hasShown = localStorage.getItem('roomy_welcome_shown');
    if (hasShown === 'true') {
      setHasShownBefore(true);
      setIsOpen(false);
    } else if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    } else {
      // 기본값: 처음 방문 시 표시
      setIsOpen(true);
    }
  }, [controlledIsOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('roomy_welcome_shown', 'true');
    onClose?.();
  };

  const handleSkip = () => {
    setIsOpen(false);
    localStorage.setItem('roomy_welcome_shown', 'true');
    onClose?.();
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps.find((s) => s.id === currentStep);

  if (!isOpen || !step) {
    return null;
  }

  const isLastStep = currentStep === steps.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{step.title}</DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-8">
          {/* 아이콘 */}
          <div className="flex justify-center">{step.icon}</div>

          {/* 상세 설명 */}
          <div className="w-full space-y-3">
            {step.details.map((detail, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg bg-gray-50 p-4"
              >
                <span className="text-lg font-semibold text-gray-700">{detail.charAt(0)}</span>
                <p className="text-sm text-gray-700">{detail.substring(1)}</p>
              </div>
            ))}
          </div>

          {/* 진행 표시 */}
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index + 1)}
                className={`h-2 transition-all ${
                  index + 1 === currentStep
                    ? 'w-8 bg-blue-500'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
          >
            건너뛰기
          </Button>

          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1"
            >
              이전
            </Button>
          )}

          <Button
            onClick={handleNext}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            {isLastStep ? '시작하기' : '다음'}
          </Button>
        </div>

        {/* 다시 보지 않기 옵션 */}
        <div className="flex items-center justify-center gap-2 pt-4 text-xs text-gray-500">
          <button
            onClick={() => localStorage.removeItem('roomy_welcome_shown')}
            className="underline hover:text-gray-700"
          >
            다시 보기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 사용 예시:
 *
 * // 자동 표시 (첫 방문 시)
 * <WelcomeModal />
 *
 * // 명시적 제어
 * const [showWelcome, setShowWelcome] = useState(false);
 * <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
 */
