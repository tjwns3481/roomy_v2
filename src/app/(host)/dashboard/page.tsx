// @TASK P4-T4.3 - 호스트 대시보드 페이지 (가이드북 목록 포함)
// @SPEC docs/planning/03-user-flow.md#호스트-대시보드

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreateGuidebookModal } from '@/components/dashboard/CreateGuidebookModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UpgradeBanner } from '@/components/subscription';
import type { Guidebook } from '@/types/guidebook';

export default function DashboardPage() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [guidebooks, setGuidebooks] = useState<Guidebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGuidebooks();
  }, []);

  const loadGuidebooks = async () => {
    try {
      const response = await fetch('/api/guidebooks');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '가이드북을 불러오는데 실패했습니다');
      }

      setGuidebooks(data.guidebooks || []);
    } catch (error) {
      console.error('가이드북 조회 오류:', error);
      toast.error('가이드북을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="p-6 lg:p-8">
      {/* 업그레이드 배너 */}
      <UpgradeBanner className="mb-6" dismissable />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
          <p className="text-gray-600">가이드북 현황과 통계를 확인하세요</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
          새 가이드북
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="총 가이드북"
          value={guidebooks.length.toString()}
          description="생성된 가이드북"
          color="blue"
        />
        <StatCard
          title="총 조회수"
          value={guidebooks.reduce((sum, g) => sum + g.view_count, 0).toString()}
          description="누적 조회수"
          color="green"
        />
        <StatCard
          title="공개 중"
          value={guidebooks.filter((g) => g.status === 'published').length.toString()}
          description="게스트에게 공개"
          color="purple"
        />
        <StatCard
          title="플랜"
          value="Free"
          description="업그레이드 가능"
          color="orange"
        />
      </div>

      {/* Guidebooks List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">가이드북 목록</h2>
          {guidebooks.length > 0 && (
            <span className="text-sm text-gray-500">{guidebooks.length}개</span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : guidebooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              아직 가이드북이 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              첫 가이드북을 만들어 게스트에게 공유해보세요
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>첫 가이드북 만들기</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {guidebooks.map((guidebook) => (
              <div
                key={guidebook.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                onClick={() => router.push(`/dashboard/editor/${guidebook.id}`)}
              >
                {/* 썸네일 */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {guidebook.hero_image_url ? (
                    <img
                      src={guidebook.hero_image_url}
                      alt={guidebook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {guidebook.title}
                    </h3>
                    {getStatusBadge(guidebook.status)}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    roomy.app/g/{guidebook.slug}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {guidebook.view_count}
                    </span>
                    <span>•</span>
                    <span>{formatDate(guidebook.updated_at)}</span>
                  </div>
                </div>

                {/* 액션 */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/g/${guidebook.slug}`, '_blank');
                    }}
                  >
                    미리보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/editor/${guidebook.id}`);
                    }}
                  >
                    편집
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 가이드북 생성 모달 */}
      <CreateGuidebookModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}

// 통계 카드 컴포넌트
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, description, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${colorClasses[color]} mb-4`}
      >
        <span className="text-2xl font-bold">{value[0]}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
