/**
 * @TASK P6-T6.2 - 결제 요청 API
 * @SPEC docs/planning/02-trd.md#payments
 *
 * POST /api/payments/request
 * - 결제 요청 정보 생성
 * - 주문번호, 금액, 콜백 URL 반환
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import {
  generateOrderId,
  PLAN_PRICES,
  PLAN_NAMES,
  getSuccessUrl,
  getFailUrl,
} from '@/lib/toss';
import type { PaymentRequestBody, PaymentRequestResponse } from '@/types/payment';

// ============================================================
// POST - 결제 요청 생성
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // 1. 요청 본문 파싱
    const body: PaymentRequestBody = await request.json();
    const { plan, userId } = body;

    // 2. 입력 검증
    if (!plan || !['pro', 'business'].includes(plan)) {
      return NextResponse.json(
        { error: '유효하지 않은 플랜입니다. (pro 또는 business)' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
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

    // 요청한 userId와 로그인한 사용자가 일치하는지 확인
    if (user.id !== userId) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 4. 기존 구독 상태 확인
    const adminClient = createAdminClient();
    const { data: existingSubscription } = await adminClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 이미 같은 플랜이거나 상위 플랜인 경우
    if (existingSubscription) {
      const currentPlan = existingSubscription.plan;

      if (currentPlan === plan) {
        return NextResponse.json(
          { error: '이미 동일한 플랜을 사용 중입니다.' },
          { status: 400 }
        );
      }

      if (currentPlan === 'business' && plan === 'pro') {
        return NextResponse.json(
          { error: '하위 플랜으로 다운그레이드할 수 없습니다.' },
          { status: 400 }
        );
      }
    }

    // 5. 사용자 정보 조회 (이메일, 이름)
    const { data: profile } = await adminClient
      .from('profiles')
      .select('display_name, email')
      .eq('id', userId)
      .single();

    // 6. 주문 정보 생성
    const orderId = generateOrderId();
    const amount = PLAN_PRICES[plan];
    const orderName = PLAN_NAMES[plan];
    const successUrl = getSuccessUrl();
    const failUrl = getFailUrl();

    // 7. 결제 대기 정보 저장 (payment_history에 pending 상태로)
    const { error: insertError } = await adminClient
      .from('payment_history')
      .insert({
        user_id: userId,
        amount,
        currency: 'KRW',
        status: 'pending',
        order_id: orderId,
        payment_method: 'card', // 기본값
      });

    if (insertError) {
      console.error('결제 대기 정보 저장 실패:', insertError);
      return NextResponse.json(
        { error: '결제 요청 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 8. 응답
    const response: PaymentRequestResponse = {
      orderId,
      amount,
      orderName,
      customerEmail: profile?.email || user.email,
      customerName: profile?.display_name || undefined,
      successUrl,
      failUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('결제 요청 생성 에러:', error);
    return NextResponse.json(
      { error: '결제 요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET - 결제 요청 상태 조회
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: '주문번호가 필요합니다.' },
        { status: 400 }
      );
    }

    // 인증 확인
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 결제 정보 조회
    const adminClient = createAdminClient();
    const { data: payment, error: queryError } = await adminClient
      .from('payment_history')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (queryError || !payment) {
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderId: payment.order_id,
      status: payment.status,
      amount: payment.amount,
      createdAt: payment.created_at,
    });
  } catch (error) {
    console.error('결제 상태 조회 에러:', error);
    return NextResponse.json(
      { error: '결제 상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
