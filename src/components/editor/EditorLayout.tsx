// @TASK P1-T1.1 - 에디터 레이아웃 (3단: TOC + Editor + Preview)
// @SPEC docs/planning/06-tasks.md#P1-T1.1

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import type { Guide } from '@/types/editor';

interface EditorLayoutProps {
  guide: Guide;
}

export function EditorLayout({ guide }: EditorLayoutProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    guide.blocks[0]?.id || null
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 모바일 탭 (< lg) */}
      <div className="lg:hidden border-b bg-white px-4 py-2 flex gap-2">
        <button
          role="tab"
          aria-selected={activeTab === 'editor'}
          onClick={() => setActiveTab('editor')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeTab === 'editor'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700'
          )}
        >
          편집
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'preview'}
          onClick={() => setActiveTab('preview')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700'
          )}
        >
          미리보기
        </button>
      </div>

      {/* 3단 레이아웃 (Desktop) */}
      <div
        data-testid="editor-layout-container"
        className={cn(
          'flex-1 grid',
          'grid-cols-1', // 모바일
          'lg:grid-cols-[240px_1fr_375px]', // 데스크톱
          'gap-0'
        )}
      >
        {/* TOC Sidebar */}
        <aside
          data-testid="toc-sidebar"
          className={cn(
            'bg-white border-r overflow-y-auto',
            activeTab === 'preview' && 'hidden lg:block'
          )}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">블록</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                aria-label="블록 추가"
              >
                <PlusIcon className="w-4 h-4" />
                추가
              </Button>
            </div>

            {/* 블록 목록 */}
            <div className="space-y-2">
              {guide.blocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg transition-colors',
                    'hover:bg-gray-100',
                    selectedBlockId === block.id
                      ? 'bg-primary-light border border-primary'
                      : 'border border-transparent'
                  )}
                >
                  <div className="font-medium text-sm">
                    {block.data.title || block.data.text || block.type}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {block.type}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Editor Panel */}
        <main
          data-testid="editor-panel"
          className={cn(
            'bg-white overflow-y-auto p-6',
            activeTab === 'preview' && 'hidden lg:block'
          )}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{guide.title}</h1>
              <div
                className="text-sm text-gray-500"
                aria-live="polite"
                aria-atomic="true"
              >
                저장됨
              </div>
            </div>

            {/* 선택된 블록 에디터 (P1-T1.2에서 구현) */}
            <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              <p>블록 에디터 영역</p>
              <p className="text-sm mt-2">
                선택된 블록: {selectedBlockId || '없음'}
              </p>
            </div>
          </div>
        </main>

        {/* Preview Panel */}
        <aside
          data-testid="preview-panel"
          className={cn(
            'bg-gray-100 overflow-y-auto flex items-start justify-center p-4',
            activeTab === 'editor' && 'hidden lg:flex'
          )}
        >
          {/* iPhone 프레임 */}
          <div
            className={cn(
              'iphone-frame',
              'w-full max-w-[375px]',
              'bg-white rounded-[40px] shadow-xl',
              'border-[12px] border-black',
              'relative',
              'overflow-hidden'
            )}
          >
            {/* 노치 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-black rounded-b-3xl z-10" />

            {/* 스크린 */}
            <div className="h-[667px] overflow-y-auto bg-gray-50">
              <div className="p-4 space-y-4">
                {guide.blocks.map((block) => (
                  <div
                    key={block.id}
                    className="bg-white rounded-lg p-4 shadow-sm"
                  >
                    <div className="font-semibold">
                      {block.data.title || block.data.text || block.type}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {block.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 홈 인디케이터 */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full" />
          </div>
        </aside>
      </div>
    </div>
  );
}
