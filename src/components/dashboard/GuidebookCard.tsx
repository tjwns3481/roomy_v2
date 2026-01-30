// @TASK P8-S5-T1 - AirBnB 스타일 가이드북 카드
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Home } from 'lucide-react';
import type { Guidebook } from '@/types/guidebook';

interface GuidebookCardProps {
  guidebook: Guidebook;
  onEdit?: (id: string) => void;
  onPreview?: (slug: string) => void;
  className?: string;
}

export function GuidebookCard({
  guidebook,
  onEdit,
  onPreview,
  className,
}: GuidebookCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { label: '초안', variant: 'secondary' as const },
      published: { label: '공개', variant: 'default' as const },
      archived: { label: '보관', variant: 'outline' as const },
    };

    const badge = variants[status as keyof typeof variants] || variants.draft;
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  return (
    <div
      className={cn(
        'bg-white rounded-airbnb overflow-hidden',
        'shadow-airbnb-sm hover:shadow-airbnb-lg',
        'transition-all duration-300',
        'border border-cloud/30',
        'group cursor-pointer',
        className
      )}
      onClick={() => onEdit?.(guidebook.id)}
    >
      {/* 썸네일 */}
      <div
        className="relative h-48 bg-snow overflow-hidden"
        data-testid="thumbnail-container"
      >
        {guidebook.hero_image_url ? (
          <img
            src={guidebook.hero_image_url}
            alt={guidebook.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-16 h-16 text-stone" />
          </div>
        )}

        {/* 상태 뱃지 - 좌상단 */}
        <div className="absolute top-3 left-3">{getStatusBadge(guidebook.status)}</div>
      </div>

      {/* 내용 */}
      <div className="p-5">
        {/* 제목 */}
        <h3 className="text-h3 text-ink font-semibold mb-2 truncate group-hover:text-coral transition-colors">
          {guidebook.title}
        </h3>

        {/* 슬러그 */}
        <p className="text-body-sm text-stone mb-3 truncate">
          roomy.app/g/{guidebook.slug}
        </p>

        {/* 통계 */}
        <div className="flex items-center gap-4 mb-4 text-body-sm text-charcoal">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{guidebook.view_count}</span>
          </div>
          <span>•</span>
          <span>{formatDate(guidebook.updated_at)}</span>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(guidebook.id);
            }}
          >
            편집
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(guidebook.slug);
            }}
          >
            미리보기
          </Button>
        </div>
      </div>
    </div>
  );
}
