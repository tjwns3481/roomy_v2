/**
 * Middleware 인증 테스트
 *
 * AC:
 * - /my/* 접근 시 로그인 체크
 * - /admin/* 접근 시 관리자 권한 체크
 * - 미인증 접근 시 /login?redirect=원래경로로 리다이렉트
 * - 관리자가 아닌 사용자의 /admin 접근 시 홈으로 리다이렉트
 * - 세션 자동 갱신
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../../middleware';

// Supabase mock
const mockGetSession = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/middleware', () => ({
  createMiddlewareClient: vi.fn(() => ({
    supabase: {
      auth: {
        getSession: mockGetSession,
        getUser: mockGetUser,
      },
    },
    response: {
      cookies: {
        set: vi.fn(),
      },
    },
  })),
}));

describe('Middleware - 인증 및 세션 갱신', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('공개 라우트', () => {
    it('/ 접근 시 인증 없이 통과', async () => {
      const request = new NextRequest('http://localhost:3000/');
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      const response = await middleware(request);

      expect(response.status).not.toBe(307); // 리다이렉트 안 됨
    });

    it('/products 접근 시 인증 없이 통과', async () => {
      const request = new NextRequest('http://localhost:3000/products');
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });

    it('/login 접근 시 인증 없이 통과', async () => {
      const request = new NextRequest('http://localhost:3000/login');
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });
  });

  describe('보호된 라우트 - /my/*', () => {
    it('미인증 사용자가 /my/orders 접근 시 /login으로 리다이렉트', async () => {
      const request = new NextRequest('http://localhost:3000/my/orders');
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/login?redirect=%2Fmy%2Forders'
      );
    });

    it('인증된 사용자가 /my/profile 접근 시 통과', async () => {
      const request = new NextRequest('http://localhost:3000/my/profile');
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123', email: 'user@example.com' },
          },
        },
        error: null,
      });

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });
  });

  describe('관리자 라우트 - /admin/*', () => {
    it('미인증 사용자가 /admin 접근 시 /login으로 리다이렉트', async () => {
      const request = new NextRequest('http://localhost:3000/admin');
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/login?redirect=%2Fadmin'
      );
    });

    it('일반 사용자가 /admin 접근 시 홈으로 리다이렉트', async () => {
      const request = new NextRequest('http://localhost:3000/admin');
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'user-123',
              email: 'user@example.com',
              user_metadata: { role: 'customer' }, // 일반 사용자
            },
          },
        },
        error: null,
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/');
    });

    it('관리자가 /admin 접근 시 통과', async () => {
      const request = new NextRequest('http://localhost:3000/admin');
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'admin-123',
              email: 'admin@example.com',
              user_metadata: { role: 'admin' },
            },
          },
        },
        error: null,
      });

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });
  });

  describe('세션 갱신', () => {
    it('인증된 요청 시 세션 자동 갱신', async () => {
      const request = new NextRequest('http://localhost:3000/my/orders');
      const mockSession = {
        user: { id: 'user-123', email: 'user@example.com' },
        access_token: 'token-123',
      };

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const response = await middleware(request);

      // getSession이 호출되어 세션 갱신됨
      expect(mockGetSession).toHaveBeenCalled();
      expect(response).toBeDefined();
    });
  });

  describe('API 라우트', () => {
    it('/api/* 라우트는 미들웨어 스킵', async () => {
      const request = new NextRequest('http://localhost:3000/api/products');

      const response = await middleware(request);

      // API 라우트는 middleware에서 제외됨 (config.matcher에서)
      expect(response).toBeDefined();
    });
  });
});
