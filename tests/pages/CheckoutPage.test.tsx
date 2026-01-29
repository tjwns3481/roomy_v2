/**
 * CheckoutPage Test
 *
 * TDD: RED → GREEN → REFACTOR
 *
 * 테스트 대상: src/app/(shop)/checkout/page.tsx
 *
 * AC:
 * - 장바구니 상품 요약 표시
 * - 비회원 이메일 입력 폼
 * - Toss Payments SDK 연동 (결제 버튼)
 * - 결제 처리 중 로딩 상태
 * - 결제 성공 → /checkout/success로 리다이렉트
 * - 결제 실패 → 에러 메시지 표시
 * - Neo-Brutalism 스타일
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// Mocks (must be hoisted - no top-level variables)
// ============================================================================

const mockFetchCart = vi.fn();
const mockClearCart = vi.fn();
const mockRequestPayment = vi.fn();
const mockPush = vi.fn();

// Mock useCartStore
vi.mock('@/stores/cart-store', () => ({
  useCartStore: vi.fn(() => ({
    items: [
      {
        id: 'cart-item-1',
        product_id: 'product-1',
        quantity: 2,
        product: {
          name: '바이브코딩 강의 패키지',
          price: 99000,
          discount_price: 79000,
          thumbnail_url: 'https://example.com/image.jpg',
        },
      },
    ],
    total: 158000,
    isLoading: false,
    error: null,
    fetchCart: mockFetchCart,
    clearCart: mockClearCart,
    addItem: vi.fn(),
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
  })),
}));

// Mock Toss Payments SDK
vi.mock('@tosspayments/payment-sdk', () => ({
  loadTossPayments: vi.fn(() =>
    Promise.resolve({
      requestPayment: mockRequestPayment,
    })
  ),
}));

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

// Mock fetch (주문 생성 API)
global.fetch = vi.fn();

// ============================================================================
// Tests
// ============================================================================

describe('CheckoutPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    mockFetchCart.mockClear();
    mockClearCart.mockClear();
    mockRequestPayment.mockClear();
    mockPush.mockClear();

    // Reset to default mock implementation
    const { useCartStore } = await import('@/stores/cart-store');
    vi.mocked(useCartStore).mockReturnValue({
      items: [
        {
          id: 'cart-item-1',
          product_id: 'product-1',
          quantity: 2,
          product: {
            name: '바이브코딩 강의 패키지',
            price: 99000,
            discount_price: 79000,
            thumbnail_url: 'https://example.com/image.jpg',
          },
        },
      ],
      total: 158000,
      isLoading: false,
      error: null,
      fetchCart: mockFetchCart,
      clearCart: mockClearCart,
      addItem: vi.fn(),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  describe('주문 요약 표시', () => {
    it('장바구니 상품 목록을 표시해야 한다', async () => {
      const CheckoutPage = (await import('@/app/(shop)/checkout/page')).default;
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('바이브코딩 강의 패키지')).toBeInTheDocument();
      });
    });

    it('상품별 가격과 수량을 표시해야 한다', async () => {
      const CheckoutPage = (await import('@/app/(shop)/checkout/page')).default;
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('79,000원')).toBeInTheDocument();
        expect(screen.getByText('수량: 2')).toBeInTheDocument();
      });
    });

    it('총 결제 금액을 표시해야 한다', async () => {
      const CheckoutPage = (await import('@/app/(shop)/checkout/page')).default;
      render(<CheckoutPage />);

      await waitFor(() => {
        const totalElements = screen.getAllByText('158,000원');
        expect(totalElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('비회원 이메일 입력', () => {
    it('이메일 입력 폼이 표시되어야 한다', async () => {
      const CheckoutPage = (await import('@/app/(shop)/checkout/page')).default;
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/이메일/i)).toBeInTheDocument();
      });
    });

    it('이메일 형식 검증을 해야 한다', async () => {
      const CheckoutPage = (await import('@/app/(shop)/checkout/page')).default;
      render(<CheckoutPage />);

      const emailInput = await screen.findByPlaceholderText(/이메일/i);
      const submitButton = screen.getByRole('button', { name: /결제하기/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/이메일 형식이 올바르지 않습니다/i)).toBeInTheDocument();
      });
    });
  });

  describe('결제 처리', () => {
    it('결제 버튼을 클릭하면 주문을 생성해야 한다', async () => {
      const CheckoutPage = (await import('@/app/(shop)/checkout/page')).default;

      const mockOrder = {
        id: 'order-1',
        order_number: 'ORD-20260125-0001',
        total_amount: 158000,
        order_items: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockOrder }),
      });

      render(<CheckoutPage />);

      const emailInput = await screen.findByPlaceholderText(/이메일/i);
      const submitButton = screen.getByRole('button', { name: /결제하기/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/orders',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.any(String),
          })
        );
      });
    });

    it('주문 생성 후 Toss SDK를 호출해야 한다', async () => {
      const CheckoutPage = (await import('@/app/(shop)/checkout/page')).default;

      const mockOrder = {
        id: 'order-1',
        order_number: 'ORD-20260125-0001',
        total_amount: 158000,
        order_items: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockOrder }),
      });

      render(<CheckoutPage />);

      const emailInput = await screen.findByPlaceholderText(/이메일/i);
      const submitButton = screen.getByRole('button', { name: /결제하기/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRequestPayment).toHaveBeenCalledWith(
          '카드',
          expect.objectContaining({
            amount: 158000,
            orderId: 'order-1',
            orderName: '바이브코딩 강의 패키지',
            customerEmail: 'test@example.com',
          })
        );
      });
    });

    it('결제 중에는 로딩 상태를 표시해야 한다', async () => {
      const CheckoutPage = (await import('@/app/(shop)/checkout/page')).default;

      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ data: { id: 'order-1', total_amount: 158000 } }),
                }),
              100
            )
          )
      );

      render(<CheckoutPage />);

      const emailInput = await screen.findByPlaceholderText(/이메일/i);
      const submitButton = screen.getByRole('button', { name: /결제하기/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/결제 처리 중/i)).toBeInTheDocument();
      });
    });

    it('빈 장바구니인 경우 결제 버튼을 비활성화해야 한다', async () => {
      const { useCartStore } = await import('@/stores/cart-store');
      vi.mocked(useCartStore).mockReturnValue({
        items: [],
        total: 0,
        isLoading: false,
        error: null,
        fetchCart: vi.fn(),
        clearCart: vi.fn(),
        addItem: vi.fn(),
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
      });

      const CheckoutPage = (await import('@/app/(shop)/checkout/page')).default;
      render(<CheckoutPage />);

      const submitButton = await screen.findByRole('button', { name: /결제하기/i });

      expect(submitButton).toBeDisabled();
    });

    it('주문 생성 실패 시 에러 메시지를 표시해야 한다', async () => {
      const CheckoutPage = (await import('@/app/(shop)/checkout/page')).default;

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            code: 'DATABASE_ERROR',
            message: '주문 생성에 실패했습니다',
          },
        }),
      });

      render(<CheckoutPage />);

      const emailInput = await screen.findByPlaceholderText(/이메일/i);
      const submitButton = screen.getByRole('button', { name: /결제하기/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/주문 생성에 실패했습니다/i)).toBeInTheDocument();
      });
    });
  });

  describe('Neo-Brutalism 스타일', () => {
    it('주요 컴포넌트에 Neo-Brutalism 클래스가 적용되어야 한다', async () => {
      const CheckoutPage = (await import('@/app/(shop)/checkout/page')).default;
      const { container } = render(<CheckoutPage />);

      await waitFor(() => {
        const buttons = container.querySelectorAll('button');
        const hasNeoBrutalismButton = Array.from(buttons).some((button) => {
          const className = button.className;
          return className.includes('border-4') || className.includes('shadow-');
        });

        expect(hasNeoBrutalismButton).toBe(true);
      });
    });
  });
});
