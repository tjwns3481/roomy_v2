// @TASK P4-T4.6 - 알림 설정 API
// @SPEC docs/planning/06-tasks.md#P4-T4.6

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// 알림 설정 스키마
const notificationPreferencesSchema = z.object({
  dailyStats: z.boolean().optional(),
  newFeatures: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

/**
 * PATCH /api/user/notifications
 * 알림 설정 업데이트
 */
export async function PATCH(request: Request) {
  try {
    // 1. 세션 확인
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // 2. 요청 본문 파싱 및 검증
    const body = await request.json();

    try {
      notificationPreferencesSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
      }
      throw error;
    }

    const { dailyStats, newFeatures, marketing } = body;

    // 3. Supabase에 upsert
    const supabase = await createServerClient();

    const updateData = {
      user_id: session.user.id,
      updated_at: new Date().toISOString(),
      daily_stats: dailyStats,
      new_features: newFeatures,
      marketing: marketing,
    };

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(updateData, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Notification preferences update error:', error);
      return NextResponse.json(
        { error: '알림 설정 업데이트에 실패했습니다' },
        { status: 500 }
      );
    }

    // 4. 성공 응답
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
