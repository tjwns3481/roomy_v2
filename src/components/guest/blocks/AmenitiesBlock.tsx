// @TASK P2-T2.2 - 게스트용 AmenitiesBlock
// @SPEC docs/planning/06-tasks.md#P2-T2.2

'use client';

import React from 'react';
import { AmenitiesContent } from '@/types/block';
import { Card, CardContent } from '@/components/ui/card';
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

// lucide-react 아이콘 매핑
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
 * 게스트용 편의시설 블록
 * - 아이콘 그리드로 표시
 * - 이용 가능/불가 구분
 */
export function AmenitiesBlock({ content }: AmenitiesBlockProps) {
  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Wifi;
    return <IconComponent className="h-6 w-6" />;
  };

  const availableItems = content.items.filter((item) => item.available);
  const unavailableItems = content.items.filter((item) => !item.available);

  return (
    <div className="px-4 py-6 space-y-4">
      {/* 이용 가능한 편의시설 */}
      {availableItems.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 px-2">이용 가능한 편의시설</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                      <span className="text-green-600">{renderIcon(item.icon)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 이용 불가 편의시설 */}
      {unavailableItems.length > 0 && (
        <div className="opacity-60">
          <h3 className="text-lg font-semibold mb-3 px-2 text-muted-foreground">
            이용 불가 시설
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {unavailableItems.map((item) => (
              <Card key={item.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                      <span className="text-red-600">{renderIcon(item.icon)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <X className="h-3 w-3 text-red-600" />
                      <span className="text-sm font-medium line-through">{item.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {availableItems.length === 0 && unavailableItems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">등록된 편의시설이 없습니다</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
