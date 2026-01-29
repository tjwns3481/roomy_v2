import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';

// ============================================================================
// Types
// ============================================================================

interface ProductCardProps {
  product: Product;
  thumbnail?: string;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * 숫자를 원화 포맷으로 변환
 * @example formatPrice(99000) // "99,000원"
 */
function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

/**
 * 할인율 계산
 * @example calculateDiscountRate(99000, 79000) // 20
 */
function calculateDiscountRate(price: number, discountPrice: number): number {
  return Math.round(((price - discountPrice) / price) * 100);
}

// ============================================================================
// Component
// ============================================================================

/**
 * 상품 카드 컴포넌트
 *
 * Features:
 * - 썸네일 이미지 (placeholder if null)
 * - 상품명 (긴 텍스트 truncate)
 * - 가격 표시 (원화 포맷)
 * - 할인가 표시 (원가 취소선, 할인율 뱃지)
 * - 호버 효과 (scale, shadow)
 * - 상품 상세 링크
 * - Neo-Brutalism 스타일
 */
export function ProductCard({ product, thumbnail }: ProductCardProps) {
  const hasDiscount = product.discount_price !== null;
  const displayPrice = hasDiscount ? product.discount_price! : product.price;
  const discountRate = hasDiscount
    ? calculateDiscountRate(product.price, product.discount_price!)
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      data-testid="product-card"
    >
      <article className="relative overflow-hidden border-3 border-neo-black bg-neo-white shadow-neo transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-neo-sm">
        {/* Thumbnail */}
        <div className="relative aspect-square w-full overflow-hidden bg-neo-cream">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div
              data-testid="product-card-placeholder"
              className="flex h-full w-full items-center justify-center bg-neo-cream"
            >
              <svg
                className="h-16 w-16 text-neo-black/20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute right-2 top-2 bg-neo-pink px-2 py-1 text-sm font-black text-neo-white border-2 border-neo-black">
              {discountRate}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 border-t-3 border-neo-black">
          {/* Product Name */}
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-neo-black">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span className="text-sm text-neo-black/40 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-xl font-black text-neo-black">
              {formatPrice(displayPrice)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
