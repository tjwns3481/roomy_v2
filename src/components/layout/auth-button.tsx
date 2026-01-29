/**
 * Auth Button Component
 * Clerk 기반 로그인 버튼
 *
 * @TASK Clerk-Auth - Clerk UserButton으로 전환
 */

'use client';

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/nextjs';
import { User } from 'lucide-react';

export function AuthButton() {
  return (
    <>
      {/* 로그인 상태: 사용자 버튼 표시 */}
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'w-10 h-10 sm:w-12 sm:h-12 border-3 border-neo-black shadow-neo-sm',
              userButtonPopoverCard: 'border-3 border-neo-black shadow-neo',
              userButtonPopoverActionButton: 'hover:bg-neo-yellow transition-colors',
              userButtonPopoverActionButtonText: 'font-bold',
              userButtonPopoverFooter: 'hidden',
            },
          }}
          userProfileMode="navigation"
          userProfileUrl="/settings"
        >
          <UserButton.MenuItems>
            <UserButton.Link
              label="대시보드"
              labelIcon={<User className="w-4 h-4" />}
              href="/dashboard"
            />
            <UserButton.Link
              label="설정"
              labelIcon={<User className="w-4 h-4" />}
              href="/settings"
            />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>

      {/* 비로그인 상태: 로그인 버튼 표시 */}
      <SignedOut>
        <SignInButton mode="modal">
          <button className="flex items-center gap-2 px-3 sm:px-6 h-10 sm:h-12 bg-blue-600 text-white border-3 border-neo-black shadow-neo font-bold uppercase tracking-wide hover:bg-blue-700 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150">
            <User className="w-5 h-5" strokeWidth={2.5} />
            <span className="hidden sm:inline">로그인</span>
          </button>
        </SignInButton>
      </SignedOut>
    </>
  );
}
