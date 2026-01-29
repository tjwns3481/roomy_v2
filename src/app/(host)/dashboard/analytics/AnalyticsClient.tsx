// @TASK P8-S8-T1 - 통계 페이지 클라이언트 컴포넌트
'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart';
import { ReferrerChart } from '@/components/dashboard/ReferrerChart';
import { Eye, TrendingUp, BookOpen, Sparkles } from 'lucide-react';

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

interface ReferrerData {
  name: string;
  value: number;
}

interface Props {
  initialData: AnalyticsData;
}

export function AnalyticsClient({ initialData }: Props) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [referrerData, setReferrerData] = useState<ReferrerData[]>([]);
  const [loading, setLoading] = useState(false);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // 유입 경로 데이터 로드
  useEffect(() => {
    async function fetchReferrerData() {
      setLoading(true);
      try {
        const response = await fetch('/api/analytics?type=referrer&period=30d');
        if (response.ok) {
          const result = await response.json();
          if (result.data?.referrer) {
            setReferrerData(result.data.referrer);
          }
        }
      } catch (error) {
        console.error('Failed to fetch referrer data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReferrerData();
  }, []);

  return (
    <div className="space-y-6">
      {/* 요약 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-surface border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-caption text-text-secondary">전체 조회수</p>
              <p className="text-h3 font-bold text-text-primary">
                {formatNumber(initialData.summary.totalViews)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-surface border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-caption text-text-secondary">오늘 조회수</p>
              <p className="text-h3 font-bold text-text-primary">
                {formatNumber(initialData.summary.todayViews)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-surface border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-caption text-text-secondary">가이드북 수</p>
              <p className="text-h3 font-bold text-text-primary">
                {initialData.summary.guidebookCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-surface border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-caption text-text-secondary">AI 사용량</p>
              <p className="text-h3 font-bold text-text-primary">
                {initialData.summary.aiUsage.used} / {initialData.summary.aiUsage.limit}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 조회수 추이 차트 */}
      <Card className="p-6 bg-surface border border-border">
        <div className="mb-6">
          <h2 className="text-h2 font-semibold text-text-primary mb-2">
            조회수 추이
          </h2>
          <p className="text-caption text-text-secondary">
            기간별 가이드북 조회 통계
          </p>
        </div>

        <Tabs
          value={period}
          onValueChange={(value) => setPeriod(value as typeof period)}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="daily">일별</TabsTrigger>
            <TabsTrigger value="weekly">주별</TabsTrigger>
            <TabsTrigger value="monthly">월별</TabsTrigger>
          </TabsList>
        </Tabs>

        <AnalyticsChart data={initialData.chartData} period={period} />
      </Card>

      {/* 유입 경로 분석 */}
      {referrerData.length > 0 && (
        <Card className="p-6 bg-surface border border-border">
          <div className="mb-6">
            <h2 className="text-h2 font-semibold text-text-primary mb-2">
              유입 경로 분석
            </h2>
            <p className="text-caption text-text-secondary">
              QR, 링크, 직접 접속 비율
            </p>
          </div>

          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <ReferrerChart data={referrerData} />
          )}
        </Card>
      )}

      {/* 가이드북별 통계 */}
      <Card className="p-6 bg-surface border border-border">
        <div className="mb-6">
          <h2 className="text-h2 font-semibold text-text-primary mb-2">
            가이드북별 통계
          </h2>
          <p className="text-caption text-text-secondary">
            각 가이드북의 조회 현황
          </p>
        </div>

        <div className="space-y-4">
          {initialData.guidebookStats.length > 0 ? (
            initialData.guidebookStats.map((stat, index) => (
              <div
                key={stat.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-bold rounded-full text-caption">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-body font-semibold text-text-primary">
                      {stat.title}
                    </h3>
                    <p className="text-caption text-text-secondary">
                      전체 {formatNumber(stat.views)}회 · 오늘{' '}
                      {formatNumber(stat.todayViews)}회
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-body text-text-secondary">
                아직 통계가 없습니다.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
