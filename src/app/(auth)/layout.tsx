/**
 * @TASK P7-T7.1 - Auth Layout
 * @TASK P7-T7.4 - 메타데이터 추가
 * @SPEC 인증 페이지 공통 레이아웃
 *
 * 기능:
 * - 중앙 정렬 레이아웃
 * - 로고 표시
 * - 반응형 디자인
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <header className="py-6">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-primary">Roomy</h1>
          </Link>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center space-x-4">
            <Link href="/terms" className="hover:underline">
              이용약관
            </Link>
            <span>|</span>
            <Link href="/privacy" className="hover:underline">
              개인정보처리방침
            </Link>
            <span>|</span>
            <Link href="/help" className="hover:underline">
              도움말
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Roomy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
