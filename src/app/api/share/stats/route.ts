// @TASK P5-T5.5 - 공유 통계 조회 API
// @SPEC docs/planning/06-tasks.md#P5-T5.5

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';
import { ShareStatsPeriod, ShareStatsSummary, DailyShareStat } from '@/types/share';

export const dynamic = 'force-dynamic';

// UUID 형식 검증
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 유효한 기간
const VALID_PERIODS: ShareStatsPeriod[] = ['7d', '30d', 'all'];

/**
 * GET /api/share/stats?guidebookId={id}&period={7d|30d|all}
 *
 * 가이드북 공유 통계를 조회합니다.
 * 인증 필요 (가이드북 소유자만 조회 가능)
 *
 * @param request - NextRequest
 * @returns 공유 통계 데이터
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guidebookId = searchParams.get('guidebookId');
    const period = (searchParams.get('period') || 'all') as ShareStatsPeriod;

    // 1. 필수 파라미터 검증
    if (!guidebookId) {
      return NextResponse.json(
        { error: 'guidebookId 파라미터가 필요합니다' },
        { status: 400 }
      );
    }

    // 2. UUID 형식 검증
    if (!UUID_REGEX.test(guidebookId)) {
      return NextResponse.json(
        { error: '잘못된 가이드북 ID 형식입니다' },
        { status: 400 }
      );
    }

    // 3. 기간 검증
    if (!VALID_PERIODS.includes(period)) {
      return NextResponse.json(
        { error: `유효하지 않은 기간입니다. 허용: ${VALID_PERIODS.join(', ')}` },
        { status: 400 }
      );
    }

    // 4. 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 5. Admin client 사용
    const supabase = createAdminClient();

    // 6. 가이드북 조회 및 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, user_id, title')
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

    // 7. 통계 요약 조회 (RPC 또는 직접 쿼리)
    let summary: ShareStatsSummary = {
      totalShares: 0,
      shortUrlClicks: 0,
      linkCopies: 0,
      qrDownloads: 0,
      socialShares: {
        kakao: 0,
        twitter: 0,
        facebook: 0,
      },
    };

    // 기간에 따른 시작 날짜 계산
    const getStartDate = (p: ShareStatsPeriod): Date | null => {
      const now = new Date();
      switch (p) {
        case '7d':
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d':
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        default:
          return null;
      }
    };

    const startDate = getStartDate(period);

    // RPC 호출 시도 (타입 정의가 없는 RPC 함수이므로 any 캐스트)
    const { data: summaryData, error: summaryError } = await (supabase.rpc as any)(
      'get_share_stats_summary',
      {
        p_guidebook_id: guidebookId,
        p_period: period,
      }
    );

    if (!summaryError && summaryData && summaryData.length > 0) {
      const data = summaryData[0];
      summary = {
        totalShares: Number(data.total_shares) || 0,
        shortUrlClicks: Number(data.short_url_clicks) || 0,
        linkCopies: Number(data.link_copies) || 0,
        qrDownloads: Number(data.qr_downloads) || 0,
        socialShares: {
          kakao: Number(data.kakao_shares) || 0,
          twitter: Number(data.twitter_shares) || 0,
          facebook: Number(data.facebook_shares) || 0,
        },
      };
    } else {
      // RPC가 없는 경우 직접 쿼리
      let query = supabase
        .from('share_events')
        .select('event_type, event_data')
        .eq('guidebook_id', guidebookId);

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data: events } = await query;

      if (events) {
        events.forEach((event) => {
          summary.totalShares++;

          switch (event.event_type) {
            case 'short_url_click':
              summary.shortUrlClicks++;
              break;
            case 'link_copy':
              summary.linkCopies++;
              break;
            case 'qr_download':
              summary.qrDownloads++;
              break;
            case 'social_share':
              const platform = (event.event_data as { platform?: string })?.platform;
              if (platform === 'kakao') summary.socialShares.kakao++;
              else if (platform === 'twitter') summary.socialShares.twitter++;
              else if (platform === 'facebook') summary.socialShares.facebook++;
              break;
          }
        });
      }
    }

    // 8. 일별 통계 조회
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 365;
    let dailyStats: DailyShareStat[] = [];

    const { data: dailyData, error: dailyError } = await supabase.rpc(
      'get_share_daily_stats',
      {
        p_guidebook_id: guidebookId,
        p_days: days,
      }
    );

    if (!dailyError && dailyData) {
      dailyStats = dailyData.map((item: {
        share_date: string;
        share_count: number;
        link_copies: number;
        qr_downloads: number;
        social_shares: number;
      }) => ({
        date: item.share_date,
        count: Number(item.share_count) || 0,
        linkCopies: Number(item.link_copies) || 0,
        qrDownloads: Number(item.qr_downloads) || 0,
        socialShares: Number(item.social_shares) || 0,
      }));
    } else {
      // RPC가 없는 경우 직접 쿼리
      const periodStartDate = new Date();
      periodStartDate.setDate(periodStartDate.getDate() - days);

      const { data: eventsData } = await supabase
        .from('share_events')
        .select('event_type, created_at')
        .eq('guidebook_id', guidebookId)
        .gte('created_at', periodStartDate.toISOString())
        .order('created_at', { ascending: false });

      if (eventsData) {
        // 일별로 그룹핑
        const groupedByDate: Record<string, DailyShareStat> = {};

        eventsData.forEach((event) => {
          const date = new Date(event.created_at).toISOString().split('T')[0];

          if (!groupedByDate[date]) {
            groupedByDate[date] = {
              date,
              count: 0,
              linkCopies: 0,
              qrDownloads: 0,
              socialShares: 0,
            };
          }

          groupedByDate[date].count++;

          switch (event.event_type) {
            case 'link_copy':
              groupedByDate[date].linkCopies++;
              break;
            case 'qr_download':
              groupedByDate[date].qrDownloads++;
              break;
            case 'social_share':
              groupedByDate[date].socialShares++;
              break;
          }
        });

        dailyStats = Object.values(groupedByDate).sort((a, b) =>
          b.date.localeCompare(a.date)
        );
      }
    }

    // 9. 응답 반환
    return NextResponse.json({
      success: true,
      data: {
        guidebookId,
        period,
        summary,
        dailyStats,
      },
    });
  } catch (error) {
    console.error('공유 통계 조회 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}
