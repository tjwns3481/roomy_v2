// @TASK P4-T4.5 - 조회수 차트
// @SPEC docs/planning/06-tasks.md#P4-T4.5

'use client';

interface DailyViewStat {
  view_date: string;
  view_count: number;
}

interface StatsChartProps {
  data: DailyViewStat[];
}

export function StatsChart({ data }: StatsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">조회수 추이</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          데이터가 없습니다
        </div>
      </div>
    );
  }

  // 최대값 계산 (y축 스케일)
  const maxViews = Math.max(...data.map((d) => d.view_count), 1);
  const yAxisMax = Math.ceil(maxViews / 10) * 10; // 10 단위로 올림

  // 데이터를 시간순으로 정렬 (오래된 것부터)
  const sortedData = [...data].sort((a, b) =>
    a.view_date.localeCompare(b.view_date)
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">조회수 추이</h2>

      <div className="relative h-64">
        {/* Y축 라벨 */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
          <span>{yAxisMax}</span>
          <span>{Math.round(yAxisMax * 0.75)}</span>
          <span>{Math.round(yAxisMax * 0.5)}</span>
          <span>{Math.round(yAxisMax * 0.25)}</span>
          <span>0</span>
        </div>

        {/* 차트 영역 */}
        <div className="ml-14 h-full flex items-end gap-2">
          {sortedData.map((item, index) => {
            const height = yAxisMax > 0
              ? (item.view_count / yAxisMax) * 100
              : 0;

            const date = new Date(item.view_date);
            const label = date.toLocaleDateString('ko-KR', {
              month: 'numeric',
              day: 'numeric',
            });

            return (
              <div
                key={item.view_date}
                className="flex-1 flex flex-col items-center group"
              >
                {/* 바 */}
                <div className="relative w-full flex items-end justify-center h-48">
                  <div
                    className="w-full bg-primary rounded-t-md transition-all duration-300 hover:bg-primary/80 relative group"
                    style={{ height: `${height}%` }}
                  >
                    {/* 호버 시 값 표시 */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {item.view_count}회
                    </div>
                  </div>
                </div>

                {/* X축 라벨 */}
                <div className="text-xs text-gray-500 mt-2 text-center whitespace-nowrap">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
