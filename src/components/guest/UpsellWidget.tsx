// @TASK P8-S2-T3 - Upsell 위젯 (AirBnB 스타일)
// @SPEC specs/shared/components.yaml#upsell_widget

'use client';

import { useState, useEffect } from 'react';
import { UpsellCard } from './UpsellCard';
import { UpsellRequestModal } from './UpsellRequestModal';
import type { UpsellItem } from '@/types/upsell';

interface UpsellWidgetProps {
  guidebookId: string;
}

/**
 * Upsell 위젯
 * - Business 플랜 가이드북에서만 표시
 * - 수평 스크롤 캐러셀 형태
 * - AirBnB 스타일 카드 디자인
 */
export function UpsellWidget({ guidebookId }: UpsellWidgetProps) {
  const [items, setItems] = useState<UpsellItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<UpsellItem | null>(null);

  // 아이템 로딩
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/guidebooks/${guidebookId}/upsell/items`);

        if (!response.ok) {
          console.error('Failed to fetch upsell items');
          setItems([]);
          return;
        }

        const data = await response.json();
        setItems(data.items || []);
      } catch (error) {
        console.error('Error fetching upsell items:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [guidebookId]);

  // 로딩 중 스켈레톤
  if (loading) {
    return (
      <section className="mt-8 px-4 pb-8">
        <div
          className="flex gap-4 overflow-x-auto pb-4"
          role="status"
          aria-label="Upsell 아이템 로딩 중"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-none w-64 bg-white rounded-xl border border-border overflow-hidden shadow-airbnb-sm"
            >
              <div className="aspect-[4/3] bg-surface animate-pulse" />
              <div className="p-4">
                <div className="h-5 bg-surface rounded animate-pulse mb-2" />
                <div className="h-4 bg-surface rounded animate-pulse w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 아이템이 없으면 렌더링하지 않음
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <section className="mt-8 px-4 pb-8">
        <h2 className="text-h3 font-semibold text-text-primary mb-4 px-1">
          추가 서비스
        </h2>

        {/* 수평 스크롤 캐러셀 */}
        <div
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {items.map((item) => (
            <UpsellCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
      </section>

      {/* 상세 모달 */}
      {selectedItem && (
        <UpsellRequestModal
          item={selectedItem}
          guidebookId={guidebookId}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
