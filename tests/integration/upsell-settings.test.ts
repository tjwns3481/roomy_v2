// @TASK P8-S13-T1: Upsell 설정 통합 테스트
// @SPEC TDD: RED → GREEN → REFACTOR

import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { createBrowserClient } from '@/lib/supabase/client';

describe('Upsell Settings Integration', () => {
  let supabase: ReturnType<typeof createBrowserClient>;
  let testGuidebookId: string;
  let testUserId: string;

  beforeAll(async () => {
    supabase = createBrowserClient();

    // 테스트용 가이드북 생성
    const { data: guidebook, error } = await supabase
      .from('guidebooks')
      .insert({
        title: 'Test Guidebook for Upsell',
        slug: `test-upsell-${Date.now()}`,
        status: 'published',
      })
      .select()
      .single();

    if (error || !guidebook) {
      throw new Error('Failed to create test guidebook');
    }

    testGuidebookId = guidebook.id;
    testUserId = guidebook.user_id;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    if (testGuidebookId) {
      await supabase.from('guidebooks').delete().eq('id', testGuidebookId);
    }
  });

  describe('Upsell Items API', () => {
    it('아이템 목록 조회', async () => {
      const response = await fetch(
        `/api/guidebooks/${testGuidebookId}/upsell/items`
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBe(true);
    });

    it('Business 플랜이 아니면 아이템 생성 실패', async () => {
      const response = await fetch(
        `/api/guidebooks/${testGuidebookId}/upsell/items`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '조식 서비스',
            description: '맛있는 아침 식사',
            price: 15000,
            is_active: true,
          }),
        }
      );

      expect(response.status).toBe(402); // Payment Required
    });
  });

  describe('Upsell Requests API', () => {
    it('요청 목록 조회 (호스트)', async () => {
      const response = await fetch(
        `/api/guidebooks/${testGuidebookId}/upsell/requests`
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('requests');
      expect(Array.isArray(data.requests)).toBe(true);
    });
  });

  describe('Business Plan Check', () => {
    it('can_create_upsell_item RPC 함수 호출', async () => {
      const { data, error } = await supabase.rpc('can_create_upsell_item', {
        p_user_id: testUserId,
      });

      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
    });
  });
});
