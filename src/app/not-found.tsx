// @TASK P7-T7.5 - 404 Not Found 페이지
// @SPEC docs/planning/06-tasks.md#P7-T7.5

import { ErrorLayout } from '@/components/error/error-layout';
import Link from 'next/link';

export default function NotFound() {
  return (
    <ErrorLayout
      emoji="🔍"
      title="페이지를 찾을 수 없습니다"
      description="요청하신 페이지가 존재하지 않거나, 이동되었을 수 있습니다."
      showHomeButton
      showDashboardButton
    >
      {/* 추천 페이지 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600 mb-3">
          다음 페이지를 찾고 계신가요?
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            → 내 가이드북 목록 보기
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-blue-600 hover:underline"
          >
            → 요금제 확인하기
          </Link>
        </div>
      </div>
    </ErrorLayout>
  );
}
