/**
 * @TASK P6-T6.3 - 플랜 정보 API
 * @SPEC docs/planning/02-trd.md#plans
 *
 * GET - 모든 플랜 정보 조회
 */

import { NextResponse } from 'next/server';
import { getAllPlans } from '@/lib/subscription';
import { PRICING_CARDS } from '@/types/subscription';

// ============================================================
// GET: 모든 플랜 정보 조회
// ============================================================

export async function GET() {
  try {
    // DB에서 플랜 정보 조회
    const dbPlans = await getAllPlans();

    // DB 플랜 정보와 프리셋 정보 병합
    const plans = PRICING_CARDS.map((pricing) => {
      const dbPlan = dbPlans.find((p) => p.plan === pricing.plan);

      return {
        // 기본 정보
        plan: pricing.plan,
        name: pricing.name,
        description: pricing.description,

        // 가격 정보 (DB 우선, 없으면 프리셋)
        priceYearly: dbPlan?.priceYearly ?? pricing.price,
        priceMonthly: Math.round((dbPlan?.priceYearly ?? pricing.price) / 12),

        // 기능 (프리셋에서)
        features: pricing.features,

        // 제한 정보 (DB 우선)
        limits: {
          maxGuidebooks: dbPlan?.maxGuidebooks ?? pricing.limits.maxGuidebooks,
          maxAiGenerationsPerMonth:
            dbPlan?.maxAiGenerationsPerMonth ?? pricing.limits.maxAiGenerationsPerMonth,
          watermarkRemoved: dbPlan?.watermarkRemoved ?? pricing.limits.watermarkRemoved,
          customDomain: dbPlan?.customDomain ?? pricing.limits.customDomain,
          prioritySupport: dbPlan?.prioritySupport ?? pricing.limits.prioritySupport,
        },

        // UI 정보
        cta: pricing.cta,
        isPopular: pricing.isPopular ?? false,

        // 추가 정보
        isUnlimited: {
          guidebooks: (dbPlan?.maxGuidebooks ?? pricing.limits.maxGuidebooks) === -1,
          aiGenerations:
            (dbPlan?.maxAiGenerationsPerMonth ?? pricing.limits.maxAiGenerationsPerMonth) === -1,
        },
      };
    });

    // 가격 비교 정보
    const priceComparison = {
      free: {
        name: 'Free',
        priceYearly: 0,
        priceMonthly: 0,
        savings: 0,
      },
      pro: {
        name: 'Pro',
        priceYearly: plans.find((p) => p.plan === 'pro')?.priceYearly ?? 49000,
        priceMonthly: plans.find((p) => p.plan === 'pro')?.priceMonthly ?? 4083,
        // 월간 기준 대비 연간 절약액 (월 5900원 기준)
        savings: (5900 * 12) - (plans.find((p) => p.plan === 'pro')?.priceYearly ?? 49000),
      },
      business: {
        name: 'Business',
        priceYearly: plans.find((p) => p.plan === 'business')?.priceYearly ?? 99000,
        priceMonthly: plans.find((p) => p.plan === 'business')?.priceMonthly ?? 8250,
        // 월간 기준 대비 연간 절약액 (월 11900원 기준)
        savings: (11900 * 12) - (plans.find((p) => p.plan === 'business')?.priceYearly ?? 99000),
      },
    };

    return NextResponse.json({
      plans,
      priceComparison,
      currency: 'KRW',
      billingCycle: 'yearly',
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: '플랜 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
