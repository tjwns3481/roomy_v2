// @TASK P4-T4.3 - 슬러그 중복 체크 API
// @SPEC docs/planning/03-user-flow.md#가이드북-생성-플로우

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * GET /api/guidebooks/check-slug?slug=...
 * 슬러그 중복 확인
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: '슬러그를 입력해주세요' }, { status: 400 });
    }

    // 슬러그 형식 검증
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        {
          available: false,
          error: '영문 소문자, 숫자, 하이픈만 사용할 수 있습니다',
        },
        { status: 200 }
      );
    }

    const supabase = await createServerClient();

    const { data: existingGuidebook } = await supabase
      .from('guidebooks')
      .select('id')
      .eq('slug', slug)
      .single();

    return NextResponse.json({
      available: !existingGuidebook,
      slug,
    });
  } catch (error) {
    console.error('슬러그 확인 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
