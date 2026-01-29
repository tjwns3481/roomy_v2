// @TASK P1-T1.8 - 저장 상태 컴포넌트
// @SPEC docs/planning/06-tasks.md#P1-T1.8

'use client';

import { cn } from '@/lib/utils';
import { AutoSaveStatus, getAutoSaveStatusLabel } from '@/hooks/useAutoSave';
import { CheckCircle2, Loader2, AlertCircle, Cloud } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface SaveStatusProps {
  /** 현재 저장 상태 */
  status: AutoSaveStatus;
  /** 저장 대기 중 여부 */
  isPending?: boolean;
  /** 마지막 저장 시간 */
  lastSavedAt?: Date | null;
  /** 에러 메시지 */
  error?: string | null;
  /** 추가 클래스 */
  className?: string;
  /** 컴팩트 모드 (아이콘만 표시) */
  compact?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function SaveStatus({
  status,
  isPending = false,
  lastSavedAt,
  error,
  className,
  compact = false,
}: SaveStatusProps) {
  // 상태별 스타일 및 아이콘
  const statusConfig = getStatusConfig(status, isPending, error);

  // 마지막 저장 시간 포맷
  const formattedTime = lastSavedAt
    ? formatLastSavedTime(lastSavedAt)
    : null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm transition-all duration-200',
        statusConfig.textColor,
        className
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* 아이콘 */}
      <span className={cn('flex-shrink-0', statusConfig.iconAnimation)}>
        {statusConfig.icon}
      </span>

      {/* 텍스트 (컴팩트 모드가 아닐 때만) */}
      {!compact && (
        <span className="flex-shrink-0">
          {statusConfig.label}
          {/* 저장됨 상태일 때 시간 표시 */}
          {status === 'saved' && formattedTime && (
            <span className="text-gray-400 ml-1">({formattedTime})</span>
          )}
        </span>
      )}

      {/* 에러 메시지 툴팁 (컴팩트 모드일 때) */}
      {compact && error && (
        <span className="sr-only">{error}</span>
      )}
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

interface StatusConfig {
  icon: React.ReactNode;
  label: string;
  textColor: string;
  iconAnimation?: string;
}

function getStatusConfig(
  status: AutoSaveStatus,
  isPending: boolean,
  error?: string | null
): StatusConfig {
  if (isPending) {
    return {
      icon: <Cloud className="w-4 h-4" />,
      label: '변경사항 감지...',
      textColor: 'text-gray-500',
    };
  }

  switch (status) {
    case 'idle':
      return {
        icon: <Cloud className="w-4 h-4" />,
        label: '',
        textColor: 'text-gray-400',
      };

    case 'saving':
      return {
        icon: <Loader2 className="w-4 h-4" />,
        label: '저장 중...',
        textColor: 'text-blue-500',
        iconAnimation: 'animate-spin',
      };

    case 'saved':
      return {
        icon: <CheckCircle2 className="w-4 h-4" />,
        label: '저장됨',
        textColor: 'text-green-500',
      };

    case 'error':
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        label: error || '저장 실패',
        textColor: 'text-red-500',
      };

    default:
      return {
        icon: <Cloud className="w-4 h-4" />,
        label: '',
        textColor: 'text-gray-400',
      };
  }
}

function formatLastSavedTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 5) {
    return '방금';
  }
  if (diff < 60) {
    return `${diff}초 전`;
  }
  if (diff < 3600) {
    return `${Math.floor(diff / 60)}분 전`;
  }

  // 오늘이면 시간만 표시
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // 그 외에는 날짜 + 시간
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================================
// Export
// ============================================================================

export default SaveStatus;
