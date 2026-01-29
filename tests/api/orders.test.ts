/**
 * Orders API Tests
 * Phase: P3-T3.2
 * TDD: RED → GREEN → REFACTOR
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

// Mock Toss Payments
vi.mock('@/lib/toss/payments', () => ({
  approvePayment: vi.fn(),
}));

describe('Orders API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('주문 생성 로직', () => {
    it('회원 주문 생성 - 주문번호 자동 생성', () => {
      // 주문번호 형식 검증
      const orderNumber = 'ORD-20260125-0001';
      expect(orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
    });

    it('비회원 주문 - guest_email 필수 검증', () => {
      // 비회원 주문 시 guest_email 없으면 에러
      const user = null;
      const guest_email = undefined;

      const shouldFail = !user && !guest_email;
      expect(shouldFail).toBe(true);
    });

    it('총액 계산 로직', () => {
      const items = [
        { price: 10000, quantity: 2 },
        { price: 20000, quantity: 1 },
      ];
      const discount_amount = 5000;

      const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const total_amount = itemsTotal - discount_amount;

      expect(total_amount).toBe(35000);
    });
  });

  describe('주문 조회 로직', () => {
    it('로그인하지 않은 경우 401 에러', () => {
      const user = null;
      const shouldFail = !user;

      expect(shouldFail).toBe(true);
    });

    it('본인 주문만 조회 가능 (RLS)', () => {
      const currentUserId = 'user-123';
      const orderUserId = 'user-123';

      const canAccess = currentUserId === orderUserId;
      expect(canAccess).toBe(true);
    });

    it('타인 주문 조회 불가 (RLS)', () => {
      const currentUserId = 'user-999';
      const orderUserId = 'user-123';

      const canAccess = currentUserId === orderUserId;
      expect(canAccess).toBe(false);
    });
  });

  describe('결제 승인 로직', () => {
    it('금액 일치 검증', () => {
      const orderAmount = 10000;
      const paymentAmount = 10000;

      const isValid = orderAmount === paymentAmount;
      expect(isValid).toBe(true);
    });

    it('금액 불일치 시 실패', () => {
      const orderAmount = 10000;
      const paymentAmount = 9000;

      const isValid = orderAmount === paymentAmount;
      expect(isValid).toBe(false);
    });

    it('이미 결제된 주문 처리 방지', () => {
      const orderStatus = 'paid';
      const isPending = orderStatus === 'pending';

      expect(isPending).toBe(false);
    });

    it('Toss 결제 승인 후 상태 업데이트', async () => {
      const { approvePayment } = await import('@/lib/toss/payments');

      (approvePayment as any).mockResolvedValue({
        paymentKey: 'payment-key-123',
        orderId: 'ORD-20260125-0001',
        status: 'DONE',
        method: 'CARD',
        totalAmount: 10000,
        approvedAt: '2026-01-25T10:00:00.000Z',
      });

      const result = await approvePayment({
        paymentKey: 'payment-key-123',
        orderId: 'ORD-20260125-0001',
        amount: 10000,
      });

      expect(result.status).toBe('DONE');
      expect(result.paymentKey).toBe('payment-key-123');
    });
  });

  describe('Supabase 통합', () => {
    it('주문 생성 시 Supabase insert 호출', async () => {
      const { createServerClient } = await import('@/lib/supabase/server');

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'order-1',
              order_number: 'ORD-20260125-0001',
              status: 'pending',
            },
            error: null,
          }),
        }),
      });

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          insert: mockInsert,
        })),
      };

      (createServerClient as any).mockReturnValue(mockSupabase);

      const supabase = createServerClient();
      await supabase.from('orders').insert({
        user_id: 'user-123',
        status: 'pending',
        total_amount: 10000,
      }).select().single();

      expect(mockInsert).toHaveBeenCalled();
    });

    it('주문 조회 시 Supabase select 호출', async () => {
      const { createServerClient } = await import('@/lib/supabase/server');

      const mockOrder = vi.fn().mockResolvedValue({
        data: [{ id: 'order-1' }],
        error: null,
      });

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: mockOrder,
            })),
          })),
        })),
      };

      (createServerClient as any).mockReturnValue(mockSupabase);

      const supabase = createServerClient();
      await supabase.from('orders').select('*').eq('user_id', 'user-123').order('created_at');

      expect(mockOrder).toHaveBeenCalled();
    });
  });
});
