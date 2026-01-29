/**
 * @TASK P6-T6.6 - 구독 취소 모달
 * @SPEC docs/planning/06-tasks.md#P6-T6.6
 *
 * 구독 취소 확인 및 사유 선택
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2 } from 'lucide-react';

// ============================================================
// 타입 정의
// ============================================================

interface CancelSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (immediately: boolean, reason?: string) => Promise<boolean>;
  currentPeriodEnd: string | null;
  planName: string;
}

// 취소 사유 옵션
const CANCEL_REASONS = [
  { value: 'too_expensive', label: '가격이 너무 비싸요' },
  { value: 'missing_features', label: '필요한 기능이 없어요' },
  { value: 'technical_issues', label: '기술적 문제가 있어요' },
  { value: 'switching_service', label: '다른 서비스로 이동해요' },
  { value: 'not_using', label: '자주 사용하지 않아요' },
  { value: 'other', label: '기타' },
];

// ============================================================
// 컴포넌트
// ============================================================

export function CancelSubscriptionModal({
  open,
  onOpenChange,
  onConfirm,
  currentPeriodEnd,
  planName,
}: CancelSubscriptionModalProps) {
  const [reason, setReason] = useState<string>('');
  const [immediately, setImmediately] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 취소 처리
  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      const success = await onConfirm(immediately, reason);

      if (success) {
        // 초기화
        setReason('');
        setImmediately(false);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 날짜 포맷
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>구독 해지</DialogTitle>
          <DialogDescription>
            정말로 {planName} 플랜을 해지하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 경고 메시지 */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  구독 해지 안내
                </p>
                {immediately ? (
                  <p className="text-xs text-yellow-800">
                    즉시 해지를 선택하시면 지금 바로 Free 플랜으로 전환되며,
                    남은 기간에 대한 환불은 진행되지 않습니다.
                  </p>
                ) : (
                  <p className="text-xs text-yellow-800">
                    {currentPeriodEnd ? (
                      <>
                        {formatDate(currentPeriodEnd)}까지 모든 기능을 사용하실 수 있으며,
                        그 이후 자동으로 Free 플랜으로 전환됩니다.
                      </>
                    ) : (
                      '기간 종료 시 자동으로 Free 플랜으로 전환됩니다.'
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 취소 사유 선택 */}
          <div className="space-y-2">
            <Label htmlFor="reason">취소 사유 (선택)</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="사유를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {CANCEL_REASONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              더 나은 서비스를 위해 취소 사유를 알려주세요
            </p>
          </div>

          {/* 즉시 취소 옵션 */}
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <Checkbox
              id="immediately"
              checked={immediately}
              onCheckedChange={(checked) => setImmediately(checked === true)}
            />
            <div className="space-y-1 flex-1">
              <Label
                htmlFor="immediately"
                className="text-sm font-medium cursor-pointer"
              >
                즉시 해지하기
              </Label>
              <p className="text-xs text-muted-foreground">
                남은 기간 없이 지금 바로 Free 플랜으로 전환합니다
              </p>
            </div>
          </div>

          {/* 해지 시 잃게 되는 혜택 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">해지 시 잃게 되는 혜택</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 추가 가이드북 생성 권한</li>
              <li>• 추가 AI 생성 횟수</li>
              <li>• 워터마크 제거</li>
              <li>• 통계 및 분석</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                처리 중...
              </>
            ) : (
              '구독 해지'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CancelSubscriptionModal;
