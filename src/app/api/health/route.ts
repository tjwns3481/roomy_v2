/**
 * @TASK P0-T0.3, P7-T7.9 - Supabase 연결 상태 확인 API (Vercel 배포용 강화)
 * @SPEC docs/planning/02-trd.md#API-설계
 *
 * GET /api/health
 * - Supabase 연결 상태 확인
 * - DB 접근 테스트 (guidebooks 테이블 카운트)
 * - 버전 정보 포함 (Vercel Git Commit SHA)
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface HealthResponse {
  status: 'ok' | 'error';
  supabase: 'connected' | 'disconnected';
  timestamp: string;
  version: string;
  environment: string;
  details?: {
    tablesAccessible: boolean;
    latencyMs: number;
    guidebookCount?: number;
    error?: string;
  };
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const startTime = Date.now();
  const version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev';
  const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';

  try {
    // Admin 클라이언트로 연결 테스트 (RLS 우회)
    const supabase = createAdminClient();

    // guidebooks 테이블로 연결 확인 (Roomy 핵심 테이블)
    const { count, error } = await supabase
      .from('guidebooks')
      .select('*', { count: 'exact', head: true });

    const latencyMs = Date.now() - startTime;

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          supabase: 'disconnected',
          timestamp: new Date().toISOString(),
          version,
          environment,
          details: {
            tablesAccessible: false,
            latencyMs,
            error: error.message,
          },
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      supabase: 'connected',
      timestamp: new Date().toISOString(),
      version,
      environment,
      details: {
        tablesAccessible: true,
        latencyMs,
        guidebookCount: count ?? 0,
      },
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        status: 'error',
        supabase: 'disconnected',
        timestamp: new Date().toISOString(),
        version,
        environment,
        details: {
          tablesAccessible: false,
          latencyMs,
          error: errorMessage,
        },
      },
      { status: 503 }
    );
  }
}
