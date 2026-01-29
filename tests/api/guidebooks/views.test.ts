// @TASK P2-T2.7 - 조회수 증가 API 테스트
// @SPEC docs/planning/06-tasks.md#P2-T2.7

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  update: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  rpc: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mockSupabaseClient,
  createServerClient: () => Promise.resolve(mockSupabaseClient),
}));

// Import after mocking
import { POST } from '@/app/api/guidebooks/[id]/views/route';

describe('POST /api/guidebooks/[id]/views', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if guidebook ID is missing', async () => {
    const request = new NextRequest('http://localhost/api/guidebooks//views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request, { params: Promise.resolve({ id: '' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('가이드북 ID가 필요합니다');
  });

  it('should return 400 if guidebook ID is invalid UUID', async () => {
    const request = new NextRequest('http://localhost/api/guidebooks/invalid-id/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'invalid-id' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('잘못된 가이드북 ID 형식입니다');
  });

  it('should return 404 if guidebook not found', async () => {
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' },
    });

    const request = new NextRequest(`http://localhost/api/guidebooks/${validUUID}/views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request, { params: Promise.resolve({ id: validUUID }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('가이드북을 찾을 수 없습니다');
  });

  it('should increment view count successfully', async () => {
    // Mock guidebook exists
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { id: validUUID, status: 'published', view_count: 10 },
      error: null,
    });

    // Mock RPC success
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const request = new NextRequest(`http://localhost/api/guidebooks/${validUUID}/views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 Test',
        'X-Forwarded-For': '192.168.1.1',
      },
      body: JSON.stringify({ visitor_id: 'test-visitor-123' }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: validUUID }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('조회수가 증가했습니다');
  });

  it('should handle RPC error and fallback to direct update', async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock guidebook exists - chain calls properly
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: validUUID, status: 'published', view_count: 10 },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
      insert: vi.fn().mockReturnValue({
        catch: vi.fn().mockResolvedValue(null),
      }),
    });

    // Mock RPC error (function not found)
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'function not found' },
    });

    const request = new NextRequest(`http://localhost/api/guidebooks/${validUUID}/views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request, { params: Promise.resolve({ id: validUUID }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should work without request body', async () => {
    // Mock guidebook exists
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { id: validUUID, status: 'published', view_count: 5 },
      error: null,
    });

    // Mock RPC success
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const request = new NextRequest(`http://localhost/api/guidebooks/${validUUID}/views`, {
      method: 'POST',
    });

    const response = await POST(request, { params: Promise.resolve({ id: validUUID }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
