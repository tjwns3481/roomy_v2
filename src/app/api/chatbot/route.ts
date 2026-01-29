// @TASK P8-R1 - chatbot 질문/답변 API
// @SPEC specs/domain/resources.yaml#chatbot_log

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { ChatbotMessageRequest, ChatbotMessageResponse } from '@/types/chatbot';

export const dynamic = 'force-dynamic';

/**
 * POST /api/chatbot
 *
 * AI 챗봇 질문/답변을 저장합니다.
 * 인증 불필요 (게스트 접근 허용)
 *
 * @param request - NextRequest
 * @returns { id, answer, created_at }
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body: ChatbotMessageRequest = await request.json();
    const { guidebook_id, session_id, question } = body;

    // 필수 필드 검증
    if (!guidebook_id || !session_id || !question) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'guidebook_id, session_id, question 필드가 필요합니다',
          },
        },
        { status: 400 }
      );
    }

    // UUID 형식 검증
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(guidebook_id)) {
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

    // Admin client 사용 (게스트가 삽입할 수 있도록)
    const supabase = createAdminClient();

    // 1. 가이드북 존재 여부 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, status')
      .eq('id', guidebook_id)
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

    // 2. 비공개 가이드북 체크
    if (guidebook.status !== 'published') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: '비공개 가이드북입니다',
          },
        },
        { status: 403 }
      );
    }

    // 3. AI 답변 생성 (임시: 실제 AI 연동은 P8-R6에서 구현)
    // TODO: OpenAI API 연동
    const answer = `안녕하세요! "${question}" 질문에 대한 답변입니다. 현재는 테스트 답변이며, 향후 실제 AI 모델로 교체됩니다.`;

    // 4. 챗봇 로그 삽입
    const { data: log, error: insertError } = await supabase
      .from('chatbot_logs')
      .insert({
        guidebook_id,
        session_id,
        question,
        answer,
      })
      .select('id, answer, created_at')
      .single();

    if (insertError || !log) {
      console.error('챗봇 로그 삽입 에러:', insertError);
      return NextResponse.json(
        {
          error: {
            code: 'INSERT_ERROR',
            message: '챗봇 로그 저장에 실패했습니다',
          },
        },
        { status: 500 }
      );
    }

    // 5. 응답
    const response: ChatbotMessageResponse = {
      id: log.id,
      answer: log.answer,
      created_at: log.created_at,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('챗봇 API 에러:', error);
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
