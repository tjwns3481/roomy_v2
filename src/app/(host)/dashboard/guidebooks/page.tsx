// @TASK P4-T4.2 - 가이드북 목록 페이지
// @SPEC docs/planning/06-tasks.md#P4-T4.2

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GuidebookGrid } from '@/components/dashboard/GuidebookGrid';
import { useGuidebooks } from '@/hooks/useGuidebooks';
import type { GuidebookStatus } from '@/types/guidebook';

type SortOption = 'latest' | 'views' | 'name';
type FilterOption = 'all' | GuidebookStatus;

/**
 * 가이드북 목록 페이지
 * - 전체 가이드북 목록
 * - 검색, 정렬, 필터
 * - 그리드 레이아웃
 */
export default function GuidebooksPage() {
  const router = useRouter();
  const { guidebooks, isLoading, deleteGuidebook, archiveGuidebook } = useGuidebooks();

  // UI 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // 필터링 및 정렬된 가이드북 목록
  const filteredGuidebooks = useMemo(() => {
    let result = guidebooks;

    // 1. 상태 필터
    if (filterBy !== 'all') {
      result = result.filter((g) => g.status === filterBy);
    }

    // 2. 검색
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.slug.toLowerCase().includes(query) ||
          g.description?.toLowerCase().includes(query)
      );
    }

    // 3. 정렬
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'views':
          return b.view_count - a.view_count;
        case 'name':
          return a.title.localeCompare(b.title, 'ko');
        default:
          return 0;
      }
    });

    return result;
  }, [guidebooks, filterBy, searchQuery, sortBy]);

  // 액션 핸들러
  const handleEdit = (id: string) => {
    router.push(`/editor/${id}`);
  };

  const handlePreview = (slug: string) => {
    window.open(`/g/${slug}`, '_blank');
  };

  const handleShare = (guidebook: any) => {
    // TODO: 공유 모달 열기 (P5에서 구현)
    console.log('Share:', guidebook);
  };

  const handleDuplicate = async (id: string) => {
    // TODO: 복제 기능 구현
    console.log('Duplicate:', id);
  };

  const handleSettings = (id: string) => {
    router.push(`/dashboard/guidebooks/${id}/settings`);
  };

  const handleArchive = async (id: string) => {
    if (confirm('이 가이드북을 보관하시겠습니까?')) {
      await archiveGuidebook(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      await deleteGuidebook(id);
    }
  };

  const handleCreateNew = () => {
    router.push('/dashboard/guidebooks/new');
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">가이드북</h1>
            <p className="text-gray-600">
              {guidebooks.length > 0
                ? `총 ${guidebooks.length}개의 가이드북`
                : '가이드북을 만들어보세요'}
            </p>
          </div>

          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="w-5 h-5" />
            새 가이드북
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="가이드북 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="views">조회수순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter */}
          <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="published">공개</SelectItem>
              <SelectItem value="draft">초안</SelectItem>
              <SelectItem value="archived">보관</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Guidebooks Grid */}
      <GuidebookGrid
        guidebooks={filteredGuidebooks}
        isLoading={isLoading}
        onEdit={handleEdit}
        onPreview={handlePreview}
        onShare={handleShare}
        onDuplicate={handleDuplicate}
        onSettings={handleSettings}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
}
