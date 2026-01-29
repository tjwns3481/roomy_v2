/**
 * Cart Page Test
 *
 * 장바구니 페이지 테스트
 * - 빈 장바구니 안내
 * - 장바구니 아이템 목록
 * - 수량 변경
 * - 삭제
 * - 총액 계산
 * - 결제하기 버튼
 */

import { render, screen, waitFor } from '@testing-library/react';
import { useCart } from '@/hooks/use-cart';
import CartPage from '@/app/(shop)/cart/page';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock useCart
vi.mock('@/hooks/use-cart');
const mockUseCart = useCart as ReturnType<typeof vi.fn>;

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('빈 장바구니', () => {
    it('빈 장바구니일 때 안내 메시지를 표시한다', () => {
      mockUseCart.mockReturnValue({
        items: [],
        total: 0,
        itemCount: 0,
        isLoading: false,
        error: null,
        addItem: vi.fn(),
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
      });

      render(<CartPage />);

      expect(screen.getByText(/장바구니가 비어있습니다/i)).toBeInTheDocument();
      expect(screen.getByText(/쇼핑 계속하기/i)).toBeInTheDocument();
    });
  });

  describe('장바구니 아이템 목록', () => {
    const mockItems = [
      {
        id: 'cart-1',
        product_id: 'prod-1',
        quantity: 2,
        product: {
          name: 'Next.js 대시보드 템플릿',
          price: 29900,
          discount_price: 19900,
          thumbnail_url: 'https://example.com/thumb1.jpg',
        },
      },
      {
        id: 'cart-2',
        product_id: 'prod-2',
        quantity: 1,
        product: {
          name: 'React 컴포넌트 라이브러리',
          price: 15000,
          discount_price: null,
          thumbnail_url: null,
        },
      },
    ];

    it('장바구니 아이템들을 표시한다', () => {
      mockUseCart.mockReturnValue({
        items: mockItems,
        total: 54800, // 19900 * 2 + 15000
        itemCount: 3,
        isLoading: false,
        error: null,
        addItem: vi.fn(),
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
      });

      render(<CartPage />);

      expect(screen.getByText('Next.js 대시보드 템플릿')).toBeInTheDocument();
      expect(screen.getByText('React 컴포넌트 라이브러리')).toBeInTheDocument();
    });

    it('할인가가 있으면 할인가를 표시한다', () => {
      mockUseCart.mockReturnValue({
        items: [mockItems[0]],
        total: 39800,
        itemCount: 2,
        isLoading: false,
        error: null,
        addItem: vi.fn(),
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
      });

      render(<CartPage />);

      // 할인가 표시
      expect(screen.getByText(/19,900/)).toBeInTheDocument();
      // 정가는 줄 그어서 표시
      expect(screen.getByText(/29,900/)).toBeInTheDocument();
    });

    it('할인가가 없으면 정가를 표시한다', () => {
      mockUseCart.mockReturnValue({
        items: [mockItems[1]],
        total: 15000,
        itemCount: 1,
        isLoading: false,
        error: null,
        addItem: vi.fn(),
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
      });

      render(<CartPage />);

      // 정가가 표시되는지 확인 (여러 곳에 나타나므로 getAllByText 사용)
      const prices = screen.getAllByText(/15,000/);
      expect(prices.length).toBeGreaterThan(0);
    });
  });

  describe('수량 변경', () => {
    it('+ 버튼 클릭 시 수량을 증가한다', async () => {
      const user = userEvent.setup();
      const mockUpdateQuantity = vi.fn();

      mockUseCart.mockReturnValue({
        items: [
          {
            id: 'cart-1',
            product_id: 'prod-1',
            quantity: 1,
            product: {
              name: '테스트 상품',
              price: 10000,
              discount_price: null,
              thumbnail_url: null,
            },
          },
        ],
        total: 10000,
        itemCount: 1,
        isLoading: false,
        error: null,
        addItem: vi.fn(),
        updateQuantity: mockUpdateQuantity,
        removeItem: vi.fn(),
        clearCart: vi.fn(),
      });

      render(<CartPage />);

      const plusButton = screen.getByLabelText('수량 증가');
      await user.click(plusButton);

      expect(mockUpdateQuantity).toHaveBeenCalledWith('cart-1', 2);
    });

    it('- 버튼 클릭 시 수량을 감소한다', async () => {
      const user = userEvent.setup();
      const mockUpdateQuantity = vi.fn();

      mockUseCart.mockReturnValue({
        items: [
          {
            id: 'cart-1',
            product_id: 'prod-1',
            quantity: 2,
            product: {
              name: '테스트 상품',
              price: 10000,
              discount_price: null,
              thumbnail_url: null,
            },
          },
        ],
        total: 20000,
        itemCount: 2,
        isLoading: false,
        error: null,
        addItem: vi.fn(),
        updateQuantity: mockUpdateQuantity,
        removeItem: vi.fn(),
        clearCart: vi.fn(),
      });

      render(<CartPage />);

      const minusButton = screen.getByLabelText('수량 감소');
      await user.click(minusButton);

      expect(mockUpdateQuantity).toHaveBeenCalledWith('cart-1', 1);
    });

    it('수량이 1일 때 - 버튼은 비활성화된다', () => {
      mockUseCart.mockReturnValue({
        items: [
          {
            id: 'cart-1',
            product_id: 'prod-1',
            quantity: 1,
            product: {
              name: '테스트 상품',
              price: 10000,
              discount_price: null,
              thumbnail_url: null,
            },
          },
        ],
        total: 10000,
        itemCount: 1,
        isLoading: false,
        error: null,
        addItem: vi.fn(),
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
      });

      render(<CartPage />);

      const minusButton = screen.getByLabelText('수량 감소');
      expect(minusButton).toBeDisabled();
    });
  });

  describe('삭제', () => {
    it('삭제 버튼 클릭 시 removeItem을 호출한다', async () => {
      const user = userEvent.setup();
      const mockRemoveItem = vi.fn();

      mockUseCart.mockReturnValue({
        items: [
          {
            id: 'cart-1',
            product_id: 'prod-1',
            quantity: 1,
            product: {
              name: '테스트 상품',
              price: 10000,
              discount_price: null,
              thumbnail_url: null,
            },
          },
        ],
        total: 10000,
        itemCount: 1,
        isLoading: false,
        error: null,
        addItem: vi.fn(),
        updateQuantity: vi.fn(),
        removeItem: mockRemoveItem,
        clearCart: vi.fn(),
      });

      render(<CartPage />);

      const removeButton = screen.getByLabelText('삭제');
      await user.click(removeButton);

      expect(mockRemoveItem).toHaveBeenCalledWith('cart-1');
    });
  });

  describe('총액 계산', () => {
    it('총액을 표시한다', () => {
      mockUseCart.mockReturnValue({
        items: [
          {
            id: 'cart-1',
            product_id: 'prod-1',
            quantity: 2,
            product: {
              name: '상품 1',
              price: 10000,
              discount_price: 8000,
              thumbnail_url: null,
            },
          },
          {
            id: 'cart-2',
            product_id: 'prod-2',
            quantity: 1,
            product: {
              name: '상품 2',
              price: 15000,
              discount_price: null,
              thumbnail_url: null,
            },
          },
        ],
        total: 31000, // 8000 * 2 + 15000
        itemCount: 3,
        isLoading: false,
        error: null,
        addItem: vi.fn(),
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
      });

      render(<CartPage />);

      // 총액이 여러 곳에 표시되므로 getAllByText 사용
      const totalPrices = screen.getAllByText(/31,000/);
      expect(totalPrices.length).toBeGreaterThan(0);
    });
  });

  describe('결제하기 버튼', () => {
    it('장바구니에 상품이 있으면 결제하기 버튼을 표시한다', () => {
      mockUseCart.mockReturnValue({
        items: [
          {
            id: 'cart-1',
            product_id: 'prod-1',
            quantity: 1,
            product: {
              name: '테스트 상품',
              price: 10000,
              discount_price: null,
              thumbnail_url: null,
            },
          },
        ],
        total: 10000,
        itemCount: 1,
        isLoading: false,
        error: null,
        addItem: vi.fn(),
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
      });

      render(<CartPage />);

      expect(screen.getByRole('button', { name: /결제하기/i })).toBeInTheDocument();
    });

    it('장바구니가 비어있으면 결제하기 버튼을 표시하지 않는다', () => {
      mockUseCart.mockReturnValue({
        items: [],
        total: 0,
        itemCount: 0,
        isLoading: false,
        error: null,
        addItem: vi.fn(),
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
      });

      render(<CartPage />);

      expect(screen.queryByRole('button', { name: /결제하기/i })).not.toBeInTheDocument();
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중일 때 로딩 표시를 한다', () => {
      mockUseCart.mockReturnValue({
        items: [],
        total: 0,
        itemCount: 0,
        isLoading: true,
        error: null,
        addItem: vi.fn(),
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
      });

      render(<CartPage />);

      expect(screen.getByText(/로딩 중/i)).toBeInTheDocument();
    });
  });
});
