/**
 * Toss Payments Integration Tests
 * TDD: RED → GREEN → REFACTOR
 */

import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import {
  createPaymentRequest,
  approvePayment,
  cancelPayment,
  getPayment,
  validateWebhook,
} from '@/lib/toss/payments';
import type { TossPaymentRequest, TossPaymentApprovalRequest } from '@/lib/toss/types';

// Mock fetch globally
global.fetch = vi.fn();

// Setup test environment variables
beforeAll(() => {
  process.env.TOSS_CLIENT_KEY = 'test_ck_test_client_key';
  process.env.TOSS_SECRET_KEY = 'test_sk_test_secret_key';
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY = 'test_ck_test_client_key';
});

describe('Toss Payments - Payment Request', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create payment request with required fields', async () => {
    const paymentRequest: TossPaymentRequest = {
      amount: 10000,
      orderId: 'ORD-20260125-0001',
      orderName: 'Next.js 템플릿',
      successUrl: 'http://localhost:3000/checkout/success',
      failUrl: 'http://localhost:3000/checkout/fail',
    };

    const result = await createPaymentRequest(paymentRequest);

    expect(result).toBeDefined();
    expect(result.amount).toBe(10000);
    expect(result.orderId).toBe('ORD-20260125-0001');
    expect(result.orderName).toBe('Next.js 템플릿');
  });

  it('should create payment request with customer info', async () => {
    const paymentRequest: TossPaymentRequest = {
      amount: 10000,
      orderId: 'ORD-20260125-0002',
      orderName: '디지털 상품',
      customerEmail: 'test@example.com',
      customerName: '홍길동',
      successUrl: 'http://localhost:3000/checkout/success',
      failUrl: 'http://localhost:3000/checkout/fail',
    };

    const result = await createPaymentRequest(paymentRequest);

    expect(result.customerEmail).toBe('test@example.com');
    expect(result.customerName).toBe('홍길동');
  });

  it('should throw error for invalid amount', async () => {
    const paymentRequest: TossPaymentRequest = {
      amount: -1000,
      orderId: 'ORD-20260125-0003',
      orderName: '잘못된 금액',
      successUrl: 'http://localhost:3000/checkout/success',
      failUrl: 'http://localhost:3000/checkout/fail',
    };

    await expect(createPaymentRequest(paymentRequest)).rejects.toThrow('결제 금액은 0보다 커야 합니다');
  });

  it('should throw error for missing orderId', async () => {
    const paymentRequest = {
      amount: 10000,
      orderId: '',
      orderName: '주문번호 없음',
      successUrl: 'http://localhost:3000/checkout/success',
      failUrl: 'http://localhost:3000/checkout/fail',
    } as TossPaymentRequest;

    await expect(createPaymentRequest(paymentRequest)).rejects.toThrow('주문번호는 필수입니다');
  });
});

describe('Toss Payments - Payment Approval', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should approve payment successfully', async () => {
    const mockResponse = {
      paymentKey: 'test_payment_key_123',
      orderId: 'ORD-20260125-0001',
      orderName: 'Next.js 템플릿',
      status: 'DONE',
      totalAmount: 10000,
      approvedAt: '2026-01-25T10:00:00+09:00',
      method: 'CARD',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const approvalRequest: TossPaymentApprovalRequest = {
      paymentKey: 'test_payment_key_123',
      orderId: 'ORD-20260125-0001',
      amount: 10000,
    };

    const result = await approvePayment(approvalRequest);

    expect(result.status).toBe('DONE');
    expect(result.paymentKey).toBe('test_payment_key_123');
    expect(result.totalAmount).toBe(10000);
  });

  it('should throw error when approval fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        code: 'INVALID_PAYMENT_KEY',
        message: '유효하지 않은 결제 키입니다.',
      }),
    });

    const approvalRequest: TossPaymentApprovalRequest = {
      paymentKey: 'invalid_key',
      orderId: 'ORD-20260125-0001',
      amount: 10000,
    };

    await expect(approvePayment(approvalRequest)).rejects.toThrow('유효하지 않은 결제 키입니다');
  });

  it('should validate amount mismatch', async () => {
    const approvalRequest: TossPaymentApprovalRequest = {
      paymentKey: 'test_payment_key_123',
      orderId: 'ORD-20260125-0001',
      amount: -1000,
    };

    await expect(approvePayment(approvalRequest)).rejects.toThrow('결제 금액은 0보다 커야 합니다');
  });
});

describe('Toss Payments - Payment Cancellation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should cancel payment successfully', async () => {
    const mockResponse = {
      paymentKey: 'test_payment_key_123',
      orderId: 'ORD-20260125-0001',
      status: 'CANCELED',
      cancels: [
        {
          cancelAmount: 10000,
          cancelReason: '고객 요청',
          canceledAt: '2026-01-25T11:00:00+09:00',
        },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await cancelPayment('test_payment_key_123', '고객 요청');

    expect(result.status).toBe('CANCELED');
    expect(result.cancels?.[0].cancelReason).toBe('고객 요청');
  });
});

describe('Toss Payments - Get Payment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve payment info successfully', async () => {
    const mockResponse = {
      paymentKey: 'test_payment_key_123',
      orderId: 'ORD-20260125-0001',
      status: 'DONE',
      totalAmount: 10000,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getPayment('test_payment_key_123');

    expect(result.paymentKey).toBe('test_payment_key_123');
    expect(result.status).toBe('DONE');
  });

  it('should throw error when payment not found', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        code: 'PAYMENT_NOT_FOUND',
        message: '결제 정보를 찾을 수 없습니다.',
      }),
    });

    await expect(getPayment('invalid_key')).rejects.toThrow('결제 정보를 찾을 수 없습니다');
  });
});

describe('Toss Payments - Webhook Validation', () => {
  it('should validate webhook payload', () => {
    const webhookPayload = {
      eventType: 'PAYMENT_STATUS_CHANGED' as const,
      createdAt: '2026-01-25T10:00:00+09:00',
      data: {
        paymentKey: 'test_payment_key_123',
        orderId: 'ORD-20260125-0001',
        status: 'DONE' as const,
        totalAmount: 10000,
      },
    };

    const result = validateWebhook(webhookPayload as any);

    expect(result).toBe(true);
  });

  it('should reject invalid webhook payload', () => {
    const invalidPayload = {
      eventType: 'INVALID_EVENT',
      data: {},
    };

    const result = validateWebhook(invalidPayload as any);

    expect(result).toBe(false);
  });

  it('should reject webhook with missing data', () => {
    const invalidPayload = {
      eventType: 'PAYMENT_STATUS_CHANGED',
      createdAt: '2026-01-25T10:00:00+09:00',
    };

    const result = validateWebhook(invalidPayload as any);

    expect(result).toBe(false);
  });
});

describe('Toss Payments - Test Mode', () => {
  it('should use test credentials in test mode', () => {
    const clientKey = process.env.TOSS_CLIENT_KEY;
    const secretKey = process.env.TOSS_SECRET_KEY;

    // Test mode keys start with 'test_'
    expect(clientKey?.startsWith('test_') || !clientKey).toBe(true);
    expect(secretKey?.startsWith('test_') || !secretKey).toBe(true);
  });
});
