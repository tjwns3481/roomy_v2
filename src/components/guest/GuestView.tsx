// @TASK P2-T2.2 - 게스트 뷰 (전체 가이드북 렌더링)
// @SPEC docs/planning/06-tasks.md#P2-T2.2

'use client';

import React from 'react';
import { Guidebook, Block } from '@/types/guidebook';
import { BlockRenderer } from './BlockRenderer';

interface GuestViewProps {
  guidebook: Guidebook;
  blocks: Block[];
}

/**
 * 게스트용 가이드북 전체 뷰
 * - 블록 순서대로 렌더링
 * - 테마 적용
 * - 모바일 최적화
 */
export function GuestView({ guidebook, blocks }: GuestViewProps) {
  // order_index로 정렬
  const sortedBlocks = [...blocks].sort((a, b) => a.order_index - b.order_index);

  // 테마 CSS 변수 적용
  const themeStyle = {
    '--primary-color': guidebook.primary_color,
    '--secondary-color': guidebook.secondary_color,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-background" style={themeStyle}>
      {/* 가이드북 메타데이터 (SEO) */}
      <div className="sr-only">
        <h1>{guidebook.title}</h1>
        {guidebook.description && <p>{guidebook.description}</p>}
      </div>

      {/* 블록 렌더링 */}
      <div className="max-w-4xl mx-auto">
        {sortedBlocks.map((block) => (
          <div key={block.id} className="block-item">
            <BlockRenderer block={block} />
          </div>
        ))}
      </div>

      {/* 빈 상태 */}
      {sortedBlocks.length === 0 && (
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{guidebook.title}</h2>
            <p className="text-muted-foreground">
              아직 추가된 콘텐츠가 없습니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
