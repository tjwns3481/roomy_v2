// @TASK P1-T1.6 - RulesEditor 데모 페이지
// @SPEC docs/planning/06-tasks.md#P1-T1.6

'use client';

import { useState } from 'react';
import { RulesEditor, RulesPreview } from '@/components/editor/blocks';
import { RulesContent } from '@/types/block';

const DEMO_STATES = {
  empty: {
    sections: [],
  } as RulesContent,
  minimal: {
    sections: [
      {
        id: 'section-1',
        title: '하우스 룰',
        icon: 'home',
        items: ['실내 금연', '반려동물 동반 불가'],
      },
    ],
  } as RulesContent,
  korean: {
    sections: [
      {
        id: 'waste-separation',
        title: '분리수거 안내',
        icon: 'recycle',
        items: [
          '**일반 쓰레기**: 음식물 외 모든 쓰레기 (종량제 봉투 사용)',
          '**음식물 쓰레기**: 물기를 제거한 후 음식물 전용 봉투에 버려주세요',
          '**재활용**: 플라스틱, 종이, 유리, 캔 등 깨끗이 세척 후 분리',
          '**대형 폐기물**: 사전 신고 필요 (관리사무소 문의)',
        ],
      },
      {
        id: 'house-rules',
        title: '하우스 룰',
        icon: 'home',
        items: [
          '**흡연 금지**: 실내 및 베란다 흡연 금지',
          '**소음 주의**: 밤 10시 ~ 오전 8시 조용히 해주세요',
          '**파티 금지**: 허가되지 않은 파티/행사 금지',
          '**반려동물**: 사전 허가 필요',
        ],
      },
    ],
    checkoutChecklist: [
      '설거지 및 정리',
      '쓰레기 분리수거',
      '모든 창문 닫기',
      '에어컨/히터 끄기',
      '현관 비밀번호 확인 후 열쇠 반납',
    ],
  } as RulesContent,
  full: {
    sections: [
      {
        id: 'section-1',
        title: '분리수거 안내',
        icon: 'recycle',
        items: [
          '**일반 쓰레기**: 종량제 봉투 사용 (편의점/마트에서 구매 가능)',
          '**음식물 쓰레기**: 물기를 제거한 후 음식물 전용 봉투에 버려주세요',
          '**재활용**: 플라스틱, 종이, 유리, 캔 등 *깨끗이 세척* 후 분리',
          '**대형 폐기물**: 사전 신고 필요 (관리사무소 `02-1234-5678`)',
        ],
      },
      {
        id: 'section-2',
        title: '하우스 룰',
        icon: 'home',
        items: [
          '**흡연 금지**: 실내 및 베란다 모두 금연입니다',
          '**소음 주의**: 밤 `22:00` ~ 오전 `08:00` 조용히 해주세요',
          '**파티 금지**: 허가되지 않은 파티/행사 금지',
          '**인원 제한**: 예약 인원 외 추가 게스트 불가',
          '**반려동물**: 사전 허가 필요 (소형견만 가능)',
        ],
      },
      {
        id: 'section-3',
        title: '유용한 팁',
        icon: 'bulb',
        items: [
          '*편의점*: 도보 3분 거리에 GS25, CU 있습니다',
          '*교통*: 지하철 2호선 강남역 5번 출구에서 도보 10분',
          '*맛집*: 근처 추천 식당 정보는 맵 블록을 참고하세요',
        ],
      },
    ],
    checkoutChecklist: [
      '설거지 및 정리',
      '쓰레기 분리수거',
      '모든 창문 닫기',
      '에어컨/히터/전등 끄기',
      '현관 비밀번호 확인 후 열쇠 반납',
    ],
  } as RulesContent,
} as const;

export default function RulesEditorDemoPage() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('korean');
  const [content, setContent] = useState<RulesContent>(DEMO_STATES.korean);

  const handleStateChange = (newState: keyof typeof DEMO_STATES) => {
    setState(newState);
    setContent(DEMO_STATES[newState]);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* 상태 선택기 */}
        <div className="mb-4 flex gap-2">
          {Object.keys(DEMO_STATES).map((s) => (
            <button
              key={s}
              onClick={() => handleStateChange(s as keyof typeof DEMO_STATES)}
              className={
                state === s
                  ? 'rounded bg-blue-600 px-4 py-2 text-white'
                  : 'rounded bg-gray-200 px-4 py-2'
              }
            >
              {s}
            </button>
          ))}
        </div>

        {/* 에디터 */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">RulesEditor</h2>
          <RulesEditor content={content} onChange={setContent} />
        </div>

        {/* 미리보기 */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">RulesPreview</h2>
          <RulesPreview content={content} />
        </div>

        {/* 상태 정보 */}
        <div className="rounded bg-gray-100 p-4">
          <h3 className="mb-2 font-semibold">현재 상태</h3>
          <pre className="overflow-auto text-sm">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
