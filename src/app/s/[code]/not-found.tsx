// @TASK P5-T5.4 - 단축 URL 404 페이지
// @SPEC docs/planning/06-tasks.md#P5-T5.4

import Link from 'next/link';

/**
 * 존재하지 않는 단축 URL 접근 시 표시
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          링크를 찾을 수 없습니다
        </h1>
        <p className="text-gray-600 mb-6">
          요청하신 공유 링크가 존재하지 않습니다.
          <br />
          링크 주소를 다시 확인해 주세요.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Roomy 홈으로
          </Link>
          <p className="text-sm text-gray-500">
            가이드북을 만들어보고 싶으신가요?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              무료로 시작하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
