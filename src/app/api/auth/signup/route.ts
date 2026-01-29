/**
 * Signup API Route
 *
 * NextAuth.js와 호환되는 회원가입 API
 * - Supabase Auth를 사용하여 사용자 생성
 * - 트리거를 통해 profiles 테이블에 자동 생성
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client (서버 사이드에서만 사용)
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: Request) {
  try {
    const { email, password, nickname } = await request.json();

    // 유효성 검사
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 6자 이상이어야 합니다' },
        { status: 400 }
      );
    }

    // Supabase Auth로 사용자 생성
    // - auth.users 테이블에 사용자 생성
    // - 트리거를 통해 profiles 테이블에 자동 생성
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 이메일 인증 자동 완료 (개발 환경)
      user_metadata: {
        nickname: nickname || email.split('@')[0],
      },
    });

    if (error) {
      // 이메일 중복 등의 에러 처리
      if (
        error.message.includes('already registered') ||
        error.message.includes('User already registered') ||
        error.message.includes('duplicate') ||
        error.code === '23505' // PostgreSQL unique constraint violation
      ) {
        return NextResponse.json(
          { error: '이미 사용 중인 이메일입니다' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message || '회원가입 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: '사용자 생성에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
