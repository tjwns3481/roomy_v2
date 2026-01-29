/**
 * @TASK P8-R5 - 알림톡 이력 조회 API 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { createServerClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server');

describe('GET /api/notifications/alimtalk', () => {
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

    const request = new Request('http://localhost/api/notifications/alimtalk');

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('알림톡 이력 조회 성공', async () => {
    const mockLogs = [
      {
        id: 'log-1',
        guidebook_id: 'guidebook-1',
        user_id: 'user-1',
        template_code: 'GUIDEBOOK_SHARE_001',
        recipient_phone: '010-1234-5678',
        recipient_name: '홍길동',
        status: 'sent',
        sent_at: '2024-01-28T10:00:00Z',
        delivered_at: null,
        error_message: null,
        error_code: null,
        message_content: '가이드북 공유 알림',
        kakao_message_id: 'MOCK_123456',
        template_params: { recipientName: '홍길동' },
        cost_krw: 8,
        created_at: '2024-01-28T10:00:00Z',
        updated_at: '2024-01-28T10:00:00Z',
      },
    ];

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
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: mockLogs,
        error: null,
        count: 1,
      }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);

    const request = new Request('http://localhost/api/notifications/alimtalk');

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].id).toBe('log-1');
    expect(data.pagination.total).toBe(1);
  });

  it('가이드북 필터링 적용', async () => {
    const mockLogs = [
      {
        id: 'log-1',
        guidebook_id: 'guidebook-1',
        user_id: 'user-1',
        template_code: 'GUIDEBOOK_SHARE_001',
        recipient_phone: '010-1234-5678',
        status: 'sent',
        created_at: '2024-01-28T10:00:00Z',
      },
    ];

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
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: mockLogs,
        error: null,
        count: 1,
      }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);

    const request = new Request('http://localhost/api/notifications/alimtalk?guidebook_id=guidebook-1');

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockSupabase.eq).toHaveBeenCalledWith('guidebook_id', 'guidebook-1');
  });

  it('페이지네이션 적용', async () => {
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
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);

    const request = new Request('http://localhost/api/notifications/alimtalk?limit=10&offset=20');

    const response = await GET(request as any);

    expect(mockSupabase.range).toHaveBeenCalledWith(20, 29);
  });

  it('DB 에러 시 500 반환', async () => {
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
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
        count: null,
      }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any);

    const request = new Request('http://localhost/api/notifications/alimtalk');

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('FETCH_ERROR');
  });
});
