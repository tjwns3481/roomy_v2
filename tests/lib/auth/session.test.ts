/**
 * @TASK P7-T7.2 - 세션 관리 테스트
 * @TEST src/lib/auth/session.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Session } from 'next-auth';

// Mock auth 함수
const mockAuth = vi.fn();
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}));

// 세션 유틸리티 함수들 가져오기 (mock 설정 후)
import {
  getSession,
  getCurrentUser,
  getUserId,
  getUserRole,
  isAuthenticated,
  isAdmin,
  hasRole,
  validateSession,
  extractUser,
  extractRole,
} from '@/lib/auth/session';

describe('Session Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validSession: Session = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'customer',
    },
    expires: '2024-12-31T23:59:59.999Z',
  };

  const adminSession: Session = {
    user: {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    },
    expires: '2024-12-31T23:59:59.999Z',
  };

  describe('getSession', () => {
    it('should return session when authenticated', async () => {
      mockAuth.mockResolvedValue(validSession);
      const session = await getSession();
      expect(session).toEqual(validSession);
    });

    it('should return null when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const session = await getSession();
      expect(session).toBeNull();
    });

    it('should return null on error', async () => {
      mockAuth.mockRejectedValue(new Error('Auth error'));
      const session = await getSession();
      expect(session).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from session', async () => {
      mockAuth.mockResolvedValue(validSession);
      const user = await getCurrentUser();
      expect(user).toEqual(validSession.user);
    });

    it('should return null when no session', async () => {
      mockAuth.mockResolvedValue(null);
      const user = await getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('getUserId', () => {
    it('should return user ID from session', async () => {
      mockAuth.mockResolvedValue(validSession);
      const userId = await getUserId();
      expect(userId).toBe('user-123');
    });

    it('should return null when no session', async () => {
      mockAuth.mockResolvedValue(null);
      const userId = await getUserId();
      expect(userId).toBeNull();
    });
  });

  describe('getUserRole', () => {
    it('should return user role from session', async () => {
      mockAuth.mockResolvedValue(validSession);
      const role = await getUserRole();
      expect(role).toBe('customer');
    });

    it('should return admin role', async () => {
      mockAuth.mockResolvedValue(adminSession);
      const role = await getUserRole();
      expect(role).toBe('admin');
    });

    it('should return null when no session', async () => {
      mockAuth.mockResolvedValue(null);
      const role = await getUserRole();
      expect(role).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when authenticated', async () => {
      mockAuth.mockResolvedValue(validSession);
      const result = await isAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin', async () => {
      mockAuth.mockResolvedValue(adminSession);
      const result = await isAdmin();
      expect(result).toBe(true);
    });

    it('should return false for customer', async () => {
      mockAuth.mockResolvedValue(validSession);
      const result = await isAdmin();
      expect(result).toBe(false);
    });

    it('should return false when no session', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await isAdmin();
      expect(result).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true for matching role', async () => {
      mockAuth.mockResolvedValue(validSession);
      const result = await hasRole('customer');
      expect(result).toBe(true);
    });

    it('should return true for admin with any role', async () => {
      mockAuth.mockResolvedValue(adminSession);
      const result = await hasRole('customer');
      expect(result).toBe(true); // admin can access customer routes
    });

    it('should return false for non-matching role', async () => {
      mockAuth.mockResolvedValue(validSession);
      const result = await hasRole('admin');
      expect(result).toBe(false);
    });

    it('should return false when no session', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await hasRole('customer');
      expect(result).toBe(false);
    });
  });

  describe('validateSession', () => {
    it('should return valid result for authenticated session', async () => {
      mockAuth.mockResolvedValue(validSession);
      const result = await validateSession();
      expect(result.isValid).toBe(true);
      expect(result.session).toEqual(validSession);
      expect(result.user).toEqual(validSession.user);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid result for no session', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await validateSession();
      expect(result.isValid).toBe(false);
      expect(result.session).toBeNull();
      expect(result.user).toBeNull();
      expect(result.error).toBe('No session found');
    });

    it('should return invalid result for session without user', async () => {
      mockAuth.mockResolvedValue({ expires: '2024-12-31' } as Session);
      const result = await validateSession();
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Session has no user');
    });

    it('should handle errors gracefully', async () => {
      mockAuth.mockRejectedValue(new Error('Auth failed'));
      const result = await validateSession();
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Auth failed');
    });
  });

  describe('extractUser', () => {
    it('should extract user from session', () => {
      const user = extractUser(validSession);
      expect(user).toEqual(validSession.user);
    });

    it('should return null for null session', () => {
      const user = extractUser(null);
      expect(user).toBeNull();
    });
  });

  describe('extractRole', () => {
    it('should extract role from session', () => {
      const role = extractRole(validSession);
      expect(role).toBe('customer');
    });

    it('should return null for null session', () => {
      const role = extractRole(null);
      expect(role).toBeNull();
    });
  });
});
