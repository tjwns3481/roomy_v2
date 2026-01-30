// @TASK P8-R1 - chatbot 질문/답변 API
// @TASK P8-R6 - AI Chatbot RAG 통합
// @SPEC specs/domain/resources.yaml#chatbot_log

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerClient } from '@/lib/supabase/server';
import { ChatbotMessageRequest, ChatbotMessageResponse } from '@/types/chatbot';
import {
  generateChatbotResponse,
  checkChatbotLimit,
  hasOpenAIKey,
} from '@/lib/ai/chatbot';

export const dynamic = 'force-dynamic';

/**
 * POST /api/chatbot
 *
 * AI 챗봇 질문/답변 (RAG 기반)
 * - 가이드북 콘텐츠 기반으로 답변 생성
 * - 플랜별 사용량 제한 (Free: 50회/월, Pro: 500회/월, Business: 무제한)
 * - 인증 불필요 (게스트 접근 허용)
 *
 * @param request - NextRequest
 * @returns { id, answer, sources, created_at }
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
      .select('id, status, user_id')
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

    // 3. 플랜별 사용량 제한 체크 (가이드북 소유자 기준)
    const limitInfo = await checkChatbotLimit(guidebook.user_id);
    if (!limitInfo.canChat) {
      return NextResponse.json(
        {
          error: {
            code: 'LIMIT_EXCEEDED',
            message: '이번 달 챗봇 사용 한도를 초과했습니다.',
            details: `Used: ${limitInfo.usedThisMonth}/${limitInfo.limitThisMonth}`,
          },
        },
        { status: 429 }
      );
    }

    // 4. AI 답변 생성 (RAG)
    let answer: string;
    let sources: string[] = [];

    try {
      const aiResponse = await generateChatbotResponse({
        guidebookId: guidebook_id,
        sessionId: session_id,
        question,
      });

      answer = aiResponse.answer;
      sources = aiResponse.sources;
    } catch (aiError) {
      console.error('[Chatbot] AI generation error:', aiError);

      // AI 실패 시 폴백 응답
      if (!hasOpenAIKey()) {
        answer = `안녕하세요! "${question}" 질문에 대한 답변입니다.\n\nAI 서비스가 현재 설정되지 않았습니다. 호스트에게 직접 문의해 주세요.`;
      } else {
        answer = `죄송합니다. 일시적인 오류로 답변을 생성할 수 없습니다. 잠시 후 다시 시도해 주세요.`;
      }
      sources = [];
    }

    // 5. 챗봇 로그 삽입
    // TODO: chatbot_logs 테이블 마이그레이션 필요
    // const { data: log, error: insertError } = await supabase
    //   .from('chatbot_logs')
    //   .insert({
    //     guidebook_id,
    //     session_id,
    //     question,
    //     answer,
    //   })
    //   .select('id, answer, created_at')
    //   .single();

    // if (insertError || !log) {
    //   console.error('챗봇 로그 삽입 에러:', insertError);
    //   return NextResponse.json(
    //     {
    //       error: {
    //         code: 'INSERT_ERROR',
    //         message: '챗봇 로그 저장에 실패했습니다',
    //       },
    //     },
    //     { status: 500 }
    //   );
    // }
    const log = {
      id: session_id,
      answer,
      created_at: new Date().toISOString(),
    };

    // 6. 응답 (sources 추가)
    const response: ChatbotMessageResponse & { sources?: string[] } = {
      id: log.id,
      answer: log.answer,
      created_at: log.created_at,
      sources: sources.length > 0 ? sources : undefined,
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
