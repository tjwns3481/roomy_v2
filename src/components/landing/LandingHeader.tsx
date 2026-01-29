/**
 * @TASK Clerk-Auth + UI-V2 - 랜딩 페이지 전용 헤더
 * 감성 중심 디자인 시스템 적용
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '기능', href: '#features' },
    { name: '요금제', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-soft'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 bg-ink rounded-xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-xl font-display">R</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-coral/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold text-ink tracking-tight">
              Roomy
            </span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-stone font-medium hover:text-ink transition-colors duration-300 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* 인증 버튼 */}
          <div className="hidden md:flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-stone font-medium hover:text-ink transition-colors duration-300">
                  로그인
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2.5 bg-ink text-white text-sm font-semibold rounded-full hover:bg-charcoal transition-all duration-300 shadow-sm hover:shadow-md">
                  무료로 시작하기
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-ink hover:text-coral transition-colors duration-300"
              >
                <LayoutDashboard className="w-4 h-4" />
                대시보드
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10 ring-2 ring-cloud',
                    userButtonPopoverCard: 'shadow-soft border border-cloud',
                    userButtonPopoverFooter: 'hidden',
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-ink"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-cloud"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-lg text-charcoal font-medium hover:text-ink transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-cloud space-y-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="w-full py-3 text-center text-charcoal font-medium hover:text-ink transition-colors">
                      로그인
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full py-3 bg-ink text-white font-semibold rounded-full">
                      무료로 시작하기
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 py-3 text-ink font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    대시보드
                  </Link>
                </SignedIn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
