// @TASK P1-T1.8 - 블록 비즈니스 로직 서비스
// @SPEC docs/planning/06-tasks.md#P1-T1.8

import { createAdminClient } from '@/lib/supabase/server';
import { getAuthUserId } from '@/lib/clerk-auth';
import { BlockType, BlockContent, blockContentSchemas } from '@/types/block';
import { z } from 'zod';

// ============================================================================
// DB Column Mapping (DB uses different column names)
// ============================================================================

// DB는 Prisma에서 생성한 BlockType enum 사용 (대문자)
const BLOCK_TYPE_TO_DB: Record<BlockType, string> = {
  hero: 'HERO',
  quickInfo: 'QUICK_INFO',
  amenities: 'AMENITIES',
  rules: 'RULES',
  map: 'MAP',
  gallery: 'GALLERY',
  notice: 'NOTICE',
  custom: 'CUSTOM',
};

const DB_TO_BLOCK_TYPE: Record<string, BlockType> = {
  HERO: 'hero',
  QUICK_INFO: 'quickInfo',
  AMENITIES: 'amenities',
  RULES: 'rules',
  MAP: 'map',
  GALLERY: 'gallery',
  NOTICE: 'notice',
  CUSTOM: 'custom',
};

// CUID 생성 함수 (DB에서 사용하는 형식)
function generateCuid(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `c${timestamp}${randomPart}`;
}

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

// DB row 타입 (실제 DB 컬럼명)
interface DBBlockRow {
  id: string;
  guideId: string;
  type: string;
  order: number;
  content: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  guidebook_id: string | null;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// DB row를 Block으로 변환
function mapDBRowToBlock(row: DBBlockRow): Block {
  return {
    id: row.id,
    guidebook_id: row.guideId || row.guidebook_id || '',
    type: DB_TO_BLOCK_TYPE[row.type] || (row.type.toLowerCase() as BlockType),
    order_index: row.order ?? row.order_index ?? 0,
    content: row.content as BlockContent,
    is_visible: row.is_visible ?? true,
    created_at: row.createdAt || row.created_at,
    updated_at: row.updatedAt || row.updated_at,
  };
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
    const supabase = createAdminClient();

    // DB는 guideId 컬럼을 사용 (기존 Prisma 스키마)
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('guideId', guidebookId)
      .order('order', { ascending: true });

    if (error) {
      throw new BlockServiceError(
        `블록 조회 실패: ${error.message}`,
        'DB_ERROR',
        500
      );
    }

    return (data || []).map((row: DBBlockRow) => mapDBRowToBlock(row));
  },

  /**
   * 단일 블록 조회
   */
  async getBlockById(blockId: string): Promise<Block | null> {
    const supabase = createAdminClient();

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

    return mapDBRowToBlock(data as DBBlockRow);
  },

  /**
   * 블록 생성
   */
  async createBlock(input: CreateBlockInput): Promise<Block> {
    const supabase = createAdminClient();
    const userId = await getAuthUserId();

    if (!userId) {
      throw new BlockServiceError('인증이 필요합니다', 'UNAUTHORIZED', 401);
    }

    // 1. 가이드북 존재 및 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, user_id')
      .eq('id', input.guidebook_id)
      .single();

    if (guidebookError || !guidebook) {
      throw new BlockServiceError(
        '가이드북을 찾을 수 없습니다',
        'GUIDEBOOK_NOT_FOUND',
        404
      );
    }

    // 소유권 확인
    if (guidebook.user_id !== userId) {
      throw new BlockServiceError(
        '이 가이드북에 대한 권한이 없습니다',
        'UNAUTHORIZED',
        403
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

    // 3. order 계산 (없으면 마지막에 추가) - DB는 'order' 컬럼 사용
    let orderValue = input.order_index;
    if (orderValue === undefined) {
      const { data: maxOrderData } = await supabase
        .from('blocks')
        .select('order')
        .eq('guideId', input.guidebook_id)
        .order('order', { ascending: false })
        .limit(1)
        .single();

      orderValue = maxOrderData ? (maxOrderData.order as number) + 1 : 0;
    }

    // 4. 블록 생성 (DB는 대문자 BlockType enum 사용)
    const blockId = generateCuid();
    const now = new Date().toISOString();
    const dbType = BLOCK_TYPE_TO_DB[input.type] || input.type.toUpperCase();

    const { data, error } = await supabase
      .from('blocks')
      .insert({
        id: blockId,
        guideId: input.guidebook_id,
        type: dbType,
        order: orderValue,
        content: validation.data as unknown as Record<string, never>,
        createdAt: now,
        updatedAt: now,
        // 새 스키마 컬럼도 함께 설정 (호환성)
        guidebook_id: input.guidebook_id,
        order_index: orderValue,
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

    return mapDBRowToBlock(data as DBBlockRow);
  },

  /**
   * 블록 수정
   */
  async updateBlock(blockId: string, input: UpdateBlockInput): Promise<Block> {
    const supabase = createAdminClient();

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

    // 3. 업데이트할 필드 구성 (DB는 대문자 BlockType enum)
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (input.type !== undefined) {
      updateData.type = BLOCK_TYPE_TO_DB[input.type] || input.type.toUpperCase();
    }
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

    return mapDBRowToBlock(data as DBBlockRow);
  },

  /**
   * 블록 삭제
   */
  async deleteBlock(blockId: string): Promise<void> {
    const supabase = createAdminClient();

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
    // RPC 함수가 타입에 정의되지 않으므로 타입 우회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: reorderError } = await (supabase.rpc as any)('reorder_blocks_after_delete', {
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
    const supabase = createAdminClient();
    const userId = await getAuthUserId();

    if (!userId) {
      throw new BlockServiceError('인증이 필요합니다', 'UNAUTHORIZED', 401);
    }

    // 1. 가이드북 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, user_id')
      .eq('id', guidebookId)
      .single();

    if (guidebookError || !guidebook) {
      throw new BlockServiceError(
        '가이드북을 찾을 수 없습니다',
        'GUIDEBOOK_NOT_FOUND',
        404
      );
    }

    if (guidebook.user_id !== userId) {
      throw new BlockServiceError(
        '이 가이드북에 대한 권한이 없습니다',
        'UNAUTHORIZED',
        403
      );
    }

    // 2. 각 블록의 order 업데이트 (DB는 'order' 컬럼 사용)
    const updatePromises = orders.map(({ id, order_index }) =>
      supabase
        .from('blocks')
        .update({ order: order_index, order_index, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .eq('guideId', guidebookId)
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
    const supabase = createAdminClient();
    const userId = await getAuthUserId();

    if (!userId) {
      return false;
    }

    const { data, error } = await supabase
      .from('guidebooks')
      .select('id, user_id')
      .eq('id', guidebookId)
      .single();

    return !error && !!data && data.user_id === userId;
  },
};

export default BlockService;
