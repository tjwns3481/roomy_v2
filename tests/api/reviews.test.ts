/**
 * Review API 테스트
 *
 * 테스트 범위:
 * - GET /api/reviews - 후기 목록 조회 (정렬: 최신/좋아요순/별점순)
 * - POST /api/reviews - 후기 작성 (구매 검증, 이미지 업로드)
 * - GET /api/reviews/[id] - 후기 상세 조회
 * - PATCH /api/reviews/[id] - 후기 수정 (본인만)
 * - DELETE /api/reviews/[id] - 후기 삭제 (본인/관리자)
 * - GET /api/products/[slug]/reviews - 상품별 후기 목록
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/reviews/route';
import { GET as getReview, PATCH, DELETE } from '@/app/api/reviews/[id]/route';
import { GET as getProductReviews } from '@/app/api/products/[slug]/reviews/route';

// Supabase Mock
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
  storage: {
    from: vi.fn(),
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Next.js cookies Mock
vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(() => ({ value: 'session-123' })),
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
  url?: string;
}) {
  const headers = new Headers(options.headers || {});

  return new Request(options.url || 'http://localhost:3000/api/reviews', {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

describe('GET /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('후기 목록 조회 성공 (최신순)', async () => {
    const mockReviews = [
      {
        id: 'review-1',
        product_id: 'prod-1',
        user_id: 'user-1',
        rating: 5,
        title: '정말 좋아요!',
        content: '품질이 훌륭합니다.',
        images: ['https://example.com/img1.jpg'],
        like_count: 10,
        view_count: 100,
        is_best: true,
        created_at: '2026-01-25T00:00:00Z',
        profiles: {
          nickname: '테스터',
          avatar_url: 'https://example.com/avatar.jpg',
        },
        products: {
          name: '테스트 상품',
          slug: 'test-product',
        },
      },
    ];

    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({
          range: vi.fn().mockResolvedValueOnce({
            data: mockReviews,
            error: null,
            count: 1,
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/reviews?sort=latest&page=1&limit=12',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reviews).toHaveLength(1);
    expect(data.reviews[0].title).toBe('정말 좋아요!');
    expect(data.pagination).toBeDefined();
  });

  it('좋아요순 정렬', async () => {
    const mockReviews = [
      {
        id: 'review-1',
        rating: 5,
        title: '인기 후기',
        like_count: 100,
      },
      {
        id: 'review-2',
        rating: 4,
        title: '일반 후기',
        like_count: 10,
      },
    ];

    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({
          range: vi.fn().mockResolvedValueOnce({
            data: mockReviews,
            error: null,
            count: 2,
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/reviews?sort=likes',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reviews[0].like_count).toBe(100);
  });

  it('별점 필터링', async () => {
    const mockReviews = [
      {
        id: 'review-1',
        rating: 5,
        title: '5점 후기',
      },
    ];

    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockReturnValueOnce({
            range: vi.fn().mockResolvedValueOnce({
              data: mockReviews,
              error: null,
              count: 1,
            }),
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/reviews?rating=5',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reviews[0].rating).toBe(5);
  });
});

describe('POST /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('후기 작성 성공 (구매 검증 통과)', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    const mockOrderItem = {
      id: 'order-item-1',
      product_id: 'prod-1',
      order_id: 'order-1',
      orders: {
        id: 'order-1',
        user_id: 'user-1',
        status: 'paid',
      },
    };

    const mockReview = {
      id: 'review-new',
      product_id: 'prod-1',
      user_id: mockUser.id,
      order_item_id: mockOrderItem.id,
      rating: 5,
      title: '정말 좋아요',
      content: '품질이 훌륭합니다',
      images: [],
    };

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    // 구매 검증 (order_item 확인)
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            in: vi.fn().mockReturnValueOnce({
              single: vi.fn().mockResolvedValueOnce({
                data: mockOrderItem,
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as any);

    // 이미 작성한 후기 확인
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

    // 후기 작성
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      insert: vi.fn().mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: mockReview,
            error: null,
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'POST',
      body: {
        product_id: 'prod-1',
        order_item_id: mockOrderItem.id,
        rating: 5,
        title: '정말 좋아요',
        content: '품질이 훌륭합니다',
        images: [],
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.id).toBe('review-new');
  });

  it('이미지 포함 후기 작성 (최대 5장)', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    const images = [
      'https://example.com/img1.jpg',
      'https://example.com/img2.jpg',
      'https://example.com/img3.jpg',
    ];

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    // 구매 검증
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            in: vi.fn().mockReturnValueOnce({
              single: vi.fn().mockResolvedValueOnce({
                data: {
                  id: 'order-item-1',
                  product_id: 'prod-1',
                  orders: {
                    id: 'order-1',
                    user_id: 'user-1',
                    status: 'paid',
                  },
                },
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as any);

    // 중복 확인
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

    // 후기 작성
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      insert: vi.fn().mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: { id: 'review-with-images', images },
            error: null,
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'POST',
      body: {
        product_id: 'prod-1',
        order_item_id: 'order-item-1',
        rating: 5,
        title: '사진 후기',
        content: '사진과 함께 후기 남깁니다',
        images,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.images).toHaveLength(3);
  });

  it('구매하지 않은 상품 - 403 에러', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    // 구매 검증 실패
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            in: vi.fn().mockReturnValueOnce({
              single: vi.fn().mockResolvedValueOnce({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'POST',
      body: {
        product_id: 'prod-1',
        order_item_id: 'invalid-order-item',
        rating: 5,
        title: '후기',
        content: '내용',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error.code).toBe('PURCHASE_VERIFICATION_FAILED');
  });

  it('이미 작성한 후기 - 400 에러', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    // 구매 검증 통과
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            in: vi.fn().mockReturnValueOnce({
              single: vi.fn().mockResolvedValueOnce({
                data: {
                  id: 'order-item-1',
                  product_id: 'prod-1',
                  orders: {
                    id: 'order-1',
                    user_id: 'user-1',
                    status: 'paid',
                  },
                },
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as any);

    // 이미 작성한 후기 존재
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          maybeSingle: vi.fn().mockResolvedValueOnce({
            data: { id: 'existing-review' },
            error: null,
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'POST',
      body: {
        product_id: 'prod-1',
        order_item_id: 'order-item-1',
        rating: 5,
        title: '후기',
        content: '내용',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('REVIEW_ALREADY_EXISTS');
  });

  it('이미지 6장 이상 - 400 에러', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    const images = Array(6).fill('https://example.com/img.jpg');

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    const request = createMockRequest({
      method: 'POST',
      body: {
        product_id: 'prod-1',
        order_item_id: 'order-item-1',
        rating: 5,
        title: '후기',
        content: '내용',
        images,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('이미지는 최대 5장');
  });

  it('로그인하지 않음 - 401 에러', async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    } as any);

    const request = createMockRequest({
      method: 'POST',
      body: {
        product_id: 'prod-1',
        order_item_id: 'order-item-1',
        rating: 5,
        title: '후기',
        content: '내용',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('잘못된 별점 (1-5 범위 외) - 400 에러', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    const request = createMockRequest({
      method: 'POST',
      body: {
        product_id: 'prod-1',
        order_item_id: 'order-item-1',
        rating: 6, // 잘못된 별점
        title: '후기',
        content: '내용',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PATCH /api/reviews/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('본인 후기 수정 성공', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    const reviewId = 'review-1';

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    // 후기 조회
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: {
              id: reviewId,
              user_id: mockUser.id,
              rating: 5,
              title: '원래 제목',
            },
            error: null,
          }),
        }),
      }),
    } as any);

    // 후기 수정
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      update: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: {
                id: reviewId,
                user_id: mockUser.id,
                rating: 4,
                title: '수정된 제목',
                content: '수정된 내용',
              },
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'PATCH',
      body: {
        rating: 4,
        title: '수정된 제목',
        content: '수정된 내용',
      },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: reviewId }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.title).toBe('수정된 제목');
  });

  it('다른 사람 후기 수정 - 403 에러', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    const reviewId = 'review-2';

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    // 다른 사람의 후기
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: {
              id: reviewId,
              user_id: 'other-user',
            },
            error: null,
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'PATCH',
      body: { title: '수정 시도' },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: reviewId }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error.code).toBe('FORBIDDEN');
  });
});

describe('DELETE /api/reviews/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('본인 후기 삭제 성공', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    const reviewId = 'review-1';

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    } as any);

    // 후기 조회
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: { id: reviewId, user_id: mockUser.id },
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
    const response = await DELETE(request, { params: Promise.resolve({ id: reviewId }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('후기가 삭제되었습니다.');
  });

  it('관리자 - 모든 후기 삭제 가능', async () => {
    const mockAdmin = { id: 'admin-1', email: 'admin@example.com' };
    const reviewId = 'review-2';

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValueOnce({
      data: { user: mockAdmin },
      error: null,
    } as any);

    // 관리자 확인
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: { id: mockAdmin.id, role: 'admin' },
            error: null,
          }),
        }),
      }),
    } as any);

    // 후기 조회
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: { id: reviewId, user_id: 'other-user' },
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
    const response = await DELETE(request, { params: Promise.resolve({ id: reviewId }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('후기가 삭제되었습니다.');
  });
});

describe('GET /api/products/[slug]/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('상품별 후기 목록 조회', async () => {
    const productSlug = 'test-product';
    const mockProduct = { id: 'prod-1', name: '테스트 상품' };
    const mockReviews = [
      {
        id: 'review-1',
        rating: 5,
        title: '좋아요',
        like_count: 10,
        created_at: '2026-01-25T00:00:00Z',
      },
      {
        id: 'review-2',
        rating: 4,
        title: '괜찮아요',
        like_count: 5,
        created_at: '2026-01-24T00:00:00Z',
      },
    ];

    // 상품 조회
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

    // 후기 목록
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockReturnValueOnce({
            range: vi.fn().mockResolvedValueOnce({
              data: mockReviews,
              error: null,
              count: 2,
            }),
          }),
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'GET',
      url: `http://localhost:3000/api/products/${productSlug}/reviews`,
    });

    const response = await getProductReviews(request, {
      params: Promise.resolve({ slug: productSlug }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reviews).toHaveLength(2);
    expect(data.product.id).toBe('prod-1');
  });

  it('평균 별점 및 별점 분포 포함', async () => {
    const productSlug = 'test-product';

    // 상품 조회
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: { id: 'prod-1' },
            error: null,
          }),
        }),
      }),
    } as any);

    // 후기 목록
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockReturnValueOnce({
            range: vi.fn().mockResolvedValueOnce({
              data: [],
              error: null,
              count: 0,
            }),
          }),
        }),
      }),
    } as any);

    // 평균 별점 (함수 호출)
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce({
        data: [{ avg_rating: 4.5 }],
        error: null,
      }),
    } as any);

    // 별점 분포
    vi.mocked(mockSupabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockResolvedValueOnce({
          data: [
            { rating: 5, count: 10 },
            { rating: 4, count: 5 },
          ],
          error: null,
        }),
      }),
    } as any);

    const request = createMockRequest({
      method: 'GET',
      url: `http://localhost:3000/api/products/${productSlug}/reviews`,
    });

    const response = await getProductReviews(request, {
      params: Promise.resolve({ slug: productSlug }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.stats).toBeDefined();
    expect(data.stats.average_rating).toBe(4.5);
    expect(data.stats.rating_distribution).toHaveLength(2);
  });
});
