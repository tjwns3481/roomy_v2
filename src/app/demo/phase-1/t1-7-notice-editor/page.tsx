// @TASK P1-T1.7 - NoticeEditor 데모 페이지
// @SPEC docs/planning/06-tasks.md#P1-T1.7

'use client';

import { useState } from 'react';
import { NoticeEditor, NoticePreview } from '@/components/editor/blocks';
import { NoticeContent } from '@/types/block';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DEMO_STATES: Record<string, NoticeContent> = {
  info: {
    title: '체크인 안내',
    content: '체크인은 오후 3시부터 가능합니다.\n열쇠는 현관 비밀번호 박스에 있습니다.',
    type: 'info',
    dismissible: true,
  },
  warning: {
    title: '주차 공간 제한',
    content: '주차 공간은 1대만 가능합니다.\n대형 차량은 주차가 어려울 수 있으니 미리 확인해주세요.',
    type: 'warning',
    dismissible: true,
  },
  danger: {
    title: '화재 경보 주의',
    content: '화재 경보기가 매우 민감합니다.\n조리 시 환기를 충분히 해주시고, 흡연은 절대 금지입니다.',
    type: 'danger',
    dismissible: false,
  },
  empty: {
    title: '',
    content: '',
    type: 'info',
    dismissible: true,
  },
};

export default function NoticeEditorDemoPage() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('info');
  const [content, setContent] = useState<NoticeContent>(DEMO_STATES[state]);

  const handleStateChange = (newState: keyof typeof DEMO_STATES) => {
    setState(newState);
    setContent(DEMO_STATES[newState]);
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>P1-T1.7 - NoticeEditor 데모</CardTitle>
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
            <NoticeEditor content={content} onChange={setContent} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <NoticePreview content={content} />
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
