// @TASK P7-T7.6 - 전체 화면 로딩 오버레이
// @SPEC docs/planning/06-tasks.md#P7-T7.6

import { LoadingSpinner } from './loading-spinner';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  message = '로딩 중...',
  className,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="로딩 중"
    >
      <LoadingSpinner size="lg" variant="primary" />
      {message && (
        <p className="mt-4 text-sm text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );
}
