// @TASK P4-T4.1 - 호스트 대시보드 레이아웃
// @SPEC docs/planning/03-user-flow.md#호스트-대시보드

'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:fixed lg:inset-y-0 lg:top-16 lg:w-64">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar */}
        <MobileNav
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 lg:pl-64 pt-16">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
