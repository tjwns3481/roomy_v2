// @TASK P8-S8-T1 - 고급 통계 API
// @SPEC specs/screens/s-08-analytics.yaml

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface ReferrerStat {
  name: string;
  value: number;
}

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

interface ChatbotStats {
  totalQuestions: number;
  helpfulCount: number;
  notHelpfulCount: number;
  topQuestions: string[];
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * GET /api/analytics?guidebookId=xxx&type=referrer|heatmap|chatbot&period=7d|30d
 *
 * 고급 통계를 조회합니다.
 * 인증 필요
 *
 * @returns {
 *   referrer: ReferrerStat[] (유입 경로별 통계)
 *   heatmap: HeatmapData[] (시간대별 히트맵)
 *   chatbot: ChatbotStats (챗봇 질문 통계, Pro 이상)
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

    // 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const guidebookId = searchParams.get('guidebookId');
    const type = searchParams.get('type') || 'all';
    const period = searchParams.get('period') || '7d';

    let days = 7;
    if (period === '30d') {
      days = 30;
    } else if (period === '90d') {
      days = 90;
    }

    const supabase = createAdminClient();

    // 가이드북 소유권 확인
    if (guidebookId) {
      const { data: guidebook, error: guidebookError } = await supabase
        .from('guidebooks')
        .select('id, user_id')
        .eq('id', guidebookId)
        .single();

      if (guidebookError || !guidebook) {
        return NextResponse.json(
          { error: '가이드북을 찾을 수 없습니다' },
          { status: 404 }
        );
      }

      if (guidebook.user_id !== userId) {
        return NextResponse.json(
          { error: '권한이 없습니다' },
          { status: 403 }
        );
      }
    }

    const result: {
      referrer?: ReferrerStat[];
      heatmap?: HeatmapData[];
      chatbot?: ChatbotStats;
    } = {};

    // 유입 경로 통계
    if (type === 'referrer' || type === 'all') {
      try {
        const funcName = guidebookId
          ? 'get_referrer_stats'
          : 'get_user_referrer_stats';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.rpc as any)(funcName, {
          ...(guidebookId
            ? { p_guidebook_id: guidebookId }
            : { p_user_id: userId }),
          p_days: days,
        });

        if (!error && data) {
          result.referrer = data.map((item: any) => ({
            name: item.referrer_type,
            value: Number(item.view_count),
          }));
        }
      } catch (err) {
        console.error('Referrer stats error:', err);
      }
    }

    // 시간대별 히트맵 (가이드북 ID 필요)
    if ((type === 'heatmap' || type === 'all') && guidebookId) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.rpc as any)('get_hourly_stats', {
          p_guidebook_id: guidebookId,
          p_days: days,
        });

        if (!error && data) {
          result.heatmap = data.map((item: any) => ({
            day: DAY_NAMES[item.day_of_week],
            hour: item.hour_of_day,
            value: Number(item.view_count),
          }));
        }
      } catch (err) {
        console.error('Heatmap stats error:', err);
      }
    }

    // 챗봇 통계 (가이드북 ID 필요, Pro 이상)
    if ((type === 'chatbot' || type === 'all') && guidebookId) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.rpc as any)('get_chatbot_stats', {
          p_guidebook_id: guidebookId,
          p_days: days,
        });

        if (!error && data && data.length > 0) {
          const chatbotData = data[0];
          result.chatbot = {
            totalQuestions: Number(chatbotData.total_questions || 0),
            helpfulCount: Number(chatbotData.helpful_count || 0),
            notHelpfulCount: Number(chatbotData.not_helpful_count || 0),
            topQuestions: chatbotData.top_questions || [],
          };
        }
      } catch (err) {
        console.error('Chatbot stats error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}
