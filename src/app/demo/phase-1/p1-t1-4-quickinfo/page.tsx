// @TASK P1-T1.4 - QuickInfoEditor 데모 페이지
// @SPEC docs/planning/06-tasks.md#P1-T1.4

'use client';

import { useState } from 'react';
import { QuickInfoEditor } from '@/components/editor/blocks/QuickInfoEditor';
import { QuickInfoPreview } from '@/components/editor/blocks/QuickInfoPreview';
import { QuickInfoContent } from '@/types/blocks';

const DEMO_STATES = {
  normal: {
    checkIn: '15:00',
    checkOut: '11:00',
    address: '서울시 강남구 테헤란로 123',
    wifi: {
      ssid: 'MyWiFi',
      password: 'password123',
    },
    doorLock: {
      password: '1234',
      instructions: '도어락을 눌러주세요',
    },
    coordinates: {
      lat: 37.5665,
      lng: 126.9780,
    },
  } as QuickInfoContent,
  minimal: {
    checkIn: '14:00',
    checkOut: '12:00',
    address: '서울시 종로구 종로 1',
  } as QuickInfoContent,
  withoutWifi: {
    checkIn: '16:00',
    checkOut: '10:00',
    address: '부산시 해운대구 해운대로 100',
    doorLock: {
      password: '5678',
      instructions: '# 버튼을 누른 후 비밀번호를 입력하세요',
    },
    coordinates: {
      lat: 35.1586,
      lng: 129.1603,
    },
  } as QuickInfoContent,
  withoutDoorLock: {
    checkIn: '15:00',
    checkOut: '11:00',
    address: '제주시 첨단로 213',
    wifi: {
      ssid: 'Jeju-WiFi',
      password: 'jeju2024!',
    },
    coordinates: {
      lat: 33.4996,
      lng: 126.5312,
    },
  } as QuickInfoContent,
} as const;

export default function QuickInfoEditorDemoPage() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('normal');
  const [content, setContent] = useState<QuickInfoContent>(DEMO_STATES.normal);

  const handleStateChange = (newState: keyof typeof DEMO_STATES) => {
    setState(newState);
    setContent(DEMO_STATES[newState]);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">QuickInfoEditor Demo</h1>
          <p className="mt-2 text-muted-foreground">
            P1-T1.4: 체크인/체크아웃, 와이파이, 도어락, 주소 정보 에디터
          </p>
        </div>

        {/* 상태 선택기 */}
        <div className="mb-6 flex gap-2">
          {Object.keys(DEMO_STATES).map((s) => (
            <button
              key={s}
              onClick={() => handleStateChange(s as keyof typeof DEMO_STATES)}
              className={`rounded px-4 py-2 font-medium transition-colors ${
                state === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* 에디터 & 프리뷰 */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* 에디터 */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold">에디터</h2>
            <QuickInfoEditor content={content} onChange={setContent} />
          </div>

          {/* 프리뷰 */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold">프리뷰</h2>
            <QuickInfoPreview content={content} />

            {/* 현재 상태 JSON */}
            <div className="mt-6">
              <h3 className="mb-2 text-lg font-medium">현재 상태 (JSON)</h3>
              <pre className="rounded-lg bg-muted p-4 text-sm">
                {JSON.stringify(content, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
