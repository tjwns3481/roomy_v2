// @TASK P8-S13-T1: 에디터 네비게이션 (브랜딩, 리뷰, Upsell 설정)
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Settings, Palette, Star, Package, ArrowLeft } from 'lucide-react';

interface EditorNavProps {
  guidebookId: string;
}

export function EditorNav({ guidebookId }: EditorNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: `/editor/${guidebookId}`,
      label: '블록 편집',
      icon: <Settings className="h-4 w-4" />,
      exact: true,
    },
    {
      href: `/editor/${guidebookId}/branding`,
      label: '브랜딩',
      icon: <Palette className="h-4 w-4" />,
    },
    {
      href: `/editor/${guidebookId}/review`,
      label: '리뷰 요청',
      icon: <Star className="h-4 w-4" />,
    },
    {
      href: `/editor/${guidebookId}/upsell`,
      label: 'Upsell 설정',
      icon: <Package className="h-4 w-4" />,
      badge: 'Business',
    },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="container max-w-7xl">
        <div className="flex items-center justify-between py-3">
          {/* 뒤로가기 */}
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              대시보드
            </Link>
          </Button>

          {/* 탭 네비게이션 */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'gap-2',
                    isActive && 'bg-primary text-white'
                  )}
                >
                  <Link href={item.href}>
                    {item.icon}
                    {item.label}
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
