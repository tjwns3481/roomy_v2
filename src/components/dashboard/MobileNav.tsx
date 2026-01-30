// @TASK P4-T4.1 - 모바일 네비게이션 (Slide-over)
// @SPEC docs/planning/03-user-flow.md#호스트-대시보드

'use client';

import { Home, FileText, BarChart2, Settings, X, Crown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: '대시보드', href: '/dashboard' },
  { icon: FileText, label: '가이드북', href: '/dashboard/guidebooks' },
  { icon: BarChart2, label: '통계', href: '/dashboard/stats' },
  { icon: Settings, label: '설정', href: '/settings' },
];

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  // 경로 변경 시 메뉴 닫기
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Body 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-64 bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out shadow-airbnb-lg',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-cloud/30">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-coral rounded-airbnb flex items-center justify-center group-hover:shadow-coral transition-all duration-200">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-ink">Roomy</span>
          </Link>

          <button
            onClick={onClose}
            className="p-2 hover:bg-snow rounded-airbnb transition-all duration-200"
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5 text-charcoal" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ height: 'calc(100% - 4rem)' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-airbnb text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-coral-light text-coral border-l-3 border-coral shadow-soft'
                    : 'text-charcoal hover:bg-snow hover:text-ink'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-coral' : 'text-stone'
                )} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Pro Upgrade Banner */}
          <div className="mt-8">
            <div className="bg-gradient-to-br from-coral-light to-coral-light/50 rounded-airbnb p-4 border border-coral/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-coral" />
                <h3 className="text-sm font-semibold text-ink">Pro 플랜</h3>
              </div>
              <p className="text-xs text-charcoal mb-3">
                무제한 가이드북과 고급 기능을 사용해보세요
              </p>
              <Link
                href="/settings/license"
                className="block w-full text-center bg-coral text-white text-sm font-medium py-2 rounded-airbnb hover:bg-coral-dark transition-all duration-200 shadow-soft"
              >
                업그레이드
              </Link>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
