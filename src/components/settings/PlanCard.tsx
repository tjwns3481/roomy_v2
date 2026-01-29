// @TASK P4-T4.6 - 현재 플랜 표시 카드
// @SPEC docs/planning/06-tasks.md#P4-T4.6

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import Link from 'next/link';

type PlanType = 'free' | 'pro' | 'business';

interface PlanCardProps {
  currentPlan: PlanType;
}

const PLAN_INFO: Record<
  PlanType,
  {
    name: string;
    description: string;
    features: string[];
    color: string;
  }
> = {
  free: {
    name: 'Free',
    description: '개인 사용자를 위한 무료 플랜',
    features: ['가이드북 1개', 'AI 생성 3회/월', 'Roomy 워터마크'],
    color: 'text-gray-600',
  },
  pro: {
    name: 'Pro',
    description: '전문 호스트를 위한 플랜',
    features: ['가이드북 5개', 'AI 생성 30회/월', '워터마크 제거', '조회수 통계'],
    color: 'text-blue-600',
  },
  business: {
    name: 'Business',
    description: '비즈니스 사용자를 위한 플랜',
    features: ['무제한 가이드북', 'AI 생성 무제한', '워터마크 제거', '고급 통계', '우선 지원'],
    color: 'text-purple-600',
  },
};

export function PlanCard({ currentPlan }: PlanCardProps) {
  const planInfo = PLAN_INFO[currentPlan];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>구독 플랜</CardTitle>
          <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'} className="text-sm">
            {planInfo.name}
          </Badge>
        </div>
        <CardDescription>{planInfo.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 플랜 특징 */}
        <div className="space-y-2">
          {planInfo.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* 업그레이드 버튼 (Free 플랜만) */}
        {currentPlan === 'free' && (
          <div className="pt-2">
            <Button asChild className="w-full">
              <Link href="/settings/subscription">Pro로 업그레이드</Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              더 많은 기능을 사용하려면 업그레이드하세요
            </p>
          </div>
        )}

        {/* 플랜 변경 버튼 (Pro/Business) */}
        {currentPlan !== 'free' && (
          <div className="pt-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/settings/subscription">플랜 관리</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
