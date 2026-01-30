// @TASK DR-P5 - Coral 테마 Skeleton 컴포넌트
import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-airbnb bg-gradient-to-r from-muted via-muted/80 to-muted',
        className
      )}
      style={{
        backgroundSize: '200% 100%',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
      {...props}
    />
  );
}

export { Skeleton };
