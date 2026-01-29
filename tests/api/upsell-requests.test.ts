// @TASK P8-R4: Upsell 요청 API 테스트
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createRequest } from '@/app/api/upsell/requests/route';
import { GET as getRequests } from '@/app/api/guidebooks/[id]/upsell/requests/route';
import { PATCH as updateRequest, DELETE as deleteRequest } from '@/app/api/guidebooks/[id]/upsell/requests/[reqId]/route';
import { NextRequest } from 'next/server';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  })),
}));

const { createClient } = await import('@/lib/supabase/server');

describe('POST /api/upsell/requests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('게스트가 Upsell 요청을 생성할 수 있어야 함', async () => {
    const mockItem = {
      id: 'item-123',
      guidebook_id: 'guidebook-123',
      is_active: true,
    };

    const mockRequest = {
      id: 'request-123',
      upsell_item_id: 'item-123',
      guidebook_id: 'guidebook-123',
      guest_name: '홍길동',
      guest_contact: '010-1234-5678',
      message: '조식 추가 부탁드립니다',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'upsell_items') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
          };
        }
        if (table === 'upsell_requests') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockRequest, error: null }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const req = new NextRequest('http://localhost:3000/api/upsell/requests', {
      method: 'POST',
      body: JSON.stringify({
        upsell_item_id: 'item-123',
        guest_name: '홍길동',
        guest_contact: '010-1234-5678',
        message: '조식 추가 부탁드립니다',
      }),
    });

    const response = await createRequest(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.request).toBeDefined();
    expect(data.request.status).toBe('pending');
  });

  it('존재하지 않는 아이템은 404 에러를 반환해야 함', async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      })),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const req = new NextRequest('http://localhost:3000/api/upsell/requests', {
      method: 'POST',
      body: JSON.stringify({
        upsell_item_id: 'invalid-item-id',
      }),
    });

    const response = await createRequest(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('ITEM_NOT_FOUND');
  });

  it('비활성 아이템은 400 에러를 반환해야 함', async () => {
    const mockItem = {
      id: 'item-123',
      guidebook_id: 'guidebook-123',
      is_active: false,
    };

    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
      })),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const req = new NextRequest('http://localhost:3000/api/upsell/requests', {
      method: 'POST',
      body: JSON.stringify({
        upsell_item_id: 'item-123',
      }),
    });

    const response = await createRequest(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('ITEM_INACTIVE');
  });

  it('유효하지 않은 데이터는 400 에러를 반환해야 함', async () => {
    const req = new NextRequest('http://localhost:3000/api/upsell/requests', {
      method: 'POST',
      body: JSON.stringify({
        upsell_item_id: 'invalid-uuid',
      }),
    });

    const response = await createRequest(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/guidebooks/[id]/upsell/requests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('호스트가 자신의 가이드북 요청 목록을 조회할 수 있어야 함', async () => {
    const mockUser = { id: 'user-123' };
    const mockGuidebook = {
      id: 'guidebook-123',
      user_id: 'user-123',
    };

    const mockRequests = [
      {
        id: 'request-1',
        upsell_item_id: 'item-1',
        guidebook_id: 'guidebook-123',
        guest_name: '홍길동',
        status: 'pending',
        created_at: new Date().toISOString(),
        upsell_items: {
          name: '조식',
          price: 10000,
        },
      },
    ];

    const mockStats = {
      total_requests: 5,
      pending_requests: 3,
      confirmed_requests: 1,
      cancelled_requests: 1,
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn((table: string) => {
        if (table === 'guidebooks') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockGuidebook, error: null }),
          };
        }
        if (table === 'upsell_requests') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockResolvedValue({
              data: mockRequests,
              error: null,
              count: mockRequests.length,
            }),
          };
        }
        return {};
      }),
      rpc: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockStats, error: null }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const req = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/requests');

    const response = await getRequests(req, { params: { id: 'guidebook-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.requests).toBeDefined();
    expect(data.total).toBe(1);
    expect(data.stats).toBeDefined();
  });

  it('인증되지 않은 사용자는 401 에러를 반환해야 함', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const req = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/requests');

    const response = await getRequests(req, { params: { id: 'guidebook-123' } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('다른 사용자의 가이드북은 403 에러를 반환해야 함', async () => {
    const mockUser = { id: 'user-123' };
    const mockGuidebook = {
      id: 'guidebook-123',
      user_id: 'other-user-456',
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockGuidebook, error: null }),
      })),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const req = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/requests');

    const response = await getRequests(req, { params: { id: 'guidebook-123' } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error.code).toBe('FORBIDDEN');
  });
});

describe('PATCH /api/guidebooks/[id]/upsell/requests/[reqId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('호스트가 요청 상태를 변경할 수 있어야 함', async () => {
    const mockUser = { id: 'user-123' };
    const mockGuidebook = {
      id: 'guidebook-123',
      user_id: 'user-123',
    };

    const mockExistingRequest = {
      id: 'request-123',
      guidebook_id: 'guidebook-123',
      status: 'pending',
    };

    const mockUpdatedRequest = {
      ...mockExistingRequest,
      status: 'confirmed',
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn((table: string) => {
        if (table === 'guidebooks') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockGuidebook, error: null }),
          };
        }
        if (table === 'upsell_requests') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockExistingRequest, error: null }),
            update: vi.fn().mockReturnThis(),
          };
        }
        return {};
      }),
    };

    // Mock for update
    const selectMock = vi.fn().mockReturnThis();
    const singleMock = vi.fn().mockResolvedValue({ data: mockUpdatedRequest, error: null });
    selectMock.mockReturnValue({ single: singleMock });

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'guidebooks') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockGuidebook, error: null }),
        };
      }
      if (table === 'upsell_requests') {
        const eqMock = vi.fn().mockReturnThis();
        return {
          select: vi.fn().mockReturnThis(),
          eq: eqMock,
          single: vi.fn().mockResolvedValue({ data: mockExistingRequest, error: null }),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({ data: mockUpdatedRequest, error: null }),
                })),
              })),
            })),
          })),
        };
      }
      return {};
    });

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const req = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/requests/request-123', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'confirmed' }),
    });

    const response = await updateRequest(req, {
      params: { id: 'guidebook-123', reqId: 'request-123' },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.request.status).toBe('confirmed');
  });

  it('유효하지 않은 상태는 400 에러를 반환해야 함', async () => {
    const req = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/requests/request-123', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'invalid_status' }),
    });

    const response = await updateRequest(req, {
      params: { id: 'guidebook-123', reqId: 'request-123' },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('DELETE /api/guidebooks/[id]/upsell/requests/[reqId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('호스트가 요청을 삭제할 수 있어야 함', async () => {
    const mockUser = { id: 'user-123' };
    const mockGuidebook = {
      id: 'guidebook-123',
      user_id: 'user-123',
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn((table: string) => {
        if (table === 'guidebooks') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockGuidebook, error: null }),
          };
        }
        if (table === 'upsell_requests') {
          return {
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const req = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/requests/request-123', {
      method: 'DELETE',
    });

    const response = await deleteRequest(req, {
      params: { id: 'guidebook-123', reqId: 'request-123' },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
