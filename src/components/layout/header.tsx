import Link from 'next/link';
import { Search, Menu } from 'lucide-react';
import { NavMenu } from './nav-menu';
import { MobileNav } from './mobile-nav';
import { AuthButton } from './auth-button';
import { CartBadge } from './cart-badge';

/**
 * Header 컴포넌트
 * - Neo-Brutalism 스타일의 상단 네비게이션
 * - 로고, 메뉴, 검색, 장바구니, 로그인 버튼
 * - 반응형: 모바일에서는 햄버거 메뉴
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-neo-white border-b-3 border-neo-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* 로고 */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neo-black hover:text-neo-blue transition-colors"
            >
              VIBE STORE
            </Link>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden lg:block">
              <NavMenu />
            </nav>
          </div>

          {/* 우측 액션 버튼들 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 검색 버튼 */}
            <button
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-neo-white border-3 border-neo-black shadow-neo-sm hover:bg-neo-yellow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150"
              aria-label="검색"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </button>

            {/* 장바구니 버튼 */}
            <CartBadge />

            {/* 로그인/사용자 버튼 */}
            <AuthButton />

            {/* 모바일 메뉴 버튼 */}
            <button
              className="lg:hidden w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-neo-white border-3 border-neo-black shadow-neo-sm hover:bg-neo-lime hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150"
              aria-label="메뉴 열기"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 네비게이션 (오버레이) */}
      <MobileNav />
    </header>
  );
}
