/**
 * Test: Checkout Success Page (P3-T3.4)
 *
 * 결제 완료 페이지 테스트
 * - URL 파라미터에서 orderId, paymentKey, amount 추출
 * - 주문 확인 및 결제 성공 메시지
 * - 다운로드 센터 링크
 * - 비회원일 경우 회원 가입 유도
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock functions that we can control
const mockGetUser = vi.fn();
const mockPush = vi.fn();

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

describe('CheckoutSuccessPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null,
    });
  });

  describe('RED Phase - 테스트 실패 확인', () => {
    it('should render page component', async () => {
      // This test will fail initially as the component doesn't exist
      const { default: CheckoutSuccessPage } = await import(
        '@/app/(shop)/checkout/success/page'
      );

      const mockSearchParams = {
        orderId: 'ORD-20260125-0001',
        paymentKey: 'test-payment-key-123',
        amount: '29900',
      };

      render(<CheckoutSuccessPage searchParams={mockSearchParams} />);

      // Wait for async content to load
      await waitFor(
        () => {
          expect(screen.getByText(/결제가 완료되었습니다/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should display order number from URL params', async () => {
      const { default: CheckoutSuccessPage } = await import(
        '@/app/(shop)/checkout/success/page'
      );

      const mockSearchParams = {
        orderId: 'ORD-20260125-0001',
        paymentKey: 'test-payment-key-123',
        amount: '29900',
      };

      render(<CheckoutSuccessPage searchParams={mockSearchParams} />);

      await waitFor(
        () => {
          expect(screen.getByText(/ORD-20260125-0001/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should show download center link for authenticated users', async () => {
      // Mock authenticated user
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      const { default: CheckoutSuccessPage } = await import(
        '@/app/(shop)/checkout/success/page'
      );

      const mockSearchParams = {
        orderId: 'ORD-20260125-0001',
        paymentKey: 'test-payment-key-123',
        amount: '29900',
      };

      render(<CheckoutSuccessPage searchParams={mockSearchParams} />);

      await waitFor(
        () => {
          expect(screen.getByText(/다운로드 센터 가기/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should show guest conversion prompt for non-authenticated users', async () => {
      // Mock guest user (not authenticated)
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { default: CheckoutSuccessPage } = await import(
        '@/app/(shop)/checkout/success/page'
      );

      const mockSearchParams = {
        orderId: 'ORD-20260125-0001',
        paymentKey: 'test-payment-key-123',
        amount: '29900',
      };

      render(<CheckoutSuccessPage searchParams={mockSearchParams} />);

      await waitFor(
        () => {
          expect(
            screen.getByText(/회원가입하고 다운로드 관리하기/i)
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should display payment amount', async () => {
      const { default: CheckoutSuccessPage } = await import(
        '@/app/(shop)/checkout/success/page'
      );

      const mockSearchParams = {
        orderId: 'ORD-20260125-0001',
        paymentKey: 'test-payment-key-123',
        amount: '29900',
      };

      render(<CheckoutSuccessPage searchParams={mockSearchParams} />);

      await waitFor(
        () => {
          expect(screen.getByText(/29,900원/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should handle missing URL parameters gracefully', async () => {
      const { default: CheckoutSuccessPage } = await import(
        '@/app/(shop)/checkout/success/page'
      );

      const mockSearchParams = {};

      render(<CheckoutSuccessPage searchParams={mockSearchParams} />);

      await waitFor(
        () => {
          expect(screen.getByText(/잘못된 접근/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});
