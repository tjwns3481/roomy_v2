/**
 * @TASK P6-T6.5 - 결제 실패 페이지
 * @SPEC docs/planning/06-tasks.md#P6-T6.5
 *
 * 결제 실패 후 콜백 페이지
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

/**
 * Toss Payments 에러 코드별 안내 메시지
 */
const ERROR_MESSAGES: Record<string, { title: string; description: string; action: string }> = {
  PAY_PROCESS_CANCELED: {
    title: '결제가 취소되었습니다',
    description: '고객님께서 결제를 취소하셨습니다.',
    action: '다시 시도해주세요.',
  },
  PAY_PROCESS_ABORTED: {
    title: '결제가 중단되었습니다',
    description: '결제 진행 중 오류가 발생했습니다.',
    action: '잠시 후 다시 시도해주세요.',
  },
  REJECT_CARD_COMPANY: {
    title: '카드사 승인 거부',
    description: '카드사에서 결제를 거부했습니다.',
    action: '다른 카드로 시도하거나 카드사에 문의해주세요.',
  },
  EXCEED_MAX_CARD_INSTALLMENT_PLAN: {
    title: '할부 개월 수 초과',
    description: '선택하신 할부 개월 수가 초과되었습니다.',
    action: '할부 개월 수를 변경하여 다시 시도해주세요.',
  },
  INVALID_CARD_EXPIRATION: {
    title: '유효기간 오류',
    description: '카드 유효기간이 올바르지 않습니다.',
    action: '카드 정보를 확인하고 다시 시도해주세요.',
  },
  INVALID_STOPPED_CARD: {
    title: '정지된 카드',
    description: '사용이 정지된 카드입니다.',
    action: '다른 카드로 시도하거나 카드사에 문의해주세요.',
  },
  EXCEED_MAX_DAILY_PAYMENT_COUNT: {
    title: '일일 결제 횟수 초과',
    description: '일일 결제 가능 횟수를 초과했습니다.',
    action: '내일 다시 시도하거나 다른 카드를 사용해주세요.',
  },
  NOT_SUPPORTED_INSTALLMENT: {
    title: '할부 미지원',
    description: '해당 카드는 할부를 지원하지 않습니다.',
    action: '일시불로 결제하거나 다른 카드를 사용해주세요.',
  },
  INVALID_CARD_INSTALLMENT_PLAN: {
    title: '할부 개월 오류',
    description: '잘못된 할부 개월이 선택되었습니다.',
    action: '할부 개월을 다시 선택해주세요.',
  },
  NOT_AVAILABLE_PAYMENT: {
    title: '결제 불가',
    description: '현재 결제를 진행할 수 없습니다.',
    action: '잠시 후 다시 시도해주세요.',
  },
  INVALID_AUTHORIZE_AUTH: {
    title: '인증 실패',
    description: '본인 인증에 실패했습니다.',
    action: '본인 인증을 다시 진행해주세요.',
  },
  FAILED_PAYMENT_INTERNAL_SYSTEM_PROCESSING: {
    title: '시스템 오류',
    description: '결제 시스템 내부 오류가 발생했습니다.',
    action: '잠시 후 다시 시도해주세요.',
  },
  FAILED_INTERNAL_SYSTEM_PROCESSING: {
    title: '내부 시스템 오류',
    description: '서버 처리 중 오류가 발생했습니다.',
    action: '잠시 후 다시 시도해주세요.',
  },
  UNKNOWN_PAYMENT_ERROR: {
    title: '알 수 없는 오류',
    description: '결제 중 알 수 없는 오류가 발생했습니다.',
    action: '잠시 후 다시 시도하거나 고객센터에 문의해주세요.',
  },
};

function FailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  const errorInfo = code ? ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_PAYMENT_ERROR : ERROR_MESSAGES.UNKNOWN_PAYMENT_ERROR;

  return (
    <div className="container max-w-2xl py-16">
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">{errorInfo.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">{errorInfo.description}</p>
            <p className="text-sm text-muted-foreground mt-2">{errorInfo.action}</p>
          </div>

          {/* 에러 상세 정보 */}
          {(code || message || orderId) && (
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertTitle>상세 정보</AlertTitle>
              <AlertDescription className="space-y-1 mt-2">
                {code && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">에러 코드</span>
                    <span className="font-mono text-xs">{code}</span>
                  </div>
                )}
                {message && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">메시지</span>
                    <span className="text-xs">{message}</span>
                  </div>
                )}
                {orderId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">주문번호</span>
                    <span className="font-mono text-xs">{orderId}</span>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* 해결 방법 안내 */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm">해결 방법</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 카드 정보를 다시 확인해주세요</li>
              <li>• 다른 결제 수단을 시도해보세요</li>
              <li>• 카드사 또는 은행에 문의해주세요</li>
              <li>• 문제가 계속되면 고객센터로 연락주세요</li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" onClick={() => router.push('/checkout?plan=pro')}>
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.push('/settings')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              설정으로 돌아가기
            </Button>
          </div>

          {/* 고객센터 안내 */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              문제가 계속 발생하시나요?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href="mailto:support@roomy.app"
                className="text-sm text-primary hover:underline"
              >
                이메일: support@roomy.app
              </a>
              <span className="hidden sm:inline text-muted-foreground">|</span>
              <a
                href="tel:02-1234-5678"
                className="text-sm text-primary hover:underline"
              >
                전화: 02-1234-5678
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              운영 시간: 평일 09:00 - 18:00
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutFailPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-2xl py-16 text-center">
          <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      }
    >
      <FailContent />
    </Suspense>
  );
}
