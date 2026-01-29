// @TASK P2-T2.3 - QuickInfo 카드 데모 페이지
// @SPEC docs/planning/06-tasks.md#P2-T2.3

'use client';

import { useState } from 'react';
import { QuickInfoBlock } from '@/components/guest/blocks/QuickInfoBlock';
import { QuickInfoContent } from '@/types/block';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const DEMO_STATES = {
  complete: {
    checkIn: '15:00',
    checkOut: '11:00',
    wifi: {
      ssid: 'GuestWifi_5G',
      password: 'welcome2024!',
    },
    doorLock: {
      password: '1234',
      instructions: '숫자 4자리 입력 후 # 버튼을 눌러주세요',
    },
    address: '서울시 강남구 테헤란로 123, 456호',
    coordinates: {
      lat: 37.5665,
      lng: 126.978,
    },
  } as QuickInfoContent,

  noWifi: {
    checkIn: '14:00',
    checkOut: '12:00',
    address: '부산시 해운대구 해운대해변로 264',
  } as QuickInfoContent,

  noDoorLock: {
    checkIn: '16:00',
    checkOut: '10:00',
    wifi: {
      ssid: 'MyAirbnb_WiFi',
      password: 'airbnb123',
    },
    address: '제주특별자치도 제주시 애월읍 애월해안로 123',
  } as QuickInfoContent,

  minimal: {
    checkIn: '15:00',
    checkOut: '11:00',
    address: '경기도 성남시 분당구 판교역로 123',
  } as QuickInfoContent,
} as const;

export default function QuickInfoDemoPage() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('complete');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">QuickInfo Block Demo</h1>
          <p className="text-muted-foreground">
            P2-T2.3 - QuickInfo 카드 UI (복사 버튼 포함)
          </p>
        </div>

        {/* State Selector */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">데모 상태 선택</h2>
          <div className="flex flex-wrap gap-2">
            {Object.keys(DEMO_STATES).map((s) => (
              <Button
                key={s}
                onClick={() => setState(s as keyof typeof DEMO_STATES)}
                variant={state === s ? 'default' : 'outline'}
                size="sm"
              >
                {s === 'complete' && '✅ 전체 정보'}
                {s === 'noWifi' && '📵 WiFi 없음'}
                {s === 'noDoorLock' && '🚪 도어락 없음'}
                {s === 'minimal' && '📝 최소 정보'}
              </Button>
            ))}
          </div>
        </Card>

        {/* Component Preview */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">컴포넌트 렌더링</h2>
          <QuickInfoBlock content={DEMO_STATES[state]} />
        </div>

        {/* State Information */}
        <Card className="p-6">
          <h2 className="font-semibold mb-3">현재 Props</h2>
          <pre className="bg-secondary/50 p-4 rounded-lg text-xs overflow-auto">
            {JSON.stringify(DEMO_STATES[state], null, 2)}
          </pre>
        </Card>

        {/* Feature List */}
        <Card className="p-6">
          <h2 className="font-semibold mb-3">구현된 기능</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>체크인/체크아웃 시간 카드 형태로 표시</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>WiFi SSID 복사 버튼</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>WiFi 비밀번호 표시/숨김 토글 (Eye/EyeOff 아이콘)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>WiFi 비밀번호 복사 버튼</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>도어락 비밀번호 표시/숨김 토글</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>도어락 사용 방법 안내</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>주소 복사 버튼</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>복사 성공 시 토스트 알림 (sonner)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>복사 후 버튼 상태 변경 (Copy → Check)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>모바일 최적화 터치 영역 (44×44px 이상)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>접근성: aria-label 설정</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>shadcn/ui Card 컴포넌트 활용</span>
            </li>
          </ul>
        </Card>

        {/* Usage Instructions */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <h2 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">
            사용 방법
          </h2>
          <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>1. 위의 버튼으로 다양한 상태를 테스트하세요</li>
            <li>2. 복사 버튼을 클릭하여 클립보드 복사를 확인하세요</li>
            <li>3. 눈 아이콘을 클릭하여 비밀번호 표시/숨김을 확인하세요</li>
            <li>4. 모바일 화면에서도 터치 영역이 충분한지 확인하세요</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
