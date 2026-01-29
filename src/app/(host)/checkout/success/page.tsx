/**
 * @TASK P6-T6.5 - 결제 성공 페이지
 * @SPEC docs/planning/06-tasks.md#P6-T6.5
 *
 * 결제 성공 후 콜백 페이지
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, AlertCircle, ArrowRight, Home } from 'lucide-react';

type PaymentStatus = 'confirming' | 'success' | 'error';

interface PaymentResult {
  orderId: string;
  amount: number;
  plan: string;
  approvedAt: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  const [status, setStatus] = useState<PaymentStatus>('confirming');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URL 파라미터 검증
    if (!paymentKey || !orderId || !amount) {
      setError('결제 정보가 올바르지 않습니다.');
      setStatus('error');
      return;
    }

    // 결제 확인 API 호출
    const confirmPayment = async () => {
      try {
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount, 10),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '결제 확인에 실패했습니다.');
        }

        const data = await response.json();
        setPaymentResult({
          orderId: data.payment.orderId,
          amount: data.payment.amount,
          plan: data.subscription?.plan || 'Pro',
          approvedAt: data.payment.approvedAt,
        });
        setStatus('success');
      } catch (err) {
        console.error('결제 확인 실패:', err);
        setError(err instanceof Error ? err.message : '결제 확인 중 오류가 발생했습니다.');
        setStatus('error');
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount]);

  // 확인 중 상태
  if (status === 'confirming') {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">결제를 확인하고 있습니다</h2>
            <p className="text-muted-foreground mt-2">잠시만 기다려주세요...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (status === 'error') {
    return (
      <div className="container max-w-2xl py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>결제 확인 실패</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={() => router.push('/settings')}>
            <Home className="mr-2 h-4 w-4" />
            설정으로 돌아가기
          </Button>
          <Button onClick={() => router.push('/checkout?plan=pro')}>
            <ArrowRight className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  // 성공 상태
  return (
    <div className="container max-w-2xl py-16">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">결제가 완료되었습니다!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              {paymentResult?.plan} 구독이 시작되었습니다.
              <br />
              이제 더 많은 기능을 사용할 수 있습니다.
            </p>
          </div>

          {/* 결제 정보 */}
          <div className="bg-white p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">주문번호</span>
              <span className="font-mono text-xs">{paymentResult?.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">결제금액</span>
              <span className="font-semibold">{paymentResult?.amount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">결제일시</span>
              <span>
                {paymentResult?.approvedAt
                  ? new Date(paymentResult.approvedAt).toLocaleString('ko-KR')
                  : '-'}
              </span>
            </div>
          </div>

          {/* 다음 단계 안내 */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm">다음 단계</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 설정 페이지에서 현재 플랜을 확인하세요</li>
              <li>• 대시보드에서 더 많은 가이드북을 만들어보세요</li>
              <li>• AI 생성 기능으로 빠르게 콘텐츠를 작성하세요</li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" onClick={() => router.push('/dashboard')}>
              <Home className="mr-2 h-4 w-4" />
              대시보드로 이동
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.push('/settings')}>
              설정 확인하기
            </Button>
          </div>

          {/* 영수증 안내 */}
          <p className="text-xs text-center text-muted-foreground">
            영수증은 설정 {'>'} 결제 내역에서 확인하실 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
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
      <SuccessContent />
    </Suspense>
  );
}
