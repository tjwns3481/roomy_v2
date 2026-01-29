// @TASK P4-T4.5 - 기간 선택 컴포넌트
// @SPEC docs/planning/06-tasks.md#P4-T4.5

'use client';

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const PERIODS = [
  { value: 'today', label: '오늘' },
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' },
  { value: 'all', label: '전체' },
] as const;

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="inline-flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-all
            ${
              value === period.value
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
