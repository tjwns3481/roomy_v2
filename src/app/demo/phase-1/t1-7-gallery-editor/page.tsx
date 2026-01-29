// @TASK P1-T1.7 - GalleryEditor 데모 페이지
// @SPEC docs/planning/06-tasks.md#P1-T1.7

'use client';

import { useState } from 'react';
import { GalleryEditor, GalleryPreview } from '@/components/editor/blocks';
import { GalleryContent } from '@/types/block';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DEMO_STATES: Record<string, GalleryContent> = {
  empty: {
    images: [],
    layout: 'grid',
  },
  gridLayout: {
    images: [
      {
        id: 'img-1',
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        alt: '거실',
        caption: '넓고 밝은 거실',
      },
      {
        id: 'img-2',
        url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
        alt: '침실',
        caption: '편안한 침실',
      },
      {
        id: 'img-3',
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        alt: '주방',
        caption: '깔끔한 주방',
      },
      {
        id: 'img-4',
        url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800',
        alt: '욕실',
        caption: '깨끗한 욕실',
      },
    ],
    layout: 'grid',
  },
  sliderLayout: {
    images: [
      {
        id: 'img-1',
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        alt: '거실',
      },
      {
        id: 'img-2',
        url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
        alt: '침실',
      },
      {
        id: 'img-3',
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        alt: '주방',
      },
    ],
    layout: 'slider',
  },
};

export default function GalleryEditorDemoPage() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('gridLayout');
  const [content, setContent] = useState<GalleryContent>(DEMO_STATES[state]);

  const handleStateChange = (newState: keyof typeof DEMO_STATES) => {
    setState(newState);
    setContent(DEMO_STATES[newState]);
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>P1-T1.7 - GalleryEditor 데모</CardTitle>
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
            <GalleryEditor content={content} onChange={setContent} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <GalleryPreview content={content} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>현재 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(content, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
