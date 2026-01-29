// @TASK P4-T4.1 - 호스트 레이아웃 (대시보드 레이아웃 적용)
// @TASK P7-T7.4 - 메타데이터 추가
// @SPEC docs/planning/03-user-flow.md#호스트-대시보드

import { Metadata } from 'next';
import { DashboardLayout } from '@/components/dashboard';

export const metadata: Metadata = {
  title: '대시보드',
  description: '내 가이드북을 관리하세요',
  robots: {
    index: false, // 호스트 페이지는 검색 엔진에 노출하지 않음
    follow: false,
  },
};

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
