/**
 * @TASK P6-T6.8 - 사용량 제한 경고 배너
 * @SPEC docs/planning/06-tasks.md#P6-T6.8
 *
 * 플랜별 사용량 제한에 근접하거나 도달했을 때 표시되는 배너
 * - 가이드북 생성 제한
 * - AI 생성 제한
 * - 80% 도달 시 경고, 100% 도달 시 제한 안내
 */

'use client';

import { AlertCircle, AlertTriangle, Crown, Sparkles, FileText } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================================
// 타입 정의
// ============================================================

export interface LimitWarningBannerProps {
  /**
   * 제한 타입
   * - guidebooks: 가이드북 생성 제한
   * - ai: AI 생성 제한
   */
  type: 'guidebooks' | 'ai';

  /**
   * 현재 사용량
   */
  current: number;

  /**
   * 최대 제한
   * - -1: 무제한
   */
  limit: number;

  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

// ============================================================
// 유틸리티 함수
// ============================================================

/**
 * 사용률 계산 (0~100%)
 */
function calculateUsagePercentage(current: number, limit: number): number {
  if (limit === -1) {
    return 0; // 무제한
  }

  if (limit === 0) {
    return 100; // 제한 없음
  }

  return Math.min(100, Math.round((current / limit) * 100));
}

/**
 * 배너 타입 결정
 * - none: 배너 표시 안 함 (80% 미만)
 * - warning: 경고 (80~99%)
 * - critical: 제한 도달 (100%)
 */
function getBannerType(percentage: number): 'none' | 'warning' | 'critical' {
  if (percentage < 80) {
    return 'none';
  }

  if (percentage >= 100) {
    return 'critical';
  }

  return 'warning';
}

// ============================================================
// 컴포넌트
// ============================================================

export function LimitWarningBanner({
  type,
  current,
  limit,
  className,
}: LimitWarningBannerProps) {
  // 무제한이면 배너 표시 안 함
  if (limit === -1) {
    return null;
  }

  const percentage = calculateUsagePercentage(current, limit);
  const bannerType = getBannerType(percentage);

  // 80% 미만이면 배너 표시 안 함
  if (bannerType === 'none') {
    return null;
  }

  // 타입별 설정
  const config = getConfig(type, current, limit, bannerType);

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        bannerType === 'critical'
          ? 'bg-red-50 border-red-200'
          : 'bg-yellow-50 border-yellow-200',
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
            bannerType === 'critical' ? 'bg-red-100' : 'bg-yellow-100'
          )}
        >
          {bannerType === 'critical' ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          )}
        </div>

        {/* 메시지 */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'text-sm font-semibold mb-1',
              bannerType === 'critical' ? 'text-red-900' : 'text-yellow-900'
            )}
          >
            {config.title}
          </h3>
          <p
            className={cn(
              'text-sm mb-3',
              bannerType === 'critical' ? 'text-red-700' : 'text-yellow-700'
            )}
          >
            {config.description}
          </p>

          {/* 진행 바 */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span
                className={cn(
                  'font-medium',
                  bannerType === 'critical' ? 'text-red-700' : 'text-yellow-700'
                )}
              >
                {current} / {limit} 사용 중
              </span>
              <span
                className={cn(
                  'font-bold',
                  bannerType === 'critical' ? 'text-red-900' : 'text-yellow-900'
                )}
              >
                {percentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-white rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  bannerType === 'critical' ? 'bg-red-600' : 'bg-yellow-600'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* CTA 버튼 */}
          <Link
            href="/settings/billing"
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              bannerType === 'critical'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            )}
          >
            <Crown className="w-4 h-4" />
            Pro로 업그레이드
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 설정 헬퍼
// ============================================================

interface BannerConfig {
  title: string;
  description: string;
  icon: typeof Crown;
}

function getConfig(
  type: 'guidebooks' | 'ai',
  current: number,
  limit: number,
  bannerType: 'warning' | 'critical'
): BannerConfig {
  if (type === 'guidebooks') {
    return {
      title:
        bannerType === 'critical'
          ? '가이드북 생성 제한 도달'
          : '가이드북 생성 제한에 근접했습니다',
      description:
        bannerType === 'critical'
          ? `Free 플랜에서는 최대 ${limit}개의 가이드북을 만들 수 있습니다. Pro 플랜으로 업그레이드하여 5개까지 생성하세요.`
          : `Free 플랜에서는 최대 ${limit}개의 가이드북을 만들 수 있습니다. 곧 제한에 도달합니다.`,
      icon: FileText,
    };
  }

  // AI 생성
  return {
    title:
      bannerType === 'critical'
        ? 'AI 생성 제한 도달'
        : 'AI 생성 제한에 근접했습니다',
    description:
      bannerType === 'critical'
        ? `Free 플랜에서는 이번 달 ${limit}회의 AI 생성을 사용할 수 있습니다. Pro 플랜으로 업그레이드하여 30회까지 사용하세요.`
        : `Free 플랜에서는 이번 달 ${limit}회의 AI 생성을 사용할 수 있습니다. 곧 제한에 도달합니다.`,
    icon: Sparkles,
  };
}

export default LimitWarningBanner;
