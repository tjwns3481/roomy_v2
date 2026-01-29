// @TASK P4-T4.3 - 가이드북 생성 API 테스트
// @TASK P6-T6.7 - 제한 체크 미들웨어 연동 테스트
// @SPEC docs/planning/03-user-flow.md#가이드북-생성-플로우

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// @TASK P6-T6.7 - 제한 체크 미들웨어 Mock
vi.mock('@/lib/subscription/middleware', () => ({
  withGuidebookLimit: vi.fn(),
}));

import { auth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { withGuidebookLimit } from '@/lib/subscription/middleware';

describe('POST /api/guidebooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 기본적으로 제한 체크 통과
    vi.mocked(withGuidebookLimit).mockResolvedValue({
      success: true,
      limitInfo: {
        allowed: true,
        current: 0,
        limit: 1,
      },
    });
  });

  it('인증되지 않은 경우 401 반환', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/guidebooks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Guidebook',
        slug: 'test-guidebook',
        theme: 'modern',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('로그인이 필요합니다');
  });

  it('유효하지 않은 슬러그 형식일 경우 400 반환', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    } as any);

    const req = new NextRequest('http://localhost:3000/api/guidebooks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Guidebook',
        slug: 'Test Guidebook!', // 잘못된 슬러그 (대문자, 특수문자)
        theme: 'modern',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    // Zod 에러 메시지 또는 기본 메시지 모두 허용
    expect(data.error).toBeDefined();
  });

  it('슬러그가 중복된 경우 409 반환', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    } as any);

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'existing-guidebook' },
        error: null,
      }),
    };

    vi.mocked(createClient).mockReturnValue(mockSupabase as any);

    const req = new NextRequest('http://localhost:3000/api/guidebooks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Guidebook',
        slug: 'existing-slug',
        theme: 'modern',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('이미 사용 중인 슬러그입니다');
  });

  // @TASK P6-T6.7 - 제한 초과 시 402 Payment Required 반환으로 변경
  it('가이드북 생성 제한에 도달한 경우 402 반환', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    } as any);

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // Not found
      }),
    };

    vi.mocked(createClient).mockReturnValue(mockSupabase as any);

    // 제한 초과 Mock
    vi.mocked(withGuidebookLimit).mockResolvedValue({
      success: false,
      response: {
        error: 'LIMIT_EXCEEDED',
        message: '가이드북 생성 한도를 초과했습니다.',
        current: 1,
        limit: 1,
        upgradeUrl: '/pricing',
        feature: 'guidebook',
      },
    });

    const req = new NextRequest('http://localhost:3000/api/guidebooks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Guidebook',
        slug: 'test-guidebook',
        theme: 'modern',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(402);
    expect(data.error).toBe('LIMIT_EXCEEDED');
    expect(data.upgradeUrl).toBe('/pricing');
  });

  it('유효한 요청일 경우 가이드북 생성 성공', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    } as any);

    // @TASK P6-T6.7 - 제한 체크 통과 Mock
    vi.mocked(withGuidebookLimit).mockResolvedValue({
      success: true,
      limitInfo: {
        allowed: true,
        current: 0,
        limit: 1,
      },
    });

    const mockGuidebook = {
      id: 'guidebook-1',
      user_id: 'user-1',
      title: 'Test Guidebook',
      slug: 'test-guidebook',
      theme: 'modern',
      status: 'draft',
    };

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'guidebooks') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
            insert: vi.fn().mockReturnThis(),
          };
        }
        if (table === 'blocks') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          };
        }
        return this;
      }),
    };

    // 가이드북 생성 체인
    const guidebookChain = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockGuidebook,
        error: null,
      }),
    };

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'guidebooks') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
          insert: vi.fn().mockReturnValue(guidebookChain),
        };
      }
      if (table === 'blocks') {
        return {
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        };
      }
      return mockSupabase;
    });

    vi.mocked(createClient).mockReturnValue(mockSupabase as any);

    const req = new NextRequest('http://localhost:3000/api/guidebooks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Guidebook',
        slug: 'test-guidebook',
        theme: 'modern',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.guidebook).toEqual(mockGuidebook);
    expect(data.message).toBe('가이드북이 생성되었습니다');
  });
});

describe('GET /api/guidebooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 경우 401 반환', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/guidebooks');

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('로그인이 필요합니다');
  });

  it('사용자의 가이드북 목록 반환', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
    } as any);

    const mockGuidebooks = [
      {
        id: 'guidebook-1',
        user_id: 'user-1',
        title: 'Guidebook 1',
        slug: 'guidebook-1',
      },
      {
        id: 'guidebook-2',
        user_id: 'user-1',
        title: 'Guidebook 2',
        slug: 'guidebook-2',
      },
    ];

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockGuidebooks,
        error: null,
      }),
    };

    vi.mocked(createClient).mockReturnValue(mockSupabase as any);

    const req = new NextRequest('http://localhost:3000/api/guidebooks');

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.guidebooks).toEqual(mockGuidebooks);
  });
});
