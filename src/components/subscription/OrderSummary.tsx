/**
 * @TASK P6-T6.5 - 주문 요약 컴포넌트
 * @SPEC docs/planning/06-tasks.md#P6-T6.5
 *
 * 플랜 정보, 가격, 구독 기간 표시
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check } from 'lucide-react';
import type { SubscriptionPlan } from '@/types/subscription';
import { PLAN_LIMITS_DEFAULTS, PRICING_CARDS } from '@/types/subscription';

interface OrderSummaryProps {
  plan: Exclude<SubscriptionPlan, 'free'>;
}

export function OrderSummary({ plan }: OrderSummaryProps) {
  const planInfo = PRICING_CARDS.find((p) => p.plan === plan);
  const limits = PLAN_LIMITS_DEFAULTS[plan];

  if (!planInfo) {
    return null;
  }

  const { price, features, name, description } = planInfo;

  // 구독 기간 계산 (오늘부터 1년 후)
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">주문 요약</CardTitle>
          {plan === 'pro' && <Badge variant="default">추천</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 플랜 정보 */}
        <div>
          <h3 className="text-2xl font-bold">{name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>

        <Separator />

        {/* 구독 기간 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">구독 시작일</span>
            <span className="font-medium">{formatDate(today)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">구독 종료일</span>
            <span className="font-medium">{formatDate(nextYear)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">구독 기간</span>
            <span className="font-medium">1년 (12개월)</span>
          </div>
        </div>

        <Separator />

        {/* 가격 정보 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">플랜</span>
            <span className="font-medium">{name} 연간 구독</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">단가</span>
            <span className="font-medium">{price.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">수량</span>
            <span className="font-medium">1</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">할인</span>
            <span className="font-medium text-green-600">-0원</span>
          </div>
        </div>

        <Separator />

        {/* 합계 */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">총 결제 금액</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{price.toLocaleString()}원</div>
            <div className="text-xs text-muted-foreground">
              월 {Math.round(price / 12).toLocaleString()}원
            </div>
          </div>
        </div>

        <Separator />

        {/* 포함 혜택 */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">포함 혜택</h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 안내 사항 */}
        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-900 space-y-1">
          <p>• 구독은 즉시 시작되며, 1년 후 자동 갱신됩니다.</p>
          <p>• 언제든지 설정에서 자동 갱신을 해지할 수 있습니다.</p>
          <p>• 환불 정책은 이용약관을 참고해주세요.</p>
        </div>
      </CardContent>
    </Card>
  );
}
