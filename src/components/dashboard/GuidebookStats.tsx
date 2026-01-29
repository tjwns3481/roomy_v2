// @TASK P4-T4.5 - 가이드북별 통계 테이블
// @SPEC docs/planning/06-tasks.md#P4-T4.5

'use client';

import { Eye, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface GuidebookStat {
  id: string;
  title: string;
  views: number;
  todayViews: number;
  lastViewed: string | null;
}

interface GuidebookStatsProps {
  guidebooks: GuidebookStat[];
}

export function GuidebookStats({ guidebooks }: GuidebookStatsProps) {
  if (!guidebooks || guidebooks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          가이드북별 통계
        </h2>
        <div className="text-center py-8 text-gray-500">
          가이드북이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">가이드북별 통계</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가이드북
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                총 조회수
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                오늘
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {guidebooks.map((guidebook) => (
              <tr
                key={guidebook.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* 가이드북 제목 */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {guidebook.title}
                      </p>
                    </div>
                  </div>
                </td>

                {/* 총 조회수 */}
                <td className="px-6 py-4 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {guidebook.views.toLocaleString()}
                  </p>
                </td>

                {/* 오늘 조회수 */}
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 rounded-md">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      {guidebook.todayViews}
                    </span>
                  </div>
                </td>

                {/* 액션 버튼 */}
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/dashboard/stats/${guidebook.id}`}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    상세보기
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
