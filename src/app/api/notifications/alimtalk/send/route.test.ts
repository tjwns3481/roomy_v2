/**
 * @TASK P8-R5 - 알림톡 발송 API 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from './route';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import * as alimtalkLib from '@/lib/kakao/alimtalk';

// Mock modules
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/kakao/alimtalk', async () => {
  const actual = await vi.importActual('@/lib/kakao/alimtalk');
  return {
    ...actual,
    sendAlimtalk: vi.fn(),
  };
});

describe('POST /api/notifications/alimtalk/send', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 요청은 401 반환', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Unauthorized'),
        }),
      },
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);

    const request = new Request('http://localhost/api/notifications/alimtalk/send', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('Business 플랜이 아니면 402 반환', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { plan: 'free' },
        error: null,
      }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);

    const request = new Request('http://localhost/api/notifications/alimtalk/send', {
      method: 'POST',
      body: JSON.stringify({
        guidebookId: '123e4567-e89b-12d3-a456-426614174000',
        templateCode: 'GUIDEBOOK_SHARE_001',
        recipientPhone: '010-1234-5678',
        templateParams: {
          recipientName: '홍길동',
          guidebookTitle: '테스트 가이드북',
          guidebookUrl: 'https://example.com/g/test',
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(402);
    expect(data.error.code).toBe('PLAN_REQUIRED');
  });

  it('유효하지 않은 전화번호는 400 반환', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { plan: 'business' },
              error: null,
            }),
          };
        }
        if (table === 'guidebooks') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'guidebook-1', title: 'Test Guidebook' },
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);

    const request = new Request('http://localhost/api/notifications/alimtalk/send', {
      method: 'POST',
      body: JSON.stringify({
        guidebookId: '123e4567-e89b-12d3-a456-426614174000',
        templateCode: 'GUIDEBOOK_SHARE_001',
        recipientPhone: '123', // 잘못된 전화번호
        templateParams: {
          recipientName: '홍길동',
          guidebookTitle: '테스트 가이드북',
          guidebookUrl: 'https://example.com/g/test',
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_PHONE');
  });

  it('알림톡 발송 성공 시 200 반환', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { plan: 'business' },
              error: null,
            }),
          };
        }
        if (table === 'guidebooks') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'guidebook-1', title: 'Test Guidebook' },
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }),
    };

    const mockAdminClient = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);
    vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any);

    vi.mocked(alimtalkLib.sendAlimtalk).mockResolvedValue({
      success: true,
      messageId: 'MOCK_123456',
    });

    const request = new Request('http://localhost/api/notifications/alimtalk/send', {
      method: 'POST',
      body: JSON.stringify({
        guidebookId: '123e4567-e89b-12d3-a456-426614174000',
        templateCode: 'GUIDEBOOK_SHARE_001',
        recipientPhone: '010-1234-5678',
        recipientName: '홍길동',
        templateParams: {
          recipientName: '홍길동',
          guidebookTitle: '테스트 가이드북',
          guidebookUrl: 'https://example.com/g/test',
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.messageId).toBe('MOCK_123456');
    expect(alimtalkLib.sendAlimtalk).toHaveBeenCalled();
  });

  it('알림톡 발송 실패 시 500 반환', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { plan: 'business' },
              error: null,
            }),
          };
        }
        if (table === 'guidebooks') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'guidebook-1', title: 'Test Guidebook' },
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }),
    };

    const mockAdminClient = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);
    vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any);

    vi.mocked(alimtalkLib.sendAlimtalk).mockResolvedValue({
      success: false,
      error: {
        code: 'KAKAO_API_ERROR',
        message: '카카오 API 오류',
      },
    });

    const request = new Request('http://localhost/api/notifications/alimtalk/send', {
      method: 'POST',
      body: JSON.stringify({
        guidebookId: '123e4567-e89b-12d3-a456-426614174000',
        templateCode: 'GUIDEBOOK_SHARE_001',
        recipientPhone: '010-1234-5678',
        templateParams: {
          recipientName: '홍길동',
          guidebookTitle: '테스트 가이드북',
          guidebookUrl: 'https://example.com/g/test',
        },
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('KAKAO_API_ERROR');
  });
});

describe('GET /api/notifications/alimtalk/send', () => {
  it('템플릿 목록 반환', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.templates).toBeInstanceOf(Array);
    expect(data.templates.length).toBeGreaterThan(0);
    expect(data.templates[0]).toHaveProperty('code');
    expect(data.templates[0]).toHaveProperty('name');
    expect(data.templates[0]).toHaveProperty('variables');
    expect(data.templates[0]).toHaveProperty('description');
  });
});
