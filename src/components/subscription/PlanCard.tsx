/**
 * @TASK P6-T6.4 - 플랜 카드 컴포넌트
 * @SPEC docs/planning/06-tasks.md#P6-T6.4
 *
 * 플랜별 정보 및 CTA를 표시하는 카드 컴포넌트
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import type { SubscriptionPlan } from '@/types/subscription';

// ============================================================
// 타입 정의
// ============================================================

export interface PlanLimits {
  maxGuidebooks: number;
  maxAiGenerationsPerMonth: number;
  watermarkRemoved: boolean;
  customDomain: boolean;
  prioritySupport: boolean;
}

export interface PlanCardProps {
  plan: SubscriptionPlan;
  name: string;
  price: number; // 연간 가격
  features: string[];
  limits: PlanLimits;
  isCurrentPlan: boolean;
  isPopular?: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

// ============================================================
// 헬퍼 함수
// ============================================================

function formatPrice(price: number): string {
  if (price === 0) return '무료';
  return `₩${price.toLocaleString()}/년`;
}

function getMonthlyPrice(yearlyPrice: number): string {
  if (yearlyPrice === 0) return '';
  const monthly = Math.round(yearlyPrice / 12);
  return `월 ₩${monthly.toLocaleString()}`;
}

// ============================================================
// 컴포넌트
// ============================================================

export function PlanCard({
  plan,
  name,
  price,
  features,
  isCurrentPlan,
  isPopular = false,
  onSelect,
  disabled = false,
}: PlanCardProps) {
  return (
    <Card
      className={`relative transition-all ${
        isPopular
          ? 'border-blue-500 shadow-lg scale-105'
          : isCurrentPlan
          ? 'border-green-500'
          : 'hover:shadow-md'
      }`}
    >
      {/* 인기 배지 */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-blue-600 text-white">인기</Badge>
        </div>
      )}

      {/* 현재 플랜 배지 */}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-green-600 text-white">현재 플랜</Badge>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{name}</CardTitle>
        <div className="mt-4">
          <div className="text-4xl font-bold">{formatPrice(price)}</div>
          {price > 0 && (
            <CardDescription className="mt-1">{getMonthlyPrice(price)}</CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 기능 목록 */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onSelect}
          disabled={disabled || isCurrentPlan}
          className="w-full"
          variant={isPopular ? 'default' : 'outline'}
        >
          {isCurrentPlan ? '현재 플랜' : plan === 'free' ? '시작하기' : '업그레이드'}
        </Button>
      </CardFooter>
    </Card>
  );
}
