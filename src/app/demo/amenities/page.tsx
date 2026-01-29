// @TASK P1-T1.5 - AmenitiesBlock 데모 페이지
// @SPEC docs/planning/06-tasks.md#P1-T1.5

'use client';

import { useState } from 'react';
import { AmenitiesContent, DEFAULT_AMENITIES } from '@/types/block';
import { AmenitiesEditor } from '@/components/editor/blocks/AmenitiesEditor';
import { AmenitiesPreview } from '@/components/editor/blocks/AmenitiesPreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DEMO_STATES: Record<string, AmenitiesContent> = {
  empty: {
    items: [],
  },
  preset: {
    items: DEFAULT_AMENITIES,
  },
  partial: {
    items: [
      { id: '1', name: '무선 인터넷', icon: 'wifi', available: true },
      { id: '2', name: '에어컨', icon: 'snowflake', available: true },
      { id: '3', name: '난방', icon: 'flame', available: true },
      { id: '10', name: '욕조', icon: 'bathtub', available: false },
      { id: '11', name: '주차', icon: 'parking', available: false },
    ],
  },
  custom: {
    items: [
      { id: '1', name: '무선 인터넷', icon: 'wifi', available: true },
      { id: '2', name: '에어컨', icon: 'snowflake', available: true },
      { id: 'custom-1', name: '전기포트', icon: 'coffee', available: true },
      { id: 'custom-2', name: '식기세척기', icon: 'utensils', available: true },
    ],
  },
};

export default function AmenitiesDemoPage() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('partial');
  const [content, setContent] = useState<AmenitiesContent>(DEMO_STATES[state]);

  const handleStateChange = (newState: keyof typeof DEMO_STATES) => {
    setState(newState);
    setContent(DEMO_STATES[newState]);
  };

  return (
    <div className="container mx-auto min-h-screen p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AmenitiesBlock 데모</h1>
        <p className="mt-2 text-muted-foreground">
          편의시설 블록의 에디터와 프리뷰를 테스트합니다
        </p>
      </div>

      {/* 상태 선택기 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>데모 상태 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
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

      {/* 에디터 + 프리뷰 */}
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">에디터</TabsTrigger>
          <TabsTrigger value="preview">프리뷰</TabsTrigger>
          <TabsTrigger value="data">데이터</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AmenitiesEditor</CardTitle>
            </CardHeader>
            <CardContent>
              <AmenitiesEditor content={content} onChange={setContent} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AmenitiesPreview</CardTitle>
            </CardHeader>
            <CardContent>
              <AmenitiesPreview content={content} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>현재 데이터</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="rounded-lg bg-muted p-4 text-sm">
                {JSON.stringify(content, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
