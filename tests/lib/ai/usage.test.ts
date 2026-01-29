/**
 * @TASK P3-T3.5 - AI 사용량 유틸리티 테스트
 * @SPEC docs/planning/02-trd.md#AI-Usage-Tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import {
  checkAiLimit,
  recordAiUsage,
  getAiUsageHistory,
  getPlanLimits,
  createLimitExceededError,
} from '@/lib/ai/usage';

describe('checkAiLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return limit info for user with available quota', async () => {
    const mockRpcResponse = {
      data: [
        {
          can_generate: true,
          used_this_month: 2,
          limit_this_month: 30,
          remaining: 28,
          plan: 'pro',
        },
      ],
      error: null,
    };

    (createServerClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      rpc: vi.fn().mockResolvedValue(mockRpcResponse),
    });

    const result = await checkAiLimit('user-123');

    expect(result.canGenerate).toBe(true);
    expect(result.usedThisMonth).toBe(2);
    expect(result.limitThisMonth).toBe(30);
    expect(result.remaining).toBe(28);
    expect(result.plan).toBe('pro');
  });

  it('should return limit info for user at limit', async () => {
    const mockRpcResponse = {
      data: [
        {
          can_generate: false,
          used_this_month: 3,
          limit_this_month: 3,
          remaining: 0,
          plan: 'free',
        },
      ],
      error: null,
    };

    (createServerClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      rpc: vi.fn().mockResolvedValue(mockRpcResponse),
    });

    const result = await checkAiLimit('user-123');

    expect(result.canGenerate).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should return safe defaults on error', async () => {
    (createServerClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    });

    const result = await checkAiLimit('user-123');

    expect(result.canGenerate).toBe(false);
    expect(result.usedThisMonth).toBe(0);
    expect(result.limitThisMonth).toBe(3);
    expect(result.remaining).toBe(0);
    expect(result.plan).toBe('free');
  });
});

describe('recordAiUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should record usage successfully', async () => {
    const mockRecordId = 'record-uuid-123';

    (createAdminClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      rpc: vi.fn().mockResolvedValue({
        data: mockRecordId,
        error: null,
      }),
    });

    const result = await recordAiUsage({
      userId: 'user-123',
      guidebookId: 'gb-456',
      tokensUsed: 500,
      model: 'gpt-4o-mini',
      action: 'generate',
    });

    expect(result).toBe(mockRecordId);
  });

  it('should return null on error', async () => {
    (createAdminClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      }),
    });

    const result = await recordAiUsage({
      userId: 'user-123',
      tokensUsed: 500,
      model: 'gpt-4o-mini',
      action: 'generate',
    });

    expect(result).toBeNull();
  });
});

describe('getAiUsageHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return usage history', async () => {
    const mockHistory = [
      {
        id: 'usage-1',
        guidebook_id: 'gb-1',
        guidebook_title: 'My Guidebook',
        tokens_used: 500,
        model: 'gpt-4o-mini',
        action: 'generate',
        created_at: '2024-01-28T10:00:00Z',
      },
      {
        id: 'usage-2',
        guidebook_id: null,
        guidebook_title: null,
        tokens_used: 200,
        model: 'gpt-4o-mini',
        action: 'chat',
        created_at: '2024-01-28T09:00:00Z',
      },
    ];

    (createServerClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      rpc: vi.fn().mockResolvedValue({
        data: mockHistory,
        error: null,
      }),
    });

    const result = await getAiUsageHistory('user-123', 10, 0);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('usage-1');
    expect(result[0].guidebookTitle).toBe('My Guidebook');
    expect(result[0].tokensUsed).toBe(500);
    expect(result[1].guidebookId).toBeNull();
  });

  it('should return empty array on error', async () => {
    (createServerClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Query failed' },
      }),
    });

    const result = await getAiUsageHistory('user-123');

    expect(result).toEqual([]);
  });
});

describe('getPlanLimits', () => {
  it('should return free plan limits', () => {
    const limits = getPlanLimits('free');

    expect(limits.maxGenerations).toBe(3);
    expect(limits.maxGuidebooks).toBe(1);
    expect(limits.features).toContain('Basic AI generation');
  });

  it('should return pro plan limits', () => {
    const limits = getPlanLimits('pro');

    expect(limits.maxGenerations).toBe(30);
    expect(limits.maxGuidebooks).toBe(5);
    expect(limits.features).toContain('30 AI generations/month');
  });

  it('should return business plan limits (unlimited)', () => {
    const limits = getPlanLimits('business');

    expect(limits.maxGenerations).toBe(999999);
    expect(limits.maxGuidebooks).toBe(-1);
    expect(limits.features).toContain('Unlimited AI generations');
  });

  it('should default to free plan for unknown plan', () => {
    const limits = getPlanLimits('unknown');

    expect(limits.maxGenerations).toBe(3);
    expect(limits.maxGuidebooks).toBe(1);
  });
});

describe('createLimitExceededError', () => {
  it('should create a properly formatted error response', () => {
    const limitInfo = {
      canGenerate: false,
      usedThisMonth: 3,
      limitThisMonth: 3,
      remaining: 0,
      plan: 'free',
    };

    const error = createLimitExceededError(limitInfo);

    expect(error.error).toBe('AI_LIMIT_EXCEEDED');
    expect(error.message).toContain('3/3');
    expect(error.usedThisMonth).toBe(3);
    expect(error.limitThisMonth).toBe(3);
    expect(error.remaining).toBe(0);
    expect(error.plan).toBe('free');
    expect(error.upgradeUrl).toBe('/settings/billing');
  });
});
