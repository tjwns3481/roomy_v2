// @TASK P1-T1.7 - MapEditor 컴포넌트
// @SPEC docs/planning/06-tasks.md#P1-T1.7

'use client';

import { useState } from 'react';
import { MapContent } from '@/types/block';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Map, Plus, Trash2, Navigation } from 'lucide-react';

interface MapEditorProps {
  content: MapContent;
  onChange: (content: MapContent) => void;
}

const CATEGORY_LABELS: Record<MapContent['markers'][0]['category'], string> = {
  accommodation: '숙소',
  restaurant: '음식점',
  convenience: '편의점',
  attraction: '관광지',
  transport: '교통',
};

export function MapEditor({ content, onChange }: MapEditorProps) {
  const [newMarkerTitle, setNewMarkerTitle] = useState('');
  const [newMarkerLat, setNewMarkerLat] = useState('');
  const [newMarkerLng, setNewMarkerLng] = useState('');
  const [newMarkerCategory, setNewMarkerCategory] = useState<MapContent['markers'][0]['category']>('convenience');

  const handleProviderChange = (provider: 'naver' | 'kakao') => {
    onChange({
      ...content,
      provider,
    });
  };

  const handleCenterLatChange = (value: string) => {
    const lat = parseFloat(value);
    if (!isNaN(lat)) {
      onChange({
        ...content,
        center: {
          ...content.center,
          lat,
        },
      });
    }
  };

  const handleCenterLngChange = (value: string) => {
    const lng = parseFloat(value);
    if (!isNaN(lng)) {
      onChange({
        ...content,
        center: {
          ...content.center,
          lng,
        },
      });
    }
  };

  const handleZoomChange = (value: string) => {
    const zoom = parseInt(value);
    if (!isNaN(zoom) && zoom >= 1 && zoom <= 21) {
      onChange({
        ...content,
        zoom,
      });
    }
  };

  const handleAddMarker = () => {
    if (!newMarkerTitle || !newMarkerLat || !newMarkerLng) {
      return;
    }

    const lat = parseFloat(newMarkerLat);
    const lng = parseFloat(newMarkerLng);

    if (isNaN(lat) || isNaN(lng)) {
      return;
    }

    const newMarker = {
      id: `marker-${Date.now()}`,
      lat,
      lng,
      title: newMarkerTitle,
      category: newMarkerCategory,
    };

    onChange({
      ...content,
      markers: [...content.markers, newMarker],
    });

    // Reset form
    setNewMarkerTitle('');
    setNewMarkerLat('');
    setNewMarkerLng('');
    setNewMarkerCategory('convenience');
  };

  const handleRemoveMarker = (markerId: string) => {
    onChange({
      ...content,
      markers: content.markers.filter((m) => m.id !== markerId),
    });
  };

  const handleMarkerLatChange = (markerId: string, value: string) => {
    const lat = parseFloat(value);
    if (!isNaN(lat)) {
      onChange({
        ...content,
        markers: content.markers.map((m) =>
          m.id === markerId ? { ...m, lat } : m
        ),
      });
    }
  };

  const handleMarkerLngChange = (markerId: string, value: string) => {
    const lng = parseFloat(value);
    if (!isNaN(lng)) {
      onChange({
        ...content,
        markers: content.markers.map((m) =>
          m.id === markerId ? { ...m, lng } : m
        ),
      });
    }
  };

  const handleMarkerTitleChange = (markerId: string, value: string) => {
    onChange({
      ...content,
      markers: content.markers.map((m) =>
        m.id === markerId ? { ...m, title: value } : m
      ),
    });
  };

  const handleMarkerCategoryChange = (markerId: string, category: MapContent['markers'][0]['category']) => {
    onChange({
      ...content,
      markers: content.markers.map((m) =>
        m.id === markerId ? { ...m, category } : m
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* 지도 설정 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            지도 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="provider">지도 제공자</Label>
            <Select value={content.provider} onValueChange={handleProviderChange}>
              <SelectTrigger id="provider" className="mt-1">
                <SelectValue placeholder="지도 제공자 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="naver">네이버 지도</SelectItem>
                <SelectItem value="kakao">카카오 지도</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="zoom">줌 레벨 (1-21)</Label>
            <Input
              id="zoom"
              type="number"
              min={1}
              max={21}
              value={content.zoom}
              onChange={(e) => handleZoomChange(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              권장: 15-18 (숙소 주변 표시)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 중심 좌표 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            중심 좌표
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="centerLat">위도</Label>
              <Input
                id="centerLat"
                type="number"
                step="0.0001"
                value={content.center.lat}
                onChange={(e) => handleCenterLatChange(e.target.value)}
                placeholder="37.5665"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="centerLng">경도</Label>
              <Input
                id="centerLng"
                type="number"
                step="0.0001"
                value={content.center.lng}
                onChange={(e) => handleCenterLngChange(e.target.value)}
                placeholder="126.9780"
                className="mt-1"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            💡 QuickInfo 블록의 좌표를 복사하여 사용하세요
          </p>
        </CardContent>
      </Card>

      {/* 마커 추가 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            마커 추가
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newMarkerTitle">장소 이름</Label>
            <Input
              id="newMarkerTitle"
              type="text"
              value={newMarkerTitle}
              onChange={(e) => setNewMarkerTitle(e.target.value)}
              placeholder="GS25 편의점"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="newMarkerCategory">카테고리</Label>
            <Select
              value={newMarkerCategory}
              onValueChange={(value) => setNewMarkerCategory(value as MapContent['markers'][0]['category'])}
            >
              <SelectTrigger id="newMarkerCategory" className="mt-1">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newMarkerLat">위도</Label>
              <Input
                id="newMarkerLat"
                type="number"
                step="0.0001"
                value={newMarkerLat}
                onChange={(e) => setNewMarkerLat(e.target.value)}
                placeholder="37.5665"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newMarkerLng">경도</Label>
              <Input
                id="newMarkerLng"
                type="number"
                step="0.0001"
                value={newMarkerLng}
                onChange={(e) => setNewMarkerLng(e.target.value)}
                placeholder="126.9780"
                className="mt-1"
              />
            </div>
          </div>

          <Button onClick={handleAddMarker} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            마커 추가
          </Button>
        </CardContent>
      </Card>

      {/* 마커 목록 섹션 */}
      {content.markers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>마커 목록 ({content.markers.length}개)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.markers.map((marker) => (
              <div
                key={marker.id}
                className="border rounded-lg p-4 space-y-3 relative"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveMarker(marker.id)}
                  aria-label="마커 삭제"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>

                <div>
                  <Label htmlFor={`marker-title-${marker.id}`}>장소 이름</Label>
                  <Input
                    id={`marker-title-${marker.id}`}
                    type="text"
                    value={marker.title}
                    onChange={(e) => handleMarkerTitleChange(marker.id, e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor={`marker-category-${marker.id}`}>카테고리</Label>
                  <Select
                    value={marker.category}
                    onValueChange={(value) =>
                      handleMarkerCategoryChange(marker.id, value as MapContent['markers'][0]['category'])
                    }
                  >
                    <SelectTrigger id={`marker-category-${marker.id}`} className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`marker-lat-${marker.id}`}>위도</Label>
                    <Input
                      id={`marker-lat-${marker.id}`}
                      type="number"
                      step="0.0001"
                      value={marker.lat}
                      onChange={(e) => handleMarkerLatChange(marker.id, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`marker-lng-${marker.id}`}>경도</Label>
                    <Input
                      id={`marker-lng-${marker.id}`}
                      type="number"
                      step="0.0001"
                      value={marker.lng}
                      onChange={(e) => handleMarkerLngChange(marker.id, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
