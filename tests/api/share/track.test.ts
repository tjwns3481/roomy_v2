// @TASK P5-T5.5 - 공유 이벤트 추적 API 테스트
// @SPEC docs/planning/06-tasks.md#P5-T5.5

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/share/track/route';

// Supabase 모킹
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-guidebook-id' },
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-event-id' },
            error: null,
          })),
        })),
      })),
    })),
    rpc: vi.fn(() => ({
      data: 'test-event-id',
      error: null,
    })),
  })),
}));

describe('POST /api/share/track', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: object) =>
    new NextRequest('http://localhost:3000/api/share/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'test-agent',
      },
      body: JSON.stringify(body),
    });

  it('링크 복사 이벤트를 기록할 수 있다', async () => {
    const request = createRequest({
      guidebookId: '123e4567-e89b-12d3-a456-426614174000',
      eventType: 'link_copy',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.eventId).toBeDefined();
  });

  it('QR 다운로드 이벤트를 기록할 수 있다', async () => {
    const request = createRequest({
      guidebookId: '123e4567-e89b-12d3-a456-426614174000',
      eventType: 'qr_download',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('SNS 공유 이벤트를 platform과 함께 기록할 수 있다', async () => {
    const request = createRequest({
      guidebookId: '123e4567-e89b-12d3-a456-426614174000',
      eventType: 'social_share',
      eventData: { platform: 'kakao' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('guidebookId가 없으면 400 에러를 반환한다', async () => {
    const request = createRequest({
      eventType: 'link_copy',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('가이드북 ID가 필요합니다');
  });

  it('eventType이 없으면 400 에러를 반환한다', async () => {
    const request = createRequest({
      guidebookId: '123e4567-e89b-12d3-a456-426614174000',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('이벤트 타입이 필요합니다');
  });

  it('잘못된 UUID 형식이면 400 에러를 반환한다', async () => {
    const request = createRequest({
      guidebookId: 'invalid-uuid',
      eventType: 'link_copy',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('잘못된 가이드북 ID 형식입니다');
  });

  it('유효하지 않은 이벤트 타입이면 400 에러를 반환한다', async () => {
    const request = createRequest({
      guidebookId: '123e4567-e89b-12d3-a456-426614174000',
      eventType: 'invalid_type',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('유효하지 않은 이벤트 타입');
  });

  it('social_share에 platform이 없으면 400 에러를 반환한다', async () => {
    const request = createRequest({
      guidebookId: '123e4567-e89b-12d3-a456-426614174000',
      eventType: 'social_share',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('유효한 platform이 필요합니다');
  });

  it('social_share에 잘못된 platform이 있으면 400 에러를 반환한다', async () => {
    const request = createRequest({
      guidebookId: '123e4567-e89b-12d3-a456-426614174000',
      eventType: 'social_share',
      eventData: { platform: 'instagram' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('유효한 platform이 필요합니다');
  });
});
