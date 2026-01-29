// @TASK P7-T7.5 - 에러 페이지 공통 레이아웃
// @SPEC docs/planning/06-tasks.md#P7-T7.5

import Link from 'next/link';
import { ReactNode } from 'react';

interface ErrorLayoutProps {
  title: string;
  description: string;
  emoji?: string;
  children?: ReactNode;
  showHomeButton?: boolean;
  showDashboardButton?: boolean;
}

export function ErrorLayout({
  title,
  description,
  emoji = '😕',
  children,
  showHomeButton = true,
  showDashboardButton = false,
}: ErrorLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Emoji */}
        <div className="text-8xl mb-6 animate-bounce">{emoji}</div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>

        {/* Custom Actions (error details, retry button 등) */}
        {children}

        {/* Default Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          {showHomeButton && (
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              🏠 홈으로 이동
            </Link>
          )}
          {showDashboardButton && (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
            >
              📊 대시보드로 이동
            </Link>
          )}
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-8">
          문제가 계속되면{' '}
          <a
            href="mailto:support@roomy.kr"
            className="text-blue-600 hover:underline"
          >
            support@roomy.kr
          </a>
          로 문의해주세요.
        </p>
      </div>
    </div>
  );
}
