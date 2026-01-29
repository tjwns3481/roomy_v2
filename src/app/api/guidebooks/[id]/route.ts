// @TASK P4-T4.4 - 가이드북 PATCH/DELETE API
// @SPEC docs/planning/06-tasks.md#p4-t44

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { GuidebookStatus, Theme } from '@/types/guidebook';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/guidebooks/[id]
 * 가이드북 정보 수정
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createServerClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { title, slug, theme, status } = body;

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

    // 가이드북 업데이트 (RLS로 본인 소유만 수정 가능)
    const { data, error } = await supabase
      .from('guidebooks')
      .update(updates)
      .eq('id', id)
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
    const supabase = await createServerClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 가이드북 삭제 (RLS로 본인 소유만 삭제 가능)
    // CASCADE 설정으로 관련 블록도 함께 삭제됨
    const { error } = await supabase
      .from('guidebooks')
      .delete()
      .eq('id', id);

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
