/**
 * @TASK P6-T6.3 - 사용량 조회 API
 * @SPEC docs/planning/02-trd.md#usage-tracking
 *
 * GET - 현재 월 사용량 조회
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUsageInfo, getUserPlan, checkPlanLimit } from '@/lib/subscription';

// ============================================================
// GET: 현재 월 사용량 조회
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

    // 사용량 정보 조회
    const usage = await getUsageInfo(user.id);

    // 플랜 정보 조회
    const plan = await getUserPlan(user.id);

    // 각 기능별 제한 체크
    const guidebookLimit = await checkPlanLimit(user.id, 'guidebooks');
    const aiLimit = await checkPlanLimit(user.id, 'ai');

    // 사용률 계산
    const guidebookUsagePercent =
      usage.limits.maxGuidebooks === -1
        ? 0
        : Math.round((usage.guidebooks / usage.limits.maxGuidebooks) * 100);

    const aiUsagePercent =
      usage.limits.maxAiGenerations === -1
        ? 0
        : Math.round((usage.aiGenerations / usage.limits.maxAiGenerations) * 100);

    // 현재 월 정보
    const now = new Date();
    const currentMonth = now.toLocaleString('ko-KR', { month: 'long', year: 'numeric' });
    const daysLeftInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate() - now.getDate();

    return NextResponse.json({
      plan,
      guidebooks: {
        used: usage.guidebooks,
        limit: usage.limits.maxGuidebooks,
        remaining: guidebookLimit.limit === -1 ? -1 : guidebookLimit.limit - usage.guidebooks,
        canCreate: guidebookLimit.allowed,
        usagePercent: guidebookUsagePercent,
        isUnlimited: usage.limits.maxGuidebooks === -1,
      },
      aiGenerations: {
        used: usage.aiGenerations,
        limit: usage.limits.maxAiGenerations,
        remaining: aiLimit.limit === -1 ? -1 : aiLimit.limit - usage.aiGenerations,
        canGenerate: aiLimit.allowed,
        usagePercent: aiUsagePercent,
        isUnlimited: usage.limits.maxAiGenerations === -1,
      },
      period: {
        currentMonth,
        daysLeftInMonth,
        resetsAt: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching usage info:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: '사용량 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
