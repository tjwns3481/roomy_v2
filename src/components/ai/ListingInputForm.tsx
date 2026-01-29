/**
 * @TASK P3-T3.3 - 숙소 정보 입력 폼 (URL / 수동)
 * @SPEC docs/planning/06-tasks.md#P3-T3.3
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { LinkIcon, PenToolIcon, Loader2Icon } from 'lucide-react';
import type { GenerationInputMode, GenerationInputData } from '@/types/ai-generate';

interface ListingInputFormProps {
  onSubmit: (data: GenerationInputData) => void;
  isLoading?: boolean;
}

/**
 * 숙소 정보 입력 폼
 *
 * 2가지 입력 방식:
 * 1. URL 입력: 에어비앤비 URL 붙여넣기
 * 2. 수동 입력: 숙소 정보 직접 입력
 */
export function ListingInputForm({ onSubmit, isLoading = false }: ListingInputFormProps) {
  const [mode, setMode] = useState<GenerationInputMode>('url');

  // URL 모드 상태
  const [url, setUrl] = useState('');

  // 수동 입력 모드 상태
  const [manualInput, setManualInput] = useState({
    title: '',
    description: '',
    address: '',
    checkIn: '15:00',
    checkOut: '11:00',
    amenities: [] as string[],
    houseRules: [] as string[],
    photos: [] as string[],
  });

  // 편의시설 프리셋
  const amenityOptions = [
    '무선 인터넷',
    '에어컨',
    '난방',
    'TV',
    '세탁기',
    '냉장고',
    '전자레인지',
    '헤어드라이어',
    '다리미',
    '욕조',
    '주차',
    '엘리베이터',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'url') {
      onSubmit({
        mode: 'url',
        url,
      });
    } else {
      onSubmit({
        mode: 'manual',
        ...manualInput,
      });
    }
  };

  const toggleAmenity = (amenity: string) => {
    setManualInput((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 입력 방식 선택 */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={cn(
            'flex-1 px-4 py-2 rounded-md font-medium transition-all',
            'flex items-center justify-center gap-2',
            mode === 'url'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <LinkIcon className="w-4 h-4" />
          URL 입력
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={cn(
            'flex-1 px-4 py-2 rounded-md font-medium transition-all',
            'flex items-center justify-center gap-2',
            mode === 'manual'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <PenToolIcon className="w-4 h-4" />
          수동 입력
        </button>
      </div>

      {/* URL 입력 모드 */}
      {mode === 'url' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">에어비앤비 URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://www.airbnb.co.kr/rooms/12345678"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={isLoading}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-2">
              에어비앤비 숙소 URL을 입력하면 자동으로 정보를 가져옵니다.
            </p>
          </div>
        </div>
      )}

      {/* 수동 입력 모드 */}
      {mode === 'manual' && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* 숙소명 */}
          <div>
            <Label htmlFor="title">숙소명 *</Label>
            <Input
              id="title"
              value={manualInput.title}
              onChange={(e) =>
                setManualInput((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="서울 강남 아파트"
              required
              disabled={isLoading}
              className="mt-2"
            />
          </div>

          {/* 숙소 설명 */}
          <div>
            <Label htmlFor="description">숙소 설명 *</Label>
            <textarea
              id="description"
              value={manualInput.description}
              onChange={(e) =>
                setManualInput((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="강남역 도보 5분, 깨끗하고 편안한 공간..."
              required
              disabled={isLoading}
              rows={4}
              className={cn(
                'w-full px-3 py-2 border border-input rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'mt-2'
              )}
            />
          </div>

          {/* 주소 */}
          <div>
            <Label htmlFor="address">주소 *</Label>
            <Input
              id="address"
              value={manualInput.address}
              onChange={(e) =>
                setManualInput((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="서울특별시 강남구 테헤란로 123"
              required
              disabled={isLoading}
              className="mt-2"
            />
          </div>

          {/* 체크인/아웃 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkIn">체크인</Label>
              <Input
                id="checkIn"
                type="time"
                value={manualInput.checkIn}
                onChange={(e) =>
                  setManualInput((prev) => ({ ...prev, checkIn: e.target.value }))
                }
                disabled={isLoading}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="checkOut">체크아웃</Label>
              <Input
                id="checkOut"
                type="time"
                value={manualInput.checkOut}
                onChange={(e) =>
                  setManualInput((prev) => ({ ...prev, checkOut: e.target.value }))
                }
                disabled={isLoading}
                className="mt-2"
              />
            </div>
          </div>

          {/* 편의시설 */}
          <div>
            <Label>편의시설</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {amenityOptions.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={manualInput.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                    disabled={isLoading}
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 제출 버튼 */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading || (mode === 'url' && !url)}
        >
          {isLoading && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
          AI로 가이드북 생성
        </Button>
      </div>
    </form>
  );
}
