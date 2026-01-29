/**
 * @TASK P7-T7.1 - Auth Hook
 * @SPEC Supabase Auth 기반 인증 훅
 *
 * 기능:
 * - signIn: 이메일/비밀번호 로그인
 * - signUp: 회원가입
 * - signOut: 로그아웃
 * - signInWithOAuth: OAuth 로그인 (Google, Kakao)
 * - resetPassword: 비밀번호 재설정 요청
 * - updatePassword: 새 비밀번호 설정
 * - onAuthStateChange: 인증 상태 변경 구독
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, AuthError, Provider } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import type { Profile } from '@/types/auth';

interface AuthResult<T = unknown> {
  data: T | null;
  error: { message: string; status?: number } | null;
}

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const { user, profile, setUser, setProfile, login, logout, initialize } = useAuthStore();

  const supabase = createClient();

  // 프로필 조회
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }

    return data as Profile;
  }, [supabase]);

  // 초기 세션 로드
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          initialize(
            {
              id: session.user.id,
              email: session.user.email!,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            },
            userProfile
          );
        } else {
          initialize(null, null);
        }
      } catch (error) {
        console.error('Session init error:', error);
        initialize(null, null);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [fetchProfile, initialize, supabase.auth]);

  // Auth 상태 변경 구독
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          login(
            {
              id: session.user.id,
              email: session.user.email!,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            },
            userProfile!
          );
        } else if (event === 'SIGNED_OUT') {
          logout();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
          });
        } else if (event === 'PASSWORD_RECOVERY') {
          // 비밀번호 복구 모드 - 세션 유지
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            });
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, login, logout, setUser, supabase.auth]);

  // 이메일/비밀번호 로그인
  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<AuthResult<User>> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error: { message: getErrorMessage(error), status: error.status } };
      }

      return { data: data.user, error: null };
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  // 회원가입
  const signUp = useCallback(async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthResult<User>> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { data: null, error: { message: getErrorMessage(error), status: error.status } };
      }

      return { data: data.user, error: null };
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  // OAuth 로그인
  const signInWithOAuth = useCallback(async (
    provider: 'google' | 'kakao',
    redirectTo?: string
  ): Promise<AuthResult<{ provider: Provider; url: string }>> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo || '/dashboard')}`,
        },
      });

      if (error) {
        return { data: null, error: { message: getErrorMessage(error), status: error.status } };
      }

      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: { message: 'OAuth 로그인 중 오류가 발생했습니다' }
      };
    }
  }, [supabase.auth]);

  // 로그아웃
  const signOut = useCallback(async (): Promise<AuthResult<void>> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { data: null, error: { message: getErrorMessage(error), status: error.status } };
      }

      logout();
      return { data: undefined, error: null };
    } finally {
      setLoading(false);
    }
  }, [logout, supabase.auth]);

  // 비밀번호 재설정 요청
  const resetPassword = useCallback(async (
    email: string
  ): Promise<AuthResult<void>> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        return { data: null, error: { message: getErrorMessage(error), status: error.status } };
      }

      return { data: undefined, error: null };
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  // 비밀번호 변경
  const updatePassword = useCallback(async (
    newPassword: string
  ): Promise<AuthResult<User>> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { data: null, error: { message: getErrorMessage(error), status: error.status } };
      }

      return { data: data.user, error: null };
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  // 세션 갱신
  const refreshSession = useCallback(async (): Promise<AuthResult<User>> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return { data: null, error: { message: getErrorMessage(error), status: error.status } };
      }

      return { data: data.user, error: null };
    } catch (err) {
      return {
        data: null,
        error: { message: '세션 갱신에 실패했습니다' }
      };
    }
  }, [supabase.auth]);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    refreshSession,
    setProfile,
  };
}

// 에러 메시지 변환
function getErrorMessage(error: AuthError): string {
  const messages: Record<string, string> = {
    'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다',
    'Email not confirmed': '이메일 인증이 완료되지 않았습니다',
    'User already registered': '이미 가입된 이메일입니다',
    'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다',
    'Email rate limit exceeded': '너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요',
    'User not found': '등록되지 않은 이메일입니다',
    'New password should be different from the old password': '새 비밀번호는 기존 비밀번호와 달라야 합니다',
  };

  return messages[error.message] || error.message;
}
