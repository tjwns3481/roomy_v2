// @TASK P8-R3: Upsell Items API 테스트

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/guidebooks/[id]/upsell/items/route';
import { PUT, DELETE } from '@/app/api/guidebooks/[id]/upsell/items/[itemId]/route';
import { NextRequest } from 'next/server';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

const { createServerClient } = await import('@/lib/supabase/server');

describe('Upsell Items API', () => {
  let mockSupabase: any;
  let mockUser: any;
  let mockGuidebook: any;
  let mockItem: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUser = {
      id: 'user-123',
      email: 'host@example.com',
    };

    mockGuidebook = {
      id: 'guidebook-123',
      user_id: 'user-123',
      title: 'Test Guidebook',
    };

    mockItem = {
      id: 'item-123',
      guidebook_id: 'guidebook-123',
      name: 'Early Check-in',
      description: 'Check in 2 hours earlier',
      price: 20000,
      image_url: 'https://example.com/image.jpg',
      is_active: true,
      sort_order: 0,
      created_at: '2024-01-28T00:00:00Z',
      updated_at: '2024-01-28T00:00:00Z',
    };

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn(),
      rpc: vi.fn(),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);
  });

  describe('GET /api/guidebooks/[id]/upsell/items', () => {
    it('호스트는 모든 아이템을 조회할 수 있다', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockItem],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockGuidebook,
              error: null,
            }),
          }),
        }),
      });

      // 두 번째 호출 (아이템 목록)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const request = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/items');
      const params = Promise.resolve({ id: 'guidebook-123' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(data.items[0]).toEqual(mockItem);
      expect(data.total).toBe(1);
    });

    it('게스트는 활성화된 아이템만 조회할 수 있다', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockItem],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const request = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/items');
      const params = Promise.resolve({ id: 'guidebook-123' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockQuery.eq).toHaveBeenCalledWith('is_active', true);
    });

    it('조회 중 에러 발생 시 500 에러를 반환한다', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/items');
      const params = Promise.resolve({ id: 'guidebook-123' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('FETCH_ERROR');
    });
  });

  describe('POST /api/guidebooks/[id]/upsell/items', () => {
    it('Business 플랜 사용자는 아이템을 생성할 수 있다', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockGuidebook,
              error: null,
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockItem,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/items', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Early Check-in',
          description: 'Check in 2 hours earlier',
          price: 20000,
          image_url: 'https://example.com/image.jpg',
        }),
      });
      const params = Promise.resolve({ id: 'guidebook-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.item).toEqual(mockItem);
    });

    it('Business 플랜이 아니면 402 에러를 반환한다', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockGuidebook,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.rpc.mockResolvedValue({
        data: false,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/items', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Early Check-in',
          price: 20000,
        }),
      });
      const params = Promise.resolve({ id: 'guidebook-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(402);
      expect(data.error.code).toBe('PLAN_UPGRADE_REQUIRED');
      expect(data.error.upgradeUrl).toBe('/settings/subscription');
    });

    it('인증되지 않은 사용자는 401 에러를 반환한다', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/items', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Early Check-in',
          price: 20000,
        }),
      });
      const params = Promise.resolve({ id: 'guidebook-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('다른 사용자의 가이드북에는 아이템을 생성할 수 없다', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockGuidebook, user_id: 'other-user' },
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/items', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Early Check-in',
          price: 20000,
        }),
      });
      const params = Promise.resolve({ id: 'guidebook-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('유효하지 않은 데이터는 400 에러를 반환한다', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockGuidebook,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/items', {
        method: 'POST',
        body: JSON.stringify({
          name: '', // 빈 이름
          price: -1000, // 음수 가격
        }),
      });
      const params = Promise.resolve({ id: 'guidebook-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/guidebooks/[id]/upsell/items/[itemId]', () => {
    it('호스트는 자신의 아이템을 수정할 수 있다', async () => {
      const updatedItem = { ...mockItem, name: 'Late Check-out', price: 30000 };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              guidebook_id: 'guidebook-123',
              guidebooks: { user_id: 'user-123' },
            },
            error: null,
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updatedItem,
                error: null,
              }),
            }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/items/item-123', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Late Check-out',
          price: 30000,
        }),
      });
      const params = Promise.resolve({ id: 'guidebook-123', itemId: 'item-123' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.item.name).toBe('Late Check-out');
      expect(data.item.price).toBe(30000);
    });

    it('다른 사용자의 아이템은 수정할 수 없다', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              guidebook_id: 'guidebook-123',
              guidebooks: { user_id: 'other-user' },
            },
            error: null,
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/items/item-123', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Late Check-out',
        }),
      });
      const params = Promise.resolve({ id: 'guidebook-123', itemId: 'item-123' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('존재하지 않는 아이템은 404 에러를 반환한다', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Not found'),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/items/item-123', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Late Check-out',
        }),
      });
      const params = Promise.resolve({ id: 'guidebook-123', itemId: 'item-123' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/guidebooks/[id]/upsell/items/[itemId]', () => {
    it('호스트는 자신의 아이템을 삭제할 수 있다', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              guidebook_id: 'guidebook-123',
              guidebooks: { user_id: 'user-123' },
            },
            error: null,
          }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/items/item-123', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: 'guidebook-123', itemId: 'item-123' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('다른 사용자의 아이템은 삭제할 수 없다', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              guidebook_id: 'guidebook-123',
              guidebooks: { user_id: 'other-user' },
            },
            error: null,
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/guidebooks/guidebook-123/upsell/items/item-123', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: 'guidebook-123', itemId: 'item-123' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('FORBIDDEN');
    });
  });
});
