// @TASK P4-T4.1 - 대시보드 헤더
// @SPEC docs/planning/03-user-flow.md#호스트-대시보드
// @TASK Clerk-Auth - Clerk로 인증 전환

'use client';

import { Menu, Bell, User, Settings, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useClerk, useUser } from '@clerk/nextjs';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useClerk();
  const { user } = useUser();

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirectUrl: '/login' });
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.emailAddresses[0]?.emailAddress?.split('@')[0] || '호스트';
  const displayEmail = user?.emailAddresses[0]?.emailAddress || 'host@roomy.com';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-cloud/30 shadow-soft">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Logo + Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-snow rounded-airbnb transition-all duration-200"
            aria-label="메뉴 열기"
          >
            <Menu className="w-6 h-6 text-charcoal" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-coral rounded-airbnb flex items-center justify-center group-hover:shadow-coral transition-all duration-200">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-ink">Roomy</span>
          </Link>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-2">
          {/* Notification Button */}
          <button
            className="relative p-2 hover:bg-snow rounded-airbnb transition-all duration-200"
            aria-label="알림"
          >
            <Bell className="w-5 h-5 text-charcoal" />
            {/* Notification Badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral rounded-full shadow-coral animate-pulse" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2 hover:bg-snow rounded-airbnb transition-all duration-200"
              aria-label="프로필 메뉴"
            >
              <div className="w-8 h-8 bg-coral-light rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-coral" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-cloud/30 rounded-airbnb shadow-airbnb-md overflow-hidden animate-fade-up">
                <div className="px-4 py-3 border-b border-cloud/30">
                  <p className="text-sm font-semibold text-ink">{displayName}</p>
                  <p className="text-xs text-stone mt-1">{displayEmail}</p>
                </div>

                <div className="py-2">
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-charcoal hover:bg-snow transition-all duration-200"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    설정
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/5 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
