// @TASK P2-T2.7 - 통계 조회 API
// @SPEC docs/planning/06-tasks.md#P2-T2.7

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface DailyViewStat {
  view_date: string;
  view_count: number;
}

interface StatsSummary {
  total_views: number;
  today_views: number;
  week_views: number;
  month_views: number;
}

/**
 * GET /api/guidebooks/[id]/stats
 *
 * 가이드북 통계를 조회합니다.
 * 인증 필요 (가이드북 소유자만 조회 가능)
 *
 * @param request - NextRequest
 * @param params - { id: string } (guidebook ID)
 * @returns 통계 데이터
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: guidebookId } = await params;

    if (!guidebookId) {
      return NextResponse.json(
        { error: '가이드북 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // UUID 형식 검증
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(guidebookId)) {
      return NextResponse.json(
        { error: '잘못된 가이드북 ID 형식입니다' },
        { status: 400 }
      );
    }

    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Admin client 사용
    const supabase = createAdminClient();

    // 1. 가이드북 조회 및 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, user_id, title, view_count')
      .eq('id', guidebookId)
      .single();

    if (guidebookError || !guidebook) {
      return NextResponse.json(
        { error: '가이드북을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 소유권 확인
    if (guidebook.user_id !== userId) {
      return NextResponse.json(
        { error: '이 가이드북의 통계를 조회할 권한이 없습니다' },
        { status: 403 }
      );
    }

    // 2. 쿼리 파라미터에서 기간 가져오기
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const clampedDays = Math.min(Math.max(days, 1), 365); // 1-365일 범위

    // 3. 통계 요약 조회 (RPC 또는 직접 쿼리)
    let summary: StatsSummary = {
      total_views: guidebook.view_count || 0,
      today_views: 0,
      week_views: 0,
      month_views: 0,
    };

    // RPC 호출 시도
    const { data: summaryData, error: summaryError } = await supabase.rpc(
      'get_guidebook_stats_summary',
      { p_guidebook_id: guidebookId }
    );

    if (!summaryError && summaryData && summaryData.length > 0) {
      summary = {
        total_views: Number(summaryData[0].total_views) || guidebook.view_count || 0,
        today_views: Number(summaryData[0].today_views) || 0,
        week_views: Number(summaryData[0].week_views) || 0,
        month_views: Number(summaryData[0].month_views) || 0,
      };
    } else {
      // RPC가 없는 경우 직접 쿼리
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // 오늘 조회수
      const { count: todayCount } = await supabase
        .from('guidebook_views')
        .select('*', { count: 'exact', head: true })
        .eq('guidebook_id', guidebookId)
        .gte('viewed_at', todayStart.toISOString());

      // 주간 조회수
      const { count: weekCount } = await supabase
        .from('guidebook_views')
        .select('*', { count: 'exact', head: true })
        .eq('guidebook_id', guidebookId)
        .gte('viewed_at', weekAgo.toISOString());

      // 월간 조회수
      const { count: monthCount } = await supabase
        .from('guidebook_views')
        .select('*', { count: 'exact', head: true })
        .eq('guidebook_id', guidebookId)
        .gte('viewed_at', monthAgo.toISOString());

      summary = {
        total_views: guidebook.view_count || 0,
        today_views: todayCount || 0,
        week_views: weekCount || 0,
        month_views: monthCount || 0,
      };
    }

    // 4. 일별 조회수 조회 (RPC 또는 직접 쿼리)
    let dailyViews: DailyViewStat[] = [];

    const { data: dailyData, error: dailyError } = await supabase.rpc(
      'get_guidebook_daily_views',
      {
        p_guidebook_id: guidebookId,
        p_days: clampedDays,
      }
    );

    if (!dailyError && dailyData) {
      dailyViews = dailyData.map((item: any) => ({
        view_date: item.view_date,
        view_count: Number(item.view_count),
      }));
    } else {
      // RPC가 없는 경우 직접 쿼리
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - clampedDays);

      const { data: viewsData } = await supabase
        .from('guidebook_views')
        .select('viewed_at')
        .eq('guidebook_id', guidebookId)
        .gte('viewed_at', startDate.toISOString())
        .order('viewed_at', { ascending: false });

      if (viewsData) {
        // 일별로 그룹핑
        const groupedByDate: Record<string, number> = {};
        viewsData.forEach((view) => {
          const date = new Date(view.viewed_at).toISOString().split('T')[0];
          groupedByDate[date] = (groupedByDate[date] || 0) + 1;
        });

        dailyViews = Object.entries(groupedByDate)
          .map(([date, count]) => ({
            view_date: date,
            view_count: count,
          }))
          .sort((a, b) => b.view_date.localeCompare(a.view_date));
      }
    }

    // 5. 응답 반환
    return NextResponse.json({
      success: true,
      data: {
        guidebook_id: guidebookId,
        title: guidebook.title,
        summary,
        daily_views: dailyViews,
        period_days: clampedDays,
      },
    });
  } catch (error) {
    console.error('통계 조회 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}
