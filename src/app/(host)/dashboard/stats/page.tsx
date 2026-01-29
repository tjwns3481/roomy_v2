// @TASK P4-T4.5 - 호스트 통계 페이지
// @SPEC docs/planning/06-tasks.md#P4-T4.5

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  StatsOverview,
  StatsChart,
  GuidebookStats,
  DateRangePicker,
} from '@/components/dashboard';
import { Loader2 } from 'lucide-react';

interface StatsData {
  summary: {
    totalViews: number;
    todayViews: number;
    guidebookCount: number;
    aiUsage: {
      used: number;
      limit: number;
    };
  };
  chartData: Array<{
    view_date: string;
    view_count: number;
  }>;
  guidebookStats: Array<{
    id: string;
    title: string;
    views: number;
    todayViews: number;
    lastViewed: string | null;
  }>;
}

export default function StatsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState('7d');
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats(period);
  }, [period]);

  async function fetchStats(selectedPeriod: string) {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/stats?period=${selectedPeriod}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('통계를 불러오는데 실패했습니다');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.error || '알 수 없는 오류가 발생했습니다');
      }
    } catch (err) {
      console.error('통계 조회 에러:', err);
      setError(err instanceof Error ? err.message : '통계를 불러올 수 없습니다');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchStats(period)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">통계</h1>
          <p className="text-gray-600 mt-1">
            가이드북 조회수와 사용 현황을 확인하세요
          </p>
        </div>

        <DateRangePicker value={period} onChange={setPeriod} />
      </div>

      {/* Stats Overview */}
      <StatsOverview summary={data.summary} />

      {/* Charts */}
      <StatsChart data={data.chartData} />

      {/* Guidebook Stats Table */}
      <GuidebookStats guidebooks={data.guidebookStats} />
    </div>
  );
}
