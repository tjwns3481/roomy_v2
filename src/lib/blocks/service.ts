// @TASK P1-T1.8 - 블록 비즈니스 로직 서비스
// @SPEC docs/planning/06-tasks.md#P1-T1.8

import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { BlockType, BlockContent, blockContentSchemas } from '@/types/block';
import { z } from 'zod';

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

export interface CreateBlockInput {
  guidebook_id: string;
  type: BlockType;
  content: BlockContent;
  order_index?: number;
  is_visible?: boolean;
}

export interface UpdateBlockInput {
  type?: BlockType;
  content?: BlockContent;
  is_visible?: boolean;
}

export interface ReorderBlockInput {
  id: string;
  order_index: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class BlockServiceError extends Error {
  constructor(
    message: string,
    public code:
      | 'NOT_FOUND'
      | 'UNAUTHORIZED'
      | 'VALIDATION_ERROR'
      | 'DB_ERROR'
      | 'GUIDEBOOK_NOT_FOUND',
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'BlockServiceError';
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * 블록 콘텐츠 검증
 */
export function validateBlockContent(
  type: BlockType,
  content: unknown
): { success: true; data: BlockContent } | { success: false; error: z.ZodError } {
  const schema = blockContentSchemas[type];
  const result = schema.safeParse(content);

  if (result.success) {
    return { success: true, data: result.data as BlockContent };
  }

  return { success: false, error: result.error };
}

// ============================================================================
// Block Service
// ============================================================================

export const BlockService = {
  /**
   * 가이드북의 모든 블록 조회
   */
  async getBlocksByGuidebookId(guidebookId: string): Promise<Block[]> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('guidebook_id', guidebookId)
      .order('order_index', { ascending: true });

    if (error) {
      throw new BlockServiceError(
        `블록 조회 실패: ${error.message}`,
        'DB_ERROR',
        500
      );
    }

    return (data || []) as Block[];
  },

  /**
   * 단일 블록 조회
   */
  async getBlockById(blockId: string): Promise<Block | null> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('id', blockId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new BlockServiceError(
        `블록 조회 실패: ${error.message}`,
        'DB_ERROR',
        500
      );
    }

    return data as Block;
  },

  /**
   * 블록 생성
   */
  async createBlock(input: CreateBlockInput): Promise<Block> {
    const supabase = await createServerClient();

    // 1. 가이드북 존재 확인 (RLS가 자동으로 소유권 검증)
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id')
      .eq('id', input.guidebook_id)
      .single();

    if (guidebookError || !guidebook) {
      throw new BlockServiceError(
        '가이드북을 찾을 수 없습니다',
        'GUIDEBOOK_NOT_FOUND',
        404
      );
    }

    // 2. 콘텐츠 검증
    const validation = validateBlockContent(input.type, input.content);
    if (!validation.success) {
      throw new BlockServiceError(
        `콘텐츠 검증 실패: ${validation.error.issues.map(e => e.message).join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
    }

    // 3. order_index 계산 (없으면 마지막에 추가)
    let orderIndex = input.order_index;
    if (orderIndex === undefined) {
      const { data: maxOrderData } = await supabase
        .from('blocks')
        .select('order_index')
        .eq('guidebook_id', input.guidebook_id)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      orderIndex = maxOrderData ? maxOrderData.order_index + 1 : 0;
    }

    // 4. 블록 생성
    const { data, error } = await supabase
      .from('blocks')
      .insert({
        guidebook_id: input.guidebook_id,
        type: input.type,
        content: validation.data,
        order_index: orderIndex,
        is_visible: input.is_visible ?? true,
      })
      .select()
      .single();

    if (error) {
      throw new BlockServiceError(
        `블록 생성 실패: ${error.message}`,
        'DB_ERROR',
        500
      );
    }

    return data as Block;
  },

  /**
   * 블록 수정
   */
  async updateBlock(blockId: string, input: UpdateBlockInput): Promise<Block> {
    const supabase = await createServerClient();

    // 1. 기존 블록 조회
    const existingBlock = await this.getBlockById(blockId);
    if (!existingBlock) {
      throw new BlockServiceError('블록을 찾을 수 없습니다', 'NOT_FOUND', 404);
    }

    // 2. 콘텐츠 검증 (타입이 변경되면 새 타입으로, 아니면 기존 타입으로)
    const blockType = input.type || existingBlock.type;
    if (input.content) {
      const validation = validateBlockContent(blockType, input.content);
      if (!validation.success) {
        throw new BlockServiceError(
          `콘텐츠 검증 실패: ${validation.error.issues.map(e => e.message).join(', ')}`,
          'VALIDATION_ERROR',
          400
        );
      }
    }

    // 3. 업데이트할 필드 구성
    const updateData: Record<string, unknown> = {};
    if (input.type !== undefined) updateData.type = input.type;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.is_visible !== undefined) updateData.is_visible = input.is_visible;

    // 4. 블록 수정
    const { data, error } = await supabase
      .from('blocks')
      .update(updateData)
      .eq('id', blockId)
      .select()
      .single();

    if (error) {
      throw new BlockServiceError(
        `블록 수정 실패: ${error.message}`,
        'DB_ERROR',
        500
      );
    }

    return data as Block;
  },

  /**
   * 블록 삭제
   */
  async deleteBlock(blockId: string): Promise<void> {
    const supabase = await createServerClient();

    // 1. 블록 존재 확인
    const existingBlock = await this.getBlockById(blockId);
    if (!existingBlock) {
      throw new BlockServiceError('블록을 찾을 수 없습니다', 'NOT_FOUND', 404);
    }

    // 2. 블록 삭제
    const { error } = await supabase.from('blocks').delete().eq('id', blockId);

    if (error) {
      throw new BlockServiceError(
        `블록 삭제 실패: ${error.message}`,
        'DB_ERROR',
        500
      );
    }

    // 3. 남은 블록 순서 재정렬 (삭제된 블록 이후 블록들의 order_index 감소)
    const { error: reorderError } = await supabase.rpc('reorder_blocks_after_delete', {
      p_guidebook_id: existingBlock.guidebook_id,
      p_deleted_order: existingBlock.order_index,
    });

    // RPC가 없어도 에러로 처리하지 않음 (optional optimization)
    if (reorderError) {
      console.warn('블록 재정렬 RPC 실패 (무시됨):', reorderError.message);
    }
  },

  /**
   * 블록 순서 변경 (일괄)
   */
  async reorderBlocks(guidebookId: string, orders: ReorderBlockInput[]): Promise<Block[]> {
    const supabase = await createServerClient();

    // 1. 가이드북 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id')
      .eq('id', guidebookId)
      .single();

    if (guidebookError || !guidebook) {
      throw new BlockServiceError(
        '가이드북을 찾을 수 없습니다',
        'GUIDEBOOK_NOT_FOUND',
        404
      );
    }

    // 2. 각 블록의 order_index 업데이트
    const updatePromises = orders.map(({ id, order_index }) =>
      supabase
        .from('blocks')
        .update({ order_index })
        .eq('id', id)
        .eq('guidebook_id', guidebookId)
    );

    const results = await Promise.all(updatePromises);

    // 에러 확인
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      throw new BlockServiceError(
        `블록 순서 변경 실패: ${errors[0].error?.message}`,
        'DB_ERROR',
        500
      );
    }

    // 3. 업데이트된 블록 목록 반환
    return this.getBlocksByGuidebookId(guidebookId);
  },

  /**
   * 가이드북 소유권 확인
   */
  async verifyGuidebookOwnership(guidebookId: string): Promise<boolean> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('guidebooks')
      .select('id')
      .eq('id', guidebookId)
      .single();

    // RLS가 자동으로 소유권을 검증하므로, 데이터가 있으면 소유자임
    return !error && !!data;
  },
};

export default BlockService;
