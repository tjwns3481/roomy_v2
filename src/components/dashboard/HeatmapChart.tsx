// @TASK P8-S8-T1 - 시간대별 접속 히트맵 차트
'use client';

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

interface Props {
  data: HeatmapData[];
}

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function HeatmapChart({ data }: Props) {
  // 데이터를 맵으로 변환 (빠른 조회)
  const dataMap = new Map<string, number>();
  data.forEach((item) => {
    const key = `${item.day}-${item.hour}`;
    dataMap.set(key, item.value);
  });

  // 최대값 찾기 (색상 강도 계산용)
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  // 색상 강도 계산
  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    const intensity = Math.min((value / maxValue) * 100, 100);
    if (intensity < 20) return 'bg-primary/20';
    if (intensity < 40) return 'bg-primary/40';
    if (intensity < 60) return 'bg-primary/60';
    if (intensity < 80) return 'bg-primary/80';
    return 'bg-primary';
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        {/* 시간 헤더 */}
        <div className="flex mb-2">
          <div className="w-12"></div>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="flex-1 text-center text-caption text-text-secondary"
            >
              {hour % 6 === 0 ? `${hour}시` : ''}
            </div>
          ))}
        </div>

        {/* 히트맵 그리드 */}
        {DAYS.map((day, dayIndex) => (
          <div key={day} className="flex items-center mb-1">
            <div className="w-12 text-caption text-text-secondary pr-2 text-right">
              {day}
            </div>
            {HOURS.map((hour) => {
              const value = dataMap.get(`${day}-${hour}`) || 0;
              return (
                <div
                  key={hour}
                  className={`flex-1 aspect-square rounded-sm ${getColor(
                    value
                  )} hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                  title={`${day}요일 ${hour}시: ${value}회`}
                />
              );
            })}
          </div>
        ))}

        {/* 범례 */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <span className="text-caption text-text-secondary">적음</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded-sm"></div>
            <div className="w-4 h-4 bg-primary/20 rounded-sm"></div>
            <div className="w-4 h-4 bg-primary/40 rounded-sm"></div>
            <div className="w-4 h-4 bg-primary/60 rounded-sm"></div>
            <div className="w-4 h-4 bg-primary/80 rounded-sm"></div>
            <div className="w-4 h-4 bg-primary rounded-sm"></div>
          </div>
          <span className="text-caption text-text-secondary">많음</span>
        </div>
      </div>
    </div>
  );
}
