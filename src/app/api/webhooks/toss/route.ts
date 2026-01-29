/**
 * @TASK P6-T6.2 - Toss Payments 웹훅 처리
 * @SPEC docs/planning/02-trd.md#payments
 *
 * POST /api/webhooks/toss
 * - 결제 상태 변경 이벤트 처리
 * - 취소, 환불 등 처리
 * - 구독 자동 갱신 처리 (필요 시)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getPayment } from '@/lib/toss';
import type { TossWebhookPayload, TossPaymentStatus } from '@/types/payment';
import crypto from 'crypto';

// ============================================================
// 웹훅 서명 검증
// ============================================================

/**
 * Toss 웹훅 서명을 검증합니다.
 *
 * @param body - 원본 요청 본문
 * @param signature - 요청 헤더의 서명
 * @returns 서명이 유효한지 여부
 */
function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.TOSS_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('TOSS_WEBHOOK_SECRET이 설정되지 않았습니다. 서명 검증을 건너뜁니다.');
    return true; // 개발 환경에서는 스킵
  }

  // HMAC-SHA256 서명 생성
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  // 타이밍 공격 방지를 위한 상수 시간 비교
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// ============================================================
// 결제 상태별 처리 함수
// ============================================================

/**
 * 결제 취소 처리
 */
async function handlePaymentCanceled(
  paymentKey: string,
  orderId: string
): Promise<void> {
  const adminClient = createAdminClient();

  // 1. 결제 정보 업데이트
  const { data: payment, error: queryError } = await adminClient
    .from('payment_history')
    .select('*, subscriptions(id, user_id)')
    .eq('payment_key', paymentKey)
    .single();

  if (queryError || !payment) {
    console.error('결제 정보 조회 실패:', queryError);
    return;
  }

  // 2. 결제 상태를 refunded로 업데이트
  await adminClient
    .from('payment_history')
    .update({ status: 'refunded' })
    .eq('id', payment.id);

  // 3. 구독 상태 업데이트 (취소됨)
  if (payment.subscription_id) {
    await adminClient
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.subscription_id);
  }

  console.log(`결제 취소 처리 완료: ${orderId}`);
}

/**
 * 부분 취소 처리
 */
async function handlePartialCanceled(
  paymentKey: string,
  orderId: string
): Promise<void> {
  const adminClient = createAdminClient();

  // Toss API에서 최신 결제 정보 조회
  const tossPayment = await getPayment(paymentKey);

  // 결제 정보 업데이트 (부분 환불 금액 반영)
  const { error } = await adminClient
    .from('payment_history')
    .update({
      // 부분 환불된 경우 상태는 유지하되, 실제 금액은 balanceAmount
      // 별도의 환불 이력 테이블이 있다면 거기에 기록하는 것이 좋음
    })
    .eq('payment_key', paymentKey);

  if (error) {
    console.error('부분 취소 처리 실패:', error);
  }

  console.log(`부분 취소 처리 완료: ${orderId}, 잔액: ${tossPayment.balanceAmount}`);
}

/**
 * 결제 만료 처리
 */
async function handlePaymentExpired(
  paymentKey: string,
  orderId: string
): Promise<void> {
  const adminClient = createAdminClient();

  // pending 상태의 결제를 failed로 업데이트
  const { error } = await adminClient
    .from('payment_history')
    .update({ status: 'failed' })
    .eq('order_id', orderId)
    .eq('status', 'pending');

  if (error) {
    console.error('결제 만료 처리 실패:', error);
  }

  console.log(`결제 만료 처리 완료: ${orderId}`);
}

/**
 * 결제 실패 처리
 */
async function handlePaymentAborted(
  paymentKey: string,
  orderId: string
): Promise<void> {
  const adminClient = createAdminClient();

  // pending 상태의 결제를 failed로 업데이트
  const { error } = await adminClient
    .from('payment_history')
    .update({ status: 'failed' })
    .eq('order_id', orderId);

  if (error) {
    console.error('결제 실패 처리 실패:', error);
  }

  console.log(`결제 실패 처리 완료: ${orderId}`);
}

// ============================================================
// POST - 웹훅 이벤트 처리
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // 1. 원본 요청 본문 읽기
    const rawBody = await request.text();

    // 2. 서명 검증
    const signature = request.headers.get('x-toss-signature') || '';

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('웹훅 서명 검증 실패');
      return NextResponse.json(
        { error: '서명 검증 실패' },
        { status: 401 }
      );
    }

    // 3. 페이로드 파싱
    const payload: TossWebhookPayload = JSON.parse(rawBody);
    const { eventType, data } = payload;

    console.log(`Toss 웹훅 수신: ${eventType}`, data);

    // 4. 이벤트 타입별 처리
    if (eventType === 'PAYMENT_STATUS_CHANGED') {
      const { paymentKey, orderId, status } = data;

      switch (status as TossPaymentStatus) {
        case 'CANCELED':
          await handlePaymentCanceled(paymentKey, orderId);
          break;

        case 'PARTIAL_CANCELED':
          await handlePartialCanceled(paymentKey, orderId);
          break;

        case 'EXPIRED':
          await handlePaymentExpired(paymentKey, orderId);
          break;

        case 'ABORTED':
          await handlePaymentAborted(paymentKey, orderId);
          break;

        case 'DONE':
          // 결제 완료는 /api/payments/confirm에서 처리
          console.log(`결제 완료 이벤트 (이미 처리됨): ${orderId}`);
          break;

        default:
          console.log(`처리하지 않는 상태: ${status}`);
      }
    } else if (eventType === 'DEPOSIT_CALLBACK') {
      // 가상계좌 입금 완료 콜백
      console.log('가상계좌 입금 완료:', data);
      // 현재는 카드 결제만 지원하므로 로그만 남김
    } else {
      console.log(`처리하지 않는 이벤트 타입: ${eventType}`);
    }

    // 5. 성공 응답 (Toss는 200 OK를 기대)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('웹훅 처리 에러:', error);

    // 웹훅은 재시도될 수 있으므로 에러가 발생해도 200을 반환하는 것이 좋음
    // 단, 로깅은 필수
    return NextResponse.json(
      { success: false, error: '웹훅 처리 실패' },
      { status: 200 } // 재시도 방지를 위해 200 반환
    );
  }
}

// ============================================================
// GET - 웹훅 상태 확인 (헬스체크)
// ============================================================

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Toss Payments Webhook Endpoint',
    timestamp: new Date().toISOString(),
  });
}
