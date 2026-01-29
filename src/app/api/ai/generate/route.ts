/**
 * @TASK P3-T3.2 - AI 콘텐츠 생성 API 엔드포인트
 * @TASK P3-T3.5 - AI 사용량 체크 통합
 * @TASK P6-T6.7 - 플랜별 AI 생성 제한 체크
 * @SPEC docs/planning/06-tasks.md#P3-T3.2
 *
 * POST /api/ai/generate
 * Body: { listingInfo: ListingInput, blockTypes?: BlockType[], guidebookId?: string }
 * Response: { success: true, data: GeneratedContent } | { success: false, error: {...} }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateGuidebookContent,
  AIGenerationError,
  hasApiKey,
  validateListingInput,
} from '@/lib/openai';
import { createServerClient } from '@/lib/supabase/server';
import { checkAiLimit, recordAiUsage, createLimitExceededError } from '@/lib/ai/usage';
import { withAIGenerationLimit } from '@/lib/subscription/middleware';
import type { AIGenerateRequest, AIGenerateResponse, AIErrorCode } from '@/types/ai';

// ============================================
// Rate Limiting (간단한 메모리 기반)
// ============================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // 분당 요청 수
const RATE_LIMIT_WINDOW = 60 * 1000; // 1분

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ============================================
// 에러 응답 헬퍼
// ============================================

function errorResponse(code: AIErrorCode, message: string, status: number, details?: string) {
  const response: AIGenerateResponse = {
    success: false,
    error: { code, message, details },
  };
  return NextResponse.json(response, { status });
}

// ============================================
// OPTIONS (CORS)
// ============================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// ============================================
// POST /api/ai/generate
// ============================================

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting 확인
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return errorResponse(
        'RATE_LIMIT',
        '요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.',
        429
      );
    }

    // 2. API 키 확인
    if (!hasApiKey()) {
      return errorResponse(
        'MISSING_API_KEY',
        'OpenAI API 키가 설정되지 않았습니다.',
        500
      );
    }

    // 3. 요청 바디 파싱
    let body: AIGenerateRequest & { guidebookId?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse('INVALID_INPUT', '요청 바디가 유효한 JSON이 아닙니다.', 400);
    }

    // 4. listingInfo 검증
    if (!body.listingInfo) {
      return errorResponse('INVALID_INPUT', 'listingInfo가 필요합니다.', 400);
    }

    const validation = validateListingInput(body.listingInfo);
    if (!validation.valid) {
      return errorResponse(
        'INVALID_INPUT',
        '입력 데이터가 유효하지 않습니다.',
        400,
        validation.errors.join(', ')
      );
    }

    // @TASK P3-T3.5, P6-T6.7 - 인증 및 AI 사용량 체크 (미들웨어 사용)
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 인증된 사용자의 경우 플랜별 제한 체크
    if (user) {
      const limitResult = await withAIGenerationLimit(user.id);
      if (!limitResult.success) {
        // 402 Payment Required - 제한 초과 시 업그레이드 유도
        return NextResponse.json(
          {
            success: false,
            error: 'LIMIT_EXCEEDED' as AIErrorCode,
            message: limitResult.response.message,
            details: `Used: ${limitResult.response.current}/${limitResult.response.limit}`,
            current: limitResult.response.current,
            limit: limitResult.response.limit,
            upgradeUrl: limitResult.response.upgradeUrl,
          },
          { status: 402 }
        );
      }
    }

    // 5. 콘텐츠 생성
    const result = await generateGuidebookContent(body.listingInfo);

    // @TASK P3-T3.5 - 사용량 기록 (인증된 사용자만)
    if (user) {
      await recordAiUsage({
        userId: user.id,
        guidebookId: body.guidebookId,
        tokensUsed: result.tokensUsed?.total || 0,
        model: result.model || 'gpt-4o',
        action: 'generate',
      });
    }

    // 6. 특정 블록 타입만 필터링 (선택적)
    let filteredBlocks = result.blocks;
    if (body.blockTypes && body.blockTypes.length > 0) {
      filteredBlocks = result.blocks.filter((block) =>
        body.blockTypes!.includes(block.type)
      );
    }

    // 7. 성공 응답 (사용량 정보 포함)
    const response: AIGenerateResponse & { usage?: { usedThisMonth: number; remaining: number } } = {
      success: true,
      data: {
        ...result,
        blocks: filteredBlocks,
      },
    };

    // 인증된 사용자의 경우 업데이트된 사용량 정보 포함
    if (user) {
      const updatedLimit = await checkAiLimit(user.id);
      response.usage = {
        usedThisMonth: updatedLimit.usedThisMonth,
        remaining: updatedLimit.remaining,
      };
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[AI Generate Error]', error);

    // AIGenerationError 처리
    if (error instanceof AIGenerationError) {
      const statusMap: Record<AIErrorCode, number> = {
        MISSING_API_KEY: 500,
        INVALID_INPUT: 400,
        RATE_LIMIT: 429,
        TOKEN_LIMIT: 400,
        PARSE_ERROR: 500,
        API_ERROR: 500,
        TIMEOUT: 504,
        UNKNOWN: 500,
        LIMIT_EXCEEDED: 402,
        AI_LIMIT_EXCEEDED: 402,
      };

      return errorResponse(
        error.code,
        error.message,
        statusMap[error.code] || 500,
        error.details
      );
    }

    // 기타 에러
    return errorResponse(
      'UNKNOWN',
      '서버 오류가 발생했습니다.',
      500,
      error instanceof Error ? error.message : undefined
    );
  }
}
