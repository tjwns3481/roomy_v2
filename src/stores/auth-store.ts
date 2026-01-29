/**
 * Auth Store
 *
 * Zustand 기반 인증 상태 관리
 * - 사용자 정보 (user, profile)
 * - 로그인/로그아웃 액션
 * - localStorage persist (새로고침 후에도 상태 유지)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, Profile } from '@/types/auth';

/**
 * Auth Store State
 */
interface AuthStoreState {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Auth Store Actions
 */
interface AuthStoreActions {
  /**
   * 사용자 설정
   * @param user - AuthUser 또는 null
   */
  setUser: (user: AuthUser | null) => void;

  /**
   * 프로필 설정
   * @param profile - Profile 또는 null
   */
  setProfile: (profile: Profile | null) => void;

  /**
   * 로그인
   * @param user - AuthUser
   * @param profile - Profile
   */
  login: (user: AuthUser, profile: Profile) => void;

  /**
   * 로그아웃
   */
  logout: () => void;

  /**
   * 초기화
   * - 앱 시작 시 세션 복원에 사용
   * @param user - AuthUser 또는 null
   * @param profile - Profile 또는 null
   */
  initialize: (user: AuthUser | null, profile: Profile | null) => void;
}

/**
 * Auth Store
 */
export type AuthStore = AuthStoreState & AuthStoreActions;

/**
 * useAuthStore Hook
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial State
      user: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
        }),

      setProfile: (profile) =>
        set({
          profile,
        }),

      login: (user, profile) =>
        set({
          user,
          profile,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      initialize: (user, profile) =>
        set({
          user,
          profile,
          isAuthenticated: user !== null,
          isLoading: false,
        }),
    }),
    {
      name: 'vibe-store-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }), // isLoading, isAuthenticated는 저장하지 않음
    }
  )
);
