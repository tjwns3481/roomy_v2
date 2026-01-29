/**
 * @TASK P6-T6.4 - 플랜 비교 및 선택 페이지
 * @SPEC docs/planning/06-tasks.md#P6-T6.4
 *
 * 플랜 비교 및 업그레이드 페이지
 */

'use client';

import { useState } from 'react';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useSubscription } from '@/hooks/useSubscription';
import { PlanCard, FeatureComparison } from '@/components/subscription';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// ============================================================
// 컴포넌트
// ============================================================

export default function PricingPage() {
  const router = useRouter();
  const { plans, isLoading: plansLoading, error: plansError } = usePlanLimits();
  const { currentPlan, upgrade, isLoading: subscriptionLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'business' | null>(null);

  // 플랜 선택 핸들러
  const handleSelectPlan = async (plan: 'free' | 'pro' | 'business') => {
    // Free 플랜은 선택 불가 (다운그레이드 방지)
    if (plan === 'free') {
      toast.error('무료 플랜으로는 다운그레이드할 수 없습니다');
      return;
    }

    // 현재 플랜과 동일하면 무시
    if (plan === currentPlan) {
      return;
    }

    try {
      setSelectedPlan(plan);

      // 업그레이드 시도
      const success = await upgrade(plan);

      if (success) {
        toast.success(`${plan === 'pro' ? 'Pro' : 'Business'} 플랜으로 업그레이드되었습니다!`);

        // 결제 페이지로 이동
        router.push('/settings/billing');
      } else {
        toast.error('업그레이드에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Failed to upgrade:', error);
      toast.error('업그레이드 중 오류가 발생했습니다.');
    } finally {
      setSelectedPlan(null);
    }
  };

  // 로딩 상태
  if (plansLoading || subscriptionLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  // 에러 상태
  if (plansError) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>
            플랜 정보를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">플랜 선택</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          당신의 비즈니스에 맞는 플랜을 선택하세요. 언제든지 업그레이드할 수 있습니다.
        </p>
      </div>

      {/* 플랜 카드 */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <PlanCard
            key={plan.plan}
            plan={plan.plan}
            name={plan.name}
            price={plan.priceYearly}
            features={plan.features}
            limits={plan.limits}
            isCurrentPlan={plan.plan === currentPlan}
            isPopular={plan.isPopular}
            onSelect={() => handleSelectPlan(plan.plan)}
            disabled={selectedPlan !== null}
          />
        ))}
      </div>

      {/* 기능 비교 테이블 */}
      <div className="mb-12">
        <FeatureComparison
          plans={plans.map((p) => ({
            plan: p.plan,
            name: p.name,
            limits: p.limits,
          }))}
        />
      </div>

      {/* FAQ 섹션 */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">자주 묻는 질문</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">플랜을 중간에 변경할 수 있나요?</h3>
            <p className="text-muted-foreground">
              네, 언제든지 업그레이드할 수 있습니다. 남은 기간은 자동으로 계산되어 새 플랜에 반영됩니다.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">결제 수단은 무엇이 있나요?</h3>
            <p className="text-muted-foreground">
              신용카드 및 계좌이체를 지원합니다. 모든 결제는 토스페이먼츠를 통해 안전하게 처리됩니다.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">환불 정책은 어떻게 되나요?</h3>
            <p className="text-muted-foreground">
              결제 후 7일 이내 전액 환불이 가능합니다. 이후에는 남은 기간에 대해 부분 환불이 가능합니다.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">비즈니스 플랜의 팀 협업 기능은 무엇인가요?</h3>
            <p className="text-muted-foreground">
              여러 사용자가 하나의 가이드북을 함께 편집할 수 있으며, 권한 관리 기능도 제공됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
