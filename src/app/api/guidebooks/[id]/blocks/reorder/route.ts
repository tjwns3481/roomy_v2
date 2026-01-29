// @TASK P1-T1.8 - 블록 순서 변경 API
// @SPEC docs/planning/06-tasks.md#P1-T1.8

import { NextRequest, NextResponse } from 'next/server';
import { BlockService, BlockServiceError, ReorderBlockInput } from '@/lib/blocks/service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// ============================================================================
// Request Validation Schemas
// ============================================================================

const reorderBlocksSchema = z.object({
  orders: z.array(
    z.object({
      id: z.string().uuid('유효한 블록 ID가 아닙니다'),
      order_index: z.number().int().min(0, '순서는 0 이상이어야 합니다'),
    })
  ).min(1, '최소 하나 이상의 블록 순서를 지정해야 합니다'),
});

// ============================================================================
// PATCH /api/guidebooks/[id]/blocks/reorder - 블록 순서 변경
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: guidebookId } = await params;

    if (!guidebookId) {
      return NextResponse.json(
        { error: '가이드북 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 요청 바디 파싱 및 검증
    const body = await request.json();
    const validation = reorderBlocksSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: '잘못된 요청 형식입니다',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { orders } = validation.data;

    // 순서 변경 실행
    const blocks = await BlockService.reorderBlocks(
      guidebookId,
      orders as ReorderBlockInput[]
    );

    return NextResponse.json({
      success: true,
      data: blocks,
      message: '블록 순서가 변경되었습니다',
    });
  } catch (error) {
    if (error instanceof BlockServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('블록 순서 변경 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}
