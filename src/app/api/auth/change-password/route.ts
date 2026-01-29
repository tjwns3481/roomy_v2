/**
 * Change Password API Route
 *
 * NextAuth.js 세션 사용자의 비밀번호 변경
 * - Supabase Admin API로 비밀번호 업데이트
 * - P4-T4.6: 현재 비밀번호 검증 추가
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient, createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // 1. 세션 확인
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // 2. 요청 본문 파싱
    const { currentPassword, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다' },
        { status: 400 }
      );
    }

    // 3. 현재 비밀번호 검증 (선택적)
    if (currentPassword) {
      const supabase = await createServerClient();

      // 사용자 이메일 가져오기
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', session.user.id)
        .single();

      if (profileData?.email) {
        // 현재 비밀번호로 로그인 시도
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: profileData.email,
          password: currentPassword,
        });

        if (signInError) {
          return NextResponse.json(
            { error: '현재 비밀번호가 일치하지 않습니다' },
            { status: 400 }
          );
        }
      }
    }

    // 4. Supabase Admin Client로 비밀번호 변경
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      session.user.id,
      { password: newPassword }
    );

    if (error) {
      console.error('Password change error:', error);
      return NextResponse.json(
        { error: '비밀번호 변경에 실패했습니다' },
        { status: 500 }
      );
    }

    // 5. 성공 응답
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
