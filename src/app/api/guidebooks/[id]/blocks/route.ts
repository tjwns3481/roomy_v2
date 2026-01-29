// @TASK P1-T1.8 - 블록 목록 조회 및 생성 API
// @SPEC docs/planning/06-tasks.md#P1-T1.8

import { NextRequest, NextResponse } from 'next/server';
import { BlockService, BlockServiceError, CreateBlockInput } from '@/lib/blocks/service';
import { BlockType } from '@/types/block';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// ============================================================================
// Request Validation Schemas
// ============================================================================

const createBlockSchema = z.object({
  type: z.enum([
    'hero',
    'quickInfo',
    'amenities',
    'rules',
    'map',
    'gallery',
    'notice',
    'custom',
  ] as const),
  content: z.record(z.string(), z.unknown()),
  order_index: z.number().int().min(0).optional(),
  is_visible: z.boolean().optional(),
});

// ============================================================================
// GET /api/guidebooks/[id]/blocks - 블록 목록 조회
// ============================================================================

export async function GET(
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

    const blocks = await BlockService.getBlocksByGuidebookId(guidebookId);

    return NextResponse.json({
      success: true,
      data: blocks,
      count: blocks.length,
    });
  } catch (error) {
    if (error instanceof BlockServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('블록 목록 조회 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/guidebooks/[id]/blocks - 블록 생성
// ============================================================================

export async function POST(
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
    const validation = createBlockSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: '잘못된 요청 형식입니다',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { type, content, order_index, is_visible } = validation.data;

    const input: CreateBlockInput = {
      guidebook_id: guidebookId,
      type: type as BlockType,
      content: content as any,
      order_index,
      is_visible,
    };

    const block = await BlockService.createBlock(input);

    return NextResponse.json(
      {
        success: true,
        block,  // useEditor 훅이 'block' 키를 기대함
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof BlockServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('블록 생성 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}
