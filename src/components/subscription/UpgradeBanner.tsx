/**
 * @TASK P6-T6.8 - 업그레이드 유도 배너
 * @SPEC docs/planning/06-tasks.md#P6-T6.8
 *
 * Free 플랜 사용자에게 Pro 플랜 업그레이드를 유도하는 배너
 * - 대시보드 상단에 표시
 * - 닫기 기능 (7일간 숨김)
 * - Pro 플랜 혜택 강조
 */

'use client';

import { X, Crown, Zap, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';
import { useBannerDismiss } from '@/hooks/useBannerDismiss';

// ============================================================
// 타입 정의
// ============================================================

export interface UpgradeBannerProps {
  /**
   * 배너 스타일 변형
   * - default: 전체 너비 배너 (대시보드 상단)
   * - compact: 작은 배너 (사이드바 하단)
   * - sidebar: 사이드바용 카드 스타일
   */
  variant?: 'default' | 'compact' | 'sidebar';

  /**
   * 닫기 버튼 표시 여부
   * - true: 닫기 버튼 표시 (7일간 숨김)
   * - false: 항상 표시
   */
  dismissable?: boolean;

  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

// ============================================================
// 컴포넌트
// ============================================================

export function UpgradeBanner({
  variant = 'default',
  dismissable = true,
  className,
}: UpgradeBannerProps) {
  const { isFree, isLoading } = useSubscription();
  const { isDismissed, dismiss } = useBannerDismiss();

  // Free 플랜이 아니면 배너 표시 안 함
  if (!isFree || isLoading) {
    return null;
  }

  // 닫기 가능하고 이미 닫았으면 표시 안 함
  if (dismissable && isDismissed) {
    return null;
  }

  // variant별 렌더링
  if (variant === 'compact') {
    return <CompactBanner dismissable={dismissable} onDismiss={dismiss} className={className} />;
  }

  if (variant === 'sidebar') {
    return <SidebarBanner className={className} />;
  }

  return <DefaultBanner dismissable={dismissable} onDismiss={dismiss} className={className} />;
}

// ============================================================
// Default Variant (대시보드 상단)
// ============================================================

interface BannerVariantProps {
  dismissable: boolean;
  onDismiss: () => void;
  className?: string;
}

function DefaultBanner({ dismissable, onDismiss, className }: BannerVariantProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6',
        className
      )}
    >
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="flex items-center justify-between gap-6">
        {/* 왼쪽: 아이콘 + 텍스트 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20">
            <Crown className="w-6 h-6 text-primary" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Pro 플랜으로 업그레이드하고 더 많은 기능을 사용하세요
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-primary" />
                무제한 가이드북
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-primary" />
                AI 생성 30회/월
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                고급 통계 분석
              </span>
            </div>
          </div>
        </div>

        {/* 오른쪽: CTA 버튼 */}
        <div className="flex items-center gap-2">
          <Link
            href="/settings/billing"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Crown className="w-4 h-4" />
            업그레이드
          </Link>

          {dismissable && (
            <button
              onClick={onDismiss}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              aria-label="배너 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Compact Variant (작은 배너)
// ============================================================

function CompactBanner({ dismissable, onDismiss, className }: BannerVariantProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent p-4',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Pro로 업그레이드</p>
            <p className="text-xs text-gray-600">더 많은 기능 사용</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/settings/billing"
            className="px-4 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            업그레이드
          </Link>

          {dismissable && (
            <button
              onClick={onDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="배너 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sidebar Variant (사이드바용)
// ============================================================

interface SidebarBannerProps {
  className?: string;
}

function SidebarBanner({ className }: SidebarBannerProps) {
  return (
    <div className={cn('p-4 mx-4 mb-4 mt-8', className)}>
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-gray-900">Pro 플랜</h3>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          무제한 가이드북과 고급 기능을 사용해보세요
        </p>
        <Link
          href="/settings/billing"
          className="block w-full text-center bg-primary text-white text-sm font-medium py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          업그레이드
        </Link>
      </div>
    </div>
  );
}

export default UpgradeBanner;
