/**
 * @TASK P3-T3.5 - AI 사용량 API 테스트
 * @SPEC docs/planning/02-trd.md#AI-Usage-API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

// Mock AI usage utilities
vi.mock('@/lib/ai/usage', () => ({
  checkAiLimit: vi.fn(),
  recordAiUsage: vi.fn(),
  getAiUsageHistory: vi.fn(),
  createLimitExceededError: vi.fn(),
}));

import { GET, POST } from '@/app/api/ai/usage/route';
import { createServerClient } from '@/lib/supabase/server';
import { checkAiLimit, recordAiUsage, getAiUsageHistory, createLimitExceededError } from '@/lib/ai/usage';

describe('GET /api/ai/usage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    // Mock: 인증되지 않은 사용자
    (createServerClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        }),
      },
    });

    const request = new NextRequest('http://localhost:3000/api/ai/usage');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('UNAUTHORIZED');
  });

  it('should return AI usage info for authenticated user', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockLimitInfo = {
      canGenerate: true,
      usedThisMonth: 2,
      limitThisMonth: 3,
      remaining: 1,
      plan: 'free',
    };

    // Mock: 인증된 사용자
    (createServerClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    (checkAiLimit as ReturnType<typeof vi.fn>).mockResolvedValue(mockLimitInfo);

    const request = new NextRequest('http://localhost:3000/api/ai/usage');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.canGenerate).toBe(true);
    expect(json.usedThisMonth).toBe(2);
    expect(json.limitThisMonth).toBe(3);
    expect(json.remaining).toBe(1);
    expect(json.plan).toBe('free');
  });

  it('should include history when requested', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockLimitInfo = {
      canGenerate: true,
      usedThisMonth: 2,
      limitThisMonth: 3,
      remaining: 1,
      plan: 'free',
    };
    const mockHistory = [
      {
        id: 'usage-1',
        guidebookId: 'gb-1',
        guidebookTitle: 'My Guidebook',
        tokensUsed: 500,
        model: 'gpt-4o-mini',
        action: 'generate',
        createdAt: '2024-01-28T10:00:00Z',
      },
    ];

    (createServerClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    (checkAiLimit as ReturnType<typeof vi.fn>).mockResolvedValue(mockLimitInfo);
    (getAiUsageHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistory);

    const request = new NextRequest('http://localhost:3000/api/ai/usage?includeHistory=true&historyLimit=5');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.history).toHaveLength(1);
    expect(json.history[0].guidebookTitle).toBe('My Guidebook');
  });
});

describe('POST /api/ai/usage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (createServerClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        }),
      },
    });

    const request = new NextRequest('http://localhost:3000/api/ai/usage', {
      method: 'POST',
      body: JSON.stringify({ action: 'generate', tokensUsed: 100 }),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('UNAUTHORIZED');
  });

  it('should return 400 for invalid action', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    (createServerClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    const request = new NextRequest('http://localhost:3000/api/ai/usage', {
      method: 'POST',
      body: JSON.stringify({ action: 'invalid', tokensUsed: 100 }),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('INVALID_REQUEST');
  });

  it('should return 429 when limit exceeded', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockLimitInfo = {
      canGenerate: false,
      usedThisMonth: 3,
      limitThisMonth: 3,
      remaining: 0,
      plan: 'free',
    };
    const mockLimitError = {
      error: 'AI_LIMIT_EXCEEDED',
      message: 'Monthly AI generation limit reached.',
      usedThisMonth: 3,
      limitThisMonth: 3,
      remaining: 0,
      plan: 'free',
    };

    (createServerClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    (checkAiLimit as ReturnType<typeof vi.fn>).mockResolvedValue(mockLimitInfo);
    (createLimitExceededError as ReturnType<typeof vi.fn>).mockReturnValue(mockLimitError);

    const request = new NextRequest('http://localhost:3000/api/ai/usage', {
      method: 'POST',
      body: JSON.stringify({ action: 'generate', tokensUsed: 100 }),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json.error).toBe('AI_LIMIT_EXCEEDED');
  });

  it('should record usage successfully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockLimitInfo = {
      canGenerate: true,
      usedThisMonth: 2,
      limitThisMonth: 3,
      remaining: 1,
      plan: 'free',
    };
    const mockUpdatedLimitInfo = {
      ...mockLimitInfo,
      usedThisMonth: 3,
      remaining: 0,
    };

    (createServerClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    (checkAiLimit as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockLimitInfo)
      .mockResolvedValueOnce(mockUpdatedLimitInfo);
    (recordAiUsage as ReturnType<typeof vi.fn>).mockResolvedValue('record-123');

    const request = new NextRequest('http://localhost:3000/api/ai/usage', {
      method: 'POST',
      body: JSON.stringify({
        action: 'generate',
        tokensUsed: 500,
        model: 'gpt-4o-mini',
        guidebookId: 'gb-123',
      }),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.recordId).toBe('record-123');
    expect(json.usedThisMonth).toBe(3);
    expect(json.remaining).toBe(0);
  });
});
