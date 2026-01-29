/**
 * @TASK P6-T6.7 - 플랜별 제한 체크 미들웨어 테스트
 * @SPEC docs/planning/04-database-design.md#subscriptions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock modules before importing
vi.mock('@/lib/subscription', () => ({
  checkPlanLimit: vi.fn(),
  getUserPlanLimits: vi.fn(),
}));

import {
  checkGuidebookLimit,
  checkAIGenerationLimit,
  createLimitExceededResponse,
  withGuidebookLimit,
  withAIGenerationLimit,
} from '@/lib/subscription/middleware';
import { checkPlanLimit, getUserPlanLimits } from '@/lib/subscription';

const mockCheckPlanLimit = vi.mocked(checkPlanLimit);
const mockGetUserPlanLimits = vi.mocked(getUserPlanLimits);

describe('P6-T6.7: Subscription Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('checkGuidebookLimit', () => {
    it('should allow creation when under limit (free plan)', async () => {
      mockCheckPlanLimit.mockResolvedValue({
        allowed: true,
        current: 0,
        limit: 1,
      });
      mockGetUserPlanLimits.mockResolvedValue({
        plan: 'free',
        maxGuidebooks: 1,
        maxAiGenerationsPerMonth: 3,
        watermarkRemoved: false,
        customDomain: false,
        prioritySupport: false,
        priceYearly: 0,
        createdAt: new Date().toISOString(),
      });

      const result = await checkGuidebookLimit('user-123');

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(0);
      expect(result.limit).toBe(1);
    });

    it('should deny creation when at limit (free plan)', async () => {
      mockCheckPlanLimit.mockResolvedValue({
        allowed: false,
        current: 1,
        limit: 1,
      });
      mockGetUserPlanLimits.mockResolvedValue({
        plan: 'free',
        maxGuidebooks: 1,
        maxAiGenerationsPerMonth: 3,
        watermarkRemoved: false,
        customDomain: false,
        prioritySupport: false,
        priceYearly: 0,
        createdAt: new Date().toISOString(),
      });

      const result = await checkGuidebookLimit('user-123');

      expect(result.allowed).toBe(false);
      expect(result.current).toBe(1);
      expect(result.limit).toBe(1);
      expect(result.message).toContain('무료 플랜');
      expect(result.upgradeUrl).toBe('/pricing');
    });

    it('should allow unlimited for business plan', async () => {
      mockCheckPlanLimit.mockResolvedValue({
        allowed: true,
        current: 100,
        limit: -1,
      });
      mockGetUserPlanLimits.mockResolvedValue({
        plan: 'business',
        maxGuidebooks: -1,
        maxAiGenerationsPerMonth: -1,
        watermarkRemoved: true,
        customDomain: true,
        prioritySupport: true,
        priceYearly: 99000,
        createdAt: new Date().toISOString(),
      });

      const result = await checkGuidebookLimit('user-123');

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(-1);
      expect(result.message).toBeUndefined();
    });

    it('should show warning when near limit', async () => {
      mockCheckPlanLimit.mockResolvedValue({
        allowed: true,
        current: 4,
        limit: 5,
      });
      mockGetUserPlanLimits.mockResolvedValue({
        plan: 'pro',
        maxGuidebooks: 5,
        maxAiGenerationsPerMonth: 30,
        watermarkRemoved: true,
        customDomain: false,
        prioritySupport: false,
        priceYearly: 49000,
        createdAt: new Date().toISOString(),
      });

      const result = await checkGuidebookLimit('user-123');

      expect(result.allowed).toBe(true);
      expect(result.message).toContain('1개 남았습니다');
      expect(result.upgradeUrl).toBe('/pricing');
    });
  });

  describe('checkAIGenerationLimit', () => {
    it('should allow AI generation when under limit', async () => {
      mockCheckPlanLimit.mockResolvedValue({
        allowed: true,
        current: 2,
        limit: 3,
      });
      mockGetUserPlanLimits.mockResolvedValue({
        plan: 'free',
        maxGuidebooks: 1,
        maxAiGenerationsPerMonth: 3,
        watermarkRemoved: false,
        customDomain: false,
        prioritySupport: false,
        priceYearly: 0,
        createdAt: new Date().toISOString(),
      });

      const result = await checkAIGenerationLimit('user-123');

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(2);
      expect(result.limit).toBe(3);
    });

    it('should deny AI generation when at limit', async () => {
      mockCheckPlanLimit.mockResolvedValue({
        allowed: false,
        current: 3,
        limit: 3,
      });
      mockGetUserPlanLimits.mockResolvedValue({
        plan: 'free',
        maxGuidebooks: 1,
        maxAiGenerationsPerMonth: 3,
        watermarkRemoved: false,
        customDomain: false,
        prioritySupport: false,
        priceYearly: 0,
        createdAt: new Date().toISOString(),
      });

      const result = await checkAIGenerationLimit('user-123');

      expect(result.allowed).toBe(false);
      expect(result.message).toContain('무료 플랜');
      expect(result.message).toContain('월 3회');
    });

    it('should show warning when AI generation is near limit', async () => {
      mockCheckPlanLimit.mockResolvedValue({
        allowed: true,
        current: 28,
        limit: 30,
      });
      mockGetUserPlanLimits.mockResolvedValue({
        plan: 'pro',
        maxGuidebooks: 5,
        maxAiGenerationsPerMonth: 30,
        watermarkRemoved: true,
        customDomain: false,
        prioritySupport: false,
        priceYearly: 49000,
        createdAt: new Date().toISOString(),
      });

      const result = await checkAIGenerationLimit('user-123');

      expect(result.allowed).toBe(true);
      expect(result.message).toContain('2회 남았습니다');
    });
  });

  describe('createLimitExceededResponse', () => {
    it('should create correct error response for guidebook limit', () => {
      const result = createLimitExceededResponse('guidebook', {
        allowed: false,
        current: 1,
        limit: 1,
        message: '가이드북 생성 제한',
        upgradeUrl: '/pricing',
      });

      expect(result.error).toBe('LIMIT_EXCEEDED');
      expect(result.feature).toBe('guidebook');
      expect(result.current).toBe(1);
      expect(result.limit).toBe(1);
      expect(result.upgradeUrl).toBe('/pricing');
    });

    it('should create correct error response for AI limit', () => {
      const result = createLimitExceededResponse('ai', {
        allowed: false,
        current: 3,
        limit: 3,
        message: 'AI 생성 제한',
      });

      expect(result.error).toBe('LIMIT_EXCEEDED');
      expect(result.feature).toBe('ai');
      expect(result.current).toBe(3);
      expect(result.limit).toBe(3);
    });
  });

  describe('withGuidebookLimit', () => {
    it('should return success when allowed', async () => {
      mockCheckPlanLimit.mockResolvedValue({
        allowed: true,
        current: 0,
        limit: 1,
      });
      mockGetUserPlanLimits.mockResolvedValue({
        plan: 'free',
        maxGuidebooks: 1,
        maxAiGenerationsPerMonth: 3,
        watermarkRemoved: false,
        customDomain: false,
        prioritySupport: false,
        priceYearly: 0,
        createdAt: new Date().toISOString(),
      });

      const result = await withGuidebookLimit('user-123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.limitInfo.allowed).toBe(true);
      }
    });

    it('should return error response when not allowed', async () => {
      mockCheckPlanLimit.mockResolvedValue({
        allowed: false,
        current: 1,
        limit: 1,
      });
      mockGetUserPlanLimits.mockResolvedValue({
        plan: 'free',
        maxGuidebooks: 1,
        maxAiGenerationsPerMonth: 3,
        watermarkRemoved: false,
        customDomain: false,
        prioritySupport: false,
        priceYearly: 0,
        createdAt: new Date().toISOString(),
      });

      const result = await withGuidebookLimit('user-123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.error).toBe('LIMIT_EXCEEDED');
        expect(result.response.feature).toBe('guidebook');
      }
    });
  });

  describe('withAIGenerationLimit', () => {
    it('should return success when allowed', async () => {
      mockCheckPlanLimit.mockResolvedValue({
        allowed: true,
        current: 0,
        limit: 3,
      });
      mockGetUserPlanLimits.mockResolvedValue({
        plan: 'free',
        maxGuidebooks: 1,
        maxAiGenerationsPerMonth: 3,
        watermarkRemoved: false,
        customDomain: false,
        prioritySupport: false,
        priceYearly: 0,
        createdAt: new Date().toISOString(),
      });

      const result = await withAIGenerationLimit('user-123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.limitInfo.allowed).toBe(true);
      }
    });

    it('should return error response when not allowed', async () => {
      mockCheckPlanLimit.mockResolvedValue({
        allowed: false,
        current: 3,
        limit: 3,
      });
      mockGetUserPlanLimits.mockResolvedValue({
        plan: 'free',
        maxGuidebooks: 1,
        maxAiGenerationsPerMonth: 3,
        watermarkRemoved: false,
        customDomain: false,
        prioritySupport: false,
        priceYearly: 0,
        createdAt: new Date().toISOString(),
      });

      const result = await withAIGenerationLimit('user-123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.error).toBe('LIMIT_EXCEEDED');
        expect(result.response.feature).toBe('ai');
      }
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully in checkGuidebookLimit', async () => {
      mockCheckPlanLimit.mockRejectedValue(new Error('Database error'));
      mockGetUserPlanLimits.mockRejectedValue(new Error('Database error'));

      const result = await checkGuidebookLimit('user-123');

      // Should deny on error for safety
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('플랜 제한을 확인할 수 없습니다');
    });

    it('should handle errors gracefully in checkAIGenerationLimit', async () => {
      mockCheckPlanLimit.mockRejectedValue(new Error('Database error'));
      mockGetUserPlanLimits.mockRejectedValue(new Error('Database error'));

      const result = await checkAIGenerationLimit('user-123');

      // Should deny on error for safety
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('플랜 제한을 확인할 수 없습니다');
    });
  });
});
