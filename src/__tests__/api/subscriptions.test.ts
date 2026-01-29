/**
 * @TASK P6-T6.3 - 구독 API 테스트
 * @SPEC docs/planning/06-tasks.md#P6-T6.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => Promise.resolve({
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'sub-1',
              user_id: 'test-user-id',
              plan: 'free',
              status: 'active',
              current_period_start: null,
              current_period_end: null,
              cancel_at_period_end: false,
              payment_provider: null,
              payment_customer_id: null,
              payment_subscription_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          })),
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({
              data: [],
              error: null,
            })),
          })),
        })),
        count: 'exact',
        head: true,
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'sub-1',
              user_id: 'test-user-id',
              plan: 'free',
              status: 'active',
            },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'sub-1',
                user_id: 'test-user-id',
                plan: 'free',
                status: 'active',
                cancel_at_period_end: true,
              },
              error: null,
            })),
          })),
        })),
      })),
    })),
    rpc: vi.fn((fnName) => {
      if (fnName === 'get_user_plan') {
        return Promise.resolve({ data: 'free', error: null });
      }
      if (fnName === 'get_user_plan_limits') {
        return Promise.resolve({
          data: [{
            plan: 'free',
            max_guidebooks: 1,
            max_ai_generations_per_month: 3,
            watermark_removed: false,
            custom_domain: false,
            priority_support: false,
            price_yearly: 0,
            created_at: new Date().toISOString(),
          }],
          error: null,
        });
      }
      if (fnName === 'check_ai_limit') {
        return Promise.resolve({
          data: [{
            can_generate: true,
            used_this_month: 1,
            limit_this_month: 3,
            remaining: 2,
            plan: 'free',
          }],
          error: null,
        });
      }
      return Promise.resolve({ data: null, error: null });
    }),
  })),
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'sub-1',
              user_id: 'test-user-id',
              plan: 'free',
              status: 'active',
            },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'sub-1',
                user_id: 'test-user-id',
                plan: 'free',
                status: 'active',
                cancel_at_period_end: true,
              },
              error: null,
            })),
          })),
        })),
      })),
    })),
    rpc: vi.fn(() => Promise.resolve({
      data: [{ id: 'sub-1', user_id: 'test-user-id', plan: 'pro', status: 'active' }],
      error: null,
    })),
  })),
}));

// 구독 유틸리티 함수 테스트
describe('Subscription Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserSubscription', () => {
    it('should return user subscription', async () => {
      const { getUserSubscription } = await import('@/lib/subscription');
      const subscription = await getUserSubscription('test-user-id');

      expect(subscription).not.toBeNull();
      expect(subscription?.plan).toBe('free');
      expect(subscription?.status).toBe('active');
    });
  });

  describe('getUserPlan', () => {
    it('should return user plan', async () => {
      const { getUserPlan } = await import('@/lib/subscription');
      const plan = await getUserPlan('test-user-id');

      expect(plan).toBe('free');
    });
  });

  describe('checkPlanLimit', () => {
    it('should check AI limit', async () => {
      const { checkPlanLimit } = await import('@/lib/subscription');
      const result = await checkPlanLimit('test-user-id', 'ai');

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(1);
      expect(result.limit).toBe(3);
    });
  });

  describe('getUsageInfo', () => {
    it('should return usage info', async () => {
      const { getUsageInfo } = await import('@/lib/subscription');
      const usage = await getUsageInfo('test-user-id');

      expect(usage).toHaveProperty('guidebooks');
      expect(usage).toHaveProperty('aiGenerations');
      expect(usage).toHaveProperty('limits');
    });
  });
});

// 타입 테스트
describe('Subscription Types', () => {
  it('should have correct type definitions', async () => {
    const { PLAN_LIMITS_DEFAULTS, PRICING_CARDS } = await import('@/types/subscription');

    expect(PLAN_LIMITS_DEFAULTS.free.maxGuidebooks).toBe(1);
    expect(PLAN_LIMITS_DEFAULTS.pro.maxGuidebooks).toBe(5);
    expect(PLAN_LIMITS_DEFAULTS.business.maxGuidebooks).toBe(-1);

    expect(PRICING_CARDS).toHaveLength(3);
    expect(PRICING_CARDS[0].plan).toBe('free');
    expect(PRICING_CARDS[1].plan).toBe('pro');
    expect(PRICING_CARDS[2].plan).toBe('business');
  });
});
