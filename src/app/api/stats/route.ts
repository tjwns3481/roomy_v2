// @TASK P4-T4.5 - 호스트 통계 API
// @SPEC docs/planning/06-tasks.md#P4-T4.5

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface DailyViewStat {
  view_date: string;
  view_count: number;
}

interface GuidebookStat {
  id: string;
  title: string;
  views: number;
  todayViews: number;
  lastViewed: string | null;
}

/**
 * GET /api/stats?period=7d|30d|all
 *
 * 호스트의 전체 통계를 조회합니다.
 * 인증 필요
 *
 * @returns {
 *   summary: { totalViews, todayViews, guidebookCount, aiUsage },
 *   chartData: DailyViewStat[],
 *   guidebookStats: GuidebookStat[]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 기간 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    let days = 7;
    if (period === '30d') {
      days = 30;
    } else if (period === 'all') {
      days = 365;
    } else if (period === 'today') {
      days = 1;
    }

    const supabase = createAdminClient();

    // 1. 사용자의 모든 가이드북 조회
    const { data: guidebooks, error: guidebooksError } = await supabase
      .from('guidebooks')
      .select('id, title, view_count, created_at')
      .eq('user_id', userId)
      .order('view_count', { ascending: false });

    if (guidebooksError) {
      console.error('가이드북 조회 에러:', guidebooksError);
      return NextResponse.json(
        { error: '가이드북 조회에 실패했습니다' },
        { status: 500 }
      );
    }

    const guidebookList = guidebooks || [];

    // 2. 전체 조회수 계산
    const totalViews = guidebookList.reduce(
      (sum, gb) => sum + (gb.view_count || 0),
      0
    );

    // 3. 일별 조회수 조회 (RPC)
    const { data: dailyViewsData, error: dailyError } = await supabase.rpc(
      'get_user_daily_views',
      {
        p_user_id: userId,
        p_days: days,
      }
    );

    let chartData: DailyViewStat[] = [];
    let todayViews = 0;

    if (!dailyError && dailyViewsData) {
      chartData = dailyViewsData.map((item: any) => ({
        view_date: item.view_date,
        view_count: Number(item.view_count),
      }));

      // 오늘 조회수 추출
      const today = new Date().toISOString().split('T')[0];
      const todayData = chartData.find((item) => item.view_date === today);
      todayViews = todayData?.view_count || 0;
    } else {
      // RPC가 없는 경우 빈 배열로 초기화 (기간에 맞게)
      const now = new Date();
      chartData = Array.from({ length: days }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        return {
          view_date: date.toISOString().split('T')[0],
          view_count: 0,
        };
      }).reverse();
    }

    // 4. 가이드북별 오늘 조회수 조회
    const { data: todayByGuidebook, error: todayError } = await supabase.rpc(
      'get_user_today_views_by_guidebook',
      {
        p_user_id: userId,
      }
    );

    const todayViewsMap: Record<string, number> = {};
    if (!todayError && todayByGuidebook) {
      todayByGuidebook.forEach((item: any) => {
        todayViewsMap[item.guidebook_id] = Number(item.view_count);
      });
    }

    // 5. AI 사용량 조회
    const { data: aiUsageData } = await supabase.rpc('check_ai_limit', {
      p_user_id: userId,
    });

    let aiUsage = { used: 0, limit: 3 }; // free plan default
    if (aiUsageData && aiUsageData.length > 0) {
      aiUsage = {
        used: Number(aiUsageData[0].used) || 0,
        limit: Number(aiUsageData[0].limit) || 3,
      };
    }

    // 6. 가이드북별 통계 생성
    const guidebookStats: GuidebookStat[] = guidebookList.map((gb) => ({
      id: gb.id,
      title: gb.title,
      views: gb.view_count || 0,
      todayViews: todayViewsMap[gb.id] || 0,
      lastViewed: null, // TODO: 마지막 조회 시간은 별도 쿼리 필요
    }));

    // 7. 응답 반환
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalViews,
          todayViews,
          guidebookCount: guidebookList.length,
          aiUsage,
        },
        chartData,
        guidebookStats,
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
