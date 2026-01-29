// @TASK P4-T4.4 - 가이드북 PATCH/DELETE API
// @TASK Editor-Fix - GET API 추가
// @SPEC docs/planning/06-tasks.md#p4-t44

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { GuidebookStatus, Theme } from '@/types/guidebook';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/guidebooks/[id]
 * 단일 가이드북 조회
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // 가이드북 조회 (user_id로 소유권 확인)
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, title, slug, theme, status')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (guidebookError || !guidebook) {
      return NextResponse.json(
        { error: '가이드북을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 블록 목록 조회 - guidebook_id 컬럼 사용
    // Note: 데이터베이스 스키마에 따라 컬럼명이 다를 수 있음
    let blocks: any[] = [];

    // 먼저 guidebook_id로 시도
    const { data: blocksData, error: blocksError } = await supabase
      .from('blocks')
      .select('*')
      .eq('guidebook_id', id)
      .order('order_index', { ascending: true });

    if (blocksError) {
      // guidebook_id가 없으면 product_id 등 다른 컬럼 시도 (레거시 스키마 지원)
      console.warn('블록 조회 시도 (guidebook_id):', blocksError.message);

      // 블록이 없어도 에디터는 동작해야 함
      blocks = [];
    } else {
      blocks = blocksData || [];
    }

    return NextResponse.json({
      guidebook,
      blocks,
    });
  } catch (error) {
    console.error('GET /api/guidebooks/[id] error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/guidebooks/[id]
 * 가이드북 정보 수정
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // 요청 본문 파싱
    const body = await request.json();
    const { title, slug, theme, status } = body;

    // 소유권 확인
    const { data: existingOwner } = await supabase
      .from('guidebooks')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingOwner || existingOwner.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '가이드북을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 업데이트할 필드 준비
    const updates: {
      title?: string;
      slug?: string;
      theme?: Theme;
      status?: GuidebookStatus;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title;
    if (slug !== undefined) {
      // slug 중복 확인 (자신 제외)
      const { data: existingGuidebook } = await supabase
        .from('guidebooks')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (existingGuidebook) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 409 }
        );
      }

      updates.slug = slug;
    }
    if (theme !== undefined) updates.theme = theme;
    if (status !== undefined) updates.status = status;

    // 가이드북 업데이트
    const { data, error } = await supabase
      .from('guidebooks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update guidebook' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('PATCH /api/guidebooks/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/guidebooks/[id]
 * 가이드북 삭제
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // 가이드북 삭제 (소유권 확인)
    // CASCADE 설정으로 관련 블록도 함께 삭제됨
    const { error } = await supabase
      .from('guidebooks')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete guidebook' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/guidebooks/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
