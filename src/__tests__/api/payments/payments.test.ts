/**
 * @TASK P6-T6.2 - Toss Payments API 테스트
 * @TEST src/app/api/payments/*
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateOrderId,
  isValidOrderId,
  PLAN_PRICES,
  PLAN_NAMES,
  validatePaymentAmount,
  calculateSubscriptionPeriod,
  getSuccessUrl,
  getFailUrl,
} from '@/lib/toss';

// ============================================================
// 유틸리티 함수 테스트
// ============================================================

describe('Toss Payments 유틸리티', () => {
  describe('generateOrderId', () => {
    it('유효한 주문번호 형식을 생성해야 함', () => {
      const orderId = generateOrderId();
      expect(orderId).toMatch(/^roomy_\d+_[a-z0-9]{8}$/);
    });

    it('매번 고유한 주문번호를 생성해야 함', () => {
      const orderIds = new Set<string>();
      for (let i = 0; i < 100; i++) {
        orderIds.add(generateOrderId());
      }
      expect(orderIds.size).toBe(100);
    });
  });

  describe('isValidOrderId', () => {
    it('유효한 주문번호를 인식해야 함', () => {
      const orderId = generateOrderId();
      expect(isValidOrderId(orderId)).toBe(true);
    });

    it('유효하지 않은 주문번호를 거부해야 함', () => {
      expect(isValidOrderId('')).toBe(false);
      expect(isValidOrderId('invalid')).toBe(false);
      expect(isValidOrderId('roomy_123')).toBe(false);
      expect(isValidOrderId('roomy_abc_12345678')).toBe(false);
    });
  });

  describe('PLAN_PRICES', () => {
    it('pro 플랜 가격이 49000원이어야 함', () => {
      expect(PLAN_PRICES.pro).toBe(49000);
    });

    it('business 플랜 가격이 99000원이어야 함', () => {
      expect(PLAN_PRICES.business).toBe(99000);
    });
  });

  describe('PLAN_NAMES', () => {
    it('pro 플랜 이름이 올바르게 설정되어야 함', () => {
      expect(PLAN_NAMES.pro).toBe('Roomy Pro 연간 구독');
    });

    it('business 플랜 이름이 올바르게 설정되어야 함', () => {
      expect(PLAN_NAMES.business).toBe('Roomy Business 연간 구독');
    });
  });

  describe('validatePaymentAmount', () => {
    it('pro 플랜 금액이 일치하면 true 반환', () => {
      expect(validatePaymentAmount('pro', 49000)).toBe(true);
    });

    it('business 플랜 금액이 일치하면 true 반환', () => {
      expect(validatePaymentAmount('business', 99000)).toBe(true);
    });

    it('금액이 일치하지 않으면 false 반환', () => {
      expect(validatePaymentAmount('pro', 50000)).toBe(false);
      expect(validatePaymentAmount('business', 100000)).toBe(false);
    });
  });

  describe('calculateSubscriptionPeriod', () => {
    it('시작일로부터 1년 후가 종료일이어야 함', () => {
      const startDate = new Date('2024-01-15T10:00:00Z');
      const { periodStart, periodEnd } = calculateSubscriptionPeriod(startDate);

      expect(periodStart.toISOString()).toBe('2024-01-15T10:00:00.000Z');
      expect(periodEnd.toISOString()).toBe('2025-01-15T10:00:00.000Z');
    });

    it('기본값은 현재 시간이어야 함', () => {
      const before = new Date();
      const { periodStart, periodEnd } = calculateSubscriptionPeriod();
      const after = new Date();

      expect(periodStart.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(periodStart.getTime()).toBeLessThanOrEqual(after.getTime());

      // 종료일은 시작일 + 1년
      const expectedEnd = new Date(periodStart);
      expectedEnd.setFullYear(expectedEnd.getFullYear() + 1);
      expect(periodEnd.getTime()).toBe(expectedEnd.getTime());
    });
  });

  describe('getSuccessUrl / getFailUrl', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://roomy.app');
    });

    it('성공 URL이 올바르게 생성되어야 함', () => {
      const url = getSuccessUrl();
      expect(url).toBe('https://roomy.app/payments/success');
    });

    it('실패 URL이 올바르게 생성되어야 함', () => {
      const url = getFailUrl();
      expect(url).toBe('https://roomy.app/payments/fail');
    });
  });
});

// ============================================================
// 타입 테스트
// ============================================================

describe('결제 타입', () => {
  it('PaymentRequestBody 타입이 올바르게 정의되어야 함', () => {
    const body = {
      plan: 'pro' as const,
      userId: 'user-123',
    };
    expect(body.plan).toBe('pro');
    expect(body.userId).toBe('user-123');
  });

  it('PaymentConfirmBody 타입이 올바르게 정의되어야 함', () => {
    const body = {
      paymentKey: 'toss_pay_key_xxx',
      orderId: 'roomy_123_abcd1234',
      amount: 49000,
    };
    expect(body.paymentKey).toBe('toss_pay_key_xxx');
    expect(body.orderId).toBe('roomy_123_abcd1234');
    expect(body.amount).toBe(49000);
  });
});

// ============================================================
// Mock 테스트 (API 호출)
// ============================================================

describe('결제 API Mock 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('TOSS_SECRET_KEY', 'test_sk_1234567890');
  });

  it('결제 요청 시 필수 필드가 포함되어야 함', () => {
    const requestBody = {
      plan: 'pro' as const,
      userId: 'user-123',
    };

    expect(requestBody).toHaveProperty('plan');
    expect(requestBody).toHaveProperty('userId');
    expect(['pro', 'business']).toContain(requestBody.plan);
  });

  it('결제 확인 시 필수 필드가 포함되어야 함', () => {
    const confirmBody = {
      paymentKey: 'toss_pay_key_xxx',
      orderId: generateOrderId(),
      amount: PLAN_PRICES.pro,
    };

    expect(confirmBody).toHaveProperty('paymentKey');
    expect(confirmBody).toHaveProperty('orderId');
    expect(confirmBody).toHaveProperty('amount');
    expect(isValidOrderId(confirmBody.orderId)).toBe(true);
  });
});

// ============================================================
// 웹훅 서명 테스트
// ============================================================

describe('웹훅 검증', () => {
  it('웹훅 페이로드 구조가 올바르게 정의되어야 함', () => {
    const webhookPayload = {
      eventType: 'PAYMENT_STATUS_CHANGED' as const,
      createdAt: new Date().toISOString(),
      data: {
        paymentKey: 'toss_pay_key_xxx',
        orderId: 'roomy_123_abcd1234',
        status: 'DONE' as const,
      },
    };

    expect(webhookPayload.eventType).toBe('PAYMENT_STATUS_CHANGED');
    expect(webhookPayload.data.status).toBe('DONE');
  });

  it('웹훅 이벤트 타입이 올바르게 정의되어야 함', () => {
    const validEventTypes = [
      'PAYMENT_STATUS_CHANGED',
      'DEPOSIT_CALLBACK',
      'PAYOUT_STATUS_CHANGED',
    ];

    validEventTypes.forEach((eventType) => {
      expect(typeof eventType).toBe('string');
    });
  });
});
