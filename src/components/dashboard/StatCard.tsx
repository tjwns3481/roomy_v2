// @TASK P8-S5-T1 - AirBnB 스타일 통계 카드
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Eye,
  Globe,
  Calendar,
  Star,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: 'book' | 'eye' | 'globe' | 'calendar' | 'star';
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

const iconMap = {
  book: BookOpen,
  eye: Eye,
  globe: Globe,
  calendar: Calendar,
  star: Star,
};

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  const Icon = iconMap[icon];

  return (
    <div
      className={cn(
        'bg-white rounded-airbnb p-6',
        'shadow-airbnb-sm hover:shadow-airbnb-md',
        'transition-all duration-300',
        'border border-cloud/30',
        className
      )}
    >
      {/* 아이콘 */}
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-coral-light rounded-airbnb">
          <Icon className="w-6 h-6 text-coral" />
        </div>

        {/* Trend 표시 */}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-body-sm font-medium',
              trend.value >= 0 ? 'text-success' : 'text-error'
            )}
          >
            {trend.value >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* 제목 */}
      <h3 className="text-body-sm text-charcoal font-medium mb-1">
        {title}
      </h3>

      {/* 값 */}
      <p className="text-h2 text-ink font-bold mb-1">{value}</p>

      {/* 설명 또는 Trend 라벨 */}
      <p className="text-body-sm text-stone">
        {trend ? trend.label : description}
      </p>
    </div>
  );
}
