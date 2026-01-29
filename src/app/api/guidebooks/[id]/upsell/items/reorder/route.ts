// @TASK P8-S13-T1: Upsell 아이템 순서 변경 API

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

interface ReorderItem {
  id: string;
  sort_order: number;
}

/**
 * POST /api/guidebooks/[id]/upsell/items/reorder
 * Upsell 아이템 순서 변경
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: guidebookId } = await params;
    const supabase = await createServerClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다',
          },
        },
        { status: 401 }
      );
    }

    // 가이드북 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('user_id')
      .eq('id', guidebookId)
      .single();

    if (guidebookError || !guidebook) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '가이드북을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    if (guidebook.user_id !== user.id) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: '권한이 없습니다',
          },
        },
        { status: 403 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const items: ReorderItem[] = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'items 배열이 필요합니다',
          },
        },
        { status: 400 }
      );
    }

    // 각 아이템의 sort_order 업데이트
    const updatePromises = items.map((item) =>
      supabase
        .from('upsell_items')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
        .eq('guidebook_id', guidebookId)
    );

    const results = await Promise.all(updatePromises);

    // 에러 체크
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      console.error('[Upsell Reorder] Update errors:', errors);
      return NextResponse.json(
        {
          error: {
            code: 'UPDATE_ERROR',
            message: '순서 변경에 실패했습니다',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Upsell Reorder] Unexpected error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}
