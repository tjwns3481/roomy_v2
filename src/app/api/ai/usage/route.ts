/**
 * @TASK P3-T3.5 - AI 사용량 API 엔드포인트
 * @SPEC docs/planning/02-trd.md#AI-Usage-API
 *
 * GET  /api/ai/usage - 사용량 조회
 * POST /api/ai/usage - 사용량 기록 (내부용)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  checkAiLimit,
  recordAiUsage,
  getAiUsageHistory,
  createLimitExceededError,
} from '@/lib/ai/usage';

/**
 * GET /api/ai/usage
 *
 * 현재 사용자의 AI 사용량 조회
 *
 * @returns {Object} AI 사용량 정보
 * - canGenerate: boolean - 생성 가능 여부
 * - usedThisMonth: number - 이번 달 사용 횟수
 * - limitThisMonth: number - 이번 달 제한
 * - remaining: number - 남은 횟수
 * - plan: string - 현재 플랜
 * - history: Array - 최근 사용 이력 (선택적)
 */
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
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // AI 사용량 제한 정보 조회
    const limitInfo = await checkAiLimit(user.id);

    // 쿼리 파라미터로 히스토리 포함 여부 확인
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const historyLimit = parseInt(searchParams.get('historyLimit') || '5', 10);

    let history: Awaited<ReturnType<typeof getAiUsageHistory>> = [];
    if (includeHistory) {
      history = await getAiUsageHistory(user.id, historyLimit);
    }

    return NextResponse.json({
      canGenerate: limitInfo.canGenerate,
      usedThisMonth: limitInfo.usedThisMonth,
      limitThisMonth: limitInfo.limitThisMonth,
      remaining: limitInfo.remaining,
      plan: limitInfo.plan,
      ...(includeHistory && { history }),
    });
  } catch (error) {
    console.error('Error in GET /api/ai/usage:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to fetch AI usage' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/usage
 *
 * AI 사용량 기록 (내부용 - 서버에서만 호출)
 *
 * @body {Object} 사용량 기록 정보
 * - guidebookId: string (optional) - 관련 가이드북 ID
 * - tokensUsed: number - 사용된 토큰 수
 * - model: string - 사용된 모델
 * - action: 'generate' | 'edit' | 'chat' - 작업 유형
 *
 * @returns {Object} 기록 결과
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { guidebookId, tokensUsed, model, action } = body;

    // 필수 필드 검증
    if (!action || !['generate', 'edit', 'chat'].includes(action)) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Valid action is required (generate, edit, chat)' },
        { status: 400 }
      );
    }

    if (typeof tokensUsed !== 'number' || tokensUsed < 0) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Valid tokensUsed is required' },
        { status: 400 }
      );
    }

    // 사용량 제한 체크
    const limitInfo = await checkAiLimit(user.id);
    if (!limitInfo.canGenerate) {
      return NextResponse.json(createLimitExceededError(limitInfo), { status: 429 });
    }

    // 사용량 기록
    const recordId = await recordAiUsage({
      userId: user.id,
      guidebookId,
      tokensUsed: tokensUsed || 0,
      model: model || 'gpt-4o',
      action,
    });

    if (!recordId) {
      return NextResponse.json(
        { error: 'RECORD_FAILED', message: 'Failed to record AI usage' },
        { status: 500 }
      );
    }

    // 업데이트된 사용량 정보 조회
    const updatedLimitInfo = await checkAiLimit(user.id);

    return NextResponse.json({
      success: true,
      recordId,
      usedThisMonth: updatedLimitInfo.usedThisMonth,
      remaining: updatedLimitInfo.remaining,
    });
  } catch (error) {
    console.error('Error in POST /api/ai/usage:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to record AI usage' },
      { status: 500 }
    );
  }
}
