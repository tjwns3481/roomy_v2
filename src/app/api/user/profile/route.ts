// @TASK P4-T4.6 - 프로필 업데이트 API
// @SPEC docs/planning/06-tasks.md#P4-T4.6

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { updateProfilePayloadSchema } from '@/types/auth';
import { z } from 'zod';

/**
 * PATCH /api/user/profile
 * 프로필 업데이트 (닉네임, 아바타)
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
      updateProfilePayloadSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.issues[0].message },
          { status: 400 }
        );
      }
      throw error;
    }

    const { nickname, display_name, avatar_url } = body;

    // 3. Supabase에 업데이트
    const supabase = await createServerClient();

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // nickname 또는 display_name 지원 (호환성)
    if (nickname !== undefined) {
      updateData.display_name = nickname.trim();
    }
    if (display_name !== undefined) {
      updateData.display_name = display_name.trim();
    }

    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json(
        { error: '프로필 업데이트에 실패했습니다' },
        { status: 500 }
      );
    }

    // 4. 성공 응답
    return NextResponse.json({
      id: data.id,
      display_name: data.display_name,
      avatar_url: data.avatar_url,
      email: data.email,
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
