/**
 * Auth Store Test
 *
 * TDD: RED → GREEN → REFACTOR
 * Zustand 기반 인증 상태 관리 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthUser, Profile } from '@/types/auth';

describe('useAuthStore', () => {
  // 각 테스트 전에 스토어 초기화
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
    });
  });

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setUser', () => {
    it('user를 설정하면 isAuthenticated가 true가 되어야 함', () => {
      const mockUser: AuthUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
      };

      useAuthStore.getState().setUser(mockUser);
      const state = useAuthStore.getState();

      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('user를 null로 설정하면 isAuthenticated가 false가 되어야 함', () => {
      const mockUser: AuthUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
      };

      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setUser(null);
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setProfile', () => {
    it('profile을 설정할 수 있어야 함', () => {
      const mockProfile: Profile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        nickname: '테스트유저',
        avatar_url: 'https://example.com/avatar.jpg',
        role: 'customer',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
      };

      useAuthStore.getState().setProfile(mockProfile);
      const state = useAuthStore.getState();

      expect(state.profile).toEqual(mockProfile);
    });

    it('profile을 null로 설정할 수 있어야 함', () => {
      const mockProfile: Profile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        nickname: '테스트유저',
        avatar_url: null,
        role: 'customer',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
      };

      useAuthStore.getState().setProfile(mockProfile);
      useAuthStore.getState().setProfile(null);
      const state = useAuthStore.getState();

      expect(state.profile).toBeNull();
    });
  });

  describe('login', () => {
    it('user와 profile을 동시에 설정할 수 있어야 함', () => {
      const mockUser: AuthUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
      };

      const mockProfile: Profile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        nickname: '테스트유저',
        avatar_url: null,
        role: 'customer',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
      };

      useAuthStore.getState().login(mockUser, mockProfile);
      const state = useAuthStore.getState();

      expect(state.user).toEqual(mockUser);
      expect(state.profile).toEqual(mockProfile);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('모든 상태를 초기화해야 함', () => {
      const mockUser: AuthUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
      };

      const mockProfile: Profile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        nickname: '테스트유저',
        avatar_url: null,
        role: 'customer',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
      };

      useAuthStore.getState().login(mockUser, mockProfile);
      useAuthStore.getState().logout();
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('initialize', () => {
    it('user와 profile을 설정하고 로딩 상태를 false로 변경해야 함', () => {
      const mockUser: AuthUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
      };

      const mockProfile: Profile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        nickname: '테스트유저',
        avatar_url: null,
        role: 'customer',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
      };

      useAuthStore.setState({ isLoading: true });
      useAuthStore.getState().initialize(mockUser, mockProfile);
      const state = useAuthStore.getState();

      expect(state.user).toEqual(mockUser);
      expect(state.profile).toEqual(mockProfile);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('user와 profile이 null이면 로그아웃 상태로 설정해야 함', () => {
      const mockUser: AuthUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
      };

      const mockProfile: Profile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        nickname: '테스트유저',
        avatar_url: null,
        role: 'customer',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
      };

      useAuthStore.getState().login(mockUser, mockProfile);
      useAuthStore.setState({ isLoading: true });
      useAuthStore.getState().initialize(null, null);
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('상태 지속성 (persist)', () => {
    it('localStorage에 상태가 저장되어야 함 (통합 테스트 시 검증)', () => {
      // Note: localStorage mock이 필요한 통합 테스트
      // 현재는 스토어 로직 자체만 테스트
      const mockUser: AuthUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        created_at: '2026-01-25T00:00:00Z',
        updated_at: '2026-01-25T00:00:00Z',
      };

      useAuthStore.getState().setUser(mockUser);
      const state = useAuthStore.getState();

      expect(state.user).toEqual(mockUser);
    });
  });
});
