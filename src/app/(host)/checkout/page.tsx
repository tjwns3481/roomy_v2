/**
 * @TASK P6-T6.5 - 결제 페이지
 * @SPEC docs/planning/06-tasks.md#P6-T6.5
 *
 * Toss Payments 결제 페이지
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { CheckoutClient } from './checkout-client';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import type { SubscriptionPlan } from '@/types/subscription';

interface CheckoutPageProps {
  searchParams: Promise<{
    plan?: string;
  }>;
}

async function CheckoutContent({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const plan = params.plan as Exclude<SubscriptionPlan, 'free'> | null;

  // 플랜 검증
  if (!plan || (plan !== 'pro' && plan !== 'business')) {
    redirect('/settings');
  }

  // 인증 확인
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const userId = session.user.id;

  // 결제 요청 생성
  let paymentRequest;
  let error = null;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan,
        userId,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      error = errorData.error || '결제 요청 생성에 실패했습니다.';
    } else {
      paymentRequest = await response.json();
    }
  } catch (err) {
    console.error('결제 요청 생성 실패:', err);
    error = '결제 요청 생성에 실패했습니다.';
  }

  return <CheckoutClient plan={plan} paymentRequest={paymentRequest} error={error} />;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  return (
    <Suspense
      fallback={
        <div className="container max-w-6xl py-8">
          <Skeleton className="h-12 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        </div>
      }
    >
      <CheckoutContent searchParams={searchParams} />
    </Suspense>
  );
}
