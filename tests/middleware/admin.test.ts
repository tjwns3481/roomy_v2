/**
 * 관리자 권한 미들웨어 테스트
 *
 * P4-T4.1: Admin Middleware
 *
 * AC:
 * - role=admin 체크
 * - /admin/* 접근 제어
 * - 비관리자 접근 시 403
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminRole, isAdminUser } from '@/lib/middleware/admin';
import type { User } from '@supabase/supabase-js';

describe('Admin Middleware - 관리자 권한 체크', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAdminRole', () => {
    it('user가 null일 때 페이지 요청은 로그인으로 리다이렉트', async () => {
      const request = new NextRequest('http://localhost:3000/admin/products');
      const response = await checkAdminRole(request, null);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/login?redirect=%2Fadmin%2Fproducts'
      );
    });

    it('user가 null일 때 API 요청은 403 반환', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/products'
      );
      const response = await checkAdminRole(request, null);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('FORBIDDEN');
      expect(data.error.message).toContain('관리자');
    });

    it('forceJson 옵션으로 페이지 요청도 403 반환 가능', async () => {
      const request = new NextRequest('http://localhost:3000/admin/products');
      const response = await checkAdminRole(request, null, { forceJson: true });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('user_metadata가 없을 때 페이지 요청은 홈으로 리다이렉트', async () => {
      const request = new NextRequest('http://localhost:3000/admin/products');
      const user = {
        id: 'user-123',
        email: 'user@example.com',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      const response = await checkAdminRole(request, user);

      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toBe('http://localhost:3000/');
    });

    it('role이 admin이 아닐 때 API 요청은 403 반환', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/products'
      );
      const user = {
        id: 'user-123',
        email: 'user@example.com',
        user_metadata: { role: 'customer' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      const response = await checkAdminRole(request, user);

      expect(response?.status).toBe(403);
      const data = await response!.json();
      expect(data.error.code).toBe('FORBIDDEN');
      expect(data.error.message).toContain('권한이 없습니다');
    });

    it('role이 admin일 때 null 반환 (통과)', async () => {
      const request = new NextRequest('http://localhost:3000/admin/products');
      const user = {
        id: 'admin-123',
        email: 'admin@example.com',
        user_metadata: { role: 'admin' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      const response = await checkAdminRole(request, user);

      expect(response).toBeNull();
    });

    it('profiles 테이블의 role도 체크', async () => {
      const request = new NextRequest('http://localhost:3000/admin/products');
      const user = {
        id: 'admin-456',
        email: 'admin2@example.com',
        user_metadata: {},
        app_metadata: { role: 'admin' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      const response = await checkAdminRole(request, user);

      expect(response).toBeNull();
    });

    it('API 에러 응답에 요청 경로 포함', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/users/123'
      );
      const user = {
        id: 'user-123',
        email: 'user@example.com',
        user_metadata: { role: 'customer' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      const response = await checkAdminRole(request, user);

      expect(response?.status).toBe(403);
      const data = await response!.json();
      expect(data.error.path).toBe('/api/admin/users/123');
    });
  });

  describe('isAdminUser 헬퍼', () => {
    it('user_metadata.role이 admin이면 true', () => {
      const user = {
        id: 'admin-123',
        user_metadata: { role: 'admin' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      expect(isAdminUser(user)).toBe(true);
    });

    it('app_metadata.role이 admin이면 true', () => {
      const user = {
        id: 'admin-123',
        user_metadata: {},
        app_metadata: { role: 'admin' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      expect(isAdminUser(user)).toBe(true);
    });

    it('role이 admin이 아니면 false', () => {
      const user = {
        id: 'user-123',
        user_metadata: { role: 'customer' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      expect(isAdminUser(user)).toBe(false);
    });

    it('user가 null이면 false', () => {
      expect(isAdminUser(null)).toBe(false);
    });
  });

  describe('응답 헤더', () => {
    it('API 403 응답에 적절한 헤더 포함', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/products'
      );
      const user = {
        id: 'user-123',
        email: 'user@example.com',
        user_metadata: { role: 'customer' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      const response = await checkAdminRole(request, user);

      expect(response?.status).toBe(403);
      expect(response?.headers.get('Content-Type')).toBe('application/json');
      expect(response?.headers.get('Cache-Control')).toBe('no-store');
    });
  });
});
