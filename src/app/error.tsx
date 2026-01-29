'use client';

// @TASK P7-T7.5 - 500 Error 페이지
// @SPEC docs/planning/06-tasks.md#P7-T7.5

import { useEffect } from 'react';
import { ErrorLayout } from '@/components/error/error-layout';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (향후 Sentry 등으로 전송)
    console.error('Application error:', error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <ErrorLayout
      emoji="⚠️"
      title="문제가 발생했습니다"
      description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      showHomeButton
      showDashboardButton
    >
      {/* 다시 시도 버튼 */}
      <button
        onClick={reset}
        className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors mb-4"
      >
        🔄 다시 시도
      </button>

      {/* 개발 환경에서만 에러 상세 정보 표시 */}
      {isDevelopment && (
        <details className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
          <summary className="cursor-pointer text-sm font-medium text-red-900 mb-2">
            🐛 개발자 정보 (프로덕션에서는 숨겨짐)
          </summary>
          <div className="text-xs text-red-800 space-y-2">
            <div>
              <strong>에러 메시지:</strong>
              <pre className="mt-1 bg-red-100 p-2 rounded overflow-x-auto">
                {error.message}
              </pre>
            </div>
            {error.digest && (
              <div>
                <strong>에러 코드:</strong>
                <code className="ml-2 bg-red-100 px-2 py-1 rounded">
                  {error.digest}
                </code>
              </div>
            )}
            {error.stack && (
              <div>
                <strong>스택 트레이스:</strong>
                <pre className="mt-1 bg-red-100 p-2 rounded text-[10px] overflow-x-auto max-h-40 overflow-y-auto">
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        </details>
      )}
    </ErrorLayout>
  );
}
