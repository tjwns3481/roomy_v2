// @TASK P1-T1.5 - AmenitiesPreview 컴포넌트
// @SPEC docs/planning/06-tasks.md#P1-T1.5

'use client';

import { AmenitiesContent } from '@/types/block';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  AirVent
} from 'lucide-react';

interface AmenitiesPreviewProps {
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

export function AmenitiesPreview({ content }: AmenitiesPreviewProps) {
  // 아이콘 렌더링
  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <Wifi className="h-5 w-5" />;
  };

  // available=true인 항목만 표시
  const availableItems = content.items.filter((item) => item.available);

  // available=false인 항목
  const unavailableItems = content.items.filter((item) => !item.available);

  return (
    <div className="space-y-4">
      {/* 이용 가능한 편의시설 */}
      {availableItems.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              이용 가능한 편의시설
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {availableItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <span className="text-green-600">{renderIcon(item.icon)}</span>
                  </div>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 이용 불가 편의시설 (선택적 표시) */}
      {unavailableItems.length > 0 && (
        <Card className="opacity-60">
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              이용 불가 시설
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {unavailableItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg bg-muted/30 p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <span className="text-red-600">{renderIcon(item.icon)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium line-through">{item.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      불가
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 편의시설 없을 때 */}
      {availableItems.length === 0 && unavailableItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">등록된 편의시설이 없습니다</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
