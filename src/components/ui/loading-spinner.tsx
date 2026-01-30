// @TASK DR-P5 - Coral 테마 로딩 스피너 컴포넌트
// @SPEC docs/planning/06-tasks.md#P7-T7.6

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'coral' | 'white';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

const variantClasses = {
  default: 'border-muted border-t-text-primary',
  coral: 'border-coral-light border-t-coral',
  white: 'border-white/30 border-t-white',
};

export function LoadingSpinner({
  size = 'md',
  variant = 'coral',
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="로딩 중"
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}
