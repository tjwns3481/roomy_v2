// @ts-nocheck - Temporary: upsell tables not yet in generated database types
// @TASK P8-R3: Upsell 아이템 수정 및 삭제 API

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { updateUpsellItemSchema } from '@/lib/validations/upsell';

/**
 * PUT /api/guidebooks/[id]/upsell/items/[itemId]
 * Upsell 아이템 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: guidebookId, itemId } = await params;
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

    // 아이템 소유권 확인
    const { data: item, error: itemError } = await supabase
      .from('upsell_items')
      .select('guidebook_id, guidebooks(user_id)')
      .eq('id', itemId)
      .eq('guidebook_id', guidebookId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '아이템을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // TypeScript 타입 가드
    const guidebooks = item.guidebooks as { user_id: string } | null;
    if (!guidebooks || guidebooks.user_id !== user.id) {
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

    // 요청 본문 검증
    const body = await request.json();
    const validation = updateUpsellItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력 데이터가 올바르지 않습니다',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    // 아이템 수정
    const { data: updatedItem, error: updateError } = await supabase
      .from('upsell_items')
      .update(validation.data)
      .eq('id', itemId)
      .select()
      .single();

    if (updateError) {
      console.error('[Upsell Items] Update error:', updateError);
      return NextResponse.json(
        {
          error: {
            code: 'UPDATE_ERROR',
            message: '아이템 수정에 실패했습니다',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error('[Upsell Items] Unexpected error:', error);
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

/**
 * DELETE /api/guidebooks/[id]/upsell/items/[itemId]
 * Upsell 아이템 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: guidebookId, itemId } = await params;
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

    // 아이템 소유권 확인
    const { data: item, error: itemError } = await supabase
      .from('upsell_items')
      .select('guidebook_id, guidebooks(user_id)')
      .eq('id', itemId)
      .eq('guidebook_id', guidebookId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '아이템을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // TypeScript 타입 가드
    const guidebooks = item.guidebooks as { user_id: string } | null;
    if (!guidebooks || guidebooks.user_id !== user.id) {
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

    // 아이템 삭제
    const { error: deleteError } = await supabase
      .from('upsell_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) {
      console.error('[Upsell Items] Delete error:', deleteError);
      return NextResponse.json(
        {
          error: {
            code: 'DELETE_ERROR',
            message: '아이템 삭제에 실패했습니다',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Upsell Items] Unexpected error:', error);
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
