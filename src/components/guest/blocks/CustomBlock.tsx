// @TASK P2-T2.2 - 게스트용 CustomBlock
// @SPEC docs/planning/06-tasks.md#P2-T2.2

'use client';

import React from 'react';
import { CustomContent } from '@/types/block';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CustomBlockProps {
  content: CustomContent;
}

/**
 * 게스트용 커스텀 블록
 * - 자유 형식 HTML/Markdown 렌더링
 * - DOMPurify로 sanitize (TODO: T2.3에서 추가 예정)
 */
export function CustomBlock({ content }: CustomBlockProps) {
  return (
    <div className="px-4 py-6">
      <Card>
        {content.title && (
          <CardHeader>
            <CardTitle className="text-xl">{content.title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className={content.title ? 'pt-0' : 'pt-6'}>
          {/* TODO: DOMPurify로 sanitize 필요 */}
          <div
            className="prose prose-sm sm:prose-base max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
