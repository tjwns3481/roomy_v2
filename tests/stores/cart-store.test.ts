/**
 * Cart Store 테스트
 *
 * TDD: RED → GREEN → REFACTOR
 * - 장바구니 상태 관리
 * - CRUD 액션
 * - 낙관적 업데이트
 * - 에러 롤백
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCartStore } from '@/stores/cart-store';

// ============================================================================
// Setup & Teardown
// ============================================================================

beforeEach(() => {
  // 각 테스트 전에 스토어 초기화
  const { result } = renderHook(() => useCartStore());
  act(() => {
    result.current.clearCart();
  });

  // fetch mock 초기화
  vi.clearAllMocks();
});

// ============================================================================
// Mock Data
// ============================================================================

const mockCartItem = {
  id: 'cart-item-1',
  product_id: 'product-1',
  quantity: 2,
  product: {
    name: '테스트 상품',
    price: 10000,
    discount_price: 9000,
    thumbnail_url: 'https://example.com/image.jpg',
  },
};

const mockCartResponse = {
  items: [mockCartItem],
  total: 18000,
};

// ============================================================================
// Tests: 초기 상태
// ============================================================================

describe('Cart Store - 초기 상태', () => {
  it('초기 상태가 올바르게 설정되어야 한다', () => {
    const { result } = renderHook(() => useCartStore());

    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.total).toBe(0);
  });
});

// ============================================================================
// Tests: fetchCart (장바구니 조회)
// ============================================================================

describe('Cart Store - fetchCart', () => {
  it('장바구니를 성공적으로 조회해야 한다', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCartResponse),
      } as Response)
    );

    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.fetchCart();
    });

    expect(result.current.items).toEqual(mockCartResponse.items);
    expect(result.current.total).toBe(mockCartResponse.total);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('장바구니 조회 중 isLoading이 true여야 한다', async () => {
    global.fetch = vi.fn(
      (): Promise<Response> =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve(mockCartResponse),
            } as Response);
          }, 100);
        })
    ) as any;

    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.fetchCart();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('장바구니 조회 실패 시 에러를 설정해야 한다', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: {
              code: 'FETCH_ERROR',
              message: '장바구니 조회에 실패했습니다.',
            },
          }),
      } as Response)
    );

    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.fetchCart();
    });

    expect(result.current.error).toBe('장바구니 조회에 실패했습니다.');
    expect(result.current.items).toEqual([]);
  });
});

// ============================================================================
// Tests: addItem (장바구니에 추가)
// ============================================================================

describe('Cart Store - addItem', () => {
  it('낙관적 업데이트: 즉시 UI에 반영되어야 한다', async () => {
    global.fetch = vi.fn(
      (): Promise<Response> =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  data: mockCartItem,
                  message: '장바구니에 추가되었습니다.',
                }),
            } as Response);
          }, 100);
        })
    ) as any;

    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem('product-1', 2);
    });

    // 즉시 반영 확인 (낙관적 업데이트)
    expect(result.current.items.length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('API 성공 시 최종 데이터로 업데이트되어야 한다', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: mockCartItem,
            message: '장바구니에 추가되었습니다.',
          }),
      } as Response)
    );

    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.addItem('product-1', 2);
    });

    // fetchCart를 호출하여 최신 데이터 가져오기
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCartResponse),
      } as Response)
    );

    await act(async () => {
      await result.current.fetchCart();
    });

    expect(result.current.items).toEqual(mockCartResponse.items);
    expect(result.current.total).toBe(mockCartResponse.total);
  });

  it('API 실패 시 롤백되어야 한다', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: {
              code: 'INSERT_ERROR',
              message: '장바구니에 추가하지 못했습니다.',
            },
          }),
      } as Response)
    );

    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.addItem('product-1', 2);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBe('장바구니에 추가하지 못했습니다.');
  });
});

// ============================================================================
// Tests: updateQuantity (수량 변경)
// ============================================================================

describe('Cart Store - updateQuantity', () => {
  it('낙관적 업데이트: 즉시 UI에 반영되어야 한다', async () => {
    // 초기 장바구니 조회
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCartResponse),
      } as Response)
    );

    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.fetchCart();
    });

    // 수량 변경 API mock
    global.fetch = vi.fn(
      (): Promise<Response> =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  data: { ...mockCartItem, quantity: 5 },
                  message: '수량이 변경되었습니다.',
                }),
            } as Response);
          }, 100);
        })
    ) as any;

    act(() => {
      result.current.updateQuantity('cart-item-1', 5);
    });

    // 즉시 반영 확인 (낙관적 업데이트)
    const item = result.current.items.find((i) => i.id === 'cart-item-1');
    expect(item?.quantity).toBe(5);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('API 실패 시 이전 수량으로 롤백되어야 한다', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCartResponse),
      } as Response)
    );

    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.fetchCart();
    });

    const originalQuantity = result.current.items[0].quantity;

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: {
              code: 'UPDATE_ERROR',
              message: '수량 변경에 실패했습니다.',
            },
          }),
      } as Response)
    );

    await act(async () => {
      await result.current.updateQuantity('cart-item-1', 10);
    });

    const item = result.current.items.find((i) => i.id === 'cart-item-1');
    expect(item?.quantity).toBe(originalQuantity);
    expect(result.current.error).toBe('수량 변경에 실패했습니다.');
  });
});

// ============================================================================
// Tests: removeItem (장바구니에서 삭제)
// ============================================================================

describe('Cart Store - removeItem', () => {
  it('낙관적 업데이트: 즉시 UI에서 제거되어야 한다', async () => {
    // 초기 장바구니 조회
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCartResponse),
      } as Response)
    );

    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.fetchCart();
    });

    // 삭제 API mock
    global.fetch = vi.fn(
      (): Promise<Response> =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  message: '장바구니 아이템이 삭제되었습니다.',
                }),
            } as Response);
          }, 100);
        })
    ) as any;

    act(() => {
      result.current.removeItem('cart-item-1');
    });

    // 즉시 제거 확인 (낙관적 업데이트)
    expect(result.current.items.find((i) => i.id === 'cart-item-1')).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('API 실패 시 롤백되어야 한다', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCartResponse),
      } as Response)
    );

    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.fetchCart();
    });

    const originalItems = [...result.current.items];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: {
              code: 'DELETE_ERROR',
              message: '장바구니 아이템 삭제에 실패했습니다.',
            },
          }),
      } as Response)
    );

    await act(async () => {
      await result.current.removeItem('cart-item-1');
    });

    expect(result.current.items).toEqual(originalItems);
    expect(result.current.error).toBe('장바구니 아이템 삭제에 실패했습니다.');
  });
});

// ============================================================================
// Tests: clearCart (장바구니 비우기)
// ============================================================================

describe('Cart Store - clearCart', () => {
  it('장바구니를 비워야 한다', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.error).toBe(null);
  });
});

// ============================================================================
// Tests: total (총액 계산)
// ============================================================================

describe('Cart Store - total 계산', () => {
  it('할인가가 있으면 할인가로 계산되어야 한다', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCartResponse),
      } as Response)
    );

    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.fetchCart();
    });

    // mockCartItem: quantity=2, discount_price=9000
    // total = 2 * 9000 = 18000
    expect(result.current.total).toBe(18000);
  });

  it('할인가가 없으면 정가로 계산되어야 한다', async () => {
    const responseWithoutDiscount = {
      items: [
        {
          ...mockCartItem,
          product: {
            ...mockCartItem.product,
            discount_price: null,
          },
        },
      ],
      total: 20000,
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responseWithoutDiscount),
      } as Response)
    );

    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      await result.current.fetchCart();
    });

    // mockCartItem: quantity=2, price=10000
    // total = 2 * 10000 = 20000
    expect(result.current.total).toBe(20000);
  });
});
