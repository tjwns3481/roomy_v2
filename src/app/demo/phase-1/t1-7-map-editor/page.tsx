// @TASK P1-T1.7 - MapEditor 데모 페이지
// @SPEC docs/planning/06-tasks.md#P1-T1.7

'use client';

import { useState } from 'react';
import { MapEditor, MapPreview } from '@/components/editor/blocks';
import { MapContent } from '@/types/block';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DEMO_STATES: Record<string, MapContent> = {
  empty: {
    center: { lat: 37.5665, lng: 126.978 },
    zoom: 15,
    markers: [],
    provider: 'naver',
  },
  withMarkers: {
    center: { lat: 37.5665, lng: 126.978 },
    zoom: 16,
    markers: [
      {
        id: 'marker-1',
        lat: 37.5665,
        lng: 126.978,
        title: '숙소 위치',
        category: 'accommodation',
      },
      {
        id: 'marker-2',
        lat: 37.5675,
        lng: 126.979,
        title: 'GS25 편의점',
        category: 'convenience',
      },
      {
        id: 'marker-3',
        lat: 37.5655,
        lng: 126.977,
        title: '맛있는 식당',
        category: 'restaurant',
      },
    ],
    provider: 'naver',
  },
  kakaoMap: {
    center: { lat: 37.5665, lng: 126.978 },
    zoom: 17,
    markers: [
      {
        id: 'marker-1',
        lat: 37.5665,
        lng: 126.978,
        title: '숙소 위치',
        category: 'accommodation',
      },
    ],
    provider: 'kakao',
  },
};

export default function MapEditorDemoPage() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('withMarkers');
  const [content, setContent] = useState<MapContent>(DEMO_STATES[state]);

  const handleStateChange = (newState: keyof typeof DEMO_STATES) => {
    setState(newState);
    setContent(DEMO_STATES[newState]);
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>P1-T1.7 - MapEditor 데모</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {Object.keys(DEMO_STATES).map((s) => (
                <Button
                  key={s}
                  onClick={() => handleStateChange(s as keyof typeof DEMO_STATES)}
                  variant={state === s ? 'default' : 'outline'}
                >
                  {s}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Editor</h3>
            <MapEditor content={content} onChange={setContent} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <MapPreview content={content} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>현재 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(content, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
