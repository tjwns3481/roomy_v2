// @TASK P4-T4.5 - 호스트 통계 API 테스트
// @SPEC docs/planning/06-tasks.md#P4-T4.5

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';
import { createAdminClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

// Mock modules
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/auth');

describe('GET /api/stats', () => {
  const mockUserId = 'user-123';
  const mockGuidebooks = [
    {
      id: 'gb-1',
      title: '강남역 아파트',
      view_count: 523,
      created_at: '2024-01-20T00:00:00Z',
    },
    {
      id: 'gb-2',
      title: '제주도 펜션',
      view_count: 301,
      created_at: '2024-01-21T00:00:00Z',
    },
    {
      id: 'gb-3',
      title: '부산 해운대',
      view_count: 210,
      created_at: '2024-01-22T00:00:00Z',
    },
  ];

  const mockDailyViews = [
    { view_date: '2024-01-28', view_count: 25 },
    { view_date: '2024-01-27', view_count: 30 },
    { view_date: '2024-01-26', view_count: 20 },
    { view_date: '2024-01-25', view_count: 15 },
    { view_date: '2024-01-24', view_count: 18 },
    { view_date: '2024-01-23', view_count: 22 },
    { view_date: '2024-01-22', view_count: 28 },
  ];

  const mockTodayViews = [
    { guidebook_id: 'gb-1', view_count: 12 },
    { guidebook_id: 'gb-2', view_count: 8 },
    { guidebook_id: 'gb-3', view_count: 5 },
  ];

  const mockAiUsage = [
    {
      used: 12,
      limit: 30,
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('인증되지 않은 요청은 401 반환', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/stats');
    const response = await GET(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('로그인이 필요합니다');
  });

  it('7일 기간 통계 조회 성공', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com' },
    } as any);

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockGuidebooks,
        error: null,
      }),
      rpc: vi.fn((funcName) => {
        if (funcName === 'get_user_daily_views') {
          return Promise.resolve({ data: mockDailyViews, error: null });
        }
        if (funcName === 'get_user_today_views_by_guidebook') {
          return Promise.resolve({ data: mockTodayViews, error: null });
        }
        if (funcName === 'check_ai_limit') {
          return Promise.resolve({ data: mockAiUsage, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      }),
    };

    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

    const request = new Request('http://localhost:3000/api/stats?period=7d');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('summary');
    expect(result.data.summary).toMatchObject({
      totalViews: 1034, // 523 + 301 + 210
      todayViews: 25,
      guidebookCount: 3,
    });
    expect(result.data.summary.aiUsage).toMatchObject({
      used: 12,
      limit: 30,
    });
    expect(result.data).toHaveProperty('chartData');
    expect(result.data.chartData).toHaveLength(7);
    expect(result.data).toHaveProperty('guidebookStats');
    expect(result.data.guidebookStats).toHaveLength(3);
  });

  it('30일 기간 통계 조회 성공', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com' },
    } as any);

    const mock30DaysViews = Array.from({ length: 30 }, (_, i) => ({
      view_date: new Date(2024, 0, 28 - i).toISOString().split('T')[0],
      view_count: Math.floor(Math.random() * 50) + 10,
    }));

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockGuidebooks,
        error: null,
      }),
      rpc: vi.fn((funcName) => {
        if (funcName === 'get_user_daily_views') {
          return Promise.resolve({ data: mock30DaysViews, error: null });
        }
        if (funcName === 'get_user_today_views_by_guidebook') {
          return Promise.resolve({ data: mockTodayViews, error: null });
        }
        if (funcName === 'check_ai_limit') {
          return Promise.resolve({ data: mockAiUsage, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      }),
    };

    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

    const request = new Request('http://localhost:3000/api/stats?period=30d');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const result = await response.json();

    expect(result.data.chartData).toHaveLength(30);
  });

  it('가이드북별 오늘 조회수 포함', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com' },
    } as any);

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockGuidebooks,
        error: null,
      }),
      rpc: vi.fn((funcName) => {
        if (funcName === 'get_user_daily_views') {
          return Promise.resolve({ data: mockDailyViews, error: null });
        }
        if (funcName === 'get_user_today_views_by_guidebook') {
          return Promise.resolve({ data: mockTodayViews, error: null });
        }
        if (funcName === 'check_ai_limit') {
          return Promise.resolve({ data: mockAiUsage, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      }),
    };

    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

    const request = new Request('http://localhost:3000/api/stats?period=7d');
    const response = await GET(request);
    const result = await response.json();

    expect(result.data.guidebookStats[0]).toMatchObject({
      id: 'gb-1',
      title: '강남역 아파트',
      views: 523,
      todayViews: 12,
    });

    expect(result.data.guidebookStats[1]).toMatchObject({
      id: 'gb-2',
      title: '제주도 펜션',
      views: 301,
      todayViews: 8,
    });
  });

  it('빈 데이터에서도 정상 동작', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: mockUserId, email: 'test@example.com' },
    } as any);

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
      rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
    };

    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

    const request = new Request('http://localhost:3000/api/stats?period=7d');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const result = await response.json();

    expect(result.data.summary).toMatchObject({
      totalViews: 0,
      todayViews: 0,
      guidebookCount: 0,
      aiUsage: { used: 0, limit: 3 }, // free plan default
    });
    expect(result.data.chartData).toHaveLength(7);
    expect(result.data.guidebookStats).toHaveLength(0);
  });
});
