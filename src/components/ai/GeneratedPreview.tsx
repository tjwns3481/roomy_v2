/**
 * @TASK P3-T3.3 - AI 생성 결과 미리보기
 * @SPEC docs/planning/06-tasks.md#P3-T3.3
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CheckCircle2Icon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
  SparklesIcon,
} from 'lucide-react';
import type { Block } from '@/types/guidebook';

interface GeneratedPreviewProps {
  blocks: Block[];
  onApply: (blocks: Block[]) => void;
  onCancel: () => void;
}

/**
 * 블록 타입별 아이콘
 */
const BLOCK_TYPE_ICONS: Record<string, string> = {
  hero: '🏠',
  quickInfo: '📋',
  amenities: '✨',
  rules: '📌',
  map: '🗺️',
  gallery: '🖼️',
  notice: '📢',
  custom: '✏️',
};

/**
 * 블록 타입별 이름
 */
const BLOCK_TYPE_NAMES: Record<string, string> = {
  hero: '히어로 섹션',
  quickInfo: '빠른 정보',
  amenities: '편의시설',
  rules: '이용 규칙',
  map: '지도',
  gallery: '갤러리',
  notice: '공지사항',
  custom: '커스텀',
};

/**
 * AI 생성 결과 미리보기
 *
 * 생성된 블록 목록을 보여주고 수정/삭제/적용 옵션을 제공합니다.
 */
export function GeneratedPreview({ blocks, onApply, onCancel }: GeneratedPreviewProps) {
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(
    new Set(blocks.map((b) => b.id))
  );

  const toggleBlock = (blockId: string) => {
    setSelectedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  };

  const handleApply = () => {
    const blocksToApply = blocks.filter((b) => selectedBlocks.has(b.id));
    onApply(blocksToApply);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
          <CheckCircle2Icon className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">가이드북 생성 완료!</h3>
        <p className="text-sm text-gray-500">
          총 {blocks.length}개의 블록이 생성되었습니다. 원하는 블록을 선택하여 적용하세요.
        </p>
      </div>

      {/* 블록 목록 */}
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
        {blocks.map((block, index) => {
          const isSelected = selectedBlocks.has(block.id);
          const icon = BLOCK_TYPE_ICONS[block.type] || '📄';
          const typeName = BLOCK_TYPE_NAMES[block.type] || block.type;

          return (
            <div
              key={block.id}
              className={cn(
                'relative p-4 border rounded-lg transition-all',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 bg-white opacity-60'
              )}
            >
              {/* 선택 체크박스 */}
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={() => toggleBlock(block.id)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white text-transparent hover:border-primary'
                  )}
                  aria-label={
                    isSelected ? '블록 선택 해제' : '블록 선택'
                  }
                >
                  {isSelected ? '✓' : ''}
                </button>
              </div>

              {/* 블록 정보 */}
              <div className="pr-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="font-semibold">
                      {index + 1}. {typeName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {block.type}
                    </div>
                  </div>
                </div>

                {/* 블록 내용 미리보기 */}
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600 max-h-24 overflow-hidden">
                  {JSON.stringify(block.content, null, 2)
                    .slice(0, 200)
                    .split('\n')
                    .slice(0, 3)
                    .join('\n')}
                  ...
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 선택 통계 */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <SparklesIcon className="w-4 h-4 text-blue-600" />
          <span className="text-blue-900">
            <strong>{selectedBlocks.size}개</strong> 블록 선택됨
          </span>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          onClick={handleApply}
          disabled={selectedBlocks.size === 0}
          className="flex-1"
        >
          <CheckCircle2Icon className="w-4 h-4 mr-2" />
          적용하기 ({selectedBlocks.size}개)
        </Button>
      </div>
    </div>
  );
}
