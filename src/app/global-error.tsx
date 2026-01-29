/* eslint-disable @next/next/no-sync-scripts */
/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

// @TASK P7-T7.5 - Global Error 페이지 (루트 레이아웃 에러 처리)
// @SPEC docs/planning/06-tasks.md#P7-T7.5
// Note: global-error는 루트 레이아웃 외부이므로 Link/Script 컴포넌트 사용 불가

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 전역 에러 로깅
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="ko">
      <head>
        {/* Tailwind CDN (global-error는 레이아웃 외부이므로 CSS 직접 로드) */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            {/* Critical Error Icon */}
            <div className="text-8xl mb-6">🚨</div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              심각한 오류가 발생했습니다
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              앱을 로드하는 중 문제가 발생했습니다.
              <br />
              페이지를 새로고침하거나, 잠시 후 다시 시도해주세요.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                🔄 새로고침
              </button>
              <a
                href="/"
                className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
              >
                🏠 홈으로 이동
              </a>
            </div>

            {/* Error Code (if available) */}
            {error.digest && (
              <div className="mt-8 text-sm text-gray-500">
                에러 코드:{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {error.digest}
                </code>
              </div>
            )}

            {/* Support */}
            <p className="text-sm text-gray-500 mt-8">
              문제가 계속되면{' '}
              <a
                href="mailto:support@roomy.kr"
                className="text-red-600 hover:underline"
              >
                support@roomy.kr
              </a>
              로 문의해주세요.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
