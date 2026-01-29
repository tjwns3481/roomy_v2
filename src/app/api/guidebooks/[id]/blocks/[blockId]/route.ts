// @TASK P1-T1.8 - 블록 상세 조회, 수정, 삭제 API
// @SPEC docs/planning/06-tasks.md#P1-T1.8

import { NextRequest, NextResponse } from 'next/server';
import { BlockService, BlockServiceError, UpdateBlockInput } from '@/lib/blocks/service';
import { BlockType } from '@/types/block';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// ============================================================================
// Request Validation Schemas
// ============================================================================

const updateBlockSchema = z.object({
  type: z
    .enum([
      'hero',
      'quickInfo',
      'amenities',
      'rules',
      'map',
      'gallery',
      'notice',
      'custom',
    ] as const)
    .optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  is_visible: z.boolean().optional(),
});

// ============================================================================
// GET /api/guidebooks/[id]/blocks/[blockId] - 블록 상세 조회
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { id: guidebookId, blockId } = await params;

    if (!guidebookId || !blockId) {
      return NextResponse.json(
        { error: '가이드북 ID와 블록 ID가 필요합니다' },
        { status: 400 }
      );
    }

    const block = await BlockService.getBlockById(blockId);

    if (!block) {
      return NextResponse.json(
        { error: '블록을 찾을 수 없습니다', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 가이드북 ID 일치 확인
    if (block.guidebook_id !== guidebookId) {
      return NextResponse.json(
        { error: '블록이 해당 가이드북에 속하지 않습니다', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: block,
    });
  } catch (error) {
    if (error instanceof BlockServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('블록 조회 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/guidebooks/[id]/blocks/[blockId] - 블록 수정
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { id: guidebookId, blockId } = await params;

    if (!guidebookId || !blockId) {
      return NextResponse.json(
        { error: '가이드북 ID와 블록 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 요청 바디 파싱 및 검증
    const body = await request.json();
    const validation = updateBlockSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: '잘못된 요청 형식입니다',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    // 빈 업데이트 체크
    const { type, content, is_visible } = validation.data;
    if (type === undefined && content === undefined && is_visible === undefined) {
      return NextResponse.json(
        { error: '수정할 내용이 없습니다' },
        { status: 400 }
      );
    }

    // 가이드북 소유권 확인 (블록이 해당 가이드북에 속하는지)
    const existingBlock = await BlockService.getBlockById(blockId);
    if (!existingBlock || existingBlock.guidebook_id !== guidebookId) {
      return NextResponse.json(
        { error: '블록을 찾을 수 없습니다', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const input: UpdateBlockInput = {
      type: type as BlockType | undefined,
      content: content as any,
      is_visible,
    };

    const block = await BlockService.updateBlock(blockId, input);

    return NextResponse.json({
      success: true,
      data: block,
    });
  } catch (error) {
    if (error instanceof BlockServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('블록 수정 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/guidebooks/[id]/blocks/[blockId] - 블록 삭제
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { id: guidebookId, blockId } = await params;

    if (!guidebookId || !blockId) {
      return NextResponse.json(
        { error: '가이드북 ID와 블록 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 가이드북 소유권 확인 (블록이 해당 가이드북에 속하는지)
    const existingBlock = await BlockService.getBlockById(blockId);
    if (!existingBlock || existingBlock.guidebook_id !== guidebookId) {
      return NextResponse.json(
        { error: '블록을 찾을 수 없습니다', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    await BlockService.deleteBlock(blockId);

    return NextResponse.json({
      success: true,
      message: '블록이 삭제되었습니다',
    });
  } catch (error) {
    if (error instanceof BlockServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('블록 삭제 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}
