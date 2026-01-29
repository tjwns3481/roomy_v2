/**
 * @TASK P6-T6.6 - 현재 구독 정보 카드
 * @SPEC docs/planning/06-tasks.md#P6-T6.6
 *
 * 현재 플랜 이름, 상태, 다음 결제일, 취소 예정 표시
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, CheckCircle, Clock, CreditCard } from 'lucide-react';
import type { Subscription, SubscriptionPlan } from '@/types/subscription';
import { PRICING_CARDS } from '@/types/subscription';

// ============================================================
// 타입 정의
// ============================================================

interface CurrentPlanCardProps {
  subscription: Subscription | null;
  currentPlan: SubscriptionPlan;
  isActive: boolean;
  daysUntilExpiry: number | null;
  isCanceling: boolean;
  onUpgrade?: () => void;
  onReactivate?: () => void;
}

// ============================================================
// 유틸리티 함수
// ============================================================

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function getPlanName(plan: SubscriptionPlan): string {
  const planCard = PRICING_CARDS.find((p) => p.plan === plan);
  return planCard?.name ?? plan;
}

function getPlanColor(plan: SubscriptionPlan): string {
  const colors = {
    free: 'bg-gray-100 text-gray-800',
    pro: 'bg-blue-100 text-blue-800',
    business: 'bg-purple-100 text-purple-800',
  };
  return colors[plan] ?? colors.free;
}

// ============================================================
// 컴포넌트
// ============================================================

export function CurrentPlanCard({
  subscription,
  currentPlan,
  isActive,
  daysUntilExpiry,
  isCanceling,
  onUpgrade,
  onReactivate,
}: CurrentPlanCardProps) {
  // 플랜 정보
  const planCard = PRICING_CARDS.find((p) => p.plan === currentPlan);
  const planName = getPlanName(currentPlan);
  const planColor = getPlanColor(currentPlan);

  // 상태 메시지
  const getStatusMessage = () => {
    if (isCanceling && daysUntilExpiry !== null) {
      return `${daysUntilExpiry}일 후 자동으로 해지됩니다`;
    }
    if (subscription?.currentPeriodEnd) {
      return `다음 결제일: ${formatDate(subscription.currentPeriodEnd)}`;
    }
    return '무료 플랜을 사용 중입니다';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">현재 플랜</CardTitle>
            <CardDescription className="mt-1">
              {getStatusMessage()}
            </CardDescription>
          </div>
          {isActive && !isCanceling ? (
            <Badge className={planColor}>
              <CheckCircle className="h-3 w-3 mr-1" />
              활성
            </Badge>
          ) : isCanceling ? (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Clock className="h-3 w-3 mr-1" />
              취소 예정
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              미활성
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 플랜 정보 */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{planName}</span>
            {planCard && planCard.price > 0 && (
              <span className="text-lg text-muted-foreground">
                ₩{planCard.monthlyPrice.toLocaleString()}/월
              </span>
            )}
          </div>
          {planCard && (
            <p className="text-sm text-muted-foreground">{planCard.description}</p>
          )}
        </div>

        {/* 주요 혜택 */}
        {planCard && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">주요 혜택</h4>
            <ul className="space-y-1.5">
              {planCard.features.slice(0, 3).map((feature) => (
                <li key={feature} className="text-sm text-muted-foreground flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 결제 정보 */}
        {subscription && subscription.currentPeriodEnd && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                다음 결제일
              </span>
              <span className="font-medium">
                {formatDate(subscription.currentPeriodEnd)}
              </span>
            </div>
            {planCard && planCard.price > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  결제 금액
                </span>
                <span className="font-medium">
                  ₩{planCard.price.toLocaleString()}/년
                </span>
              </div>
            )}
          </div>
        )}

        {/* 취소 예정 안내 */}
        {isCanceling && daysUntilExpiry !== null && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  구독 해지가 예약되었습니다
                </p>
                <p className="text-xs text-yellow-800">
                  {subscription?.currentPeriodEnd ? (
                    <>
                      {formatDate(subscription.currentPeriodEnd)}까지 모든 기능을 사용하실 수 있습니다.
                      그 이후 자동으로 Free 플랜으로 전환됩니다.
                    </>
                  ) : (
                    '기간 종료 시 자동으로 Free 플랜으로 전환됩니다.'
                  )}
                </p>
                {onReactivate && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onReactivate}
                    className="mt-2"
                  >
                    구독 복원하기
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 업그레이드 버튼 */}
        {currentPlan !== 'business' && !isCanceling && onUpgrade && (
          <Button onClick={onUpgrade} className="w-full">
            {currentPlan === 'free' ? '플랜 업그레이드' : 'Business로 업그레이드'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default CurrentPlanCard;
