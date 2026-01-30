// @TASK P8-S5-T1 - AirBnB 스타일 호스트 대시보드
// @SPEC specs/screens/S-05-dashboard.yaml

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { CreateGuidebookModal } from '@/components/dashboard/CreateGuidebookModal';
import { StatCard } from '@/components/dashboard/StatCard';
import { GuidebookCard } from '@/components/dashboard/GuidebookCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { UpgradeBanner } from '@/components/subscription';
import { Plus, BookOpen } from 'lucide-react';
import type { Guidebook } from '@/types/guidebook';

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [guidebooks, setGuidebooks] = useState<Guidebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 인증 체크 - 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // 인증되지 않은 상태면 API 호출 안 함
    if (!isLoaded || !isSignedIn) return;
    loadGuidebooks();
  }, [isLoaded, isSignedIn]);

  const loadGuidebooks = async () => {
    try {
      const response = await fetch('/api/guidebooks');
      const data = await response.json();

      // 401 에러: 로그인 페이지로 리다이렉트
      if (response.status === 401) {
        router.push('/login');
        return;
      }

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

  // 인증 로딩 중이거나 로그인되지 않은 경우 로딩 표시
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-surface p-4 sm:p-6 lg:p-8">
      {/* 업그레이드 배너 */}
      <UpgradeBanner className="mb-6" dismissable />

      {/* 헤더 - AirBnB 스타일 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-h1 text-ink mb-2">환영합니다!</h1>
          <p className="text-body text-charcoal">
            가이드북 현황과 통계를 확인하세요
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="lg"
          className="shadow-airbnb-md hover:shadow-airbnb-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          새 가이드북
        </Button>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="총 가이드북"
          value={guidebooks.length.toString()}
          description="생성된 가이드북"
          icon="book"
        />
        <StatCard
          title="총 조회수"
          value={guidebooks.reduce((sum, g) => sum + g.view_count, 0).toLocaleString()}
          description="누적 조회수"
          icon="eye"
        />
        <StatCard
          title="공개 중"
          value={guidebooks.filter((g) => g.status === 'published').length.toString()}
          description="게스트에게 공개"
          icon="globe"
        />
        <StatCard
          title="플랜"
          value="Free"
          description="업그레이드 가능"
          icon="star"
        />
      </div>

      {/* 가이드북 섹션 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 text-ink">가이드북</h2>
          {guidebooks.length > 0 && (
            <span className="text-body-sm text-stone">
              {guidebooks.length}개
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-airbnb-sm">
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : guidebooks.length === 0 ? (
          <div className="bg-white rounded-airbnb-lg shadow-airbnb-sm p-12 text-center border border-cloud/30">
            <div className="w-20 h-20 bg-coral-light rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-coral" />
            </div>
            <h3 className="text-h3 text-ink mb-2">
              아직 가이드북이 없습니다
            </h3>
            <p className="text-body text-charcoal mb-6 max-w-md mx-auto">
              첫 가이드북을 만들어 게스트에게 공유해보세요.
              <br />
              몇 분이면 완성됩니다!
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="lg"
              className="shadow-airbnb-md hover:shadow-airbnb-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              첫 가이드북 만들기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guidebooks.map((guidebook) => (
              <GuidebookCard
                key={guidebook.id}
                guidebook={guidebook}
                onEdit={(id) => router.push(`/editor/${id}`)}
                onPreview={(slug) => window.open(`/g/${slug}`, '_blank')}
              />
            ))}
          </div>
        )}
      </div>

      {/* 가이드북 생성 모달 */}
      <CreateGuidebookModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
