// @TASK P1-T1.5 - AmenitiesEditor 컴포넌트
// @SPEC docs/planning/06-tasks.md#P1-T1.5

'use client';

import { useState } from 'react';
import { AmenitiesContent, DEFAULT_AMENITIES } from '@/types/block';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Trash2,
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
import * as LucideIcons from 'lucide-react';

interface AmenitiesEditorProps {
  content: AmenitiesContent;
  onChange: (content: AmenitiesContent) => void;
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

// 아이콘 선택 옵션
const availableIcons = [
  { name: 'wifi', label: 'WiFi' },
  { name: 'snowflake', label: '에어컨' },
  { name: 'flame', label: '난방' },
  { name: 'tv', label: 'TV' },
  { name: 'washer', label: '세탁기' },
  { name: 'refrigerator', label: '냉장고' },
  { name: 'microwave', label: '전자레인지' },
  { name: 'hair-dryer', label: '드라이기' },
  { name: 'iron', label: '다리미' },
  { name: 'bathtub', label: '욕조' },
  { name: 'parking', label: '주차' },
  { name: 'elevator', label: '엘리베이터' },
  { name: 'coffee', label: '커피' },
  { name: 'utensils', label: '식기' },
  { name: 'dumbbell', label: '운동시설' },
  { name: 'waves', label: '수영장' },
  { name: 'shower-head', label: '샤워' },
  { name: 'air-vent', label: '환풍기' },
];

export function AmenitiesEditor({ content, onChange }: AmenitiesEditorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('wifi');

  // 프리셋 편의시설인지 확인
  const isPreset = (id: string) => {
    return DEFAULT_AMENITIES.some((amenity) => amenity.id === id);
  };

  // 토글 핸들러
  const handleToggle = (id: string, available: boolean) => {
    const updatedItems = content.items.map((item) =>
      item.id === id ? { ...item, available } : item
    );
    onChange({ ...content, items: updatedItems });
  };

  // 커스텀 편의시설 추가
  const handleAddCustom = () => {
    if (!newAmenityName.trim()) return;

    const newId = `custom-${Date.now()}`;
    const newItem = {
      id: newId,
      name: newAmenityName,
      icon: selectedIcon,
      available: true,
    };

    onChange({
      ...content,
      items: [...content.items, newItem],
    });

    setNewAmenityName('');
    setSelectedIcon('wifi');
    setIsAddDialogOpen(false);
  };

  // 커스텀 편의시설 삭제
  const handleDelete = (id: string) => {
    const updatedItems = content.items.filter((item) => item.id !== id);
    onChange({ ...content, items: updatedItems });
  };

  // 아이콘 렌더링
  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <Wifi className="h-5 w-5" />;
  };

  // 프리셋 항목들
  const presetItems = content.items.filter((item) => isPreset(item.id));

  // 커스텀 항목들
  const customItems = content.items.filter((item) => !isPreset(item.id));

  // 프리셋 중 추가 안 된 항목 확인
  const missingPresets = DEFAULT_AMENITIES.filter(
    (preset) => !content.items.some((item) => item.id === preset.id)
  );

  // 프리셋 추가
  const handleAddPreset = () => {
    if (missingPresets.length > 0) {
      onChange({
        ...content,
        items: [...content.items, ...missingPresets],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 프리셋 편의시설 섹션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>기본 편의시설</CardTitle>
            {missingPresets.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleAddPreset}>
                <Plus className="mr-2 h-4 w-4" />
                모두 추가 ({missingPresets.length}개)
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {presetItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {renderIcon(item.icon)}
                </div>
                <Label htmlFor={`amenity-${item.id}`} className="text-base font-medium">
                  {item.name}
                </Label>
              </div>
              <Switch
                id={`amenity-${item.id}`}
                checked={item.available}
                onCheckedChange={(checked) => handleToggle(item.id, checked)}
              />
            </div>
          ))}
          {presetItems.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              기본 편의시설을 추가하려면 "모두 추가" 버튼을 클릭하세요
            </p>
          )}
        </CardContent>
      </Card>

      {/* 커스텀 편의시설 섹션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>커스텀 편의시설</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>커스텀 편의시설 추가</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amenity-name">편의시설 이름</Label>
                    <Input
                      id="amenity-name"
                      value={newAmenityName}
                      onChange={(e) => setNewAmenityName(e.target.value)}
                      placeholder="예: 전기포트"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>아이콘 선택</Label>
                    <div className="mt-2 grid grid-cols-6 gap-2">
                      {availableIcons.map((icon) => {
                        const IconComponent = iconMap[icon.name];
                        return (
                          <button
                            key={icon.name}
                            type="button"
                            onClick={() => setSelectedIcon(icon.name)}
                            className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-colors ${
                              selectedIcon === icon.name
                                ? 'border-primary bg-primary/10'
                                : 'border-muted hover:border-primary/50'
                            }`}
                            title={icon.label}
                          >
                            {IconComponent && <IconComponent className="h-5 w-5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <Button onClick={handleAddCustom} className="w-full">
                    추가
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {customItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {renderIcon(item.icon)}
                </div>
                <div>
                  <Label htmlFor={`amenity-${item.id}`} className="text-base font-medium">
                    {item.name}
                  </Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id={`amenity-${item.id}`}
                  checked={item.available}
                  onCheckedChange={(checked) => handleToggle(item.id, checked)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  aria-label={`${item.name} 삭제`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {customItems.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              커스텀 편의시설을 추가하려면 "추가" 버튼을 클릭하세요
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
