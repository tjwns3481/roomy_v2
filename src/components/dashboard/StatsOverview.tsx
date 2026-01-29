// @TASK P4-T4.5 - 통계 요약 카드
// @SPEC docs/planning/06-tasks.md#P4-T4.5

'use client';

import { TrendingUp, TrendingDown, Eye, FileText, Sparkles } from 'lucide-react';

interface StatsOverviewProps {
  summary: {
    totalViews: number;
    todayViews: number;
    guidebookCount: number;
    aiUsage: {
      used: number;
      limit: number;
    };
  };
}

export function StatsOverview({ summary }: StatsOverviewProps) {
  const aiPercentage = summary.aiUsage.limit > 0
    ? Math.round((summary.aiUsage.used / summary.aiUsage.limit) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 총 조회수 */}
      <StatCard
        icon={<Eye className="w-6 h-6" />}
        title="총 조회수"
        value={summary.totalViews.toLocaleString()}
        iconColor="text-blue-600"
        bgColor="bg-blue-50"
      />

      {/* 오늘 조회 */}
      <StatCard
        icon={<TrendingUp className="w-6 h-6" />}
        title="오늘 조회"
        value={summary.todayViews.toLocaleString()}
        iconColor="text-green-600"
        bgColor="bg-green-50"
      />

      {/* 가이드북 수 */}
      <StatCard
        icon={<FileText className="w-6 h-6" />}
        title="가이드북"
        value={`${summary.guidebookCount}개`}
        iconColor="text-purple-600"
        bgColor="bg-purple-50"
      />

      {/* AI 생성 횟수 */}
      <StatCard
        icon={<Sparkles className="w-6 h-6" />}
        title="AI 생성"
        value={`${summary.aiUsage.used}/${summary.aiUsage.limit}회`}
        subtitle="이번 달"
        iconColor="text-orange-600"
        bgColor="bg-orange-50"
        progress={aiPercentage}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  iconColor: string;
  bgColor: string;
  progress?: number;
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  iconColor,
  bgColor,
  progress,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor} ${iconColor}`}>
          {icon}
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>

      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}

      {progress !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress}% 사용</p>
        </div>
      )}
    </div>
  );
}
