/**
 * Supabase Authentication Functions
 *
 * - 이메일/비밀번호 로그인
 * - 회원가입
 * - 로그아웃
 * - 현재 사용자 조회
 */

'use client';

import { createClient } from './client';

/**
 * 이메일 형식 검증 정규식
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Auth Callback URL 생성
 */
function getCallbackUrl(path: string = '/auth/callback'): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  return `${baseUrl}${path}`;
}

/**
 * 이메일/비밀번호로 로그인
 */
export async function signInWithPassword(email: string, password: string) {
  if (!EMAIL_REGEX.test(email)) {
    return {
      data: null,
      error: { message: '유효한 이메일 형식이 아닙니다', status: 400 },
    };
  }

  if (!password || password.length < 6) {
    return {
      data: null,
      error: { message: '비밀번호는 최소 6자 이상이어야 합니다', status: 400 },
    };
  }

  const supabase = createClient();

  const result = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return result;
}

/**
 * 회원가입
 */
export async function signUp(email: string, password: string, nickname?: string) {
  if (!EMAIL_REGEX.test(email)) {
    return {
      data: null,
      error: { message: '유효한 이메일 형식이 아닙니다', status: 400 },
    };
  }

  if (!password || password.length < 6) {
    return {
      data: null,
      error: { message: '비밀번호는 최소 6자 이상이어야 합니다', status: 400 },
    };
  }

  const supabase = createClient();

  const result = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getCallbackUrl(),
      data: {
        nickname: nickname || email.split('@')[0],
      },
    },
  });

  return result;
}

/**
 * Google OAuth 로그인
 */
export async function signInWithGoogle() {
  const supabase = createClient();

  const result = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getCallbackUrl(),
    },
  });

  return result;
}

/**
 * Kakao OAuth 로그인
 */
export async function signInWithKakao() {
  const supabase = createClient();

  const result = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: getCallbackUrl(),
    },
  });

  return result;
}

/**
 * 비밀번호 재설정 이메일 발송
 */
export async function resetPasswordForEmail(email: string) {
  const supabase = createClient();

  const result = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getCallbackUrl('/update-password')}`,
  });

  return result;
}

/**
 * 비밀번호 변경
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient();

  const result = await supabase.auth.updateUser({
    password: newPassword,
  });

  return result;
}

/**
 * 로그아웃
 */
export async function signOut() {
  const supabase = createClient();

  const result = await supabase.auth.signOut();

  return result;
}

/**
 * 현재 로그인한 사용자 조회
 */
export async function getCurrentUser() {
  const supabase = createClient();

  const result = await supabase.auth.getUser();

  return result;
}
