// @TASK P5-T5.1 - 공유 링크 조회 API
// @SPEC docs/planning/02-trd.md#공유-시스템

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { getShareLinks, getShortUrlStats } from '@/lib/share';

interface RouteParams {
  params: Promise<{
    guidebookId: string;
  }>;
}

/**
 * GET /api/share/[guidebookId]
 * 가이드북의 공유 링크 조회
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { guidebookId } = await params;

    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // UUID 유효성 검사
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(guidebookId)) {
      return NextResponse.json(
        { error: '유효한 가이드북 ID가 필요합니다' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 가이드북 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, user_id, slug, status')
      .eq('id', guidebookId)
      .single();

    if (guidebookError || !guidebook) {
      return NextResponse.json(
        { error: '가이드북을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (guidebook.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '이 가이드북에 대한 권한이 없습니다' },
        { status: 403 }
      );
    }

    // 공유 링크 조회 (없으면 생성하지 않음)
    const shareLinks = await getShareLinks(guidebookId, false);

    // 없으면 새로 생성
    if (!shareLinks) {
      const newShareLinks = await getShareLinks(guidebookId, true);

      if (!newShareLinks) {
        return NextResponse.json(
          { error: '공유 링크 조회에 실패했습니다' },
          { status: 500 }
        );
      }

      return NextResponse.json(newShareLinks);
    }

    return NextResponse.json(shareLinks);
  } catch (error) {
    console.error('공유 링크 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/share/[guidebookId]
 * 가이드북의 활성 공유 링크 비활성화
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { guidebookId } = await params;

    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // UUID 유효성 검사
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(guidebookId)) {
      return NextResponse.json(
        { error: '유효한 가이드북 ID가 필요합니다' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 가이드북 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, user_id')
      .eq('id', guidebookId)
      .single();

    if (guidebookError || !guidebook) {
      return NextResponse.json(
        { error: '가이드북을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (guidebook.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '이 가이드북에 대한 권한이 없습니다' },
        { status: 403 }
      );
    }

    // 해당 가이드북의 모든 활성 단축 URL 비활성화
    const { error: updateError } = await supabase
      .from('short_urls')
      .update({ is_active: false })
      .eq('guidebook_id', guidebookId)
      .eq('is_active', true);

    if (updateError) {
      console.error('단축 URL 비활성화 오류:', updateError);
      return NextResponse.json(
        { error: '공유 링크 비활성화에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: '공유 링크가 비활성화되었습니다' },
      { status: 200 }
    );
  } catch (error) {
    console.error('공유 링크 비활성화 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
