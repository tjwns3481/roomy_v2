// @TASK P8-S2-T3 - Upsell 카드 (AirBnB 스타일)
// @SPEC specs/shared/components.yaml#upsell_card

'use client';

import Image from 'next/image';
import type { UpsellItem } from '@/types/upsell';

interface UpsellCardProps {
  item: UpsellItem;
  onClick: () => void;
}

/**
 * Upsell 아이템 카드
 * - AirBnB 스타일 디자인
 * - 4:3 비율 이미지
 * - 호버 효과 (그림자, 이미지 확대)
 */
export function UpsellCard({ item, onClick }: UpsellCardProps) {
  // 가격 포맷 (₩15,000)
  const formattedPrice = `₩${item.price.toLocaleString('ko-KR')}`;

  return (
    <button
      onClick={onClick}
      className="flex-none w-64 bg-white rounded-xl border border-border overflow-hidden
        shadow-airbnb-sm hover:shadow-airbnb-lg transition-all duration-300
        group snap-start"
      aria-label={`${item.name} 상세보기`}
    >
      {/* 이미지 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 256px, 256px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface">
            <svg
              className="w-16 h-16 text-text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="p-4 text-left">
        <h3 className="text-base font-semibold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
        <p className="text-base font-semibold text-text-primary mt-2">
          {formattedPrice}
        </p>
      </div>
    </button>
  );
}
