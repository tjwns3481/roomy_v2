/**
 * @TASK P6-T6.8 - 사이드바 업그레이드 배너
 * @SPEC docs/planning/06-tasks.md#P6-T6.8
 *
 * 대시보드 사이드바 하단에 표시되는 업그레이드 배너
 * - 항상 표시 (닫기 불가)
 * - 컴팩트한 디자인
 * - Free 플랜 사용자에게만 표시
 */

'use client';

import { Crown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';

// ============================================================
// 타입 정의
// ============================================================

export interface SidebarUpgradeBannerProps {
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

// ============================================================
// 컴포넌트
// ============================================================

export function SidebarUpgradeBanner({ className }: SidebarUpgradeBannerProps) {
  const { isFree, isLoading } = useSubscription();

  // Free 플랜이 아니거나 로딩 중이면 배너 표시 안 함
  if (!isFree || isLoading) {
    return null;
  }

  return (
    <div className={cn('p-4 mx-4 mb-4 mt-8', className)}>
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-gray-900">Pro 플랜</h3>
        </div>

        {/* 설명 */}
        <p className="text-xs text-gray-600 mb-3">
          무제한 가이드북과 고급 기능을 사용해보세요
        </p>

        {/* CTA 버튼 */}
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

export default SidebarUpgradeBanner;
