// @TASK P2-T2.2 - 게스트 블록 동적 렌더러
// @SPEC docs/planning/06-tasks.md#P2-T2.2

'use client';

import React from 'react';
import { BlockType } from '@/types/block';
import {
  HeroBlock,
  QuickInfoBlock,
  AmenitiesBlock,
  RulesBlock,
  GalleryBlock,
  NoticeBlock,
  CustomBlock,
} from './blocks';
import { MapBlock } from './blocks/MapBlock';

interface Block {
  id: string;
  type: BlockType | string;
  content: Record<string, unknown>;
  order_index: number;
  is_visible?: boolean;
}

interface BlockRendererProps {
  block: Block;
}

/**
 * 블록 타입에 따라 적절한 게스트 블록 컴포넌트를 렌더링
 */
export function BlockRenderer({ block }: BlockRendererProps) {
  const { type, content } = block;

  // 블록 타입별 렌더링
  switch (type) {
    case 'hero':
      return (
        <section id="hero" className="scroll-mt-16">
          <HeroBlock content={content as any} />
        </section>
      );

    case 'quickInfo':
      return (
        <section id="quickInfo" className="scroll-mt-16">
          <QuickInfoBlock content={content as any} />
        </section>
      );

    case 'amenities':
      return (
        <section id="amenities" className="scroll-mt-16">
          <AmenitiesBlock content={content as any} />
        </section>
      );

    case 'rules':
      return (
        <section id="rules" className="scroll-mt-16">
          <RulesBlock content={content as any} />
        </section>
      );

    case 'map':
      return (
        <section id="map" className="scroll-mt-16 px-4 py-6">
          <MapBlock content={content as any} />
        </section>
      );

    case 'gallery':
      return (
        <section id="gallery" className="scroll-mt-16">
          <GalleryBlock content={content as any} />
        </section>
      );

    case 'notice':
      return (
        <section id="notice" className="scroll-mt-16">
          <NoticeBlock content={content as any} />
        </section>
      );

    case 'custom':
      return (
        <section id={`custom-${block.id}`} className="scroll-mt-16">
          <CustomBlock content={content as any} />
        </section>
      );

    default:
      // 알 수 없는 블록 타입은 숨김 처리
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg mx-4 my-2">
            <p className="text-sm text-yellow-700">
              알 수 없는 블록 타입: {type}
            </p>
          </div>
        );
      }
      return null;
  }
}

interface BlockListProps {
  blocks: Block[];
}

/**
 * 블록 목록을 순서대로 렌더링
 */
export function BlockList({ blocks }: BlockListProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-muted-foreground">아직 작성된 내용이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
