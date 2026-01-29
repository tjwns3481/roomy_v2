// @TASK P1-T1.1 - 에디터 레이아웃 데모
// @SPEC docs/planning/06-tasks.md#P1-T1.1

'use client';

import { useState } from 'react';
import { EditorLayout } from '@/components/editor/EditorLayout';

const DEMO_STATES = {
  empty: {
    id: '1',
    title: '새 가이드북',
    slug: 'new-guide',
    blocks: [],
  },
  single: {
    id: '2',
    title: '단일 블록 가이드북',
    slug: 'single-block',
    blocks: [
      {
        id: '1',
        type: 'hero',
        order: 0,
        data: { title: '환영합니다' },
      },
    ],
  },
  normal: {
    id: '3',
    title: '서울 게스트하우스',
    slug: 'seoul-guesthouse',
    blocks: [
      {
        id: '1',
        type: 'hero',
        order: 0,
        data: {
          title: '환영합니다',
          subtitle: '편안한 숙박을 위한 안내',
        },
      },
      {
        id: '2',
        type: 'info',
        order: 1,
        data: {
          text: '체크인: 15:00 / 체크아웃: 11:00',
        },
      },
      {
        id: '3',
        type: 'wifi',
        order: 2,
        data: {
          ssid: 'Guest-WiFi',
          password: 'password123',
        },
      },
      {
        id: '4',
        type: 'map',
        order: 3,
        data: {
          address: '서울특별시 강남구 테헤란로 123',
        },
      },
    ],
  },
  many: {
    id: '4',
    title: '다수 블록 가이드북',
    slug: 'many-blocks',
    blocks: Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      type: i % 2 === 0 ? 'hero' : 'info',
      order: i,
      data: {
        title: `블록 ${i + 1}`,
        text: `내용 ${i + 1}`,
      },
    })),
  },
} as const;

export default function DemoPage() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('normal');

  return (
    <div className="h-screen flex flex-col">
      {/* 상태 선택기 */}
      <div className="bg-white border-b px-4 py-2 flex gap-2 items-center z-10">
        <span className="text-sm font-semibold text-gray-700 mr-2">
          데모 상태:
        </span>
        {Object.keys(DEMO_STATES).map((s) => (
          <button
            key={s}
            onClick={() => setState(s as keyof typeof DEMO_STATES)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              state === s
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s === 'empty' && '빈 가이드북'}
            {s === 'single' && '단일 블록'}
            {s === 'normal' && '일반 (3블록)'}
            {s === 'many' && '다수 (10블록)'}
          </button>
        ))}
      </div>

      {/* 컴포넌트 렌더링 */}
      <div className="flex-1 overflow-hidden">
        <EditorLayout guide={DEMO_STATES[state]} />
      </div>

      {/* 상태 정보 */}
      <div className="bg-gray-100 border-t px-4 py-2">
        <details>
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            현재 상태 정보
          </summary>
          <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(DEMO_STATES[state], null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
