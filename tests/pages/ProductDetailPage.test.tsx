/**
 * ProductDetailPage.test.tsx
 *
 * 상품 상세 페이지 테스트
 * - slug 기반 라우팅
 * - 상품 정보 표시 (이름, 가격, 할인가, 설명)
 * - Markdown 설명 렌더링
 * - 이미지 갤러리
 * - 미리보기 파일 목록 (is_preview=true)
 * - 장바구니 담기 버튼
 * - 태그 표시
 */

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProductDetailPage from '@/app/(shop)/products/[slug]/page';
import type { ProductWithAll } from '@/types/product';

// Mock modules
vi.mock('@/hooks/use-products');
vi.mock('@/hooks/use-cart');
vi.mock('@/components/products/image-gallery');
vi.mock('react-markdown');

import { useProduct } from '@/hooks/use-products';
import { useCart } from '@/hooks/use-cart';
import { ImageGallery } from '@/components/products/image-gallery';
import ReactMarkdown from 'react-markdown';

const mockUseProduct = useProduct as ReturnType<typeof vi.fn>;
const mockUseCart = useCart as ReturnType<typeof vi.fn>;
const MockImageGallery = ImageGallery as ReturnType<typeof vi.fn>;
const MockReactMarkdown = ReactMarkdown as ReturnType<typeof vi.fn>;

