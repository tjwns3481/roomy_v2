/**
 * @TASK P7-T7.1 - Auth Provider
 * @SPEC Supabase Auth 컨텍스트 제공
 *
 * 기능:
 * - 인증 상태 관리
 * - 자동 토큰 갱신
 * - 세션 관리
 */

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialSession?: Session | null;
}

export function AuthProvider({ children, initialSession = null }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading, setLoading] = useState(!initialSession);

  const supabase = createClient();

  // 프로필 조회
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
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
    } catch (err) {
      console.error('Profile fetch exception:', err);
      return null;
    }
  }, [supabase]);

  // 프로필 새로고침
  const refreshProfile = useCallback(async () => {
    if (user) {
      const newProfile = await fetchProfile(user.id);
      setProfile(newProfile);
    }
  }, [user, fetchProfile]);

  // 초기 세션 로드
  useEffect(() => {
    const initSession = async () => {
      if (initialSession) {
        // 초기 세션이 있으면 프로필만 로드
        if (initialSession.user) {
          const userProfile = await fetchProfile(initialSession.user.id);
          setProfile(userProfile);
        }
        setLoading(false);
        return;
      }

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentSession?.user) {
          setUser(currentSession.user);
          setSession(currentSession);
          const userProfile = await fetchProfile(currentSession.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Session init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [fetchProfile, initialSession, supabase.auth]);

  // Auth 상태 변경 구독
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        // 상태 업데이트
        setUser(newSession?.user ?? null);
        setSession(newSession);

        if (event === 'SIGNED_IN' && newSession?.user) {
          // 로그인 시 프로필 로드
          const userProfile = await fetchProfile(newSession.user.id);
          setProfile(userProfile);
        } else if (event === 'SIGNED_OUT') {
          // 로그아웃 시 프로필 초기화
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED') {
          // 토큰 갱신 - 상태 유지
          console.log('Token refreshed');
        } else if (event === 'USER_UPDATED' && newSession?.user) {
          // 사용자 정보 변경 시 프로필 다시 로드
          const userProfile = await fetchProfile(newSession.user.id);
          setProfile(userProfile);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase.auth]);

  // 자동 토큰 갱신 (세션 만료 5분 전)
  useEffect(() => {
    if (!session?.expires_at) return;

    const expiresAt = session.expires_at * 1000; // 초 -> 밀리초
    const now = Date.now();
    const refreshTime = expiresAt - 5 * 60 * 1000; // 5분 전

    if (refreshTime <= now) {
      // 이미 갱신 시간이 지났으면 즉시 갱신
      supabase.auth.refreshSession();
      return;
    }

    // 갱신 시간에 맞춰 타이머 설정
    const timeout = setTimeout(() => {
      supabase.auth.refreshSession();
    }, refreshTime - now);

    return () => clearTimeout(timeout);
  }, [session?.expires_at, supabase.auth]);

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
