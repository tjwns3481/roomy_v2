// @TASK P8-S9-T1 - 에디터 미리보기 개선
// @SPEC specs/screens/S-09-editor.yaml

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { DeviceFrame, DeviceType } from './DeviceFrame';
import { EditorBlock } from '@/hooks/useEditor';
import { Button } from '@/components/ui/button';
import { MonitorIcon, SmartphoneIcon, TabletIcon, MoonIcon, SunIcon } from 'lucide-react';

// 블록 Preview 컴포넌트 Import
import { HeroPreview } from './blocks/HeroPreview';
import { QuickInfoPreview } from './blocks/QuickInfoPreview';
import { RulesPreview } from './blocks/RulesPreview';
import { AmenitiesPreview } from './blocks/AmenitiesPreview';
import { MapPreview } from './blocks/MapPreview';
import { GalleryPreview } from './blocks/GalleryPreview';
import { NoticePreview } from './blocks/NoticePreview';

interface PreviewPanelProps {
  blocks: EditorBlock[];
  selectedBlockId: string | null;
  onBlockSelect: (blockId: string) => void;
}

/**
 * 블록별 Preview 렌더러
 */
function BlockPreviewRenderer({ block }: { block: EditorBlock }) {
  const content = block.content as any;

  switch (block.type) {
    case 'hero':
      return <HeroPreview content={content} />;
    case 'quickInfo':
      return <QuickInfoPreview content={content} />;
    case 'rules':
      return <RulesPreview content={content} />;
    case 'amenities':
      return <AmenitiesPreview content={content} />;
    case 'map':
      return <MapPreview content={content} />;
    case 'gallery':
      return <GalleryPreview content={content} />;
    case 'notice':
      return <NoticePreview content={content} />;
    case 'custom':
      return (
        <div className="p-4">
          {content.title && (
            <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
          )}
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content.content || '' }}
          />
        </div>
      );
    default:
      return (
        <div className="p-4 bg-gray-100 rounded-lg text-gray-500 text-sm">
          지원되지 않는 블록: {block.type}
        </div>
      );
  }
}

/**
 * 에디터 미리보기 패널
 * - 디바이스 크기 선택 (iPhone SE, iPhone 14, iPad)
 * - 라이트/다크 모드 토글
 * - 실시간 블록 렌더링
 * - 선택된 블록 하이라이트
 */
export function PreviewPanel({ blocks, selectedBlockId, onBlockSelect }: PreviewPanelProps) {
  const [device, setDevice] = useState<DeviceType>('iphone-14');
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        {/* 디바이스 선택 */}
        <div className="flex items-center gap-2">
          <Button
            variant={device === 'iphone-se' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDevice('iphone-se')}
            className="gap-2"
            aria-label="iPhone SE"
          >
            <SmartphoneIcon className="w-4 h-4" />
            <span className="hidden sm:inline">iPhone SE</span>
          </Button>
          <Button
            variant={device === 'iphone-14' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDevice('iphone-14')}
            className="gap-2"
            aria-label="iPhone 14"
          >
            <SmartphoneIcon className="w-4 h-4" />
            <span className="hidden sm:inline">iPhone 14</span>
          </Button>
          <Button
            variant={device === 'ipad' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDevice('ipad')}
            className="gap-2"
            aria-label="iPad"
          >
            <TabletIcon className="w-4 h-4" />
            <span className="hidden sm:inline">iPad</span>
          </Button>
        </div>

        {/* 다크모드 토글 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="gap-2"
          aria-label={isDarkMode ? '라이트 모드' : '다크 모드'}
        >
          {isDarkMode ? (
            <>
              <SunIcon className="w-4 h-4" />
              <span className="hidden sm:inline">라이트</span>
            </>
          ) : (
            <>
              <MoonIcon className="w-4 h-4" />
              <span className="hidden sm:inline">다크</span>
            </>
          )}
        </Button>
      </div>

      {/* 디바이스 프레임 */}
      <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center">
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <MonitorIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">블록을 추가하여 시작하세요</p>
          </div>
        ) : (
          <DeviceFrame device={device} isDarkMode={isDarkMode}>
            <div className="space-y-0">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  data-testid={`preview-block-${block.id}`}
                  className={cn(
                    'relative transition-all cursor-pointer',
                    selectedBlockId === block.id &&
                      'ring-2 ring-primary outline outline-2 outline-offset-2 outline-primary/30'
                  )}
                  onClick={() => onBlockSelect(block.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onBlockSelect(block.id);
                    }
                  }}
                >
                  <BlockPreviewRenderer block={block} />
                </div>
              ))}
            </div>
          </DeviceFrame>
        )}
      </div>
    </div>
  );
}
