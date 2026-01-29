/**
 * @TASK P6-T6.6 - 업그레이드 안내 컴포넌트
 * @SPEC docs/planning/06-tasks.md#P6-T6.6
 *
 * 상위 플랜 안내 및 업그레이드 유도
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import type { SubscriptionPlan } from '@/types/subscription';
import { PRICING_CARDS } from '@/types/subscription';

// ============================================================
// 타입 정의
// ============================================================

interface UpgradePromptProps {
  currentPlan: SubscriptionPlan;
  onUpgrade?: () => void;
}

// ============================================================
// 컴포넌트
// ============================================================

export function UpgradePrompt({ currentPlan, onUpgrade }: UpgradePromptProps) {
  // Business 플랜은 업그레이드 불가
  if (currentPlan === 'business') {
    return null;
  }

  // 추천 플랜 (Free → Pro, Pro → Business)
  const recommendedPlan = currentPlan === 'free' ? 'pro' : 'business';
  const planCard = PRICING_CARDS.find((p) => p.plan === recommendedPlan);

  if (!planCard) return null;

  // Free 사용자용 메시지
  if (currentPlan === 'free') {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Pro로 업그레이드하세요
              </CardTitle>
              <CardDescription>
                더 많은 기능으로 게스트 경험을 향상시키세요
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              인기
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 주요 혜택 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Pro 플랜 혜택</h4>
            <ul className="space-y-2">
              {planCard.features.slice(0, 4).map((feature) => (
                <li key={feature} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* 가격 */}
          <div className="p-4 bg-white rounded-lg border space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                ₩{planCard.monthlyPrice.toLocaleString()}
              </span>
              <span className="text-muted-foreground">/월</span>
            </div>
            <p className="text-xs text-muted-foreground">
              연간 결제 시 ₩{planCard.price.toLocaleString()} (월별보다 저렴)
            </p>
          </div>

          {/* 업그레이드 버튼 */}
          <div className="flex flex-col gap-2">
            {onUpgrade ? (
              <Button onClick={onUpgrade} size="lg" className="w-full">
                지금 업그레이드
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full">
                <Link href="/pricing">
                  플랜 보기
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
            <p className="text-xs text-center text-muted-foreground">
              언제든지 취소 가능합니다
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pro 사용자용 메시지
  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Business로 업그레이드하세요
            </CardTitle>
            <CardDescription>
              무제한 기능으로 비즈니스를 성장시키세요
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 주요 혜택 */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Business 플랜 추가 혜택</h4>
          <ul className="space-y-2">
            <li className="flex items-start text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 shrink-0" />
              무제한 가이드북 생성
            </li>
            <li className="flex items-start text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 shrink-0" />
              무제한 AI 생성
            </li>
            <li className="flex items-start text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 shrink-0" />
              커스텀 도메인 지원
            </li>
            <li className="flex items-start text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 shrink-0" />
              우선 지원 및 팀 협업
            </li>
          </ul>
        </div>

        {/* 가격 */}
        <div className="p-4 bg-white rounded-lg border space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              ₩{planCard.monthlyPrice.toLocaleString()}
            </span>
            <span className="text-muted-foreground">/월</span>
          </div>
          <p className="text-xs text-muted-foreground">
            연간 결제 시 ₩{planCard.price.toLocaleString()}
          </p>
        </div>

        {/* 업그레이드 버튼 */}
        <div className="flex flex-col gap-2">
          {onUpgrade ? (
            <Button onClick={onUpgrade} size="lg" className="w-full">
              Business로 업그레이드
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button asChild size="lg" className="w-full">
              <Link href="/pricing">
                플랜 보기
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild className="w-full">
            <Link href="/contact">영업팀에 문의하기</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default UpgradePrompt;
