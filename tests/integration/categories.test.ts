/**
 * Categories API Integration Test
 *
 * P2-T2.0: 카테고리 API 엔드포인트 테스트
 * - TDD RED 단계: 테스트 먼저 작성
 * - GET /api/categories - 전체 카테고리 트리 (계층형)
 * - GET /api/categories/[slug] - 특정 카테고리의 상품 목록
 * - 비활성 카테고리 제외
 * - 각 카테고리별 상품 수 포함
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GET as categoriesGET } from '@/app/api/categories/route';
import { GET as categorySlugGET } from '@/app/api/categories/[slug]/route';

// Mock 데이터 설정
const mockCategories = [
  {
    id: 'cat-1',
    name: '디지털 상품',
    slug: 'digital',
    parent_id: null,
    is_active: true,
    sort_order: 1,
    description: '디지털 다운로드 상품',
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: '템플릿',
    slug: 'templates',
    parent_id: 'cat-1',
    is_active: true,
    sort_order: 1,
    description: 'Next.js 템플릿',
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: '이북',
    slug: 'ebooks',
    parent_id: 'cat-1',
    is_active: true,
    sort_order: 2,
    description: '전자책',
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    name: '비활성',
    slug: 'inactive',
    parent_id: null,
    is_active: false,
    sort_order: 99,
    description: '비활성 카테고리',
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockProducts = [
  {
    id: 'prod-1',
    category_id: 'cat-2',
    name: 'Next.js E-commerce Template',
    slug: 'nextjs-ecommerce',
    status: 'active',
  },
  {
    id: 'prod-2',
    category_id: 'cat-2',
    name: 'React Dashboard Template',
    slug: 'react-dashboard',
    status: 'active',
  },
  {
    id: 'prod-3',
    category_id: 'cat-3',
    name: 'TypeScript 완벽 가이드',
    slug: 'typescript-guide',
    status: 'active',
  },
];

const mockProductsWithImages = [
  {
    id: 'prod-1',
    category_id: 'cat-2',
    name: 'Next.js E-commerce Template',
    slug: 'nextjs-ecommerce',
    short_description: 'Full-featured e-commerce template',
    price: 99000,
    discount_price: null,
    type: 'digital',
    is_featured: true,
    view_count: 150,
    sales_count: 20,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: 'img-1',
        url: 'https://example.com/image1.jpg',
        alt_text: 'Template preview',
        is_primary: true,
      },
    ],
  },
  {
    id: 'prod-2',
    category_id: 'cat-2',
    name: 'React Dashboard Template',
    slug: 'react-dashboard',
    short_description: 'Admin dashboard template',
    price: 79000,
    discount_price: 59000,
    type: 'digital',
    is_featured: false,
    view_count: 100,
    sales_count: 15,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: 'img-2',
        url: 'https://example.com/image2.jpg',
        alt_text: 'Dashboard preview',
        is_primary: true,
      },
    ],
  },
];

// Supabase Mock
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

describe('GET /api/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return category tree with product counts', async () => {
    // First call: categories query
    const categoriesChain = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockCategories.filter((c) => c.is_active),
        error: null,
      }),
    };

    // Second call: products query
    const productsChain = {
      eq: vi.fn().mockResolvedValue({
        data: mockProducts,
        error: null,
      }),
    };

    mockSelect
      .mockReturnValueOnce(categoriesChain)
      .mockReturnValueOnce(productsChain);

    mockFrom.mockReturnValue({
      select: mockSelect,
    });

    const response = await categoriesGET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('categories');
    expect(Array.isArray(data.categories)).toBe(true);

    // 비활성 카테고리는 제외되어야 함
    const inactiveCategory = data.categories.find(
      (c: any) => c.slug === 'inactive'
    );
    expect(inactiveCategory).toBeUndefined();

    // 최상위 카테고리 찾기
    const digitalCategory = data.categories.find(
      (c: any) => c.slug === 'digital'
    );
    expect(digitalCategory).toBeDefined();
    expect(digitalCategory).toHaveProperty('children');
    expect(digitalCategory).toHaveProperty('product_count');

    // 하위 카테고리 확인
    expect(Array.isArray(digitalCategory.children)).toBe(true);
    expect(digitalCategory.children.length).toBeGreaterThan(0);

    // 템플릿 카테고리의 상품 수 확인 (2개)
    const templatesCategory = digitalCategory.children.find(
      (c: any) => c.slug === 'templates'
    );
    expect(templatesCategory).toBeDefined();
    expect(templatesCategory.product_count).toBe(2);

    // 이북 카테고리의 상품 수 확인 (1개)
    const ebooksCategory = digitalCategory.children.find(
      (c: any) => c.slug === 'ebooks'
    );
    expect(ebooksCategory).toBeDefined();
    expect(ebooksCategory.product_count).toBe(1);
  });

  it('should return only active categories', async () => {
    const categoriesChain = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockCategories.filter((c) => c.is_active),
        error: null,
      }),
    };

    const productsChain = {
      eq: vi.fn().mockResolvedValue({
        data: mockProducts,
        error: null,
      }),
    };

    mockSelect
      .mockReturnValueOnce(categoriesChain)
      .mockReturnValueOnce(productsChain);

    mockFrom.mockReturnValue({
      select: mockSelect,
    });

    const response = await categoriesGET();
    const data = await response.json();

    expect(response.status).toBe(200);

    // 비활성 카테고리가 없어야 함
    const allCategories = flattenCategories(data.categories);
    const hasInactive = allCategories.some((c: any) => !c.is_active);
    expect(hasInactive).toBe(false);
  });

  it('should handle database errors', async () => {
    const categoriesChain = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: 'PGRST301' },
      }),
    };

    mockSelect.mockReturnValueOnce(categoriesChain);

    mockFrom.mockReturnValue({
      select: mockSelect,
    });

    const response = await categoriesGET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toHaveProperty('code');
    expect(data.error).toHaveProperty('message');
  });

  it('should return empty array when no categories exist', async () => {
    const categoriesChain = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    const productsChain = {
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSelect
      .mockReturnValueOnce(categoriesChain)
      .mockReturnValueOnce(productsChain);

    mockFrom.mockReturnValue({
      select: mockSelect,
    });

    const response = await categoriesGET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.categories).toEqual([]);
  });
});

describe('GET /api/categories/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return products for a specific category', async () => {
    const slug = 'templates';
    const category = mockCategories.find((c) => c.slug === slug);

    // First call: category query
    const categoryChain = {
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [category],
        error: null,
      }),
    };

    // Second call: products query
    const productsChain = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockProductsWithImages,
        error: null,
      }),
    };

    mockSelect
      .mockReturnValueOnce(categoryChain)
      .mockReturnValueOnce(productsChain);

    mockFrom.mockReturnValue({
      select: mockSelect,
    });

    const request = new Request('http://localhost:3000/api/categories/templates');
    const response = await categorySlugGET(request, {
      params: Promise.resolve({ slug }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('category');
    expect(data).toHaveProperty('products');
    expect(data.category.slug).toBe(slug);
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products.length).toBe(2);

    // Check primary image is extracted
    expect(data.products[0]).toHaveProperty('primary_image');
    expect(data.products[0].primary_image).toHaveProperty('url');
  });

  it('should return 404 for non-existent category', async () => {
    const categoryChain = {
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSelect.mockReturnValueOnce(categoryChain);

    mockFrom.mockReturnValue({
      select: mockSelect,
    });

    const request = new Request('http://localhost:3000/api/categories/non-existent');
    const response = await categorySlugGET(request, {
      params: Promise.resolve({ slug: 'non-existent' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
    expect(data.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('should return 404 for inactive category', async () => {
    // RLS policy will filter out inactive categories, so return empty
    const categoryChain = {
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSelect.mockReturnValueOnce(categoryChain);

    mockFrom.mockReturnValue({
      select: mockSelect,
    });

    const request = new Request('http://localhost:3000/api/categories/inactive');
    const response = await categorySlugGET(request, {
      params: Promise.resolve({ slug: 'inactive' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
    expect(data.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('should return empty products array when category has no products', async () => {
    const ebooksCategory = mockCategories.find((c) => c.slug === 'ebooks');

    const categoryChain = {
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [ebooksCategory],
        error: null,
      }),
    };

    const productsChain = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSelect
      .mockReturnValueOnce(categoryChain)
      .mockReturnValueOnce(productsChain);

    mockFrom.mockReturnValue({
      select: mockSelect,
    });

    const request = new Request('http://localhost:3000/api/categories/ebooks');
    const response = await categorySlugGET(request, {
      params: Promise.resolve({ slug: 'ebooks' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products).toEqual([]);
  });

  it('should handle database errors', async () => {
    const categoryChain = {
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'PGRST301' },
      }),
    };

    mockSelect.mockReturnValueOnce(categoryChain);

    mockFrom.mockReturnValue({
      select: mockSelect,
    });

    const request = new Request('http://localhost:3000/api/categories/templates');
    const response = await categorySlugGET(request, {
      params: Promise.resolve({ slug: 'templates' }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toHaveProperty('message');
  });
});

// Helper function to flatten nested categories
function flattenCategories(categories: any[]): any[] {
  return categories.reduce((acc, category) => {
    acc.push(category);
    if (category.children && category.children.length > 0) {
      acc.push(...flattenCategories(category.children));
    }
    return acc;
  }, []);
}
