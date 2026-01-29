// @TASK P8-R1 - chatbot 피드백 업데이트 API
// @SPEC specs/domain/resources.yaml#chatbot_log

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { ChatbotFeedbackRequest } from '@/types/chatbot';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/chatbot/feedback/[id]
 *
 * 챗봇 로그의 피드백을 업데이트합니다.
 * 인증 불필요 (게스트가 피드백 제공)
 *
 * @param request - NextRequest
 * @param params - { id: string } (chatbot_log ID)
 * @returns { success: boolean }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // UUID 형식 검증
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 로그 ID 형식입니다',
          },
        },
        { status: 400 }
      );
    }

    // 요청 본문 파싱
    const body: ChatbotFeedbackRequest = await request.json();
    const { feedback } = body;

    // 피드백 검증
    if (!feedback || !['helpful', 'not_helpful'].includes(feedback)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: "feedback는 'helpful' 또는 'not_helpful'이어야 합니다",
          },
        },
        { status: 400 }
      );
    }

    // Admin client 사용 (게스트가 업데이트할 수 있도록)
    const supabase = createAdminClient();

    // 1. 로그 존재 여부 확인
    const { data: log, error: logError } = await supabase
      .from('chatbot_logs')
      .select('id')
      .eq('id', id)
      .single();

    if (logError || !log) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '챗봇 로그를 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // 2. 피드백 업데이트
    const { error: updateError } = await supabase
      .from('chatbot_logs')
      .update({ feedback })
      .eq('id', id);

    if (updateError) {
      console.error('피드백 업데이트 에러:', updateError);
      return NextResponse.json(
        {
          error: {
            code: 'UPDATE_ERROR',
            message: '피드백 업데이트에 실패했습니다',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('피드백 업데이트 API 에러:', error);
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
