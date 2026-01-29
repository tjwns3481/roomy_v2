// @TASK P2-T2.4 - MapBlock 데모 페이지
// @SPEC docs/planning/06-tasks.md#P2-T2.4

'use client';

import { useState } from 'react';
import { MapBlock } from '@/components/guest/blocks/MapBlock';
import { MapContent } from '@/types/guidebook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DEMO_STATES = {
  withCoordinates: {
    type: 'map' as const,
    lat: 37.5665,
    lng: 126.978,
    address: '서울특별시 중구 세종대로 110',
    parkingInfo: '지하 주차장 이용 가능 (1시간 2,000원)',
  },
  withoutCoordinates: {
    type: 'map' as const,
    lat: 0,
    lng: 0,
    address: '서울특별시 강남구 테헤란로 123',
  },
  noParking: {
    type: 'map' as const,
    lat: 37.5172,
    lng: 127.0473,
    address: '서울특별시 강남구 삼성동 159',
  },
  longAddress: {
    type: 'map' as const,
    lat: 37.5642135,
    lng: 127.0016985,
    address: '서울특별시 중구 남대문로5가 503 대우재단빌딩 지하 1층 카페',
    parkingInfo: '빌딩 지하 2층-4층 주차 가능 (유료, 건물 출입 시 할인권 받으세요)',
  },
} as const;

export default function MapBlockDemoPage() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('withCoordinates');

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold mb-2">P2-T2.4: MapBlock 데모</h1>
          <p className="text-muted-foreground">
            외부 지도 앱 연결 및 주소 복사 기능을 테스트합니다
          </p>
        </div>

        {/* 상태 선택기 */}
        <Card>
          <CardHeader>
            <CardTitle>데모 상태 선택</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.keys(DEMO_STATES).map((s) => (
              <Button
                key={s}
                onClick={() => setState(s as keyof typeof DEMO_STATES)}
                variant={state === s ? 'default' : 'outline'}
              >
                {s === 'withCoordinates' && '좌표 + 주차정보'}
                {s === 'withoutCoordinates' && '좌표 없음'}
                {s === 'noParking' && '주차정보 없음'}
                {s === 'longAddress' && '긴 주소 + 주차정보'}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* MapBlock 렌더링 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">컴포넌트 프리뷰</h2>
          <div className="max-w-md">
            <MapBlock content={DEMO_STATES[state]} />
          </div>
        </div>

        {/* 현재 상태 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>현재 상태 (JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
              {JSON.stringify(DEMO_STATES[state], null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* 테스트 가이드 */}
        <Card>
          <CardHeader>
            <CardTitle>테스트 가이드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">✅ 확인 사항</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>주소 복사 버튼 클릭 → 클립보드 복사 확인</li>
                <li>카카오맵 버튼 → 모바일: 앱 열림, 데스크톱: 새 탭</li>
                <li>네이버 지도 버튼 → 모바일: 앱 열림, 데스크톱: 새 탭</li>
                <li>구글 지도 버튼 → 새 탭으로 웹 열림</li>
                <li>좌표 없을 때 → 안내 메시지 표시</li>
                <li>주차 정보 있을 때 → Badge + 텍스트 표시</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">📱 모바일 테스트</h3>
              <p className="text-sm text-muted-foreground">
                Chrome DevTools에서 모바일 디바이스 모드로 전환하여 딥링크 동작을 확인하세요.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🎯 핵심 기능</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>외부 지도 앱 3개 (카카오맵, 네이버 지도, 구글 지도)</li>
                <li>모바일 딥링크 → 앱 열기 시도 → 실패 시 웹 폴백</li>
                <li>주소 클립보드 복사</li>
                <li>주차 정보 옵션 표시</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
