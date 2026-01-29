// @TASK P4-T4.1 - 대시보드 사이드바
// @SPEC docs/planning/03-user-flow.md#호스트-대시보드

'use client';

import { Home, FileText, BarChart2, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SidebarUpgradeBanner } from '@/components/subscription';

const menuItems = [
  { icon: Home, label: '대시보드', href: '/dashboard' },
  { icon: FileText, label: '가이드북', href: '/dashboard/guidebooks' },
  { icon: BarChart2, label: '통계', href: '/dashboard/stats' },
  { icon: Settings, label: '설정', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary border-l-4 border-primary'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Pro Upgrade Banner */}
      <SidebarUpgradeBanner />
    </div>
  );
}
