/**
 * @TASK P6-T6.6 - 결제 내역 테이블
 * @SPEC docs/planning/06-tasks.md#P6-T6.6
 *
 * 결제 내역을 테이블로 표시하고 페이지네이션 지원
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileText } from 'lucide-react';
import type { PaymentHistory as PaymentHistoryType, PaymentStatus } from '@/types/subscription';

// ============================================================
// 타입 정의
// ============================================================

interface PaymentHistoryProps {
  payments: PaymentHistoryType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  getStatusLabel?: (status: PaymentStatus) => string;
  getStatusColor?: (status: PaymentStatus) => string;
  formatAmount?: (amount: number) => string;
  formatDate?: (date: string) => string;
}

// ============================================================
// 기본 헬퍼 함수
// ============================================================

const defaultGetStatusLabel = (status: PaymentStatus): string => {
  const labels: Record<PaymentStatus, string> = {
    pending: '처리 중',
    succeeded: '결제 완료',
    failed: '결제 실패',
    refunded: '환불됨',
  };
  return labels[status] ?? status;
};

const defaultGetStatusColor = (status: PaymentStatus): string => {
  const colors: Record<PaymentStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    succeeded: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-800';
};

const defaultFormatAmount = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
};

const defaultFormatDate = (date: string): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// ============================================================
// 컴포넌트
// ============================================================

export function PaymentHistory({
  payments,
  pagination,
  isLoading = false,
  onPageChange,
  getStatusLabel = defaultGetStatusLabel,
  getStatusColor = defaultGetStatusColor,
  formatAmount = defaultFormatAmount,
  formatDate = defaultFormatDate,
}: PaymentHistoryProps) {
  // 빈 상태
  if (!isLoading && payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>결제 내역</CardTitle>
          <CardDescription>지금까지의 결제 내역을 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">결제 내역이 없습니다</h3>
            <p className="text-sm text-muted-foreground">
              플랜을 업그레이드하면 결제 내역이 표시됩니다
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>결제 내역</CardTitle>
        <CardDescription>
          지금까지의 결제 내역을 확인하세요
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* 테이블 (데스크톱) */}
        {!isLoading && (
          <div className="hidden md:block">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-sm">날짜</th>
                    <th className="text-left p-3 font-medium text-sm">금액</th>
                    <th className="text-left p-3 font-medium text-sm">상태</th>
                    <th className="text-left p-3 font-medium text-sm">결제 수단</th>
                    <th className="text-right p-3 font-medium text-sm">영수증</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-sm">
                        {formatDate(payment.paidAt)}
                      </td>
                      <td className="p-3 text-sm font-medium">
                        {formatAmount(payment.amount)}
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusLabel(payment.status)}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {payment.paymentMethod === 'card' ? '카드' : '계좌이체'}
                      </td>
                      <td className="p-3 text-right">
                        {payment.receiptUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={payment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              보기
                            </a>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 카드 목록 (모바일) */}
        {!isLoading && (
          <div className="md:hidden space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{formatAmount(payment.amount)}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formatDate(payment.paidAt)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(payment.status)}>
                    {getStatusLabel(payment.status)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {payment.paymentMethod === 'card' ? '카드 결제' : '계좌이체'}
                  </span>
                  {payment.receiptUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        영수증
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              총 {pagination.total}건 중 {((pagination.page - 1) * pagination.limit) + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}건
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>

              <span className="text-sm px-3">
                {pagination.page} / {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={!pagination.hasMore}
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PaymentHistory;
