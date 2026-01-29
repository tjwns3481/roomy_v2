// @TASK P5-T5.5 - 공유 통계 조회 API 테스트
// @SPEC docs/planning/06-tasks.md#P5-T5.5

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/share/stats/route';

// Auth 모킹
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() =>
    Promise.resolve({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    })
  ),
}));

// Supabase 모킹
const mockGuidebook = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: 'test-user-id',
  title: '테스트 가이드북',
};

const mockShareStats = [
  {
    total_shares: 100,
    short_url_clicks: 20,
    link_copies: 50,
    qr_downloads: 15,
    kakao_shares: 10,
    twitter_shares: 3,
    facebook_shares: 2,
  },
];

const mockDailyStats = [
  {
    share_date: '2024-01-28',
    share_count: 10,
    link_copies: 5,
    qr_downloads: 3,
    social_shares: 2,
  },
  {
    share_date: '2024-01-27',
    share_count: 8,
    link_copies: 4,
    qr_downloads: 2,
    social_shares: 2,
  },
];

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockGuidebook,
            error: null,
          })),
          gte: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
    rpc: vi.fn((fnName: string) => {
      if (fnName === 'get_share_stats_summary') {
        return { data: mockShareStats, error: null };
      }
      if (fnName === 'get_share_daily_stats') {
        return { data: mockDailyStats, error: null };
      }
      return { data: null, error: { message: 'Unknown function' } };
    }),
  })),
}));

describe('GET /api/share/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (queryParams: Record<string, string>) => {
    const url = new URL('http://localhost:3000/api/share/stats');
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url);
  };

  it('가이드북 공유 통계를 조회할 수 있다', async () => {
    const request = createRequest({
      guidebookId: '123e4567-e89b-12d3-a456-426614174000',
      period: '30d',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.summary).toBeDefined();
    expect(data.data.summary.totalShares).toBe(100);
    expect(data.data.summary.linkCopies).toBe(50);
    expect(data.data.summary.qrDownloads).toBe(15);
    expect(data.data.summary.socialShares.kakao).toBe(10);
  });

  it('7일 기간으로 조회할 수 있다', async () => {
    const request = createRequest({
      guidebookId: '123e4567-e89b-12d3-a456-426614174000',
      period: '7d',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.period).toBe('7d');
  });

  it('전체 기간으로 조회할 수 있다', async () => {
    const request = createRequest({
      guidebookId: '123e4567-e89b-12d3-a456-426614174000',
      period: 'all',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.period).toBe('all');
  });

  it('일별 통계를 포함한다', async () => {
    const request = createRequest({
      guidebookId: '123e4567-e89b-12d3-a456-426614174000',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.dailyStats).toBeDefined();
    expect(Array.isArray(data.data.dailyStats)).toBe(true);
  });

  it('guidebookId가 없으면 400 에러를 반환한다', async () => {
    const request = createRequest({});

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('guidebookId 파라미터가 필요합니다');
  });

  it('잘못된 UUID 형식이면 400 에러를 반환한다', async () => {
    const request = createRequest({
      guidebookId: 'invalid-uuid',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('잘못된 가이드북 ID 형식입니다');
  });

  it('유효하지 않은 기간이면 400 에러를 반환한다', async () => {
    const request = createRequest({
      guidebookId: '123e4567-e89b-12d3-a456-426614174000',
      period: 'invalid',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('유효하지 않은 기간');
  });
});

describe('GET /api/share/stats - 인증', () => {
  it('로그인하지 않으면 401 에러를 반환한다', async () => {
    // Auth 모킹 해제
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValueOnce(null);

    const request = new NextRequest(
      'http://localhost:3000/api/share/stats?guidebookId=123e4567-e89b-12d3-a456-426614174000'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('로그인이 필요합니다');
  });
});
