/**
 * @TASK P7-T7.2 - 미들웨어 유틸리티 테스트
 * @TEST src/lib/auth/middleware.ts
 */

import { describe, it, expect } from 'vitest';
import {
  matchesPattern,
  isProtectedRoute,
  isAuthRoute,
  isPublicRoute,
  isAdminRoute,
  isApiRoute,
  isStaticFile,
  hasRequiredRole,
} from '@/lib/auth/middleware';

describe('matchesPattern', () => {
  it('should match exact paths', () => {
    expect(matchesPattern('/dashboard', ['/dashboard'])).toBe(true);
    expect(matchesPattern('/settings', ['/dashboard', '/settings'])).toBe(true);
  });

  it('should match path prefixes', () => {
    expect(matchesPattern('/dashboard/settings', ['/dashboard'])).toBe(true);
    expect(matchesPattern('/editor/123', ['/editor'])).toBe(true);
  });

  it('should not match unrelated paths', () => {
    expect(matchesPattern('/profile', ['/dashboard'])).toBe(false);
    expect(matchesPattern('/dash', ['/dashboard'])).toBe(false);
  });
});

describe('isProtectedRoute', () => {
  it('should identify protected routes', () => {
    expect(isProtectedRoute('/dashboard')).toBe(true);
    expect(isProtectedRoute('/editor')).toBe(true);
    expect(isProtectedRoute('/editor/abc123')).toBe(true);
    expect(isProtectedRoute('/settings')).toBe(true);
    expect(isProtectedRoute('/checkout')).toBe(true);
    expect(isProtectedRoute('/my')).toBe(true);
    expect(isProtectedRoute('/my/profile')).toBe(true);
  });

  it('should not identify public routes as protected', () => {
    expect(isProtectedRoute('/')).toBe(false);
    expect(isProtectedRoute('/g/my-guide')).toBe(false);
    expect(isProtectedRoute('/login')).toBe(false);
  });
});

describe('isAuthRoute', () => {
  it('should identify auth routes', () => {
    expect(isAuthRoute('/login')).toBe(true);
    expect(isAuthRoute('/signup')).toBe(true);
    expect(isAuthRoute('/auth/login')).toBe(true);
    expect(isAuthRoute('/auth/signup')).toBe(true);
    expect(isAuthRoute('/reset-password')).toBe(true);
  });

  it('should not identify other routes as auth routes', () => {
    expect(isAuthRoute('/dashboard')).toBe(false);
    expect(isAuthRoute('/')).toBe(false);
    expect(isAuthRoute('/g/test')).toBe(false);
  });
});

describe('isPublicRoute', () => {
  it('should identify public routes', () => {
    expect(isPublicRoute('/')).toBe(true);
    expect(isPublicRoute('/g/my-guide')).toBe(true);
    expect(isPublicRoute('/g/')).toBe(true);
    expect(isPublicRoute('/s/abc123')).toBe(true);
  });

  it('should not identify protected routes as public', () => {
    expect(isPublicRoute('/dashboard')).toBe(false);
    expect(isPublicRoute('/editor/123')).toBe(false);
    expect(isPublicRoute('/settings')).toBe(false);
  });
});

describe('isAdminRoute', () => {
  it('should identify admin routes', () => {
    expect(isAdminRoute('/admin')).toBe(true);
    expect(isAdminRoute('/admin/users')).toBe(true);
    expect(isAdminRoute('/admin/settings')).toBe(true);
  });

  it('should not identify non-admin routes', () => {
    expect(isAdminRoute('/dashboard')).toBe(false);
    expect(isAdminRoute('/administrator')).toBe(false);
  });
});

describe('isApiRoute', () => {
  it('should identify API routes', () => {
    expect(isApiRoute('/api/health')).toBe(true);
    expect(isApiRoute('/api/guidebooks')).toBe(true);
    expect(isApiRoute('/api/auth/login')).toBe(true);
  });

  it('should not identify non-API routes', () => {
    expect(isApiRoute('/dashboard')).toBe(false);
    expect(isApiRoute('/api-docs')).toBe(false);
  });
});

describe('isStaticFile', () => {
  it('should identify static files', () => {
    expect(isStaticFile('/_next/static/chunk.js')).toBe(true);
    expect(isStaticFile('/image.png')).toBe(true);
    expect(isStaticFile('/styles.css')).toBe(true);
    expect(isStaticFile('/favicon.ico')).toBe(true);
  });

  it('should not identify routes as static files', () => {
    expect(isStaticFile('/dashboard')).toBe(false);
    expect(isStaticFile('/api/health')).toBe(false);
  });
});

describe('hasRequiredRole', () => {
  it('should allow admin to access any role', () => {
    expect(hasRequiredRole('admin', 'admin')).toBe(true);
    expect(hasRequiredRole('admin', 'customer')).toBe(true);
  });

  it('should allow customer to access customer role only', () => {
    expect(hasRequiredRole('customer', 'customer')).toBe(true);
    expect(hasRequiredRole('customer', 'admin')).toBe(false);
  });

  it('should deny access for null/undefined roles', () => {
    expect(hasRequiredRole(null, 'admin')).toBe(false);
    expect(hasRequiredRole(undefined, 'customer')).toBe(false);
  });
});
