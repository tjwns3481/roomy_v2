/**
 * useCart Hook 테스트
 *
 * TDD: RED → GREEN → REFACTOR
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as any).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('기본값으로 초기화되어야 함', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.items).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('addItem', () => {
    it('상품을 장바구니에 추가하고 성공 메시지를 표시해야 함', async () => {
      // Mock API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: 'item-1', product_id: 'product-1', quantity: 1 },
          message: '장바구니에 추가되었습니다.',
        }),
      });

      // Mock cart fetch response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'item-1',
              product_id: 'product-1',
              quantity: 1,
              product: {
                name: '테스트 상품',
                price: 10000,
                discount_price: null,
                thumbnail_url: 'https://example.com/image.jpg',
              },
            },
          ],
          total: 10000,
        }),
      });

      const { result } = renderHook(() => useCart());

      await result.current.addItem('product-1', 1);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('장바구니에 추가되었습니다');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.total).toBe(10000);
      expect(result.current.itemCount).toBe(1);
    });

    it('수량을 지정하지 않으면 기본값 1로 추가해야 함', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: 'item-1', product_id: 'product-1', quantity: 1 },
        }),
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'item-1',
              product_id: 'product-1',
              quantity: 1,
              product: {
                name: '테스트 상품',
                price: 10000,
                discount_price: null,
                thumbnail_url: 'https://example.com/image.jpg',
              },
            },
          ],
          total: 10000,
        }),
      });

      const { result } = renderHook(() => useCart());

      await result.current.addItem('product-1');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/cart',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ product_id: 'product-1', quantity: 1 }),
        })
      );
    });

    it('API 에러 시 에러 메시지를 표시해야 함', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: '상품을 찾을 수 없습니다.',
          },
        }),
      });

      const { result } = renderHook(() => useCart());

      await result.current.addItem('invalid-product-id');

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('상품을 찾을 수 없습니다.');
      });

      expect(result.current.error).toBe('상품을 찾을 수 없습니다.');
    });

    it('네트워크 에러 시 에러 메시지를 표시해야 함', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useCart());

      await result.current.addItem('product-1');

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('장바구니에 추가하지 못했습니다.');
      });

      expect(result.current.error).toBe('장바구니에 추가하지 못했습니다.');
    });
  });

  describe('updateQuantity', () => {
    it('장바구니 아이템 수량을 업데이트해야 함', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: 'item-1', product_id: 'product-1', quantity: 3 },
        }),
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'item-1',
              product_id: 'product-1',
              quantity: 3,
              product: {
                name: '테스트 상품',
                price: 10000,
                discount_price: null,
                thumbnail_url: 'https://example.com/image.jpg',
              },
            },
          ],
          total: 30000,
        }),
      });

      const { result } = renderHook(() => useCart());

      await result.current.updateQuantity('item-1', 3);

      await waitFor(() => {
        expect(result.current.items[0]?.quantity).toBe(3);
        expect(result.current.total).toBe(30000);
      });
    });

    it('API 에러 시 에러 메시지를 표시해야 함', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            code: 'NOT_FOUND',
            message: '장바구니 아이템을 찾을 수 없습니다.',
          },
        }),
      });

      const { result } = renderHook(() => useCart());

      await result.current.updateQuantity('invalid-item-id', 2);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('장바구니 아이템을 찾을 수 없습니다.');
      });
    });
  });

  describe('removeItem', () => {
    it('장바구니에서 아이템을 제거하고 성공 메시지를 표시해야 함', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: '장바구니에서 제거되었습니다.',
        }),
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [],
          total: 0,
        }),
      });

      const { result } = renderHook(() => useCart());

      await result.current.removeItem('item-1');

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('장바구니에서 제거되었습니다');
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.total).toBe(0);
    });

    it('API 에러 시 에러 메시지를 표시해야 함', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            code: 'NOT_FOUND',
            message: '장바구니 아이템을 찾을 수 없습니다.',
          },
        }),
      });

      const { result } = renderHook(() => useCart());

      await result.current.removeItem('invalid-item-id');

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('장바구니 아이템을 찾을 수 없습니다.');
      });
    });
  });

  describe('clearCart', () => {
    it('장바구니를 비워야 함', async () => {
      const { result } = renderHook(() => useCart());

      await result.current.clearCart();

      expect(result.current.items).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.itemCount).toBe(0);
    });
  });
});
