// @TASK P1-T1.8 - 블록 관리 훅 (낙관적 업데이트 포함)
// @SPEC docs/planning/06-tasks.md#P1-T1.8

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { BlockType, BlockContent } from '@/types/block';

// ============================================================================
// Types
// ============================================================================

export interface Block {
  id: string;
  guidebook_id: string;
  type: BlockType;
  order_index: number;
  content: BlockContent;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface UseBlocksOptions {
  guidebookId: string;
  initialBlocks?: Block[];
  onError?: (error: Error) => void;
}

export interface UseBlocksReturn {
  /** 블록 목록 */
  blocks: Block[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 */
  error: Error | null;
  /** 블록 목록 새로고침 */
  refresh: () => Promise<void>;
  /** 블록 추가 */
  addBlock: (type: BlockType, content: BlockContent, orderIndex?: number) => Promise<Block | null>;
  /** 블록 수정 */
  updateBlock: (blockId: string, updates: Partial<{ type: BlockType; content: BlockContent; is_visible: boolean }>) => Promise<Block | null>;
  /** 블록 삭제 */
  deleteBlock: (blockId: string) => Promise<boolean>;
  /** 블록 순서 변경 */
  reorderBlocks: (orders: Array<{ id: string; order_index: number }>) => Promise<boolean>;
  /** 낙관적 업데이트 취소 */
  rollback: () => void;
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchBlocks(guidebookId: string): Promise<Block[]> {
  const response = await fetch(`/api/guidebooks/${guidebookId}/blocks`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '블록 목록을 불러올 수 없습니다');
  }

  return data.data;
}

async function createBlock(
  guidebookId: string,
  type: BlockType,
  content: BlockContent,
  orderIndex?: number
): Promise<Block> {
  const response = await fetch(`/api/guidebooks/${guidebookId}/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, content, order_index: orderIndex }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '블록 생성에 실패했습니다');
  }

  return data.data;
}

async function patchBlock(
  guidebookId: string,
  blockId: string,
  updates: Partial<{ type: BlockType; content: BlockContent; is_visible: boolean }>
): Promise<Block> {
  const response = await fetch(`/api/guidebooks/${guidebookId}/blocks/${blockId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '블록 수정에 실패했습니다');
  }

  return data.data;
}

async function removeBlock(guidebookId: string, blockId: string): Promise<void> {
  const response = await fetch(`/api/guidebooks/${guidebookId}/blocks/${blockId}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '블록 삭제에 실패했습니다');
  }
}

async function reorderBlocksApi(
  guidebookId: string,
  orders: Array<{ id: string; order_index: number }>
): Promise<Block[]> {
  const response = await fetch(`/api/guidebooks/${guidebookId}/blocks/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orders }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '블록 순서 변경에 실패했습니다');
  }

