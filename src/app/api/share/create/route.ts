// @TASK P5-T5.1 - 공유 링크 생성 API
// @SPEC docs/planning/02-trd.md#공유-시스템

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { getShareLinks } from '@/lib/share';
import { z } from 'zod';

/**
 * 공유 링크 생성 요청 스키마
 */
const createShareLinkSchema = z.object({
  guidebookId: z.string().uuid('유효한 가이드북 ID가 필요합니다'),
  expiresInDays: z.number().int().positive().optional().nullable(),
});

/**
 * POST /api/share/create
 * 공유 링크 생성
 */
export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // 요청 본문 검증
    const body = await req.json();
    const validatedData = createShareLinkSchema.parse(body);

    const supabase = createAdminClient();

    // 가이드북 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, user_id, slug, status')
      .eq('id', validatedData.guidebookId)
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

    // 공유 링크 조회 또는 생성
    const shareLinks = await getShareLinks(
      validatedData.guidebookId,
      true,
      validatedData.expiresInDays
    );

    if (!shareLinks) {
      return NextResponse.json(
        { error: '공유 링크 생성에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json(shareLinks, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('공유 링크 생성 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
