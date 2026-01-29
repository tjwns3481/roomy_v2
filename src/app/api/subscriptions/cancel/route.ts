/**
 * @TASK P6-T6.3 - 구독 취소 API
 * @SPEC docs/planning/02-trd.md#subscription-cancel
 *
 * POST - 구독 취소 (기간 종료 시 해지 또는 즉시 해지)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  getUserSubscription,
  cancelSubscription,
  reactivateSubscription,
} from '@/lib/subscription';

// ============================================================
// POST: 구독 취소
// ============================================================

interface CancelRequestBody {
  immediately?: boolean; // true: 즉시 취소, false: 기간 종료 시 취소
  reason?: string; // 취소 사유 (선택)
  reactivate?: boolean; // true: 취소 예약 해제
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
    const body: CancelRequestBody = await request.json();
    const { immediately = false, reason, reactivate = false } = body;

    // 현재 구독 확인
    const currentSubscription = await getUserSubscription(user.id);

    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'Not Found', message: '활성 구독이 없습니다' },
        { status: 404 }
      );
    }

    // Free 플랜은 취소 불가
    if (currentSubscription.plan === 'free') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Free 플랜은 취소할 수 없습니다' },
        { status: 400 }
      );
    }

    // 취소 예약 해제 요청
    if (reactivate) {
      if (!currentSubscription.cancelAtPeriodEnd) {
        return NextResponse.json(
          { error: 'Bad Request', message: '취소 예약된 구독이 없습니다' },
          { status: 400 }
        );
      }

      const subscription = await reactivateSubscription(user.id);

      if (!subscription) {
        return NextResponse.json(
          { error: 'Internal Server Error', message: '구독 복원에 실패했습니다' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: '구독 취소 예약이 해제되었습니다',
        subscription,
      });
    }

    // 이미 취소 예약된 경우 (즉시 취소가 아닌 경우)
    if (currentSubscription.cancelAtPeriodEnd && !immediately) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: '이미 취소가 예약되어 있습니다. 기간 종료 시 자동으로 해지됩니다.',
          cancelAt: currentSubscription.currentPeriodEnd,
        },
        { status: 409 }
      );
    }

    // 이미 취소된 경우
    if (currentSubscription.status === 'canceled') {
      return NextResponse.json(
        { error: 'Bad Request', message: '이미 취소된 구독입니다' },
        { status: 400 }
      );
    }

    // 구독 취소 처리
    const subscription = await cancelSubscription(user.id, immediately);

    if (!subscription) {
      return NextResponse.json(
        { error: 'Internal Server Error', message: '구독 취소에 실패했습니다' },
        { status: 500 }
      );
    }

    // 취소 사유 로깅 (선택사항 - 나중에 분석용)
    if (reason) {
      console.log(`Subscription canceled: userId=${user.id}, reason=${reason}, immediately=${immediately}`);
    }

    const message = immediately
      ? '구독이 즉시 취소되었습니다. Free 플랜으로 전환됩니다.'
      : `구독 취소가 예약되었습니다. ${subscription.currentPeriodEnd}까지 현재 플랜을 이용하실 수 있습니다.`;

    return NextResponse.json({
      success: true,
      message,
      subscription,
      cancelAt: immediately ? null : subscription.currentPeriodEnd,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: '구독 취소 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