// Mock Product Data
const mockProduct: ProductWithAll = {
  id: 'product-1',
  category_id: 'cat-1',
  name: 'Next.js 완벽 가이드',
  slug: 'nextjs-perfect-guide',
  short_description: 'Next.js를 마스터하세요',
  description: '# Next.js 완벽 가이드\n\n이 강의에서는 **Next.js**의 모든 것을 배웁니다.\n\n## 주요 내용\n\n- App Router\n- Server Components\n- API Routes',
  price: 50000,
  discount_price: 39000,
  type: 'digital',
  metadata: { file_format: 'PDF', file_size: '10MB' },
  status: 'active',
  is_featured: true,
  view_count: 100,
  sales_count: 50,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  images: [
    {
      id: 'img-1',
      product_id: 'product-1',
      url: 'https://example.com/image1.jpg',
      alt_text: 'Next.js Guide Cover',
      sort_order: 0,
      is_primary: true,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'img-2',
      product_id: 'product-1',
      url: 'https://example.com/image2.jpg',
      alt_text: 'Next.js Guide Preview',
      sort_order: 1,
      is_primary: false,
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
  files: [
    {
      id: 'file-1',
      product_id: 'product-1',
      name: 'preview-chapter1.pdf',
      storage_path: 'products/preview-chapter1.pdf',
      size: 1024000,
      mime_type: 'application/pdf',
      download_limit: 0,
      download_days: 0,
      is_preview: true,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'file-2',
      product_id: 'product-1',
      name: 'full-guide.pdf',
      storage_path: 'products/full-guide.pdf',
      size: 10485760,
      mime_type: 'application/pdf',
      download_limit: 5,
      download_days: 365,
      is_preview: false,
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
  tags: [
    { id: 'tag-1', name: 'Next.js', slug: 'nextjs' },
    { id: 'tag-2', name: 'React', slug: 'react' },
  ],
};

describe('ProductDetailPage', () => {
  const mockAddItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useCart
    mockUseCart.mockReturnValue({
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false,
      error: null,
      addItem: mockAddItem,
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
    });

    // Mock ImageGallery
    MockImageGallery.mockImplementation(({ images }) => (
      <div data-testid="image-gallery">
        {images.map((img) => (
          <img key={img.id} src={img.url} alt={img.alt_text || ''} />
        ))}
      </div>
    ));

    // Mock ReactMarkdown
    MockReactMarkdown.mockImplementation(({ children }) => (
      <div data-testid="markdown-content">{children}</div>
    ));
  });

  it('로딩 중일 때 로딩 표시', async () => {
    mockUseProduct.mockReturnValue({
      product: null,
      isLoading: true,
      error: null,
      mutate: vi.fn(),
    });

    render(await ProductDetailPage({ params: { slug: 'nextjs-perfect-guide' } }));

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('상품이 없을 때 404 표시', async () => {
    mockUseProduct.mockReturnValue({
      product: null,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    render(await ProductDetailPage({ params: { slug: 'non-existent' } }));

    expect(screen.getByText(/상품을 찾을 수 없습니다/i)).toBeInTheDocument();
  });

  it('에러 발생 시 에러 메시지 표시', async () => {
    mockUseProduct.mockReturnValue({
      product: null,
      isLoading: false,
      error: new Error('Failed to fetch'),
      mutate: vi.fn(),
    });

    render(await ProductDetailPage({ params: { slug: 'nextjs-perfect-guide' } }));

    expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
  });

  it('상품 상세 정보를 올바르게 렌더링', async () => {
    mockUseProduct.mockReturnValue({
      product: mockProduct,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    render(await ProductDetailPage({ params: { slug: 'nextjs-perfect-guide' } }));

    // 상품 이름
    expect(screen.getByText('Next.js 완벽 가이드')).toBeInTheDocument();

    // 가격
    expect(screen.getByText('50,000원')).toBeInTheDocument();
    expect(screen.getByText('39,000원')).toBeInTheDocument();

    // 짧은 설명
    expect(screen.getByText('Next.js를 마스터하세요')).toBeInTheDocument();
  });

  it('ImageGallery 컴포넌트를 올바른 props로 렌더링', async () => {
    mockUseProduct.mockReturnValue({
      product: mockProduct,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    render(await ProductDetailPage({ params: { slug: 'nextjs-perfect-guide' } }));

    expect(screen.getByTestId('image-gallery')).toBeInTheDocument();
    expect(MockImageGallery).toHaveBeenCalled();
    // Check if called with images array
    const callArgs = MockImageGallery.mock.calls[0][0];
    expect(callArgs.images).toBeDefined();
    expect(Array.isArray(callArgs.images)).toBe(true);
    expect(callArgs.images.length).toBe(mockProduct.images.length);
  });

  it('Markdown 설명을 렌더링', async () => {
    mockUseProduct.mockReturnValue({
      product: mockProduct,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    render(await ProductDetailPage({ params: { slug: 'nextjs-perfect-guide' } }));

    expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    expect(MockReactMarkdown).toHaveBeenCalled();
    // Check if called with correct children prop
    const callArgs = MockReactMarkdown.mock.calls[0][0];
    expect(callArgs.children).toEqual(mockProduct.description);
  });

  it('미리보기 파일 목록을 표시 (is_preview=true)', async () => {
    mockUseProduct.mockReturnValue({
      product: mockProduct,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    render(await ProductDetailPage({ params: { slug: 'nextjs-perfect-guide' } }));

    // 미리보기 파일만 표시
    expect(screen.getByText('preview-chapter1.pdf')).toBeInTheDocument();
    expect(screen.queryByText('full-guide.pdf')).not.toBeInTheDocument();
  });

  it('태그를 표시', async () => {
    mockUseProduct.mockReturnValue({
      product: mockProduct,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    render(await ProductDetailPage({ params: { slug: 'nextjs-perfect-guide' } }));

    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('장바구니 담기 버튼 클릭 시 addItem 호출', async () => {
    const user = userEvent.setup();

    mockUseProduct.mockReturnValue({
      product: mockProduct,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    render(await ProductDetailPage({ params: { slug: 'nextjs-perfect-guide' } }));

    const addToCartButton = screen.getByRole('button', { name: /장바구니 담기/i });
    await user.click(addToCartButton);

    expect(mockAddItem).toHaveBeenCalledWith(mockProduct.id);
  });

  it('할인가가 없을 때 원가만 표시', async () => {
    const productWithoutDiscount: ProductWithAll = {
      ...mockProduct,
      discount_price: null,
    };

    mockUseProduct.mockReturnValue({
      product: productWithoutDiscount,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    render(await ProductDetailPage({ params: { slug: 'nextjs-perfect-guide' } }));

    expect(screen.getByText('50,000원')).toBeInTheDocument();
    expect(screen.queryByText('39,000원')).not.toBeInTheDocument();
  });

  it('미리보기 파일이 없을 때 섹션 표시 안 함', async () => {
    const productWithoutPreview: ProductWithAll = {
      ...mockProduct,
      files: mockProduct.files.filter((f) => !f.is_preview),
    };

    mockUseProduct.mockReturnValue({
      product: productWithoutPreview,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    render(await ProductDetailPage({ params: { slug: 'nextjs-perfect-guide' } }));

    expect(screen.queryByText('미리보기 파일')).not.toBeInTheDocument();
  });
});
