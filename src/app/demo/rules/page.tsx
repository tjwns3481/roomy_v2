// @TASK P1-T1.6 - RulesBlock 데모 페이지
// @SPEC docs/planning/06-tasks.md#P1-T1.6

'use client';

import { useState } from 'react';
import { RulesEditor, RulesPreview } from '@/components/editor/blocks';
import { RulesContent } from '@/types/block';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function RulesDemoPage() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('korean');
  const [content, setContent] = useState<RulesContent>(DEMO_STATES.korean);

  const handleStateChange = (newState: keyof typeof DEMO_STATES) => {
    setState(newState);
    setContent(DEMO_STATES[newState]);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* 헤더 */}
        <Card>
          <CardHeader>
            <CardTitle>P1-T1.6: RulesBlock 데모</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {Object.keys(DEMO_STATES).map((s) => (
                  <Button
                    key={s}
                    onClick={() => handleStateChange(s as keyof typeof DEMO_STATES)}
                    variant={state === s ? 'default' : 'outline'}
                    size="sm"
                  >
                    {s}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                현재 상태: <strong>{state}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 에디터 & 미리보기 */}
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor">에디터</TabsTrigger>
            <TabsTrigger value="preview">미리보기</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>RulesEditor</CardTitle>
              </CardHeader>
              <CardContent>
                <RulesEditor content={content} onChange={setContent} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>RulesPreview</CardTitle>
              </CardHeader>
              <CardContent>
                <RulesPreview content={content} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="json" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>JSON Output</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm">
                  {JSON.stringify(content, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 상태 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>상태 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-semibold">섹션 개수</dt>
                <dd className="text-muted-foreground">{content.sections.length}</dd>
              </div>
              <div>
                <dt className="font-semibold">체크리스트 항목</dt>
                <dd className="text-muted-foreground">
                  {content.checkoutChecklist?.length || 0}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">마크다운 지원</dt>
                <dd className="text-muted-foreground">✅ 굵게, 기울임, 코드</dd>
              </div>
              <div>
                <dt className="font-semibold">한국 특화</dt>
                <dd className="text-muted-foreground">✅ 분리수거 템플릿</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
