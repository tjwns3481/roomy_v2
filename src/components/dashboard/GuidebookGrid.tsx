// @TASK P4-T4.2 - 가이드북 그리드 레이아웃
// @SPEC docs/planning/06-tasks.md#P4-T4.2

'use client';

import { GuidebookCard } from './GuidebookCard';
import { EmptyState } from './EmptyState';
import type { Guidebook } from '@/types/guidebook';

interface GuidebookGridProps {
  guidebooks: Guidebook[];
  isLoading?: boolean;
  onEdit?: (id: string) => void;
  onPreview?: (slug: string) => void;
  onShare?: (guidebook: Guidebook) => void;
  onDuplicate?: (id: string) => void;
  onSettings?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCreateNew?: () => void;
}

/**
 * 가이드북 그리드 컴포넌트
 * - 반응형 그리드 레이아웃
 * - 로딩 스켈레톤
 * - 빈 상태 처리
 */
export function GuidebookGrid({
  guidebooks,
  isLoading = false,
  onEdit,
  onPreview,
  onShare,
  onDuplicate,
  onSettings,
  onArchive,
  onDelete,
  onCreateNew,
}: GuidebookGridProps) {
  // 로딩 중일 때 스켈레톤 표시
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <GuidebookSkeleton key={i} />
        ))}
      </div>
    );
  }

  // 가이드북이 없을 때 빈 상태 표시
  if (guidebooks.length === 0) {
    return <EmptyState onCreateNew={onCreateNew} />;
  }

  // 가이드북 그리드
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {guidebooks.map((guidebook) => (
        <GuidebookCard
          key={guidebook.id}
          guidebook={guidebook}
          onEdit={onEdit}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
function GuidebookSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-video bg-gray-200" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-full" />
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="h-4 bg-gray-100 rounded w-16" />
          <div className="h-4 bg-gray-100 rounded w-20" />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-gray-100 rounded flex-1" />
          <div className="h-8 bg-gray-100 rounded w-20" />
          <div className="h-8 bg-gray-100 rounded w-20" />
          <div className="h-8 bg-gray-100 rounded w-10" />
        </div>
      </div>
    </div>
  );
}
