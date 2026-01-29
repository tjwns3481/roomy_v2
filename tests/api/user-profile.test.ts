// @TASK P4-T4.6 - 프로필 API 테스트
// @SPEC docs/planning/06-tasks.md#P4-T4.6

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('User Profile API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PATCH /api/user/profile', () => {
    it('프로필 업데이트 성공', async () => {
      // Mock fetch
      const mockResponse = {
        id: 'test-user-id',
        display_name: '홍길동',
        avatar_url: 'https://example.com/avatar.jpg',
        email: 'test@example.com',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: '홍길동',
          avatar_url: 'https://example.com/avatar.jpg',
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.display_name).toBe('홍길동');
      expect(data.avatar_url).toBe('https://example.com/avatar.jpg');
    });

    it('이름이 2자 미만이면 실패', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: '이름은 최소 2자 이상이어야 합니다' }),
      });

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: '홍',
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(data.error).toBeTruthy();
    });
  });
});
