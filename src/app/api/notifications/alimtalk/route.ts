/**
 * @TASK P8-R5 - 알림톡 발송 이력 조회 API
 *
 * GET /api/notifications/alimtalk?guidebook_id={id}&limit={number}
 * Response: { data: AlimtalkLog[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필要합니다.',
          },
        },
        { status: 401 }
      );
    }

    // 쿼리 파라미터
    const searchParams = request.nextUrl.searchParams;
    const guidebookId = searchParams.get('guidebook_id');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // 쿼리 빌드
    let query = supabase
      .from('alimtalk_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 가이드북 필터
    if (guidebookId) {
      query = query.eq('guidebook_id', guidebookId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Alimtalk] 조회 실패:', error);
      return NextResponse.json(
        {
          error: {
            code: 'FETCH_ERROR',
            message: '알림톡 이력 조회 실패',
            details: error.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('[Alimtalk] API 에러:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    );
  }
}
