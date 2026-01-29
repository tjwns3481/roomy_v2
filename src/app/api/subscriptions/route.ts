/**
 * @TASK P6-T6.3 - 구독 조회/생성/업그레이드 API
 * @SPEC docs/planning/02-trd.md#subscriptions
 *
 * GET  - 현재 사용자 구독 정보 조회
 * POST - 구독 생성 또는 업그레이드
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  getUserSubscription,
  getUserPlanLimits,
  getUsageInfo,
  upgradePlan,
  createFreeSubscription,
} from '@/lib/subscription';
import type { SubscriptionPlan } from '@/types/subscription';

// ============================================================
// GET: 현재 사용자 구독 정보 조회
// ============================================================

export async function GET() {
  try {
    const supabase = await createServerClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // 구독 정보 조회
    let subscription = await getUserSubscription(user.id);

    // 구독이 없으면 Free 플랜 자동 생성
    if (!subscription) {
      subscription = await createFreeSubscription(user.id);
    }

    // 플랜 제한 정보 조회
    const planLimits = await getUserPlanLimits(user.id);

    // 사용량 정보 조회
    const usage = await getUsageInfo(user.id);

    // 구독 만료까지 남은 일수 계산
    let daysUntilExpiry: number | null = null;
    if (subscription?.currentPeriodEnd) {
      const endDate = new Date(subscription.currentPeriodEnd);
      const now = new Date();
      daysUntilExpiry = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    return NextResponse.json({
      subscription,
      planLimits,
      usage,
      isActive: subscription?.status === 'active' && (daysUntilExpiry === null || daysUntilExpiry > 0),
      daysUntilExpiry,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: '구독 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST: 구독 생성 또는 업그레이드
// ============================================================

interface UpgradeRequestBody {
  plan: 'pro' | 'business';
  paymentKey?: string;
  orderId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // 요청 바디 파싱
    const body: UpgradeRequestBody = await request.json();
    const { plan, paymentKey, orderId } = body;

    // 플랜 검증
    if (!plan || !['pro', 'business'].includes(plan)) {
      return NextResponse.json(
        { error: 'Bad Request', message: '유효한 플랜을 선택해주세요 (pro, business)' },
        { status: 400 }
      );
    }

    // 현재 구독 확인
    const currentSubscription = await getUserSubscription(user.id);

    // 이미 같은 플랜이면 에러
    if (currentSubscription?.plan === plan && currentSubscription.status === 'active') {
      return NextResponse.json(
        { error: 'Conflict', message: '이미 해당 플랜을 사용 중입니다' },
        { status: 409 }
      );
    }

    // 다운그레이드 방지 (business -> pro)
    if (currentSubscription?.plan === 'business' && plan === 'pro') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: '다운그레이드는 구독 취소 후 새로 가입해주세요',
        },
        { status: 400 }
      );
    }

    // 구독 업그레이드 (결제 완료 후 호출되는 것으로 가정)
    const subscription = await upgradePlan(user.id, plan as SubscriptionPlan, {
      paymentProvider: 'toss',
      // paymentCustomerId와 paymentSubscriptionId는 Toss 웹훅에서 설정
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Internal Server Error', message: '구독 업그레이드에 실패했습니다' },
        { status: 500 }
      );
    }

    // 업데이트된 플랜 제한 조회
    const planLimits = await getUserPlanLimits(user.id);

    return NextResponse.json({
      success: true,
      message: `${plan} 플랜으로 업그레이드되었습니다`,
      subscription,
      planLimits,
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: '구독 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
