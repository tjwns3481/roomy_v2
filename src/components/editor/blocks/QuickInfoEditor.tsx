// @TASK P1-T1.4 - QuickInfoEditor 컴포넌트
// @SPEC docs/planning/06-tasks.md#P1-T1.4

'use client';

import { useState } from 'react';
import { QuickInfoContent } from '@/types/blocks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Clock, Wifi, Lock, MapPin } from 'lucide-react';

interface QuickInfoEditorProps {
  content: QuickInfoContent;
  onChange: (content: QuickInfoContent) => void;
}

export function QuickInfoEditor({ content, onChange }: QuickInfoEditorProps) {
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const [showDoorLockPassword, setShowDoorLockPassword] = useState(false);

  const handleCheckInChange = (value: string) => {
    onChange({
      ...content,
      checkIn: value,
    });
  };

  const handleCheckOutChange = (value: string) => {
    onChange({
      ...content,
      checkOut: value,
    });
  };

  const handleWifiSsidChange = (value: string) => {
    onChange({
      ...content,
      wifi: {
        ssid: value,
        password: content.wifi?.password || '',
      },
    });
  };

  const handleWifiPasswordChange = (value: string) => {
    onChange({
      ...content,
      wifi: {
        ssid: content.wifi?.ssid || '',
        password: value,
      },
    });
  };

  const handleDoorLockPasswordChange = (value: string) => {
    onChange({
      ...content,
      doorLock: {
        password: value,
        instructions: content.doorLock?.instructions,
      },
    });
  };

  const handleDoorLockInstructionsChange = (value: string) => {
    onChange({
      ...content,
      doorLock: {
        password: content.doorLock?.password || '',
        instructions: value,
      },
    });
  };

  const handleAddressChange = (value: string) => {
    onChange({
      ...content,
      address: value,
    });
  };

  const handleLatChange = (value: string) => {
    const lat = parseFloat(value);
    if (!isNaN(lat)) {
      onChange({
        ...content,
        coordinates: {
          lat,
          lng: content.coordinates?.lng || 0,
        },
      });
    }
  };

  const handleLngChange = (value: string) => {
    const lng = parseFloat(value);
    if (!isNaN(lng)) {
      onChange({
        ...content,
        coordinates: {
          lat: content.coordinates?.lat || 0,
          lng,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 체크인/체크아웃 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            체크인/체크아웃
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="checkIn">체크인 시간</Label>
            <Input
              id="checkIn"
              type="time"
              value={content.checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="checkOut">체크아웃 시간</Label>
            <Input
              id="checkOut"
              type="time"
              value={content.checkOut}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* 와이파이 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            와이파이 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="wifiSsid">SSID</Label>
            <Input
              id="wifiSsid"
              type="text"
              value={content.wifi?.ssid || ''}
              onChange={(e) => handleWifiSsidChange(e.target.value)}
              placeholder="네트워크 이름"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="wifiPassword">와이파이 비밀번호</Label>
            <div className="relative mt-1">
              <Input
                id="wifiPassword"
                type={showWifiPassword ? 'text' : 'password'}
                value={content.wifi?.password || ''}
                onChange={(e) => handleWifiPasswordChange(e.target.value)}
                placeholder="비밀번호"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowWifiPassword(!showWifiPassword)}
                aria-label={showWifiPassword ? '비밀번호 숨김' : '비밀번호 표시'}
              >
                {showWifiPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 도어락 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            도어락 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="doorLockPassword">도어락 비밀번호</Label>
            <div className="relative mt-1">
              <Input
                id="doorLockPassword"
                type={showDoorLockPassword ? 'text' : 'password'}
                value={content.doorLock?.password || ''}
                onChange={(e) => handleDoorLockPasswordChange(e.target.value)}
                placeholder="비밀번호"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowDoorLockPassword(!showDoorLockPassword)}
                aria-label={showDoorLockPassword ? '비밀번호 숨김' : '비밀번호 표시'}
              >
                {showDoorLockPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="doorLockInstructions">사용 방법</Label>
            <Textarea
              id="doorLockInstructions"
              value={content.doorLock?.instructions || ''}
              onChange={(e) => handleDoorLockInstructionsChange(e.target.value)}
              placeholder="도어락 사용 방법을 입력하세요"
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* 주소/좌표 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            위치 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">주소</Label>
            <Input
              id="address"
              type="text"
              value={content.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="서울시 강남구 테헤란로 123"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">위도</Label>
              <Input
                id="lat"
                type="number"
                step="0.0001"
                value={content.coordinates?.lat || ''}
                onChange={(e) => handleLatChange(e.target.value)}
                placeholder="37.5665"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lng">경도</Label>
              <Input
                id="lng"
                type="number"
                step="0.0001"
                value={content.coordinates?.lng || ''}
                onChange={(e) => handleLngChange(e.target.value)}
                placeholder="126.9780"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
