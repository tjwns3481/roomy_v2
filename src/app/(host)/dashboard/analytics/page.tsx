// @TASK P8-S8-T1 - 통계 페이지 고도화
// @SPEC specs/screens/s-08-analytics.yaml

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AnalyticsClient } from './AnalyticsClient';

export const metadata = {
  title: '통계 대시보드 - Roomy',
  description: '가이드북 조회 통계 및 AI 챗봇 사용량 분석',
};

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

interface AnalyticsData {
  summary: {
    totalViews: number;
    todayViews: number;
    guidebookCount: number;
    aiUsage: {
      used: number;
      limit: number;
    };
  };
  chartData: DailyViewStat[];
  guidebookStats: GuidebookStat[];
}

async function fetchAnalyticsData(period: string = '7d'): Promise<AnalyticsData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/stats?period=${period}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch analytics data:', response.status);
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
}

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const analyticsData = await fetchAnalyticsData('7d');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-h1 text-text-primary font-bold mb-2">
          통계 대시보드
        </h1>
        <p className="text-body text-text-secondary">
          가이드북 조회 통계와 AI 챗봇 사용량을 확인하세요
        </p>
      </div>

      {analyticsData ? (
        <AnalyticsClient initialData={analyticsData} />
      ) : (
        <div className="text-center py-12">
          <p className="text-body text-text-secondary">
            통계 데이터를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      )}
    </div>
  );
}
