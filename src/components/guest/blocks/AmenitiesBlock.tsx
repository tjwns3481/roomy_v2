// @TASK P8-S2-T1 - AirBnB 스타일 AmenitiesBlock
// @SPEC specs/screens/guest-viewer.yaml

'use client';

import React from 'react';
import { AmenitiesContent } from '@/types/block';
import {
  Wifi,
  Snowflake,
  Flame,
  Tv,
  WashingMachine,
  Refrigerator,
  Microwave,
  Wind,
  Shirt,
  Bath,
  ParkingCircle,
  Building2,
  Coffee,
  Utensils,
  Dumbbell,
  Waves,
  ShowerHead,
  AirVent,
  Check,
  X,
} from 'lucide-react';

interface AmenitiesBlockProps {
  content: AmenitiesContent;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  snowflake: Snowflake,
  flame: Flame,
  tv: Tv,
  washer: WashingMachine,
  refrigerator: Refrigerator,
  microwave: Microwave,
  'hair-dryer': Wind,
  iron: Shirt,
  bathtub: Bath,
  parking: ParkingCircle,
  elevator: Building2,
  coffee: Coffee,
  utensils: Utensils,
  dumbbell: Dumbbell,
  waves: Waves,
  'shower-head': ShowerHead,
  'air-vent': AirVent,
};

/**
 * AirBnB 스타일 편의시설 블록
 * - 아이콘 그리드 (shadow-airbnb-sm)
 * - 부드러운 곡선 (rounded-xl)
 * - 호버 효과
 */
export function AmenitiesBlock({ content }: AmenitiesBlockProps) {
  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Wifi;
    return <IconComponent className="h-7 w-7" />;
  };

  const availableItems = content.items.filter((item) => item.available);
  const unavailableItems = content.items.filter((item) => !item.available);

  return (
    <div className="px-4 py-8 space-y-6">
      {/* 이용 가능한 편의시설 */}
      {availableItems.length > 0 && (
        <div>
          <h3 className="text-h2 font-semibold text-text-primary mb-6 px-2">
            이용 가능한 편의시설
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {availableItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-border rounded-xl p-5 shadow-airbnb-sm hover:shadow-airbnb-md transition-all hover:scale-105 cursor-pointer"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
                    <span className="text-success">{renderIcon(item.icon)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-body font-medium text-text-primary">{item.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이용 불가 편의시설 */}
      {unavailableItems.length > 0 && (
        <div className="opacity-60">
          <h3 className="text-h2 font-semibold text-text-secondary mb-6 px-2">
            이용 불가 시설
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {unavailableItems.map((item) => (
              <div
                key={item.id}
                className="bg-surface border border-border rounded-xl p-5"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10">
                    <span className="text-error">{renderIcon(item.icon)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-error flex-shrink-0" />
                    <span className="text-body font-medium text-text-secondary line-through">
                      {item.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {availableItems.length === 0 && unavailableItems.length === 0 && (
        <div className="bg-white border border-border rounded-xl p-12 text-center shadow-airbnb-sm">
          <p className="text-body text-text-secondary">등록된 편의시설이 없습니다</p>
        </div>
      )}
    </div>
  );
}
