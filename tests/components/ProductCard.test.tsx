import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/products/product-card';
import type { Product } from '@/types/product';

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    category_id: null,
    name: '바이브코딩 강의 패키지',
    slug: 'vibecoding-course-package',
    short_description: 'AI와 함께하는 코딩 강의',
    description: null,
    price: 99000,
    discount_price: null,
    type: 'digital',
    metadata: null,
    status: 'active',
    is_featured: false,
    view_count: 0,
    sales_count: 0,
    created_at: '2026-01-25T00:00:00Z',
    updated_at: '2026-01-25T00:00:00Z',
  };

  it('상품명, 가격을 표시한다', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('바이브코딩 강의 패키지')).toBeInTheDocument();
    expect(screen.getByText('99,000원')).toBeInTheDocument();
  });

  it('할인가가 있으면 원가에 취소선을 표시하고 할인율을 표시한다', () => {
    const discountedProduct: Product = {
      ...mockProduct,
      discount_price: 79000,
    };

    render(<ProductCard product={discountedProduct} />);

    // 할인가 표시
    expect(screen.getByText('79,000원')).toBeInTheDocument();

    // 원가 취소선
    const originalPrice = screen.getByText('99,000원');
    expect(originalPrice).toHaveClass('line-through');

    // 할인율 표시 (20% 할인)
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('썸네일 이미지를 표시한다', () => {
    render(
      <ProductCard
        product={mockProduct}
        thumbnail="https://example.com/image.jpg"
      />
    );

    const img = screen.getByAltText('바이브코딩 강의 패키지');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src');
  });

  it('썸네일이 없으면 placeholder를 표시한다', () => {
    render(<ProductCard product={mockProduct} />);

    // placeholder 컨테이너 확인
    const placeholder = screen.getByTestId('product-card-placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  it('긴 상품명은 truncate 처리한다', () => {
    const longNameProduct: Product = {
      ...mockProduct,
      name: '이것은 매우 긴 상품명으로 카드 내에서 적절히 잘려야 하는 텍스트입니다 아주 길게 작성해봅니다',
    };

    render(<ProductCard product={longNameProduct} />);

    const title = screen.getByText(longNameProduct.name);
    expect(title).toHaveClass('line-clamp-2'); // 2줄 제한
  });

  it('상품 상세 링크를 제공한다', () => {
    render(<ProductCard product={mockProduct} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/vibecoding-course-package');
  });

  it('호버 효과를 위한 클래스가 적용되어 있다', () => {
    const { container } = render(<ProductCard product={mockProduct} />);

    const card = container.querySelector('article');
    expect(card).toHaveClass('transition-transform');
  });
});
