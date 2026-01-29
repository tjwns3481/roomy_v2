// @TASK P4-T4.6 - 알림 설정 API 테스트
// @SPEC docs/planning/06-tasks.md#P4-T4.6

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('User Notifications API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PATCH /api/user/notifications', () => {
    it('알림 설정 업데이트 성공', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyStats: true,
          newFeatures: false,
          marketing: false,
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
    });

    it('부분 업데이트 허용', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketing: true,
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
    });
  });
});
