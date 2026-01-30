// @TASK P8-R1 - chatbot 통계 API (호스트용)
// @SPEC specs/domain/resources.yaml#chatbot_log

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { ChatbotStats } from '@/types/chatbot';

export const dynamic = 'force-dynamic';

/**
 * GET /api/chatbot/[guidebookId]/stats
 *
 * 가이드북의 챗봇 통계를 조회합니다.
 * 인증 필요 (호스트만 자신의 가이드북 통계 조회 가능)
 *
 * @param request - NextRequest
 * @param params - { guidebookId: string }
 * @returns ChatbotStats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guidebookId: string }> }
) {
  try {
    const { guidebookId } = await params;

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

    // 2. 가이드북 소유 확인
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

    // 3. RPC 함수 호출하여 통계 조회
    // TODO: get_chatbot_stats RPC 함수 마이그레이션 필요
    // const { data: statsData, error: rpcError } = await supabase.rpc(
    //   'get_chatbot_stats',
    //   {
    //     p_guidebook_id: guidebookId,
    //   }
    // );

    // if (rpcError) {
    //   console.error('챗봇 통계 RPC 에러:', rpcError);

    //   // RPC가 없는 경우 직접 계산
    //   const { data: logs, error: logsError } = await supabase
    //     .from('chatbot_logs')
    //     .select('feedback, session_id')
    //     .eq('guidebook_id', guidebookId);

    //   if (logsError) {
    //     console.error('챗봇 로그 조회 에러:', logsError);
    //     return NextResponse.json(
    //       {
    //         error: {
    //           code: 'FETCH_ERROR',
    //           message: '챗봇 통계 조회에 실패했습니다',
    //         },
    //       },
    //       { status: 500 }
    //     );
    //   }

    //   const totalQuestions = logs?.length || 0;
    //   const helpfulCount =
    //     logs?.filter((log) => log.feedback === 'helpful').length || 0;
    //   const notHelpfulCount =
    //     logs?.filter((log) => log.feedback === 'not_helpful').length || 0;

    //   // 세션별 질문 수 계산
    //   const sessionMap = new Map<string, number>();
    //   logs?.forEach((log) => {
    //     sessionMap.set(log.session_id, (sessionMap.get(log.session_id) || 0) + 1);
    //   });
    //   const avgSessionLength =
    //     sessionMap.size > 0
    //       ? Array.from(sessionMap.values()).reduce((a, b) => a + b, 0) /
    //         sessionMap.size
    //       : 0;

    //   const satisfactionRate =
    //     helpfulCount + notHelpfulCount > 0
    //       ? helpfulCount / (helpfulCount + notHelpfulCount)
    //       : 0;

    //   const stats: ChatbotStats = {
    //     total_questions: totalQuestions,
    //     helpful_count: helpfulCount,
    //     not_helpful_count: notHelpfulCount,
    //     avg_session_length: parseFloat(avgSessionLength.toFixed(2)),
    //     satisfaction_rate: parseFloat((satisfactionRate * 100).toFixed(2)),
    //   };

    //   return NextResponse.json(stats);
    // }

    // // 4. RPC 결과를 ChatbotStats 형식으로 변환
    // const rawStats = Array.isArray(statsData) ? statsData[0] : statsData;

    // const totalFeedback =
    //   (rawStats.helpful_count || 0) + (rawStats.not_helpful_count || 0);
    // const satisfactionRate =
    //   totalFeedback > 0
    //     ? ((rawStats.helpful_count || 0) / totalFeedback) * 100
    //     : 0;

    const stats: ChatbotStats = {
      total_questions: 0,
      helpful_count: 0,
      not_helpful_count: 0,
      avg_session_length: 0,
      satisfaction_rate: 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('챗봇 통계 API 에러:', error);
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
