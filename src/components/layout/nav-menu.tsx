'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * NavMenu 컴포넌트
 * - 데스크톱 네비게이션 메뉴
 * - 현재 페이지 하이라이트
 */

const menuItems = [
  { href: '/products', label: '상품' },
  { href: '/categories', label: '카테고리' },
  { href: '/reviews', label: '후기' },
  { href: '/inquiries', label: '문의' },
  { href: '/about', label: '소개' },
];

export function NavMenu() {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-6">
      {menuItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`
                relative text-base font-semibold uppercase tracking-wide
                transition-colors duration-150
                ${isActive
                  ? 'text-neo-blue'
                  : 'text-neo-black hover:text-neo-blue'
                }
              `}
            >
              {item.label}
              {/* 활성 상태 언더라인 */}
              {isActive && (
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-neo-blue" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