  return data.data;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useBlocks(options: UseBlocksOptions): UseBlocksReturn {
  const { guidebookId, initialBlocks = [], onError } = options;

  // State
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [isLoading, setIsLoading] = useState(!initialBlocks.length);
  const [error, setError] = useState<Error | null>(null);

  // 낙관적 업데이트 롤백을 위한 이전 상태 저장
  const previousBlocksRef = useRef<Block[]>(initialBlocks);
  const isMountedRef = useRef(true);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 초기 로드
  useEffect(() => {
    if (!initialBlocks.length && guidebookId) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guidebookId]);

  /**
   * 블록 목록 새로고침
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchBlocks(guidebookId);
      if (isMountedRef.current) {
        setBlocks(data);
        previousBlocksRef.current = data;
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error('알 수 없는 에러');
        setError(error);
        onError?.(error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [guidebookId, onError]);

  /**
   * 블록 추가 (낙관적 업데이트)
   */
  const addBlock = useCallback(
    async (type: BlockType, content: BlockContent, orderIndex?: number): Promise<Block | null> => {
      // 1. 이전 상태 저장
      previousBlocksRef.current = blocks;

      // 2. 낙관적 업데이트: 임시 블록 추가
      const tempId = `temp-${Date.now()}`;
      const newOrderIndex = orderIndex ?? blocks.length;
      const tempBlock: Block = {
        id: tempId,
        guidebook_id: guidebookId,
        type,
        order_index: newOrderIndex,
        content,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setBlocks((prev) => {
        const updated = [...prev, tempBlock];
        return updated.sort((a, b) => a.order_index - b.order_index);
      });

      try {
        // 3. 실제 API 호출
        const createdBlock = await createBlock(guidebookId, type, content, orderIndex);

        // 4. 임시 블록을 실제 블록으로 교체
        if (isMountedRef.current) {
          setBlocks((prev) =>
            prev.map((b) => (b.id === tempId ? createdBlock : b))
          );
          previousBlocksRef.current = blocks;
        }

        return createdBlock;
      } catch (err) {
        // 5. 에러 시 롤백
        if (isMountedRef.current) {
          setBlocks(previousBlocksRef.current);
          const error = err instanceof Error ? err : new Error('블록 생성 실패');
          setError(error);
          onError?.(error);
        }
        return null;
      }
    },
    [blocks, guidebookId, onError]
  );

  /**
   * 블록 수정 (낙관적 업데이트)
   */
  const updateBlock = useCallback(
    async (
      blockId: string,
      updates: Partial<{ type: BlockType; content: BlockContent; is_visible: boolean }>
    ): Promise<Block | null> => {
      // 1. 이전 상태 저장
      previousBlocksRef.current = blocks;

      // 2. 낙관적 업데이트
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === blockId
            ? { ...block, ...updates, updated_at: new Date().toISOString() }
            : block
        )
      );

      try {
        // 3. 실제 API 호출
        const updatedBlock = await patchBlock(guidebookId, blockId, updates);

        // 4. 서버 응답으로 동기화
        if (isMountedRef.current) {
          setBlocks((prev) =>
            prev.map((b) => (b.id === blockId ? updatedBlock : b))
          );
          previousBlocksRef.current = blocks;
        }

        return updatedBlock;
      } catch (err) {
        // 5. 에러 시 롤백
        if (isMountedRef.current) {
          setBlocks(previousBlocksRef.current);
          const error = err instanceof Error ? err : new Error('블록 수정 실패');
          setError(error);
          onError?.(error);
        }
        return null;
      }
    },
    [blocks, guidebookId, onError]
  );

  /**
   * 블록 삭제 (낙관적 업데이트)
   */
  const deleteBlock = useCallback(
    async (blockId: string): Promise<boolean> => {
      // 1. 이전 상태 저장
      previousBlocksRef.current = blocks;

      // 2. 낙관적 업데이트: 블록 제거
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));

      try {
        // 3. 실제 API 호출
        await removeBlock(guidebookId, blockId);

        // 4. 성공 시 이전 상태 업데이트
        if (isMountedRef.current) {
          previousBlocksRef.current = blocks.filter((b) => b.id !== blockId);
        }

        return true;
      } catch (err) {
        // 5. 에러 시 롤백
        if (isMountedRef.current) {
          setBlocks(previousBlocksRef.current);
          const error = err instanceof Error ? err : new Error('블록 삭제 실패');
          setError(error);
          onError?.(error);
        }
        return false;
      }
    },
    [blocks, guidebookId, onError]
  );

  /**
   * 블록 순서 변경 (낙관적 업데이트)
   */
  const reorderBlocks = useCallback(
    async (orders: Array<{ id: string; order_index: number }>): Promise<boolean> => {
      // 1. 이전 상태 저장
      previousBlocksRef.current = blocks;

      // 2. 낙관적 업데이트
      const orderMap = new Map(orders.map((o) => [o.id, o.order_index]));
      setBlocks((prev) => {
        const updated = prev.map((block) => ({
          ...block,
          order_index: orderMap.get(block.id) ?? block.order_index,
        }));
        return updated.sort((a, b) => a.order_index - b.order_index);
      });

      try {
        // 3. 실제 API 호출
        const reorderedBlocks = await reorderBlocksApi(guidebookId, orders);

        // 4. 서버 응답으로 동기화
        if (isMountedRef.current) {
          setBlocks(reorderedBlocks);
          previousBlocksRef.current = reorderedBlocks;
        }

        return true;
      } catch (err) {
        // 5. 에러 시 롤백
        if (isMountedRef.current) {
          setBlocks(previousBlocksRef.current);
          const error = err instanceof Error ? err : new Error('순서 변경 실패');
          setError(error);
          onError?.(error);
        }
        return false;
      }
    },
    [blocks, guidebookId, onError]
  );

  /**
   * 수동 롤백
   */
  const rollback = useCallback(() => {
    setBlocks(previousBlocksRef.current);
  }, []);

  return {
    blocks,
    isLoading,
    error,
    refresh,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    rollback,
  };
}

export default useBlocks;
