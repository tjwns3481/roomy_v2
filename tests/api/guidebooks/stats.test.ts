// @TASK P2-T2.7 - 통계 조회 API 테스트
// @SPEC docs/planning/06-tasks.md#P2-T2.7

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Auth
const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
  },
};

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve(mockSession)),
}));

// Mock Supabase
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn(),
  rpc: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockSupabaseClient,
  createServerClient: () => Promise.resolve(mockSupabaseClient),
}));

// Import after mocking
import { GET } from '@/app/api/guidebooks/[id]/stats/route';
import { auth } from '@/lib/auth';

describe('GET /api/guidebooks/[id]/stats', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';
  const userId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
  });

  it('should return 400 if guidebook ID is missing', async () => {
    const request = new NextRequest('http://localhost/api/guidebooks//stats');

    const response = await GET(request, { params: Promise.resolve({ id: '' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('가이드북 ID가 필요합니다');
  });

  it('should return 400 if guidebook ID is invalid UUID', async () => {
    const request = new NextRequest('http://localhost/api/guidebooks/invalid-id/stats');

    const response = await GET(request, { params: Promise.resolve({ id: 'invalid-id' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('잘못된 가이드북 ID 형식입니다');
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);

    const request = new NextRequest(`http://localhost/api/guidebooks/${validUUID}/stats`);

    const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('로그인이 필요합니다');
  });

  it('should return 404 if guidebook not found', async () => {
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' },
    });

    const request = new NextRequest(`http://localhost/api/guidebooks/${validUUID}/stats`);

    const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('가이드북을 찾을 수 없습니다');
  });

  it('should return 403 if user is not the owner', async () => {
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { id: validUUID, user_id: 'other-user', title: 'Test', view_count: 100 },
      error: null,
    });

    const request = new NextRequest(`http://localhost/api/guidebooks/${validUUID}/stats`);

    const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('이 가이드북의 통계를 조회할 권한이 없습니다');
  });

  it('should return stats for guidebook owner', async () => {
    // Mock guidebook found with owner
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { id: validUUID, user_id: userId, title: 'My Guide', view_count: 150 },
      error: null,
    });

    // Mock RPC stats summary
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: [{
        total_views: 150,
        today_views: 10,
        week_views: 50,
        month_views: 100,
      }],
      error: null,
    });

    // Mock RPC daily views
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: [
        { view_date: '2024-01-28', view_count: 10 },
        { view_date: '2024-01-27', view_count: 8 },
        { view_date: '2024-01-26', view_count: 12 },
      ],
      error: null,
    });

    const request = new NextRequest(`http://localhost/api/guidebooks/${validUUID}/stats`);

    const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.guidebook_id).toBe(validUUID);
    expect(data.data.title).toBe('My Guide');
    expect(data.data.summary.total_views).toBe(150);
    expect(data.data.summary.today_views).toBe(10);
    expect(data.data.summary.week_views).toBe(50);
    expect(data.data.summary.month_views).toBe(100);
    expect(data.data.daily_views).toHaveLength(3);
  });

  it('should respect days query parameter', async () => {
    // Mock guidebook found
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { id: validUUID, user_id: userId, title: 'My Guide', view_count: 50 },
      error: null,
    });

    // Mock RPC calls
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: [{ total_views: 50, today_views: 5, week_views: 20, month_views: 50 }],
      error: null,
    });

    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: [{ view_date: '2024-01-28', view_count: 5 }],
      error: null,
    });

    const request = new NextRequest(`http://localhost/api/guidebooks/${validUUID}/stats?days=7`);

    const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.period_days).toBe(7);
  });

  it('should clamp days parameter to valid range', async () => {
    // Mock guidebook found
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { id: validUUID, user_id: userId, title: 'My Guide', view_count: 50 },
      error: null,
    });

    // Mock RPC calls
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: [{ total_views: 50, today_views: 5, week_views: 20, month_views: 50 }],
      error: null,
    });

    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    // Request with 1000 days (should be clamped to 365)
    const request = new NextRequest(`http://localhost/api/guidebooks/${validUUID}/stats?days=1000`);

    const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.period_days).toBe(365);
  });

  it('should handle RPC error and fallback to direct queries', async () => {
    // Reset all mocks
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);

    // Create a more flexible mock chain
    const createChainMock = (finalValue: any) => {
      const chainMock: any = {};
      chainMock.select = vi.fn().mockReturnValue(chainMock);
      chainMock.eq = vi.fn().mockReturnValue(chainMock);
      chainMock.gte = vi.fn().mockReturnValue(chainMock);
      chainMock.order = vi.fn().mockReturnValue(chainMock);
      chainMock.single = vi.fn().mockResolvedValue(finalValue);

      // For count queries
      if (finalValue.count !== undefined) {
        chainMock.select = vi.fn().mockResolvedValue(finalValue);
        chainMock.eq = vi.fn().mockReturnValue(chainMock);
        chainMock.gte = vi.fn().mockReturnValue(chainMock);
      }

      return chainMock;
    };

    // Track which table is being queried
    let guidebookCallCount = 0;
    let viewsCallCount = 0;

    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'guidebooks') {
        guidebookCallCount++;
        return createChainMock({
          data: { id: validUUID, user_id: userId, title: 'My Guide', view_count: 30 },
          error: null,
        });
      }
      if (table === 'guidebook_views') {
        viewsCallCount++;
        // Return different results based on call count
        if (viewsCallCount <= 3) {
          // Count queries
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockResolvedValue({ count: viewsCallCount === 1 ? 3 : viewsCallCount === 2 ? 15 : 30 }),
              }),
            }),
          };
        } else {
          // Order query for daily views
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: [] }),
                }),
              }),
            }),
          };
        }
      }
      return createChainMock({ data: null, error: null });
    });

    // Mock RPC errors (function not found)
    mockSupabaseClient.rpc.mockResolvedValue({
      data: null,
      error: { message: 'function not found' },
    });

    const request = new NextRequest(`http://localhost/api/guidebooks/${validUUID}/stats`);

    const response = await GET(request, { params: Promise.resolve({ id: validUUID }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // Total should come from guidebook.view_count
    expect(data.data.summary.total_views).toBe(30);
  });
});
