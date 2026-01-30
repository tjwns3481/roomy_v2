// @TASK P8-R1 - chatbot 대화 로그 조회 API (호스트용)
// @SPEC specs/domain/resources.yaml#chatbot_log

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { ChatbotLogsResponse, ChatbotFeedbackRequest } from '@/types/chatbot';

export const dynamic = 'force-dynamic';

/**
 * GET /api/chatbot/[guidebookId]
 *
 * 가이드북의 챗봇 대화 로그를 조회합니다.
 * 인증 필요 (호스트만 자신의 가이드북 로그 조회 가능)
 *
 * @param request - NextRequest
 * @param params - { guidebookId: string }
 * @returns { logs, total, page, limit }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guidebookId: string }> }
) {
  try {
    const { guidebookId } = await params;

    // URL 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const session_id = searchParams.get('session_id') || undefined;

    // 페이지네이션 검증
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'page는 1 이상, limit는 1~100 사이여야 합니다',
          },
        },
        { status: 400 }
      );
    }

    // UUID 형식 검증
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(guidebookId)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 가이드북 ID 형식입니다',
          },
        },
        { status: 400 }
      );
    }

    // Server client 사용 (RLS 자동 적용)
    const supabase = await createServerClient();

    // 1. 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        },
        { status: 401 }
      );
    }

    // 2. 가이드북 소유 확인 (RLS가 자동으로 체크하지만 명시적으로 확인)
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, user_id')
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

    // 3. 챗봇 로그 조회 (페이지네이션)
    // TODO: chatbot_logs 테이블 마이그레이션 필요
    // let query = supabase
    //   .from('chatbot_logs')
    //   .select('*', { count: 'exact' })
    //   .eq('guidebook_id', guidebookId)
    //   .order('created_at', { ascending: false })
    //   .range((page - 1) * limit, page * limit - 1);

    // // 세션 필터링 (옵션)
    // if (session_id) {
    //   query = query.eq('session_id', session_id);
    // }

    // const { data: logs, error: logsError, count } = await query;

    // if (logsError) {
    //   console.error('챗봇 로그 조회 에러:', logsError);
    //   return NextResponse.json(
    //     {
    //       error: {
    //         code: 'FETCH_ERROR',
    //         message: '챗봇 로그 조회에 실패했습니다',
    //       },
    //     },
    //     { status: 500 }
    //   );
    // }
    const logs: any[] = [];
    const count = 0;

    // 4. 응답
    const response: ChatbotLogsResponse = {
      logs: logs || [],
      total: count || 0,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('챗봇 로그 조회 API 에러:', error);
    return NextResponse.json(
      {
        error: {
          code: 'SERVER_ERROR',
          message: '서버 에러가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}
