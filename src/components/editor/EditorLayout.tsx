// @TASK P1-T1.1 - 에디터 레이아웃 (3단: TOC + Editor + Preview)
// @TASK Editor-Fix - 블록 에디터 통합
// @TASK P8-S9-T1 - 에디터 미리보기 개선

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  PlusIcon,
  Trash2Icon,
  GripVerticalIcon,
  ImageIcon,
  MapPinIcon,
  InfoIcon,
  ListIcon,
  AlertTriangleIcon,
  GridIcon,
  Loader2Icon,
  FileTextIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEditor, EditorBlock } from '@/hooks/useEditor';
import { BlockType, BlockContent } from '@/types/block';
import { PreviewPanel } from './PreviewPanel';

// Block Editors
import { HeroEditor } from './blocks/HeroEditor';
import { QuickInfoEditor } from './blocks/QuickInfoEditor';
import { RulesEditor } from './blocks/RulesEditor';
import { AmenitiesEditor } from './blocks/AmenitiesEditor';
import { MapEditor } from './blocks/MapEditor';
import { GalleryEditor } from './blocks/GalleryEditor';
import { NoticeEditor } from './blocks/NoticeEditor';

interface EditorLayoutProps {
  guidebookId: string;
}

// 블록 타입별 정보 (database schema와 일치)
const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ReactNode; defaultContent: BlockContent }[] = [
  {
    type: 'hero',
    label: '히어로',
    icon: <ImageIcon className="w-5 h-5" />,
    defaultContent: { title: '환영합니다', subtitle: '' },
  },
  {
    type: 'quickInfo',
    label: '체크인/아웃',
    icon: <InfoIcon className="w-5 h-5" />,
    defaultContent: {
      checkIn: '15:00',
      checkOut: '11:00',
      address: '',
    },
  },
  {
    type: 'rules',
    label: '이용규칙',
    icon: <ListIcon className="w-5 h-5" />,
    defaultContent: { sections: [], checkoutChecklist: [] },
  },
  {
    type: 'amenities',
    label: '편의시설',
    icon: <GridIcon className="w-5 h-5" />,
    defaultContent: { items: [] },
  },
  {
    type: 'map',
    label: '지도',
    icon: <MapPinIcon className="w-5 h-5" />,
    defaultContent: {
      center: { lat: 37.5665, lng: 126.978 },
      zoom: 15,
      markers: [],
      provider: 'naver' as const,
    },
  },
  {
    type: 'gallery',
    label: '갤러리',
    icon: <ImageIcon className="w-5 h-5" />,
    defaultContent: { images: [], layout: 'grid' as const },
  },
  {
    type: 'notice',
    label: '공지사항',
    icon: <AlertTriangleIcon className="w-5 h-5" />,
    defaultContent: { title: '', content: '', type: 'info' as const },
  },
  {
    type: 'custom',
    label: '커스텀',
    icon: <FileTextIcon className="w-5 h-5" />,
    defaultContent: { content: '' },
  },
];

// 블록 타입별 레이블
function getBlockLabel(type: BlockType): string {
  const found = BLOCK_TYPES.find(b => b.type === type);
  return found?.label || type;
}

// 블록 에디터 렌더러
function BlockEditorRenderer({
  block,
  onChange,
}: {
  block: EditorBlock;
  onChange: (content: BlockContent) => void;
}) {
  const content = block.content as any;

  switch (block.type) {
    case 'hero':
      return <HeroEditor content={content} onChange={onChange} />;
    case 'quickInfo':
      return <QuickInfoEditor content={content} onChange={onChange} />;
    case 'rules':
      return <RulesEditor content={content} onChange={onChange} />;
    case 'amenities':
      return <AmenitiesEditor content={content} onChange={onChange} />;
    case 'map':
      return <MapEditor content={content} onChange={onChange} />;
    case 'gallery':
      return <GalleryEditor content={content} onChange={onChange} />;
    case 'notice':
      return <NoticeEditor content={content} onChange={onChange} />;
    case 'custom':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">제목 (선택)</label>
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => onChange({ ...content, title: e.target.value })}
              placeholder="커스텀 섹션 제목"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">내용</label>
            <textarea
              value={content.content || ''}
              onChange={(e) => onChange({ ...content, content: e.target.value })}
              placeholder="HTML 또는 Markdown 형식으로 입력"
              rows={10}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>
        </div>
      );
    default:
      return (
        <div className="p-4 bg-gray-100 rounded-lg text-gray-500">
          지원되지 않는 블록 타입: {block.type}
        </div>
      );
  }
}

