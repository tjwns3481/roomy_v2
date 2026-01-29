// @TASK P4-T4.5 - 호스트 통계 페이지 데모
// @SPEC docs/planning/06-tasks.md#P4-T4.5

'use client';

import { useState } from 'react';
import {
  StatsOverview,
  StatsChart,
  GuidebookStats,
  DateRangePicker,
} from '@/components/dashboard';

// Mock 데이터 생성 함수
function generateMockData(period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 1;

  // 차트 데이터 생성
  const chartData = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      view_date: date.toISOString().split('T')[0],
      view_count: Math.floor(Math.random() * 50) + 10,
    };
  });

  const todayViews = chartData[chartData.length - 1]?.view_count || 0;
  const totalViews = 1034;

  return {
    summary: {
      totalViews,
      todayViews,
      guidebookCount: 3,
      aiUsage: {
        used: 12,
        limit: 30,
      },
    },
    chartData,
    guidebookStats: [
      {
        id: 'gb-1',
        title: '강남역 아파트',
        views: 523,
        todayViews: 12,
        lastViewed: null,
      },
      {
        id: 'gb-2',
        title: '제주도 펜션',
        views: 301,
        todayViews: 8,
        lastViewed: null,
      },
      {
        id: 'gb-3',
        title: '부산 해운대',
        views: 210,
        todayViews: 5,
        lastViewed: null,
      },
    ],
  };
}

const DEMO_STATES = {
  normal: '일반 상태 (7일)',
  loading: '로딩 중',
  empty: '빈 데이터',
  month: '30일 기간',
} as const;

type DemoState = keyof typeof DEMO_STATES;

export default function StatsDemoPage() {
  const [demoState, setDemoState] = useState<DemoState>('normal');
  const [period, setPeriod] = useState('7d');

  // 상태별 데이터
  const data = demoState === 'empty'
    ? {
        summary: {
          totalViews: 0,
          todayViews: 0,
          guidebookCount: 0,
          aiUsage: { used: 0, limit: 3 },
        },
        chartData: [],
        guidebookStats: [],
      }
    : demoState === 'month'
    ? generateMockData('30d')
    : generateMockData(period);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 데모 컨트롤 */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                P4-T4.5 호스트 통계 페이지 데모
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                통계 요약, 차트, 가이드북별 통계 테이블
              </p>
            </div>
          </div>

          {/* 상태 선택 */}
          <div className="flex gap-2">
            {(Object.keys(DEMO_STATES) as DemoState[]).map((state) => (
              <button
                key={state}
                onClick={() => {
                  setDemoState(state);
                  if (state === 'month') setPeriod('30d');
                  else if (state === 'normal') setPeriod('7d');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  demoState === state
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {DEMO_STATES[state]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 실제 페이지 렌더링 */}
      <div className="max-w-7xl mx-auto">
        {demoState === 'loading' ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">통계를 불러오는 중...</p>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      {/* 상태 정보 */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            현재 상태: {DEMO_STATES[demoState]}
          </h3>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(
              {
                demoState,
                period,
                summary: data.summary,
                chartDataLength: data.chartData.length,
                guidebookStatsLength: data.guidebookStats.length,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
