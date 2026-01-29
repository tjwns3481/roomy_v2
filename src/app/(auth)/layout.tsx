/**
 * @TASK P7-T7.1 - Auth Layout
 * @TASK P7-T7.4 - 메타데이터 추가
 * @TASK Clerk-Auth - Clerk 전용 인증 레이아웃
 *
 * 기능:
 * - Clerk SignIn/SignUp 컴포넌트 전용 레이아웃
 * - 최소한의 UI (로고 + 컨텐츠)
 * - 루트 레이아웃의 Header/Footer 제외
 */

import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false, // 인증 페이지는 검색 엔진에 노출하지 않음
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 미니멀 헤더 (로고만) */}
      <header className="py-6">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Roomy</span>
          </Link>
        </div>
      </header>

      {/* 메인 콘텐츠 - Clerk 컴포넌트 */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* 미니멀 푸터 */}
      <footer className="py-4 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Roomy. All rights reserved.</p>
      </footer>
    </div>
  );
}
