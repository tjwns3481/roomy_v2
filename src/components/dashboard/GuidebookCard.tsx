// @TASK P4-T4.2 - 가이드북 카드 컴포넌트
// @SPEC docs/planning/06-tasks.md#P4-T4.2

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MoreVertical, Eye, Calendar, Edit, ExternalLink, Share2, Copy, Settings, Archive, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Guidebook } from '@/types/guidebook';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface GuidebookCardProps {
  guidebook: Guidebook;
  onEdit?: (id: string) => void;
  onPreview?: (slug: string) => void;
  onShare?: (guidebook: Guidebook) => void;
  onDuplicate?: (id: string) => void;
  onSettings?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * 가이드북 카드 컴포넌트
 * - 썸네일 이미지 (hero_image)
 * - 제목, 상태, URL
 * - 조회수, 수정일
 * - 액션 버튼 (수정, 미리보기, 공유, 더보기)
 */
export function GuidebookCard({
  guidebook,
  onEdit,
  onPreview,
  onShare,
  onDuplicate,
  onSettings,
  onArchive,
  onDelete,
}: GuidebookCardProps) {
  const statusConfig = {
    draft: { label: '초안', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    published: { label: '공개', color: 'bg-green-50 text-green-700 border-green-200' },
    archived: { label: '보관', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  };

  const config = statusConfig[guidebook.status];
  const updatedAt = formatDistanceToNow(new Date(guidebook.updated_at), {
    addSuffix: true,
    locale: ko,
  });

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/g/${guidebook.slug}`;

  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Hero Image */}
      <Link
        href={`/editor/${guidebook.id}`}
        className="block relative w-full aspect-video bg-gray-100 overflow-hidden"
      >
        {guidebook.hero_image_url ? (
          <Image
            src={guidebook.hero_image_url}
            alt={guidebook.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-4xl">📚</div>
          </div>
        )}

        {/* Status Badge - Absolute Top Right */}
        <div className="absolute top-3 right-3">
          <Badge
            className={cn(
              'border font-medium',
              config.color
            )}
          >
            {config.label}
          </Badge>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div>
          <Link
            href={`/editor/${guidebook.id}`}
            className="block"
          >
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 hover:text-primary transition-colors">
              {guidebook.title}
            </h3>
          </Link>

          {/* URL */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-gray-500 truncate">
              {publicUrl}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(publicUrl);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="URL 복사"
            >
              <Copy className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{guidebook.view_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{updatedAt}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit?.(guidebook.id)}
            className="flex-1"
          >
            <Edit className="w-4 h-4" />
            수정
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onPreview?.(guidebook.slug)}
          >
            <ExternalLink className="w-4 h-4" />
            미리보기
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onShare?.(guidebook)}
          >
            <Share2 className="w-4 h-4" />
            공유
          </Button>

          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="px-2">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onDuplicate?.(guidebook.id)}>
                <Copy className="w-4 h-4 mr-2" />
                복제
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSettings?.(guidebook.id)}>
                <Settings className="w-4 h-4 mr-2" />
                설정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onArchive?.(guidebook.id)}>
                <Archive className="w-4 h-4 mr-2" />
                보관
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(guidebook.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
