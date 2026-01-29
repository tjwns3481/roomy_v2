/**
 * @TASK P7-T7.9 - 일일 정리 작업 Cron
 * @SPEC docs/planning/02-trd.md#Cron-작업
 *
 * POST /api/cron/cleanup
 * - 만료된 단축 URL 정리 (90일 이상 미사용)
 * - 오래된 조회 로그 정리 (180일 이상)
 * - Vercel Cron에서 매일 00:00 UTC에 실행
 *
 * 보안: Vercel Cron Secret 검증
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Vercel Cron은 인증 헤더를 자동으로 추가
// https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
const CRON_SECRET = process.env.CRON_SECRET;

interface CleanupResult {
  success: boolean;
  timestamp: string;
  results: {
    expiredShortUrls: number;
    oldViewLogs: number;
    oldAiUsageLogs: number;
  };
  errors?: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse<CleanupResult>> {
  const timestamp = new Date().toISOString();
  const errors: string[] = [];

  // Vercel Cron 인증 검증 (production에서만)
  if (process.env.VERCEL_ENV === 'production' && CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        {
          success: false,
          timestamp,
          results: { expiredShortUrls: 0, oldViewLogs: 0, oldAiUsageLogs: 0 },
          errors: ['Unauthorized: Invalid cron secret'],
        },
        { status: 401 }
      );
    }
  }

  const supabase = createAdminClient();
  const results = {
    expiredShortUrls: 0,
    oldViewLogs: 0,
    oldAiUsageLogs: 0,
  };

  // 1. 만료된 단축 URL 정리 (90일 이상 미사용)
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: expiredUrls, error: shortUrlError } = await supabase
      .from('short_urls')
      .delete()
      .lt('updated_at', ninetyDaysAgo.toISOString())
      .eq('click_count', 0)
      .select('id');

    if (shortUrlError) {
      errors.push(`Short URL cleanup error: ${shortUrlError.message}`);
    } else {
      results.expiredShortUrls = expiredUrls?.length ?? 0;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Short URL cleanup exception: ${errorMessage}`);
  }

  // 2. 오래된 조회 로그 정리 (180일 이상)
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

    const { data: oldLogs, error: viewLogError } = await supabase
      .from('view_logs')
      .delete()
      .lt('created_at', sixMonthsAgo.toISOString())
      .select('id');

    if (viewLogError) {
      errors.push(`View log cleanup error: ${viewLogError.message}`);
    } else {
      results.oldViewLogs = oldLogs?.length ?? 0;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`View log cleanup exception: ${errorMessage}`);
  }

  // 3. 오래된 AI 사용량 로그 정리 (180일 이상)
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

    const { data: oldAiLogs, error: aiLogError } = await supabase
      .from('ai_usage_logs')
      .delete()
      .lt('created_at', sixMonthsAgo.toISOString())
      .select('id');

    if (aiLogError) {
      errors.push(`AI usage log cleanup error: ${aiLogError.message}`);
    } else {
      results.oldAiUsageLogs = oldAiLogs?.length ?? 0;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`AI usage log cleanup exception: ${errorMessage}`);
  }

  const success = errors.length === 0;

  // 정리 작업 결과 로깅 (Vercel Logs에서 확인 가능)
  console.log('[Cron Cleanup]', {
    timestamp,
    success,
    results,
    errors: errors.length > 0 ? errors : undefined,
  });

  return NextResponse.json(
    {
      success,
      timestamp,
      results,
      errors: errors.length > 0 ? errors : undefined,
    },
    { status: success ? 200 : 207 } // 207: Multi-Status (부분 성공)
  );
}

// GET 요청도 지원 (수동 테스트용, 개발 환경에서만)
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (process.env.VERCEL_ENV === 'production') {
    return NextResponse.json(
      { error: 'GET method not allowed in production. Use POST.' },
      { status: 405 }
    );
  }

  // 개발 환경에서는 GET으로도 테스트 가능
  return POST(request);
}
