// @TASK Editor-Fix - 에디터 상태 관리 훅
'use client';

import { useState, useEffect, useCallback } from 'react';
import { BlockType, BlockContent } from '@/types/block';
import { showToast } from '@/lib/toast';

export interface EditorBlock {
  id: string;
  guidebook_id: string;
  type: BlockType;
  order_index: number;
  content: BlockContent;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface EditorGuidebook {
  id: string;
  title: string;
  slug: string;
  theme: string;
  status: string;
}

interface UseEditorReturn {
  guidebook: EditorGuidebook | null;
  blocks: EditorBlock[];
  selectedBlockId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  setSelectedBlockId: (id: string | null) => void;
  updateBlock: (blockId: string, content: BlockContent) => Promise<void>;
  addBlock: (type: BlockType, content: BlockContent) => Promise<void>;
  deleteBlock: (blockId: string) => Promise<void>;
  reorderBlocks: (blockIds: string[]) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useEditor(guidebookId: string): UseEditorReturn {
  const [guidebook, setGuidebook] = useState<EditorGuidebook | null>(null);
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 가이드북 및 블록 로드 (API 사용)
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/guidebooks/${guidebookId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '가이드북을 찾을 수 없습니다');
      }

      setGuidebook(data.guidebook);

      const typedBlocks = (data.blocks || []).map((block: any) => ({
        ...block,
        content: block.content as BlockContent,
      })) as EditorBlock[];
      setBlocks(typedBlocks);

      // 첫 번째 블록 선택
      if (typedBlocks.length > 0 && !selectedBlockId) {
        setSelectedBlockId(typedBlocks[0].id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '데이터 로드 실패';
      setError(message);
      console.error('Editor fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [guidebookId, selectedBlockId]);

  // 블록 수정
  const updateBlock = useCallback(async (blockId: string, content: BlockContent) => {
    try {
      setIsSaving(true);

      const response = await fetch(`/api/guidebooks/${guidebookId}/blocks/${blockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '블록 저장 실패');
      }

      const { block } = await response.json();

      // 로컬 상태 업데이트
      setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, ...block } : b));

      showToast.success('저장되었습니다');
    } catch (err) {
      const message = err instanceof Error ? err.message : '블록 저장 실패';
      showToast.error(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [guidebookId]);

  // 블록 추가
  const addBlock = useCallback(async (type: BlockType, content: BlockContent) => {
    try {
      setIsSaving(true);

      const response = await fetch(`/api/guidebooks/${guidebookId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '블록 추가 실패');
      }

      const { block } = await response.json();

      // 로컬 상태 업데이트
      setBlocks(prev => [...prev, block]);
      setSelectedBlockId(block.id);

      showToast.success('블록이 추가되었습니다');
    } catch (err) {
      const message = err instanceof Error ? err.message : '블록 추가 실패';
      showToast.error(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [guidebookId]);

  // 블록 삭제
  const deleteBlock = useCallback(async (blockId: string) => {
    try {
      setIsSaving(true);

      const response = await fetch(`/api/guidebooks/${guidebookId}/blocks/${blockId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '블록 삭제 실패');
      }

      // 로컬 상태 업데이트
      setBlocks(prev => {
        const newBlocks = prev.filter(b => b.id !== blockId);
        // 삭제된 블록이 선택된 경우 다른 블록 선택
        if (selectedBlockId === blockId && newBlocks.length > 0) {
          setSelectedBlockId(newBlocks[0].id);
        } else if (newBlocks.length === 0) {
          setSelectedBlockId(null);
        }
        return newBlocks;
      });

      showToast.success('블록이 삭제되었습니다');
    } catch (err) {
      const message = err instanceof Error ? err.message : '블록 삭제 실패';
      showToast.error(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [guidebookId, selectedBlockId]);

  // 블록 순서 변경
  const reorderBlocks = useCallback(async (blockIds: string[]) => {
    try {
      setIsSaving(true);

      const orders = blockIds.map((id, index) => ({ id, order_index: index }));

      const response = await fetch(`/api/guidebooks/${guidebookId}/blocks/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '순서 변경 실패');
      }

      // 로컬 상태 업데이트
      setBlocks(prev => {
        const blockMap = new Map(prev.map(b => [b.id, b]));
        return blockIds.map((id, index) => ({
          ...blockMap.get(id)!,
          order_index: index,
        }));
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '순서 변경 실패';
      showToast.error(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [guidebookId]);

  // 초기 로드
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
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
    reorderBlocks,
    refetch: fetchData,
  };
}
