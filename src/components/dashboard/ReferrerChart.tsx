// @TASK P8-S8-T1 - 유입 경로 분석 차트
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ReferrerData {
  name: string;
  value: number;
}

interface Props {
  data: ReferrerData[];
}

const COLORS = ['#2563EB', '#F97316', '#10B981', '#F59E0B', '#6366F1'];

export function ReferrerChart({ data }: Props) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `${value.toLocaleString('ko-KR')}회`,
              '',
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
