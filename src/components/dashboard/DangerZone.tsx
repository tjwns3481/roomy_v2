// @TASK P4-T4.4 - 가이드북 삭제 (위험 구역) 컴포넌트
// @SPEC docs/planning/06-tasks.md#p4-t44

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface DangerZoneProps {
  guidebookId: string;
  guidebookTitle: string;
}

export function DangerZone({ guidebookId, guidebookTitle }: DangerZoneProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CONFIRM_TEXT = '가이드북 삭제';

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_TEXT) {
      setError(`"${CONFIRM_TEXT}"를 정확히 입력해주세요`);
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const supabase = createClient();

      // 가이드북 삭제 (CASCADE로 블록도 함께 삭제됨)
      const { error: deleteError } = await supabase
        .from('guidebooks')
        .delete()
        .eq('id', guidebookId);

      if (deleteError) throw deleteError;

      // 삭제 성공 - 대시보드로 이동
      router.push('/dashboard?deleted=true');
    } catch (error) {
      console.error('Delete error:', error);
      setError('삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border-2 border-red-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-semibold text-red-900 mb-1">
              위험 구역
            </h2>
            <p className="text-sm text-red-700">
              이 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.
            </p>
          </div>
        </div>

        <div className="pl-9">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-red-900 mb-2">가이드북 삭제</h3>
            <p className="text-sm text-red-700 mb-3">
              삭제된 가이드북은 복구할 수 없습니다. 모든 블록과 설정이 영구적으로
              삭제됩니다.
            </p>
            <ul className="text-sm text-red-700 space-y-1 mb-4 list-disc list-inside">
              <li>가이드북의 모든 블록이 삭제됩니다</li>
              <li>업로드된 이미지는 유지되지만 접근할 수 없습니다</li>
              <li>공유 링크가 더 이상 작동하지 않습니다</li>
              <li>통계 데이터가 삭제됩니다</li>
            </ul>
          </div>

          <Button
            variant="destructive"
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            가이드북 삭제
          </Button>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말로 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-gray-900">
                &ldquo;{guidebookTitle}&rdquo;
              </span>
              을(를) 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="confirm-text" className="mb-2 block">
              계속하려면{' '}
              <span className="font-semibold text-red-600">{CONFIRM_TEXT}</span>
              을(를) 입력하세요
            </Label>
            <Input
              id="confirm-text"
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError(null);
              }}
              placeholder={CONFIRM_TEXT}
              disabled={isDeleting}
              className="mt-1"
            />
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setConfirmText('');
                setError(null);
              }}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || confirmText !== CONFIRM_TEXT}
            >
              {isDeleting ? '삭제 중...' : '영구 삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
