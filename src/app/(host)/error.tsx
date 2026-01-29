'use client';

// @TASK P7-T7.5 - 호스트 페이지 에러 처리
// @SPEC docs/planning/06-tasks.md#P7-T7.5

import { useEffect } from 'react';
import { ErrorLayout } from '@/components/error/error-layout';

export default function HostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Host page error:', error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <ErrorLayout
      emoji="📊"
      title="대시보드 로딩 실패"
      description="대시보드를 불러오는 중 문제가 발생했습니다."
      showDashboardButton
    >
      {/* 다시 시도 버튼 */}
      <button
        onClick={reset}
        className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors mb-4"
      >
        🔄 다시 시도
      </button>

      {/* 일반적인 해결 방법 */}
      <div className="bg-blue-50 rounded-lg p-4 text-left mb-4">
        <p className="text-sm font-medium text-blue-900 mb-2">
          다음 방법을 시도해보세요:
        </p>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>페이지 새로고침 (F5)</li>
          <li>브라우저 캐시 삭제</li>
          <li>다른 브라우저에서 시도</li>
          <li>로그아웃 후 다시 로그인</li>
        </ul>
      </div>

      {/* 개발 환경 에러 상세 */}
      {isDevelopment && (
        <details className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
          <summary className="cursor-pointer text-sm font-medium text-red-900 mb-2">
            🐛 개발자 정보
          </summary>
          <div className="text-xs text-red-800 space-y-2">
            <div>
              <strong>에러:</strong>
              <pre className="mt-1 bg-red-100 p-2 rounded overflow-x-auto">
                {error.message}
              </pre>
            </div>
            {error.digest && (
              <div>
                <strong>코드:</strong> {error.digest}
              </div>
            )}
          </div>
        </details>
      )}
    </ErrorLayout>
  );
}
