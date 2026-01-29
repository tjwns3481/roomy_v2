'use client';

// @TASK P2-T2.1, P7-T7.5 - 게스트 페이지 에러 처리
// @SPEC docs/planning/06-tasks.md#P7-T7.5

import { useEffect } from 'react';
import { ErrorLayout } from '@/components/error/error-layout';

export default function GuestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Guest page error:', error);
  }, [error]);

  return (
    <ErrorLayout
      emoji="📖"
      title="가이드북을 불러올 수 없습니다"
      description="가이드북을 불러오는 중 문제가 발생했습니다. 링크를 다시 확인해주세요."
      showHomeButton={false}
    >
      {/* 다시 시도 버튼 */}
      <button
        onClick={reset}
        className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors mb-4"
      >
        🔄 다시 시도
      </button>

      {/* 도움말 */}
      <div className="bg-blue-50 rounded-lg p-4 text-left">
        <p className="text-sm font-medium text-blue-900 mb-2">
          이런 경우일 수 있습니다:
        </p>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>가이드북 링크가 잘못되었을 수 있습니다</li>
          <li>가이드북이 삭제되었을 수 있습니다</li>
          <li>일시적인 네트워크 문제</li>
        </ul>
      </div>
    </ErrorLayout>
  );
}
