/**
 * @TASK P6-T6.5 - 결제 페이지 클라이언트 컴포넌트
 * @SPEC docs/planning/06-tasks.md#P6-T6.5
 *
 * 클라이언트 사이드 결제 처리
 */

'use client';

import { useRouter } from 'next/navigation';
import { CheckoutForm } from '@/components/subscription/CheckoutForm';
import { OrderSummary } from '@/components/subscription/OrderSummary';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { requestPayment } from '@/lib/toss/client';
import type { TossPaymentMethod, PaymentRequestResponse } from '@/types/payment';
import type { SubscriptionPlan } from '@/types/subscription';

interface CheckoutClientProps {
  plan: Exclude<SubscriptionPlan, 'free'>;
  paymentRequest: PaymentRequestResponse | null | undefined;
  error: string | null;
}

export function CheckoutClient({ plan, paymentRequest, error }: CheckoutClientProps) {
  const router = useRouter();

  // 결제 요청 처리
  const handlePayment = async (paymentMethod: TossPaymentMethod) => {
    if (!paymentRequest) {
      throw new Error('결제 요청 정보가 없습니다.');
    }

    try {
      await requestPayment(paymentMethod, {
        amount: paymentRequest.amount,
        orderId: paymentRequest.orderId,
        orderName: paymentRequest.orderName,
        customerEmail: paymentRequest.customerEmail,
        customerName: paymentRequest.customerName,
        successUrl: paymentRequest.successUrl,
        failUrl: paymentRequest.failUrl,
      });
    } catch (err) {
      console.error('결제 요청 실패:', err);
      throw err;
    }
  };

  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>결제 요청 오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/settings')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          설정으로 돌아가기
        </Button>
      </div>
    );
  }

  if (!paymentRequest) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>결제 정보 없음</AlertTitle>
          <AlertDescription>결제 정보를 불러올 수 없습니다.</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/settings')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          설정으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            설정으로 돌아가기
          </Button>
          <h1 className="text-3xl font-bold tracking-tight mt-4">결제하기</h1>
          <p className="text-muted-foreground mt-2">안전하게 결제를 진행하세요</p>
        </div>
      </div>

      {/* 결제 폼 + 주문 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 좌측: 결제 폼 */}
        <div className="space-y-6">
          <CheckoutForm
            orderId={paymentRequest.orderId}
            amount={paymentRequest.amount}
            orderName={paymentRequest.orderName}
            onSubmit={handlePayment}
          />
        </div>

        {/* 우측: 주문 요약 */}
        <div className="lg:sticky lg:top-8 self-start">
          <OrderSummary plan={plan} />
        </div>
      </div>

      {/* 고객센터 안내 */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm text-center text-muted-foreground">
        결제 중 문제가 발생하셨나요?{' '}
        <a href="mailto:support@roomy.app" className="text-primary underline">
          고객센터
        </a>
        로 문의해주세요.
      </div>
    </div>
  );
}
