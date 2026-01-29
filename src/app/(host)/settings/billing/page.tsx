// @TASK P4-T4.6 - 결제/구독 페이지 (플레이스홀더)
// @SPEC docs/planning/06-tasks.md#P4-T4.6

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: '결제 및 구독 - Roomy',
  description: '플랜 관리 및 결제 정보',
};

export default function BillingPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">결제 및 구독</h1>
        <p className="text-muted-foreground mt-2">플랜 관리 및 결제 정보를 확인하세요</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>결제 페이지</CardTitle>
          <CardDescription>P6 Phase에서 구현 예정</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            결제 및 구독 관리 기능은 Phase 6에서 구현될 예정입니다.
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-sm">
            <li>플랜 업그레이드/다운그레이드</li>
            <li>결제 수단 관리</li>
            <li>결제 내역 조회</li>
            <li>영수증 다운로드</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
