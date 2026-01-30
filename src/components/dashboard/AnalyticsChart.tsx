// @TASK P8-S8-T1 - 조회수 추이 차트 컴포넌트
'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

interface DailyViewStat {
  view_date: string;
  view_count: number;
}

interface Props {
  data: DailyViewStat[];
  period: 'daily' | 'weekly' | 'monthly';
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-caption text-text-secondary mb-1">
          {payload[0].payload.view_date}
        </p>
        <p className="text-body font-semibold text-text-primary">
          조회수: {payload[0].value?.toLocaleString('ko-KR')}
        </p>
      </div>
    );
  }
  return null;
}

export function AnalyticsChart({ data, period }: Props) {
  // 데이터 가공 (기간별)
  const processedData = React.useMemo(() => {
    if (period === 'daily') {
      return data;
    }

    if (period === 'weekly') {
      // 주별로 그룹화 (7일씩)
      const weeklyData: DailyViewStat[] = [];
      for (let i = 0; i < data.length; i += 7) {
        const weekSlice = data.slice(i, i + 7);
        if (weekSlice.length > 0) {
          const totalViews = weekSlice.reduce(
            (sum, item) => sum + item.view_count,
            0
          );
          weeklyData.push({
            view_date: weekSlice[0].view_date,
            view_count: totalViews,
          });
        }
      }
      return weeklyData;
    }

    if (period === 'monthly') {
      // 월별로 그룹화
      const monthlyMap = new Map<string, number>();
      data.forEach((item) => {
        const month = item.view_date.substring(0, 7); // YYYY-MM
        const current = monthlyMap.get(month) || 0;
        monthlyMap.set(month, current + item.view_count);
      });
      return Array.from(monthlyMap.entries()).map(([month, count]) => ({
        view_date: month,
        view_count: count,
      }));
    }

    return data;
  }, [data, period]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={processedData}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="view_date"
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => {
              if (period === 'monthly') {
                return value; // YYYY-MM
              }
              return value.substring(5); // MM-DD
            }}
          />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="view_count"
            stroke="#2563EB"
            strokeWidth={2}
            fill="url(#colorViews)"
          />
          <Line
            type="monotone"
            dataKey="view_count"
            stroke="#2563EB"
            strokeWidth={2}
            dot={{ fill: '#2563EB', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