export function EditorLayout({ guidebookId }: EditorLayoutProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);

  const {
    guidebook,
    blocks,
    selectedBlockId,
    isLoading,
    isSaving,
    error,
    setSelectedBlockId,
    updateBlock,
    addBlock,
    deleteBlock,
  } = useEditor(guidebookId);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  // 블록 콘텐츠 변경 핸들러
  const handleBlockChange = async (content: BlockContent) => {
    if (!selectedBlockId) return;
    await updateBlock(selectedBlockId, content);
  };

  // 블록 추가 핸들러
  const handleAddBlock = async (type: BlockType) => {
    const blockInfo = BLOCK_TYPES.find(b => b.type === type);
    if (!blockInfo) return;

    await addBlock(type, blockInfo.defaultContent);
    setIsAddBlockOpen(false);
  };

  // 블록 삭제 핸들러
  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('이 블록을 삭제하시겠습니까?')) return;
    await deleteBlock(blockId);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-600">에디터 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !guidebook) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600">{error || '가이드북을 찾을 수 없습니다'}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

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
          'grid-cols-1',
          'lg:grid-cols-[280px_1fr_375px]',
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
                onClick={() => setIsAddBlockOpen(true)}
              >
                <PlusIcon className="w-4 h-4" />
                추가
              </Button>
            </div>

            {/* 블록 목록 */}
            <div className="space-y-2">
              {blocks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">블록이 없습니다</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddBlockOpen(true)}
                  >
                    첫 블록 추가
                  </Button>
                </div>
              ) : (
                blocks.map((block) => (
                  <div
                    key={block.id}
                    className={cn(
                      'group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer',
                      'hover:bg-gray-100',
                      selectedBlockId === block.id
                        ? 'bg-primary-light border border-primary'
                        : 'border border-transparent'
                    )}
                    onClick={() => setSelectedBlockId(block.id)}
                  >
                    <GripVerticalIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {(block.content as any).title ||
                          (block.content as any).networkName ||
                          getBlockLabel(block.type)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getBlockLabel(block.type)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlock(block.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="블록 삭제"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
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
              <h1 className="text-2xl font-bold">{guidebook.title}</h1>
              <div
                className={cn(
                  'text-sm flex items-center gap-2',
                  isSaving ? 'text-amber-600' : 'text-green-600'
                )}
                aria-live="polite"
                aria-atomic="true"
              >
                {isSaving ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  '✓ 저장됨'
                )}
              </div>
            </div>

            {/* 선택된 블록 에디터 */}
            {selectedBlock ? (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                  <span className="text-lg font-semibold">
                    {getBlockLabel(selectedBlock.type)} 편집
                  </span>
                </div>
                <BlockEditorRenderer
                  block={selectedBlock}
                  onChange={handleBlockChange}
                />
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                <p>편집할 블록을 선택하세요</p>
                <p className="text-sm mt-2">
                  왼쪽 목록에서 블록을 선택하거나 새 블록을 추가하세요
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Preview Panel */}
        <aside
          data-testid="preview-panel"
          className={cn(
            'bg-gray-100 overflow-hidden',
            activeTab === 'editor' && 'hidden lg:block'
          )}
        >
          <PreviewPanel
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onBlockSelect={setSelectedBlockId}
          />
        </aside>
      </div>

      {/* 블록 추가 모달 */}
      <Dialog open={isAddBlockOpen} onOpenChange={setIsAddBlockOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>블록 추가</DialogTitle>
            <DialogDescription>
              추가할 블록 유형을 선택하세요
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {BLOCK_TYPES.map((blockType) => (
              <button
                key={blockType.type}
                onClick={() => handleAddBlock(blockType.type)}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary-light transition-colors text-left"
              >
                <div className="p-2 bg-gray-100 rounded-lg">
                  {blockType.icon}
                </div>
                <span className="font-medium">{blockType.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
