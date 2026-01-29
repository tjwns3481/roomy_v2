/**
 * @TASK P6-T6.7 - 제한 초과 다이얼로그 컴포넌트
 * @SPEC docs/planning/04-database-design.md#subscriptions
 *
 * 가이드북/AI 생성 제한 초과 시 표시되는 다이얼로그
 * 업그레이드 유도 및 현재 사용량 정보 표시
 */

'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Sparkles, BookOpen, Zap } from 'lucide-react';

// ============================================================
// 타입 정의
// ============================================================

export interface LimitExceededDialogProps {
  /** 다이얼로그 열림 상태 */
  open: boolean;
  /** 다이얼로그 닫기 핸들러 */
  onOpenChange: (open: boolean) => void;
  /** 제한 종류 */
  feature: 'guidebook' | 'ai';
  /** 현재 사용량 */
  current: number;
  /** 제한 */
  limit: number;
  /** 에러 메시지 (선택) */
  message?: string;
  /** 업그레이드 URL (기본: /pricing) */
  upgradeUrl?: string;
}

// ============================================================
// 컴포넌트
// ============================================================

export function LimitExceededDialog({
  open,
  onOpenChange,
  feature,
  current,
  limit,
  message,
  upgradeUrl = '/pricing',
}: LimitExceededDialogProps) {
  const router = useRouter();

  // 기능별 아이콘 및 텍스트
  const featureConfig = {
    guidebook: {
      icon: BookOpen,
      title: '가이드북 생성 한도 초과',
      unit: '개',
      defaultMessage: '현재 플랜의 가이드북 생성 한도에 도달했습니다.',
    },
    ai: {
      icon: Sparkles,
      title: 'AI 생성 한도 초과',
      unit: '회',
      defaultMessage: '이번 달 AI 생성 한도에 도달했습니다.',
    },
  };

  const config = featureConfig[feature];
  const Icon = config.icon;
  const progressValue = limit > 0 ? (current / limit) * 100 : 100;

  const handleUpgrade = () => {
    onOpenChange(false);
    router.push(upgradeUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center">{config.title}</DialogTitle>
          <DialogDescription className="text-center">
            {message || config.defaultMessage}
          </DialogDescription>
        </DialogHeader>

        {/* 사용량 표시 */}
        <div className="py-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
              현재 사용량
            </span>
            <span className="font-medium">
              {current} / {limit === -1 ? '무제한' : `${limit}${config.unit}`}
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
          {progressValue >= 100 && (
            <p className="mt-2 text-center text-xs text-amber-600">
              한도에 도달했습니다
            </p>
          )}
        </div>

        {/* 플랜 비교 카드 */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">Pro 플랜 혜택</span>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {feature === 'guidebook' ? (
              <>
                <li>- 가이드북 5개까지 생성</li>
                <li>- 워터마크 제거</li>
                <li>- 모든 테마 및 블록 사용</li>
              </>
            ) : (
              <>
                <li>- 월 30회 AI 생성</li>
                <li>- 더 빠른 생성 속도</li>
                <li>- 우선 지원</li>
              </>
            )}
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleUpgrade} className="w-full">
            <Zap className="mr-2 h-4 w-4" />
            플랜 업그레이드
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            나중에 하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LimitExceededDialog;
