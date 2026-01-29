/**
 * @TASK P6-T6.6 - 구독 관리 페이지
 * @SPEC docs/planning/06-tasks.md#P6-T6.6
 *
 * 구독 정보, 사용량, 결제 내역을 한눈에 확인
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import {
  CurrentPlanCard,
  UsageOverview,
  PaymentHistory,
  CancelSubscriptionModal,
  UpgradePrompt,
} from '@/components/subscription';

// ============================================================
// 페이지 컴포넌트
// ============================================================

export default function SubscriptionPage() {
  const router = useRouter();

  // 구독 정보
  const {
    subscription,
    planLimits,
    usage,
    isActive,
    daysUntilExpiry,
    currentPlan,
    isCanceling,
    canUpgrade,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchSubscription,
    cancel,
    reactivate,
  } = useSubscription();

  // 결제 내역
  const {
    payments,
    pagination,
    isLoading: paymentsLoading,
    getStatusLabel,
    getStatusColor,
    formatAmount,
    formatDate,
    goToPage,
  } = usePaymentHistory();

  // 취소 모달 상태
  const [showCancelModal, setShowCancelModal] = useState(false);

  // 업그레이드 버튼 핸들러
  const handleUpgrade = useCallback(() => {
    router.push('/pricing');
  }, [router]);

  // 구독 취소 핸들러
  const handleCancel = useCallback(async (immediately: boolean, reason?: string) => {
    try {
      const success = await cancel(immediately);

      if (success) {
        toast.success(
          immediately
            ? '구독이 즉시 해지되었습니다'
            : '구독 해지가 예약되었습니다'
        );
        return true;
      } else {
        toast.error('구독 해지에 실패했습니다');
        return false;
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast.error('구독 해지 중 오류가 발생했습니다');
      return false;
    }
  }, [cancel]);

  // 구독 복원 핸들러
  const handleReactivate = useCallback(async () => {
    try {
      const success = await reactivate();

      if (success) {
        toast.success('구독이 복원되었습니다');
      } else {
        toast.error('구독 복원에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      toast.error('구독 복원 중 오류가 발생했습니다');
    }
  }, [reactivate]);

  // 로딩 상태
  if (subscriptionLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (subscriptionError) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">구독 정보를 불러올 수 없습니다</h2>
          <p className="text-muted-foreground mb-6">{subscriptionError.message}</p>
          <Button onClick={() => refetchSubscription()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">구독 관리</h1>
          <p className="text-muted-foreground mt-1">
            플랜, 사용량, 결제 내역을 관리하세요
          </p>
        </div>
      </div>

      <Separator />

      {/* 메인 콘텐츠 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 왼쪽: 현재 플랜 + 업그레이드 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 현재 플랜 */}
          <CurrentPlanCard
            subscription={subscription}
            currentPlan={currentPlan}
            isActive={isActive}
            daysUntilExpiry={daysUntilExpiry}
            isCanceling={isCanceling}
            onUpgrade={handleUpgrade}
            onReactivate={handleReactivate}
          />

          {/* 결제 내역 */}
          <PaymentHistory
            payments={payments}
            pagination={pagination}
            isLoading={paymentsLoading}
            onPageChange={goToPage}
            getStatusLabel={getStatusLabel}
            getStatusColor={getStatusColor}
            formatAmount={formatAmount}
            formatDate={formatDate}
          />
        </div>

        {/* 오른쪽: 사용량 + 업그레이드 안내 */}
        <div className="space-y-6">
          {/* 사용량 현황 */}
          <UsageOverview
            guidebooks={{
              current: usage?.guidebooks ?? 0,
              limit: planLimits?.maxGuidebooks ?? 1,
            }}
            aiGenerations={{
              current: usage?.aiGenerations ?? 0,
              limit: planLimits?.maxAiGenerationsPerMonth ?? 3,
            }}
            planLimits={planLimits}
          />

          {/* 업그레이드 안내 */}
          {canUpgrade && (
            <UpgradePrompt
              currentPlan={currentPlan}
              onUpgrade={handleUpgrade}
            />
          )}
        </div>
      </div>

      {/* 하단: 구독 취소 버튼 */}
      {isActive && !isCanceling && currentPlan !== 'free' && (
        <div className="pt-6 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">구독 해지</h3>
              <p className="text-xs text-muted-foreground mt-1">
                더 이상 구독이 필요하지 않으신가요?
              </p>
            </div>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowCancelModal(true)}
            >
              구독 해지하기
            </Button>
          </div>
        </div>
      )}

      {/* 구독 취소 모달 */}
      <CancelSubscriptionModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        onConfirm={handleCancel}
        currentPeriodEnd={subscription?.currentPeriodEnd ?? null}
        planName={currentPlan.toUpperCase()}
      />
    </div>
  );
}
