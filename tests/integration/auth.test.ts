/**
 * Auth Integration Test
 *
 * P1-T1.1: Google OAuth 및 이메일 매직 링크 인증 테스트
 * - TDD RED 단계: 테스트 먼저 작성
 * - 2가지 로그인 방식 (Google OAuth, 이메일 매직 링크)
 * - 로그아웃 및 사용자 조회 기능
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import {
  signInWithGoogle,
  signInWithMagicLink,
  signOut,
  getCurrentUser,
} from '@/lib/supabase/auth';

// Mock functions
const mockSignInWithOAuth = vi.fn();
const mockSignInWithOtp = vi.fn();
const mockSignOut = vi.fn();
const mockGetUser = vi.fn();

// Supabase 클라이언트 모킹
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
      signInWithOtp: mockSignInWithOtp,
      signOut: mockSignOut,
      getUser: mockGetUser,
    },
  })),
}));

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('should initiate Google OAuth flow', async () => {
      // Mock 성공 응답
      mockSignInWithOAuth.mockResolvedValue({
        data: {
          provider: 'google',
          url: 'https://accounts.google.com/oauth/...',
        },
        error: null,
      });

      const result = await signInWithGoogle();

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      });

      expect(result.error).toBeNull();
      expect(result.data?.url).toContain('google');
    });

    it('should handle Google OAuth errors', async () => {
      // Mock 에러 응답
      mockSignInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'OAuth provider error', status: 500 },
      });

      const result = await signInWithGoogle();

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('OAuth provider error');
    });
  });

  describe('signInWithMagicLink', () => {
    const testEmail = 'test@vibestore.com';

    it('should send magic link to email', async () => {
      // Mock 성공 응답
      mockSignInWithOtp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      const result = await signInWithMagicLink(testEmail);

      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: testEmail,
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      });

      expect(result.error).toBeNull();
    });

    it('should validate email format', async () => {
      const invalidEmail = 'invalid-email';

      const result = await signInWithMagicLink(invalidEmail);

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('Invalid email format');
    });

    it('should handle magic link send errors', async () => {
      // Mock 에러 응답
      mockSignInWithOtp.mockResolvedValue({
        data: null,
        error: { message: 'Email service unavailable', status: 503 },
      });

      const result = await signInWithMagicLink(testEmail);

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('Email service unavailable');
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      // Mock 성공 응답
      mockSignOut.mockResolvedValue({
        error: null,
      });

      const result = await signOut();

      expect(mockSignOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('should handle sign out errors', async () => {
      // Mock 에러 응답
      mockSignOut.mockResolvedValue({
        error: { message: 'Sign out failed', status: 500 },
      });

      const result = await signOut();

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('Sign out failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@vibestore.com',
        user_metadata: {},
      };

      // Mock 성공 응답
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getCurrentUser();

      expect(mockGetUser).toHaveBeenCalled();
      expect(result.data?.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should return null when not authenticated', async () => {
      // Mock 미인증 응답
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result.data?.user).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should handle get user errors', async () => {
      // Mock 에러 응답
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Session expired', status: 401 },
      });

      const result = await getCurrentUser();

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('Session expired');
    });
  });
});
