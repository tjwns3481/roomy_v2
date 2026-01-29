/**
 * Products Page Test
 *
 * P2-T2.4: 상품 목록 페이지 테스트
 * - 반응형 그리드 레이아웃 (1/2/3/4 cols)
 * - 카테고리 필터 (사이드바)
 * - 정렬 옵션 (인기순/최신순/가격순)
 * - 페이지네이션
 * - ProductCard 컴포넌트 사용
 * - useProducts 훅 사용
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductsPage from '@/app/(shop)/products/page';

// Mock useProducts hook
vi.mock('@/hooks/use-products', () => ({
  useProducts: vi.fn(),
}));

// Mock ProductCard component
vi.mock('@/components/products/product-card', () => ({
  ProductCard: ({ product }: { product: any }) => (
    <div data-testid="product-card" data-product-id={product.id}>
      {product.name}
    </div>
  ),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn((key: string) => {
      const params: Record<string, string> = {};
      return params[key] || null;
    }),
  }),
  usePathname: () => '/products',
}));

// Mock categories fetch
global.fetch = vi.fn();

describe('ProductsPage', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Product 1',
      slug: 'product-1',
      price: 10000,
      discount_price: null,
      images: ['https://example.com/1.jpg'],
      status: 'active',
      category_id: 'cat-1',
      description: 'Description 1',
      stock: 10,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '2',
      name: 'Product 2',
      slug: 'product-2',
      price: 20000,
      discount_price: 15000,
      images: ['https://example.com/2.jpg'],
      status: 'active',
      category_id: 'cat-1',
      description: 'Description 2',
      stock: 5,
      created_at: '2024-01-02',
      updated_at: '2024-01-02',
    },
    {
      id: '3',
      name: 'Product 3',
      slug: 'product-3',
      price: 30000,
      discount_price: null,
      images: [],
      status: 'active',
      category_id: 'cat-2',
      description: 'Description 3',
      stock: 0,
      created_at: '2024-01-03',
      updated_at: '2024-01-03',
    },
  ];

  const mockCategories = [
    {
      id: 'cat-1',
      name: 'Category 1',
      slug: 'category-1',
      parent_id: null,
      description: null,
      image_url: null,
      sort_order: 0,
      is_active: true,
      product_count: 2,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 'cat-2',
      name: 'Category 2',
      slug: 'category-2',
      parent_id: null,
      description: null,
      image_url: null,
      sort_order: 1,
      is_active: true,
      product_count: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch for categories
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ categories: mockCategories }),
    });
  });

  describe('Rendering', () => {
    it('렌더링 시 상품 목록 페이지가 표시되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /상품 목록/i })).toBeInTheDocument();
      });
    });

    it('로딩 중 스피너가 표시되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: [],
        pagination: { page: 1, pageSize: 12, total: 0, totalPages: 0 },
        isLoading: true,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      });
    });

    it('상품이 없을 때 빈 상태 메시지가 표시되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: [],
        pagination: { page: 1, pageSize: 12, total: 0, totalPages: 0 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText(/상품이 없습니다/i)).toBeInTheDocument();
      });
    });

    it('에러 발생 시 에러 메시지가 표시되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: [],
        pagination: { page: 1, pageSize: 12, total: 0, totalPages: 0 },
        isLoading: false,
        error: new Error('Failed to load products'),
      });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText(/상품을 불러오는데 실패했습니다/i)).toBeInTheDocument();
      });
    });
  });

  describe('Product Grid', () => {
    it('상품 카드가 그리드로 표시되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        const productCards = screen.getAllByTestId('product-card');
        expect(productCards).toHaveLength(3);
      });
    });

    it('그리드 컨테이너에 반응형 클래스가 있어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        const gridContainer = screen.getByTestId('products-grid');
        expect(gridContainer).toBeInTheDocument();
        // Check for responsive grid classes
        expect(gridContainer.className).toMatch(/grid/);
      });
    });
  });

  describe('Category Filter', () => {
    it('카테고리 필터 사이드바가 표시되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });
    });

    it('전체 카테고리 옵션이 표시되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText(/전체/i)).toBeInTheDocument();
      });
    });

    it('카테고리 목록이 표시되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText('Category 1')).toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
      });
    });

    it('카테고리 클릭 시 필터가 적용되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText('Category 1')).toBeInTheDocument();
      });

      const category1Button = screen.getByText('Category 1');
      await user.click(category1Button);

      // useProducts should be called with category filter
      expect(useProducts).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'category-1' })
      );
    });

    it('각 카테고리에 상품 수가 표시되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText(/2/)).toBeInTheDocument(); // Category 1 count
        expect(screen.getByText(/1/)).toBeInTheDocument(); // Category 2 count
      });
    });
  });

  describe('Sort Options', () => {
    it('정렬 드롭다운이 표시되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /정렬/i })).toBeInTheDocument();
      });
    });

    it('정렬 옵션이 모두 표시되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /정렬/i })).toBeInTheDocument();
      });

      const sortSelect = screen.getByRole('combobox', { name: /정렬/i });
      await user.click(sortSelect);

      await waitFor(() => {
        expect(screen.getByText(/인기순/i)).toBeInTheDocument();
        expect(screen.getByText(/최신순/i)).toBeInTheDocument();
        expect(screen.getByText(/가격 낮은순/i)).toBeInTheDocument();
        expect(screen.getByText(/가격 높은순/i)).toBeInTheDocument();
      });
    });

    it('정렬 옵션 선택 시 상품 목록이 재조회되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /정렬/i })).toBeInTheDocument();
      });

      const sortSelect = screen.getByRole('combobox', { name: /정렬/i });

      // Change sort option
      await user.selectOptions(sortSelect, 'newest');

      // Wait for re-render and check if useProducts was called with new sort
      await waitFor(() => {
        const calls = (useProducts as any).mock.calls;
        const hasNewestCall = calls.some((call: any[]) => call[0]?.sort === 'newest');
        expect(hasNewestCall).toBe(true);
      });
    });
  });

  describe('Pagination', () => {
    it('페이지네이션이 표시되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 30, totalPages: 3 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: /페이지네이션/i })).toBeInTheDocument();
      });
    });

    it('현재 페이지 번호가 표시되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 2, pageSize: 12, total: 30, totalPages: 3 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('다음 페이지 버튼 클릭 시 페이지가 변경되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 30, totalPages: 3 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /다음/i })).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /다음/i });
      await user.click(nextButton);

      expect(useProducts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });

    it('마지막 페이지에서 다음 버튼이 비활성화되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 3, pageSize: 12, total: 30, totalPages: 3 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /다음/i });
        expect(nextButton).toBeDisabled();
      });
    });

    it('첫 페이지에서 이전 버튼이 비활성화되어야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 30, totalPages: 3 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /이전/i });
        expect(prevButton).toBeDisabled();
      });
    });
  });

  describe('Responsive Design', () => {
    it('그리드가 반응형 열 수를 가져야 함 (sm:2 md:3 lg:4)', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        const gridContainer = screen.getByTestId('products-grid');
        const classes = gridContainer.className;

        // Check for Tailwind responsive grid classes
        expect(classes).toMatch(/grid/);
        expect(classes).toMatch(/sm:grid-cols-2|md:grid-cols-3|lg:grid-cols-4/);
      });
    });
  });

  describe('Accessibility', () => {
    it('메인 콘텐츠 영역이 적절한 role을 가져야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    it('카테고리 필터가 complementary role을 가져야 함', async () => {
      const { useProducts } = await import('@/hooks/use-products');
      (useProducts as any).mockReturnValue({
        products: mockProducts,
        pagination: { page: 1, pageSize: 12, total: 3, totalPages: 1 },
        isLoading: false,
        error: null,
      });

      render(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });
    });
  });
});
