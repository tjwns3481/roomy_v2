/**
 * @TASK P6-T6.2 - 결제 확인 API
 * @SPEC docs/planning/02-trd.md#payments
 *
 * POST /api/payments/confirm
 * - Toss 결제 성공 콜백 처리
 * - 결제 승인 API 호출
 * - payment_history 기록
 * - subscription 업데이트
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
  confirmPayment,
  validatePaymentAmount,
  calculateSubscriptionPeriod,
  PLAN_PRICES,
} from '@/lib/toss';
import type { PaymentConfirmBody } from '@/types/payment';

// ============================================================
// POST - 결제 승인 처리
// ============================================================

export async function POST(request: NextRequest) {
  const adminClient = createAdminClient();

  try {
    // 1. 요청 본문 파싱
    const body: PaymentConfirmBody = await request.json();
    const { paymentKey, orderId, amount } = body;

    // 2. 입력 검증
    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다. (paymentKey, orderId, amount)' },
        { status: 400 }
      );
    }

    // 3. pending 상태의 결제 정보 조회
    const { data: pendingPayment, error: queryError } = await adminClient
      .from('payment_history')
      .select('*')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .single();

    if (queryError || !pendingPayment) {
      console.error('결제 정보 조회 실패:', queryError);
      return NextResponse.json(
        { error: '유효하지 않은 주문번호입니다.' },
        { status: 400 }
      );
    }

    // 4. 금액 검증
    if (pendingPayment.amount !== amount) {
      console.error('금액 불일치:', { expected: pendingPayment.amount, received: amount });

      // 결제 정보 실패로 업데이트
      await adminClient
        .from('payment_history')
        .update({ status: 'failed' })
        .eq('id', pendingPayment.id);

      return NextResponse.json(
        { error: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 5. 플랜 결정 (금액 기반)
    let plan: 'pro' | 'business';
    if (amount === PLAN_PRICES.pro) {
      plan = 'pro';
    } else if (amount === PLAN_PRICES.business) {
      plan = 'business';
    } else {
      return NextResponse.json(
        { error: '유효하지 않은 결제 금액입니다.' },
        { status: 400 }
      );
    }

    // 6. Toss API로 결제 승인 요청
    let tossPayment;
    try {
      tossPayment = await confirmPayment(paymentKey, orderId, amount);
    } catch (error) {
      console.error('Toss 결제 승인 실패:', error);

      // 결제 정보 실패로 업데이트
      await adminClient
        .from('payment_history')
        .update({ status: 'failed' })
        .eq('id', pendingPayment.id);

      return NextResponse.json(
        { error: error instanceof Error ? error.message : '결제 승인에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 7. 결제 성공 확인
    if (tossPayment.status !== 'DONE') {
      console.error('결제 상태 이상:', tossPayment.status);

      // 결제 정보 실패로 업데이트
      await adminClient
        .from('payment_history')
        .update({ status: 'failed' })
        .eq('id', pendingPayment.id);

      return NextResponse.json(
        { error: `결제가 완료되지 않았습니다. (상태: ${tossPayment.status})` },
        { status: 400 }
      );
    }

    // 8. payment_history 성공으로 업데이트
    const receiptUrl = tossPayment.receipt?.url || null;
    const { error: updatePaymentError } = await adminClient
      .from('payment_history')
      .update({
        status: 'succeeded',
        payment_key: paymentKey,
        payment_method: tossPayment.method === 'CARD' ? 'card' : 'bank_transfer',
        receipt_url: receiptUrl,
        paid_at: tossPayment.approvedAt,
      })
      .eq('id', pendingPayment.id);

    if (updatePaymentError) {
      console.error('결제 정보 업데이트 실패:', updatePaymentError);
      // 결제는 완료되었으므로 계속 진행
    }

    // 9. 구독 정보 생성/업데이트
    const { periodStart, periodEnd } = calculateSubscriptionPeriod();

    const { data: subscription, error: subscriptionError } = await adminClient
      .from('subscriptions')
      .upsert({
        user_id: pendingPayment.user_id,
        plan,
        status: 'active',
        payment_provider: 'toss',
        payment_customer_id: tossPayment.mId,
        payment_subscription_id: paymentKey, // 일회성 결제이므로 paymentKey 저장
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('구독 정보 업데이트 실패:', subscriptionError);
      // 결제는 완료되었으므로 에러 로그만 남기고 계속 진행
    }

    // 10. payment_history에 subscription_id 연결
    if (subscription) {
      await adminClient
        .from('payment_history')
        .update({ subscription_id: subscription.id })
        .eq('id', pendingPayment.id);
    }

    // 11. 응답
    return NextResponse.json({
      success: true,
      payment: {
        orderId,
        paymentKey,
        amount,
        status: 'succeeded',
        approvedAt: tossPayment.approvedAt,
        receiptUrl,
      },
      subscription: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
      } : null,
    });
  } catch (error) {
    console.error('결제 확인 처리 에러:', error);
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
