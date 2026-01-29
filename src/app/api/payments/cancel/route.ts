/**
 * @TASK P6-T6.2 - 결제 취소 API
 * @SPEC docs/planning/02-trd.md#payments
 *
 * POST /api/payments/cancel
 * - 결제 취소 처리
 * - Toss API로 취소 요청
 * - payment_history 업데이트
 * - subscription 상태 업데이트
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { cancelPayment } from '@/lib/toss';

interface PaymentCancelBody {
  paymentId: string; // payment_history의 ID
  cancelReason: string;
  cancelAmount?: number; // 부분 취소 시
}

// ============================================================
// POST - 결제 취소
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // 1. 요청 본문 파싱
    const body: PaymentCancelBody = await request.json();
    const { paymentId, cancelReason, cancelAmount } = body;

    // 2. 입력 검증
    if (!paymentId) {
      return NextResponse.json(
        { error: '결제 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!cancelReason) {
      return NextResponse.json(
        { error: '취소 사유가 필요합니다.' },
        { status: 400 }
      );
    }

    // 3. 인증 확인
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 4. 결제 정보 조회
    const adminClient = createAdminClient();
    const { data: payment, error: queryError } = await adminClient
      .from('payment_history')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single();

    if (queryError || !payment) {
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 5. 취소 가능 여부 확인
    if (payment.status !== 'succeeded') {
      return NextResponse.json(
        { error: `취소할 수 없는 결제 상태입니다. (현재: ${payment.status})` },
        { status: 400 }
      );
    }

    if (!payment.payment_key) {
      return NextResponse.json(
        { error: '결제 키가 없어 취소할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 6. 부분 취소 금액 검증
    if (cancelAmount !== undefined) {
      if (cancelAmount <= 0) {
        return NextResponse.json(
          { error: '취소 금액은 0보다 커야 합니다.' },
          { status: 400 }
        );
      }

      if (cancelAmount > payment.amount) {
        return NextResponse.json(
          { error: '취소 금액이 결제 금액을 초과합니다.' },
          { status: 400 }
        );
      }
    }

    // 7. Toss API로 취소 요청
    let cancelResult;
    try {
      cancelResult = await cancelPayment(
        payment.payment_key,
        cancelReason,
        cancelAmount
      );
    } catch (error) {
      console.error('Toss 결제 취소 실패:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : '결제 취소에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 8. payment_history 상태 업데이트
    const newStatus = cancelResult.balanceAmount === 0 ? 'refunded' : 'succeeded';
    const { error: updateError } = await adminClient
      .from('payment_history')
      .update({
        status: newStatus,
        // 부분 환불인 경우 금액은 유지하고 상태만 변경
      })
      .eq('id', paymentId);

    if (updateError) {
      console.error('결제 정보 업데이트 실패:', updateError);
      // 취소는 완료되었으므로 에러 로그만 남기고 계속 진행
    }

    // 9. 전액 환불인 경우 구독 상태 업데이트
    if (cancelResult.balanceAmount === 0 && payment.subscription_id) {
      await adminClient
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.subscription_id);
    }

    // 10. 응답
    return NextResponse.json({
      success: true,
      cancel: {
        paymentKey: payment.payment_key,
        cancelAmount: cancelAmount || payment.amount,
        balanceAmount: cancelResult.balanceAmount,
        status: cancelResult.status,
        canceledAt: cancelResult.cancels?.[0]?.canceledAt,
      },
    });
  } catch (error) {
    console.error('결제 취소 처리 에러:', error);
    return NextResponse.json(
      { error: '결제 취소 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
