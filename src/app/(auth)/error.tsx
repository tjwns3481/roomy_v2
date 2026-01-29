'use client';

// @TASK P7-T7.5 - 인증 페이지 에러 처리
// @SPEC docs/planning/06-tasks.md#P7-T7.5

import { useEffect } from 'react';
import { ErrorLayout } from '@/components/error/error-layout';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Auth page error:', error);
  }, [error]);

  return (
    <ErrorLayout
      emoji="🔐"
      title="인증 처리 실패"
      description="로그인/회원가입 중 문제가 발생했습니다."
      showHomeButton
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
          해결 방법:
        </p>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>이메일 주소와 비밀번호를 다시 확인해주세요</li>
          <li>비밀번호를 잊으셨다면 비밀번호 재설정을 이용하세요</li>
          <li>브라우저의 쿠키 설정을 확인해주세요</li>
        </ul>
      </div>
    </ErrorLayout>
  );
}
