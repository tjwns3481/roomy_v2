// @TASK P2-T2.2, P7-T7.8 - 블록 타입별 렌더러 + 동적 임포트
// @SPEC docs/planning/06-tasks.md#P2-T2.2

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Block } from '@/types/guidebook';
import {
  HeroBlock,
  QuickInfoBlock,
  AmenitiesBlock,
  RulesBlock,
  NoticeBlock,
  CustomBlock,
} from './blocks';
import { Skeleton } from '@/components/ui/skeleton';

// @TASK P7-T7.8 - 무거운 컴포넌트 동적 로딩 (지도, 갤러리)
const MapBlock = dynamic(() => import('./blocks/MapBlock').then(mod => ({ default: mod.MapBlock })), {
  loading: () => (
    <div className="p-6 space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  ),
  ssr: false, // 지도는 클라이언트에서만 렌더링
});

const GalleryBlock = dynamic(() => import('./blocks/GalleryBlock').then(mod => ({ default: mod.GalleryBlock })), {
  loading: () => (
    <div className="p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
      </div>
    </div>
  ),
  ssr: true, // 갤러리는 SEO를 위해 SSR 유지
});

interface BlockRendererProps {
  block: Block;
}

/**
 * 블록 타입에 따라 적절한 게스트 블록 컴포넌트를 렌더링
 * - 타입 안전성 보장
 * - 8종 블록 타입 지원
 */
export function BlockRenderer({ block }: BlockRendererProps) {
  // 비활성화된 블록은 렌더링하지 않음
  if (!block.is_visible) {
    return null;
  }

  // 블록 컴포넌트들이 서로 다른 타입 정의를 사용하므로 타입 검사 우회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = block.content as any;

  switch (block.type) {
    case 'hero':
      return <HeroBlock content={content} />;
    case 'quickInfo':
      return <QuickInfoBlock content={content} />;
    case 'amenities':
      return <AmenitiesBlock content={content} />;
    case 'rules':
      return <RulesBlock content={content} />;
    case 'map':
      return <MapBlock content={content} />;
    case 'gallery':
      return <GalleryBlock content={content} />;
    case 'notice':
      return <NoticeBlock content={content} />;
    case 'custom':
      return <CustomBlock content={content} />;
    default:
      console.warn(`Unknown block type: ${block.type}`);
      return null;
  }
}
