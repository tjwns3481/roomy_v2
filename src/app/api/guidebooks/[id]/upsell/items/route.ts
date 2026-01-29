// @TASK P8-R3: Upsell 아이템 목록 조회 및 생성 API

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createUpsellItemSchema } from '@/lib/validations/upsell';
import type { UpsellItem } from '@/types/upsell';

/**
 * GET /api/guidebooks/[id]/upsell/items
 * Upsell 아이템 목록 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: guidebookId } = await params;
    const supabase = await createServerClient();

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 게스트는 활성화된 아이템만 조회
    let query = supabase
      .from('upsell_items')
      .select('*')
      .eq('guidebook_id', guidebookId)
      .order('sort_order', { ascending: true });

    // 비로그인 또는 다른 사용자는 활성화된 아이템만
    if (!user) {
      query = query.eq('is_active', true);
    } else {
      // 로그인 사용자는 본인 가이드북이면 전체, 아니면 활성화된 것만
      const { data: guidebook } = await supabase
        .from('guidebooks')
        .select('user_id')
        .eq('id', guidebookId)
        .single();

      if (guidebook?.user_id !== user.id) {
        query = query.eq('is_active', true);
      }
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('[Upsell Items] Fetch error:', error);
      return NextResponse.json(
        {
          error: {
            code: 'FETCH_ERROR',
            message: '아이템 목록을 불러오는데 실패했습니다',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: items || [],
      total: items?.length || 0,
    });
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
 * POST /api/guidebooks/[id]/upsell/items
 * Upsell 아이템 생성 (Business 플랜만 가능)
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

    // Business 플랜 확인
    const { data: canCreate, error: planError } = await supabase.rpc(
      'can_create_upsell_item',
      { p_user_id: user.id }
    );

    if (planError) {
      console.error('[Upsell Items] Plan check error:', planError);
      return NextResponse.json(
        {
          error: {
            code: 'PLAN_CHECK_ERROR',
            message: '플랜 확인에 실패했습니다',
          },
        },
        { status: 500 }
      );
    }

    if (!canCreate) {
      return NextResponse.json(
        {
          error: {
            code: 'PLAN_UPGRADE_REQUIRED',
            message: 'Upsell 기능은 Business 플랜에서만 사용할 수 있습니다',
            upgradeUrl: '/settings/subscription',
          },
        },
        { status: 402 }
      );
    }

    // 요청 본문 검증
    const body = await request.json();
    const validation = createUpsellItemSchema.safeParse(body);

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

    // 아이템 생성
    const { data: item, error: createError } = await supabase
      .from('upsell_items')
      .insert({
        guidebook_id: guidebookId,
        ...validation.data,
      })
      .select()
      .single();

    if (createError) {
      console.error('[Upsell Items] Create error:', createError);
      return NextResponse.json(
        {
          error: {
            code: 'CREATE_ERROR',
            message: '아이템 생성에 실패했습니다',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ item }, { status: 201 });
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
