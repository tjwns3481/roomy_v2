/**
 * @TASK P7-T7.9 - Cron Cleanup API 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/cron/cleanup/route';

// Supabase 모킹
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      delete: vi.fn(() => ({
        lt: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          select: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  })),
}));

describe('Cron Cleanup API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 환경 변수 초기화
    delete process.env.VERCEL_ENV;
    delete process.env.CRON_SECRET;
  });

  describe('POST /api/cron/cleanup', () => {
    it('should successfully run cleanup tasks', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/cleanup', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.timestamp).toBeDefined();
      expect(data.results).toEqual({
        expiredShortUrls: 0,
        oldViewLogs: 0,
        oldAiUsageLogs: 0,
      });
    });

    it('should reject unauthorized requests in production', async () => {
      process.env.VERCEL_ENV = 'production';
      process.env.CRON_SECRET = 'test-secret';

      const request = new NextRequest('http://localhost:3000/api/cron/cleanup', {
        method: 'POST',
        headers: {
          authorization: 'Bearer wrong-secret',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.errors).toContain('Unauthorized: Invalid cron secret');
    });

    it('should accept authorized requests in production', async () => {
      process.env.VERCEL_ENV = 'production';
      process.env.CRON_SECRET = 'test-secret';

      const request = new NextRequest('http://localhost:3000/api/cron/cleanup', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-secret',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/cron/cleanup', () => {
    it('should allow GET in development', async () => {
      process.env.VERCEL_ENV = 'development';

      const request = new NextRequest('http://localhost:3000/api/cron/cleanup', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject GET in production', async () => {
      process.env.VERCEL_ENV = 'production';

      const request = new NextRequest('http://localhost:3000/api/cron/cleanup', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toContain('GET method not allowed');
    });
  });
});
