/**
 * @TASK P6-T6.2 - Toss Payments SDK 클라이언트 초기화
 * @SPEC docs/planning/02-trd.md#payments
 *
 * Toss Payments SDK를 로드하고 초기화합니다.
 * 클라이언트 사이드에서만 사용됩니다.
 */

'use client';

import type { TossPaymentsInstance, TossPaymentInfo, TossPaymentMethod } from '@/types/payment';

// Toss Payments SDK 동적 로딩을 위한 타입
declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}

/**
 * Toss Payments SDK 스크립트 로드 상태
 */
let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

/**
 * Toss Payments SDK 스크립트를 동적으로 로드합니다.
 *
 * @returns SDK 로드 완료 Promise
 */
function loadTossPaymentsScript(): Promise<void> {
  if (isLoaded) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  if (isLoading) {
    return new Promise((resolve, reject) => {
      const checkLoaded = setInterval(() => {
        if (isLoaded) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);

      // 10초 타임아웃
      setTimeout(() => {
        clearInterval(checkLoaded);
        reject(new Error('Toss Payments SDK 로드 타임아웃'));
      }, 10000);
    });
  }

  isLoading = true;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.async = true;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };

    script.onerror = () => {
      isLoading = false;
      loadPromise = null;
      reject(new Error('Toss Payments SDK 로드 실패'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Toss Payments SDK 인스턴스를 초기화하고 반환합니다.
 *
 * @example
 * ```tsx
 * const tossPayments = await initTossPayments();
 * await tossPayments.requestPayment('CARD', {
 *   amount: 49000,
 *   orderId: 'order_123',
 *   orderName: 'Roomy Pro 연간 구독',
 *   successUrl: 'https://roomy.app/payments/success',
 *   failUrl: 'https://roomy.app/payments/fail',
 * });
 * ```
 *
 * @returns Toss Payments 인스턴스
 * @throws SDK 로드 실패 또는 클라이언트 키 미설정 시 에러
 */
export async function initTossPayments(): Promise<TossPaymentsInstance> {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  if (!clientKey) {
    throw new Error('NEXT_PUBLIC_TOSS_CLIENT_KEY 환경 변수가 설정되지 않았습니다.');
  }

  // SDK 스크립트 로드
  await loadTossPaymentsScript();

  // SDK 인스턴스 생성
  if (!window.TossPayments) {
    throw new Error('Toss Payments SDK가 로드되지 않았습니다.');
  }

  return window.TossPayments(clientKey);
}

/**
 * Toss Payments 결제 요청을 시작합니다.
 *
 * @param method - 결제 수단 (CARD, VIRTUAL_ACCOUNT 등)
 * @param paymentInfo - 결제 정보
 * @returns 결제 요청 Promise (성공 시 리다이렉트, 실패 시 에러)
 */
export async function requestPayment(
  method: TossPaymentMethod,
  paymentInfo: TossPaymentInfo
): Promise<void> {
  const tossPayments = await initTossPayments();
  return tossPayments.requestPayment(method, paymentInfo);
}

/**
 * 테스트 환경인지 확인합니다.
 *
 * @returns 테스트 환경 여부
 */
export function isTestEnvironment(): boolean {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  return clientKey?.startsWith('test_') ?? false;
}
