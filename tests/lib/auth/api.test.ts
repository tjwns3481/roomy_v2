/**
 * @TASK P7-T7.2 - API 보호 유틸리티 테스트
 * @TEST src/lib/auth/api.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  getUserIdFromSession,
  getRoleFromSession,
  ApiError,
  isOwnerOrAdmin,
} from '@/lib/auth/api';
import type { Session } from 'next-auth';

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('getUserIdFromSession', () => {
  it('should return user ID from valid session', () => {
    const session = {
      user: { id: 'user-123', email: 'test@example.com', role: 'customer' },
      expires: '2024-12-31',
    } as Session;

    expect(getUserIdFromSession(session)).toBe('user-123');
  });

  it('should return null for null session', () => {
    expect(getUserIdFromSession(null)).toBeNull();
  });

  it('should return null for session without user', () => {
    const session = { expires: '2024-12-31' } as Session;
    expect(getUserIdFromSession(session)).toBeNull();
  });
});

describe('getRoleFromSession', () => {
  it('should return role from valid session', () => {
    const session = {
      user: { id: 'user-123', email: 'test@example.com', role: 'admin' },
      expires: '2024-12-31',
    } as Session;

    expect(getRoleFromSession(session)).toBe('admin');
  });

  it('should return null for null session', () => {
    expect(getRoleFromSession(null)).toBeNull();
  });

  it('should return null for session without role', () => {
    const session = {
      user: { id: 'user-123', email: 'test@example.com' },
      expires: '2024-12-31',
    } as unknown as Session;

    expect(getRoleFromSession(session)).toBeNull();
  });
});

describe('ApiError', () => {
  it('should create 401 unauthorized response', async () => {
    const response = ApiError.unauthorized('Custom message');
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
    expect(body.error.message).toBe('Custom message');
  });

  it('should create 403 forbidden response', async () => {
    const response = ApiError.forbidden();
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('should create 404 not found response', async () => {
    const response = ApiError.notFound('Resource not found');
    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('should create 400 bad request response', async () => {
    const response = ApiError.badRequest();
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error.code).toBe('BAD_REQUEST');
  });

  it('should create 500 internal error response', async () => {
    const response = ApiError.internal();
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should create 402 payment required response with upgrade URL', async () => {
    const response = ApiError.paymentRequired('Upgrade needed', '/upgrade');
    expect(response.status).toBe(402);

    const body = await response.json();
    expect(body.error.code).toBe('PAYMENT_REQUIRED');
    expect(body.error.upgradeUrl).toBe('/upgrade');
  });
});

describe('isOwnerOrAdmin', () => {
  it('should return true for admin regardless of owner', () => {
    const adminSession = {
      user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' },
      expires: '2024-12-31',
    } as Session;

    expect(isOwnerOrAdmin(adminSession, 'other-user-id')).toBe(true);
  });

  it('should return true for owner', () => {
    const userSession = {
      user: { id: 'user-123', email: 'user@test.com', role: 'customer' },
      expires: '2024-12-31',
    } as Session;

    expect(isOwnerOrAdmin(userSession, 'user-123')).toBe(true);
  });

  it('should return false for non-owner non-admin', () => {
    const userSession = {
      user: { id: 'user-123', email: 'user@test.com', role: 'customer' },
      expires: '2024-12-31',
    } as Session;

    expect(isOwnerOrAdmin(userSession, 'other-user-id')).toBe(false);
  });

  it('should return false for null session', () => {
    expect(isOwnerOrAdmin(null, 'user-123')).toBe(false);
  });
});
