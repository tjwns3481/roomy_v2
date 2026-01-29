// @TASK P4-T4.4 - 가이드북 설정 API 테스트
// @TEST tests/api/guidebooks-settings.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH, DELETE } from '@/app/api/guidebooks/[id]/route';
import { createServerClient } from '@/lib/supabase/server';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

describe('PATCH /api/guidebooks/[id]', () => {
  const mockUser = { id: 'user-1', email: 'test@example.com' };

  const mockSupabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          neq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'guidebook-1',
                title: '새로운 제목',
                slug: 'new-slug',
                theme: 'cozy',
              },
              error: null,
            }),
          })),
        })),
      })),
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createServerClient as any).mockResolvedValue(mockSupabase);
  });

  it('가이드북 정보를 수정한다', async () => {
    const request = new Request('http://localhost/api/guidebooks/guidebook-1', {
      method: 'PATCH',
      body: JSON.stringify({
        title: '새로운 제목',
        slug: 'new-slug',
        theme: 'cozy',
      }),
    });

    const context = {
      params: Promise.resolve({ id: 'guidebook-1' }),
    };

    const response = await PATCH(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.title).toBe('새로운 제목');
  });

  it('인증되지 않은 사용자는 401 에러를 받는다', async () => {
    const unauthSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    };

    (createServerClient as any).mockResolvedValue(unauthSupabase);

    const request = new Request('http://localhost/api/guidebooks/guidebook-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: '새로운 제목' }),
    });

    const context = {
      params: Promise.resolve({ id: 'guidebook-1' }),
    };

    const response = await PATCH(request, context);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('중복된 slug는 409 에러를 반환한다', async () => {
    const duplicateSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => ({
              single: vi
                .fn()
                .mockResolvedValue({ data: { id: 'other-id' }, error: null }),
            })),
          })),
        })),
      })),
    };

    (createServerClient as any).mockResolvedValue(duplicateSupabase);

    const request = new Request('http://localhost/api/guidebooks/guidebook-1', {
      method: 'PATCH',
      body: JSON.stringify({ slug: 'duplicate-slug' }),
    });

    const context = {
      params: Promise.resolve({ id: 'guidebook-1' }),
    };

    const response = await PATCH(request, context);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('Slug already exists');
  });
});

describe('DELETE /api/guidebooks/[id]', () => {
  const mockUser = { id: 'user-1', email: 'test@example.com' };

  const mockSupabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
    },
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createServerClient as any).mockResolvedValue(mockSupabase);
  });

  it('가이드북을 삭제한다', async () => {
    const request = new Request('http://localhost/api/guidebooks/guidebook-1', {
      method: 'DELETE',
    });

    const context = {
      params: Promise.resolve({ id: 'guidebook-1' }),
    };

    const response = await DELETE(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('인증되지 않은 사용자는 401 에러를 받는다', async () => {
    const unauthSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    };

    (createServerClient as any).mockResolvedValue(unauthSupabase);

    const request = new Request('http://localhost/api/guidebooks/guidebook-1', {
      method: 'DELETE',
    });

    const context = {
      params: Promise.resolve({ id: 'guidebook-1' }),
    };

    const response = await DELETE(request, context);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('삭제 실패 시 500 에러를 반환한다', async () => {
    const errorSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn(() => ({
        delete: vi.fn(() => ({
          eq: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        })),
      })),
    };

    (createServerClient as any).mockResolvedValue(errorSupabase);

    const request = new Request('http://localhost/api/guidebooks/guidebook-1', {
      method: 'DELETE',
    });

    const context = {
      params: Promise.resolve({ id: 'guidebook-1' }),
    };

    const response = await DELETE(request, context);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to delete guidebook');
  });
});
