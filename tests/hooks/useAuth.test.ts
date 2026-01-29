/**
 * @TASK P7-T7.1 - useAuth Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock Supabase
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      getSession: mockGetSession,
      refreshSession: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  }),
}));

// Mock zustand store
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    user: null,
    profile: null,
    setUser: vi.fn(),
    setProfile: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    initialize: vi.fn(),
  }),
}));

import { useAuth } from '@/hooks/useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });
  });

  describe('signIn', () => {
    it('should call signInWithPassword with correct params', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: '1', email: 'test@test.com' } },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signIn('test@test.com', 'password123');
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });

    it('should return error on invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials', status: 400 },
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn('test@test.com', 'wrongpassword');
      });

      expect(signInResult?.error).toBeTruthy();
      expect(signInResult?.error?.message).toContain('이메일 또는 비밀번호가 올바르지 않습니다');
    });
  });

  describe('signUp', () => {
    it('should call signUp with correct params', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: { id: '1', email: 'new@test.com' } },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signUp('new@test.com', 'Password123', '홍길동');
      });

      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@test.com',
          password: 'Password123',
          options: expect.objectContaining({
            data: expect.objectContaining({
              display_name: '홍길동',
            }),
          }),
        })
      );
    });
  });

  describe('signInWithOAuth', () => {
    it('should call signInWithOAuth with google provider', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { provider: 'google', url: 'https://oauth.google.com/...' },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signInWithOAuth('google', '/dashboard');
      });

      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
        })
      );
    });

    it('should call signInWithOAuth with kakao provider', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { provider: 'kakao', url: 'https://kauth.kakao.com/...' },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signInWithOAuth('kakao');
      });

      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'kakao',
        })
      );
    });
  });

  describe('signOut', () => {
    it('should call signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should call resetPasswordForEmail with correct email', async () => {
      mockResetPasswordForEmail.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.resetPassword('forgot@test.com');
      });

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'forgot@test.com',
        expect.any(Object)
      );
    });
  });

  describe('updatePassword', () => {
    it('should call updateUser with new password', async () => {
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: '1' } },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePassword('NewPassword123');
      });

      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'NewPassword123',
      });
    });
  });
});
