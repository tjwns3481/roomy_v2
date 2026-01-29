/**
 * @TASK P6-T6.2 - Toss Payments 유틸리티
 * @SPEC docs/planning/02-trd.md#payments
 *
 * Toss Payments 결제 처리를 위한 서버 사이드 유틸리티 함수들
 */

import type {
  TossPaymentResponse,
  TossErrorResponse,
  PaymentCancelResponse,
} from '@/types/payment';
import type { SubscriptionPlan } from '@/types/subscription';

// ============================================================
// 플랜별 가격 설정
// ============================================================

/**
 * 플랜별 연간 가격 (원)
 */
export const PLAN_PRICES: Record<Exclude<SubscriptionPlan, 'free'>, number> = {
  pro: 49000,
  business: 99000,
};

/**
 * 플랜별 상품명
 */
export const PLAN_NAMES: Record<Exclude<SubscriptionPlan, 'free'>, string> = {
  pro: 'Roomy Pro 연간 구독',
  business: 'Roomy Business 연간 구독',
};

// ============================================================
// 주문번호 생성
// ============================================================

/**
 * 고유한 주문번호를 생성합니다.
 *
 * 형식: roomy_{timestamp}_{random}
 * 예: roomy_1706486400000_a1b2c3d4
 *
 * @returns 고유한 주문번호
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `roomy_${timestamp}_${randomPart}`;
}

/**
 * 주문번호의 유효성을 검증합니다.
 *
 * @param orderId - 검증할 주문번호
 * @returns 유효한 주문번호인지 여부
 */
export function isValidOrderId(orderId: string): boolean {
  // roomy_ 접두사로 시작하고, 숫자와 랜덤 문자열이 포함되어야 함
  const pattern = /^roomy_\d+_[a-z0-9]{8}$/;
  return pattern.test(orderId);
}

// ============================================================
// Toss API 호출
// ============================================================

const TOSS_API_BASE_URL = 'https://api.tosspayments.com/v1';

/**
 * Toss API 인증 헤더를 생성합니다.
 *
 * @returns Authorization 헤더 값
 */
function getAuthHeader(): string {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new Error('TOSS_SECRET_KEY 환경 변수가 설정되지 않았습니다.');
  }
  // Toss API는 secretKey + ":"를 Base64 인코딩
  const encoded = Buffer.from(`${secretKey}:`).toString('base64');
  return `Basic ${encoded}`;
}

/**
 * Toss API 에러 응답을 파싱합니다.
 *
 * @param response - fetch 응답
 * @returns 에러 정보
 */
async function parseErrorResponse(response: Response): Promise<TossErrorResponse> {
  try {
    const errorData = await response.json();
    return {
      code: errorData.code || 'UNKNOWN_ERROR',
      message: errorData.message || '알 수 없는 오류가 발생했습니다.',
    };
  } catch {
    return {
      code: 'PARSE_ERROR',
      message: `HTTP ${response.status}: ${response.statusText}`,
    };
  }
}

/**
 * 결제 승인 API를 호출합니다.
 *
 * @param paymentKey - Toss 결제 키 (콜백에서 전달받음)
 * @param orderId - 주문번호
 * @param amount - 결제 금액 (원)
 * @returns 결제 승인 응답
 * @throws Toss API 에러 시 예외 발생
 *
 * @example
 * ```ts
 * const payment = await confirmPayment('toss_pay_key_xxx', 'roomy_123', 49000);
 * console.log(payment.status); // 'DONE'
 * ```
 */
export async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_BASE_URL}/payments/confirm`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    }),
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw new Error(`결제 승인 실패: [${error.code}] ${error.message}`);
  }

  return response.json();
}

/**
 * 결제 취소 API를 호출합니다.
 *
 * @param paymentKey - Toss 결제 키
 * @param cancelReason - 취소 사유
 * @param cancelAmount - 취소 금액 (미입력 시 전액 취소)
 * @returns 취소 응답
 * @throws Toss API 에러 시 예외 발생
 *
 * @example
 * ```ts
 * // 전액 취소
 * const result = await cancelPayment('toss_pay_key_xxx', '고객 요청');
 *
 * // 부분 취소
 * const result = await cancelPayment('toss_pay_key_xxx', '부분 환불', 10000);
 * ```
 */
export async function cancelPayment(
  paymentKey: string,
  cancelReason: string,
  cancelAmount?: number
): Promise<PaymentCancelResponse> {
  const body: Record<string, unknown> = {
    cancelReason,
  };

  if (cancelAmount !== undefined) {
    body.cancelAmount = cancelAmount;
  }

  const response = await fetch(`${TOSS_API_BASE_URL}/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw new Error(`결제 취소 실패: [${error.code}] ${error.message}`);
  }

  return response.json();
}

/**
 * 결제 정보 조회 API를 호출합니다.
 *
 * @param paymentKey - Toss 결제 키
 * @returns 결제 정보
 * @throws Toss API 에러 시 예외 발생
 */
export async function getPayment(paymentKey: string): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_BASE_URL}/payments/${paymentKey}`, {
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(),
    },
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw new Error(`결제 조회 실패: [${error.code}] ${error.message}`);
  }

  return response.json();
}

/**
 * 주문번호로 결제 정보를 조회합니다.
 *
 * @param orderId - 주문번호
 * @returns 결제 정보
 * @throws Toss API 에러 시 예외 발생
 */
export async function getPaymentByOrderId(orderId: string): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_BASE_URL}/payments/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(),
    },
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw new Error(`결제 조회 실패: [${error.code}] ${error.message}`);
  }

  return response.json();
}

// ============================================================
// 구독 기간 계산
// ============================================================

/**
 * 구독 기간을 계산합니다 (1년).
 *
 * @param startDate - 시작일 (기본: 현재)
 * @returns 시작일과 종료일
 */
export function calculateSubscriptionPeriod(startDate: Date = new Date()): {
  periodStart: Date;
  periodEnd: Date;
} {
  const periodStart = new Date(startDate);
  const periodEnd = new Date(startDate);
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  return { periodStart, periodEnd };
}

// ============================================================
// 금액 검증
// ============================================================

/**
 * 결제 금액이 올바른지 검증합니다.
 *
 * @param plan - 구독 플랜
 * @param amount - 결제 금액
 * @returns 금액이 일치하는지 여부
 */
export function validatePaymentAmount(plan: 'pro' | 'business', amount: number): boolean {
  return PLAN_PRICES[plan] === amount;
}

// ============================================================
// 결제 성공/실패 URL 생성
// ============================================================

/**
 * 결제 성공 콜백 URL을 생성합니다.
 *
 * @returns 성공 URL
 */
export function getSuccessUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/payments/success`;
}

/**
 * 결제 실패 콜백 URL을 생성합니다.
 *
 * @returns 실패 URL
 */
export function getFailUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/payments/fail`;
}

// ============================================================
// Client 함수는 ./client.ts에서 직접 import
// 서버 컴포넌트에서는 이 파일의 함수만 사용
// ============================================================
//
// 클라이언트에서 사용:
// import { initTossPayments, requestPayment } from '@/lib/toss/client';
//
// 서버에서 사용:
// import { confirmPayment, cancelPayment, ... } from '@/lib/toss';
// ============================================================
