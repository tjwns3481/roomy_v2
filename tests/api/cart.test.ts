/**
 * Cart API 테스트
 *
 * 테스트 범위:
 * - GET /api/cart - 장바구니 조회 (회원/비회원)
 * - POST /api/cart - 상품 추가
 * - PATCH /api/cart/[id] - 수량 변경
 * - DELETE /api/cart/[id] - 상품 제거
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/cart/route';
import { PATCH, DELETE } from '@/app/api/cart/[id]/route';

// Supabase Mock - 전역 mock 객체
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Next.js cookies Mock
vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn((name: string) => ({ value: 'session-123' })),
      set: vi.fn(),
      getAll: vi.fn(() => []),
    })
  ),
}));

// Next.js Request Mock
function createMockRequest(options: {
  method: string;
  body?: unknown;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}) {
  const headers = new Headers(options.headers || {});

  if (options.cookies) {
    const cookieString = Object.entries(options.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    headers.set('cookie', cookieString);
  }

  return new Request('http://localhost:3000', {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

describe('GET /api/cart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('회원 - 장바구니 조회 성공', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockCartItems = [
      {
        id: 'cart-1',
        product_id: 'prod-1',
        quantity: 2,
        products: {
          name: '테스트 상품',
          price: 10000,
          discount_price: null,
          thumbnail_url: 'https://example.com/thumb.jpg',
        },
      },
    ];

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({
          data: mockCartItems,
          error: null,
        }),
      }),
    } as any);

    const request = createMockRequest({ method: 'GET' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].product.name).toBe('테스트 상품');
    expect(data.total).toBe(20000); // 10000 * 2
  });

  it('비회원 - 세션 ID로 장바구니 조회', async () => {
    const sessionId = 'session-123';
    const mockCartItems = [
      {
        id: 'cart-2',
        product_id: 'prod-2',
        quantity: 1,
        products: {
          name: '비회원 상품',
          price: 5000,
          discount_price: 4500,
          thumbnail_url: 'https://example.com/thumb2.jpg',
        },
      },
    ];

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    } as any);

    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({
          data: mockCartItems,
          error: null,
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'GET',
      cookies: { cart_session: sessionId },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(1);
    expect(data.total).toBe(4500); // 할인가 적용
  });

  it('빈 장바구니 조회', async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    } as any);

    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({
          data: [],
          error: null,
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'GET',
      cookies: { cart_session: 'new-session' },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(0);
    expect(data.total).toBe(0);
  });
});

describe('POST /api/cart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('회원 - 상품 추가 성공', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockProduct = {
      id: 'prod-1',
      name: '테스트 상품',
      price: 10000,
      status: 'active',
    };
    const mockCartItem = {
      id: 'cart-new',
      user_id: mockUser.id,
      product_id: mockProduct.id,
      quantity: 1,
    };

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    // 상품 존재 확인
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: mockProduct,
            error: null,
          }),
        }),
      }),
    } as any);

    // 기존 장바구니 확인
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            maybeSingle: vi.fn().mockResolvedValueOnce({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    // 장바구니에 추가
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      insert: vi.fn().mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: mockCartItem,
            error: null,
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'POST',
      body: { product_id: mockProduct.id, quantity: 1 },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.id).toBe('cart-new');
  });

  it('비회원 - 세션 ID 자동 생성 후 상품 추가', async () => {
    const mockProduct = {
      id: 'prod-2',
      name: '비회원 상품',
      price: 5000,
      status: 'active',
    };

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    } as any);

    // 상품 존재 확인
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: mockProduct,
            error: null,
          }),
        }),
      }),
    } as any);

    // 기존 장바구니 확인
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          maybeSingle: vi.fn().mockResolvedValueOnce({
            data: null,
            error: null,
          }),
        }),
      }),
    } as any);

    // 장바구니에 추가
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      insert: vi.fn().mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: { id: 'cart-guest', session_id: expect.any(String) },
            error: null,
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'POST',
      body: { product_id: mockProduct.id, quantity: 1 },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.id).toBe('cart-guest');
    expect(response.headers.get('set-cookie')).toContain('cart_session=');
  });

  it('이미 있는 상품 - 수량 증가', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockProduct = {
      id: 'prod-1',
      name: '테스트 상품',
      price: 10000,
      status: 'active',
    };
    const existingCartItem = {
      id: 'cart-existing',
      user_id: mockUser.id,
      product_id: mockProduct.id,
      quantity: 2,
    };

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    // 상품 존재 확인
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: mockProduct,
            error: null,
          }),
        }),
      }),
    } as any);

    // 기존 장바구니 확인
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            maybeSingle: vi.fn().mockResolvedValueOnce({
              data: existingCartItem,
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    // 수량 업데이트
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      update: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: { ...existingCartItem, quantity: 4 },
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'POST',
      body: { product_id: mockProduct.id, quantity: 2 },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.quantity).toBe(4);
  });

  it('존재하지 않는 상품 - 400 에러', async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    } as any);

    // 상품 존재 확인 - 없음
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: null,
            error: { message: 'Product not found' },
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'POST',
      body: { product_id: 'invalid-id', quantity: 1 },
      cookies: { cart_session: 'session-123' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('잘못된 요청 바디 - 400 에러', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { quantity: -1 }, // product_id 누락, 잘못된 quantity
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PATCH /api/cart/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('수량 변경 성공', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const cartItemId = 'cart-1';

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    // 장바구니 아이템 확인
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: { id: cartItemId, user_id: mockUser.id, quantity: 2 },
            error: null,
          }),
        }),
      }),
    } as any);

    // 수량 업데이트
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      update: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: { id: cartItemId, user_id: mockUser.id, quantity: 5 },
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'PATCH',
      body: { quantity: 5 },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: cartItemId }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.quantity).toBe(5);
  });

  it('존재하지 않는 장바구니 아이템 - 404 에러', async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    } as any);

    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'PATCH',
      body: { quantity: 3 },
      cookies: { cart_session: 'session-123' },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'invalid-id' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('CART_ITEM_NOT_FOUND');
  });
});

describe('DELETE /api/cart/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('장바구니 아이템 삭제 성공', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const cartItemId = 'cart-1';

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    // 장바구니 아이템 확인
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: { id: cartItemId, user_id: mockUser.id },
            error: null,
          }),
        }),
      }),
    } as any);

    // 삭제
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      delete: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({
          error: null,
        }),
      }),
    } as any);

    const request = createMockRequest({ method: 'DELETE' });
    const response = await DELETE(request, { params: Promise.resolve({ id: cartItemId }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('장바구니 아이템이 삭제되었습니다.');
  });

  it('비회원 - 세션 ID로 삭제', async () => {
    const sessionId = 'session-123';
    const cartItemId = 'cart-guest';

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    } as any);

    // 장바구니 아이템 확인
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: { id: cartItemId, session_id: sessionId },
            error: null,
          }),
        }),
      }),
    } as any);

    // 삭제
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      delete: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({
          error: null,
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'DELETE',
      cookies: { cart_session: sessionId },
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: cartItemId }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('장바구니 아이템이 삭제되었습니다.');
  });
});
