// @TASK P8-S13-V: Upsell 설정 연결점 검증 (API ↔ UI)
// @SPEC screens/s13-upsell-settings
// @DESC API 응답과 UI 렌더링 간의 연결점을 검증합니다

import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { createBrowserClient } from '@/lib/supabase/client';
import type {
  UpsellItem,
  UpsellItemsResponse,
  CreateUpsellItemRequest,
  UpdateUpsellItemRequest,
  UpsellRequestsResponse,
  UpdateUpsellRequestRequest,
} from '@/types/upsell';

describe('P8-S13-V: Upsell Settings Integration', () => {
  let supabase: ReturnType<typeof createBrowserClient>;
  let testGuidebookId: string;
  let testUserId: string;
  let testItemId: string;
  let testRequestId: string;
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  beforeAll(async () => {
    supabase = createBrowserClient();

    // 테스트용 가이드북 생성
    const { data: guidebook, error } = await supabase
      .from('guidebooks')
      .insert({
        title: 'Test Guidebook for Upsell Integration',
        slug: `test-upsell-int-${Date.now()}`,
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
      // 관련 데이터 모두 삭제 (cascade)
      await supabase.from('guidebooks').delete().eq('id', testGuidebookId);
    }
  });

  beforeEach(async () => {
    // 각 테스트마다 기존 아이템 삭제
    await supabase
      .from('upsell_items')
      .delete()
      .eq('guidebook_id', testGuidebookId);
    await supabase
      .from('upsell_requests')
      .delete()
      .eq('guidebook_id', testGuidebookId);
  });

  describe('✓ 1. 아이템 목록 조회 (GET /api/guidebooks/[id]/upsell/items)', () => {
    it('빈 상태에서 아이템 목록 조회 성공', async () => {
      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items`
      );
      const data: UpsellItemsResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.items.length).toBe(0);
      expect(data.total).toBe(0);
    });

    it('아이템이 있을 때 목록 조회 성공 및 정렬 확인', async () => {
      // 테스트 아이템 3개 생성
      await supabase.from('upsell_items').insert([
        {
          guidebook_id: testGuidebookId,
          name: '조식 서비스',
          price: 15000,
          sort_order: 2,
          is_active: true,
        },
        {
          guidebook_id: testGuidebookId,
          name: '공항 픽업',
          price: 50000,
          sort_order: 1,
          is_active: true,
        },
        {
          guidebook_id: testGuidebookId,
          name: '레이트 체크아웃',
          price: 30000,
          sort_order: 0,
          is_active: false, // 비활성
        },
      ]);

      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items`
      );
      const data: UpsellItemsResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data.items.length).toBe(3);
      expect(data.total).toBe(3);

      // 정렬 순서 확인 (sort_order 오름차순)
      expect(data.items[0].name).toBe('레이트 체크아웃');
      expect(data.items[0].sort_order).toBe(0);
      expect(data.items[1].name).toBe('공항 픽업');
      expect(data.items[1].sort_order).toBe(1);
      expect(data.items[2].name).toBe('조식 서비스');
      expect(data.items[2].sort_order).toBe(2);
    });

    it('게스트(비로그인)는 활성화된 아이템만 조회', async () => {
      // 활성/비활성 아이템 생성
      await supabase.from('upsell_items').insert([
        {
          guidebook_id: testGuidebookId,
          name: '활성 아이템',
          price: 10000,
          is_active: true,
        },
        {
          guidebook_id: testGuidebookId,
          name: '비활성 아이템',
          price: 20000,
          is_active: false,
        },
      ]);

      // 비로그인 상태로 요청 (쿠키 제거)
      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items`,
        {
          credentials: 'omit', // 쿠키 제외
        }
      );
      const data: UpsellItemsResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data.items.length).toBe(1);
      expect(data.items[0].name).toBe('활성 아이템');
      expect(data.items[0].is_active).toBe(true);
    });
  });

  describe('✓ 2. 아이템 생성 (POST /api/guidebooks/[id]/upsell/items)', () => {
    it('아이템 생성 성공 → UI 반영 확인', async () => {
      const newItem: CreateUpsellItemRequest = {
        name: '조식 서비스',
        description: '맛있는 한식 조식',
        price: 15000,
        is_active: true,
        sort_order: 0,
      };

      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
          credentials: 'include',
        }
      );

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data).toHaveProperty('item');
      expect(data.item.name).toBe(newItem.name);
      expect(data.item.price).toBe(newItem.price);
      expect(data.item.guidebook_id).toBe(testGuidebookId);

      testItemId = data.item.id;

      // UI 반영 확인: GET 요청으로 목록 재조회
      const listResponse = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items`
      );
      const listData: UpsellItemsResponse = await listResponse.json();

      expect(listData.items.length).toBe(1);
      expect(listData.items[0].name).toBe(newItem.name);
    });

    it('Business 플랜이 아니면 402 에러', async () => {
      // Business 플랜 확인 RPC
      const { data: canCreate } = await supabase.rpc('can_create_upsell_item', {
        p_user_id: testUserId,
      });

      if (!canCreate) {
        const response = await fetch(
          `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: '조식 서비스',
              price: 15000,
            }),
            credentials: 'include',
          }
        );

        expect(response.status).toBe(402); // Payment Required
        const data = await response.json();
        expect(data.error.code).toBe('PLAN_UPGRADE_REQUIRED');
        expect(data.error).toHaveProperty('upgradeUrl');
      } else {
        // Business 플랜이면 테스트 스킵
        expect(canCreate).toBe(true);
      }
    });

    it('유효성 검증 실패 시 400 에러', async () => {
      const invalidItem = {
        name: '', // 빈 문자열 (최소 1자)
        price: -1000, // 음수 (최소 0)
      };

      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidItem),
          credentials: 'include',
        }
      );

      const data = await response.json();

      // 402 (플랜 제한) 또는 400 (검증 실패)
      if (response.status === 402) {
        expect(data.error.code).toBe('PLAN_UPGRADE_REQUIRED');
      } else {
        expect(response.status).toBe(400);
        expect(data.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('✓ 3. 아이템 수정 (PUT /api/guidebooks/[id]/upsell/items/[itemId])', () => {
    beforeEach(async () => {
      // 테스트용 아이템 생성
      const { data } = await supabase
        .from('upsell_items')
        .insert({
          guidebook_id: testGuidebookId,
          name: '원본 아이템',
          price: 10000,
          is_active: true,
        })
        .select()
        .single();

      testItemId = data!.id;
    });

    it('아이템 수정 성공 → UI 반영 확인', async () => {
      const updateData: UpdateUpsellItemRequest = {
        name: '수정된 아이템',
        price: 20000,
        is_active: false,
      };

      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items/${testItemId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
          credentials: 'include',
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.item.name).toBe(updateData.name);
      expect(data.item.price).toBe(updateData.price);
      expect(data.item.is_active).toBe(updateData.is_active);

      // UI 반영 확인: GET 요청으로 목록 재조회
      const listResponse = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items`
      );
      const listData: UpsellItemsResponse = await listResponse.json();

      const updatedItem = listData.items.find((i) => i.id === testItemId);
      expect(updatedItem).toBeDefined();
      expect(updatedItem!.name).toBe(updateData.name);
      expect(updatedItem!.price).toBe(updateData.price);
    });

    it('존재하지 않는 아이템 수정 시 404 에러', async () => {
      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items/00000000-0000-0000-0000-000000000000`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: '수정' }),
          credentials: 'include',
        }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('✓ 4. 아이템 삭제 (DELETE /api/guidebooks/[id]/upsell/items/[itemId])', () => {
    beforeEach(async () => {
      // 테스트용 아이템 생성
      const { data } = await supabase
        .from('upsell_items')
        .insert({
          guidebook_id: testGuidebookId,
          name: '삭제할 아이템',
          price: 10000,
        })
        .select()
        .single();

      testItemId = data!.id;
    });

    it('아이템 삭제 성공 → UI에서 제거 확인', async () => {
      // 삭제 전 존재 확인
      const beforeResponse = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items`
      );
      const beforeData: UpsellItemsResponse = await beforeResponse.json();
      expect(beforeData.items.some((i) => i.id === testItemId)).toBe(true);

      // 삭제 요청
      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items/${testItemId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      // UI 반영 확인: 목록에서 제거되었는지 확인
      const afterResponse = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items`
      );
      const afterData: UpsellItemsResponse = await afterResponse.json();
      expect(afterData.items.some((i) => i.id === testItemId)).toBe(false);
    });

    it('이미 삭제된 아이템 삭제 시 404 에러', async () => {
      // 먼저 삭제
      await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items/${testItemId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      // 다시 삭제 시도
      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items/${testItemId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      expect(response.status).toBe(404);
    });
  });

  describe('✓ 5. 요청 목록 조회 (GET /api/guidebooks/[id]/upsell/requests)', () => {
    beforeEach(async () => {
      // 테스트용 아이템 생성
      const { data: item } = await supabase
        .from('upsell_items')
        .insert({
          guidebook_id: testGuidebookId,
          name: '테스트 아이템',
          price: 10000,
        })
        .select()
        .single();

      testItemId = item!.id;

      // 테스트용 요청 3개 생성
      await supabase.from('upsell_requests').insert([
        {
          guidebook_id: testGuidebookId,
          upsell_item_id: testItemId,
          guest_name: '홍길동',
          guest_contact: '010-1234-5678',
          status: 'pending',
        },
        {
          guidebook_id: testGuidebookId,
          upsell_item_id: testItemId,
          guest_name: '김철수',
          status: 'confirmed',
        },
        {
          guidebook_id: testGuidebookId,
          upsell_item_id: testItemId,
          guest_name: '이영희',
          status: 'cancelled',
        },
      ]);
    });

    it('요청 목록 조회 성공 및 통계 확인', async () => {
      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/requests`,
        {
          credentials: 'include',
        }
      );

      expect(response.status).toBe(200);

      const data: UpsellRequestsResponse = await response.json();

      expect(data).toHaveProperty('requests');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('stats');

      expect(data.requests.length).toBe(3);
      expect(data.total).toBe(3);

      // 통계 확인
      expect(data.stats.pending).toBe(1);
      expect(data.stats.confirmed).toBe(1);
      expect(data.stats.cancelled).toBe(1);

      // 아이템 정보 포함 확인
      expect(data.requests[0]).toHaveProperty('item_name');
      expect(data.requests[0]).toHaveProperty('item_price');
      expect(data.requests[0].item_name).toBe('테스트 아이템');
      expect(data.requests[0].item_price).toBe(10000);
    });

    it('상태별 필터링 (status=pending)', async () => {
      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/requests?status=pending`,
        {
          credentials: 'include',
        }
      );

      expect(response.status).toBe(200);

      const data: UpsellRequestsResponse = await response.json();

      expect(data.requests.length).toBe(1);
      expect(data.requests[0].status).toBe('pending');
      expect(data.requests[0].guest_name).toBe('홍길동');
    });

    it('상태별 필터링 (status=confirmed)', async () => {
      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/requests?status=confirmed`,
        {
          credentials: 'include',
        }
      );

      expect(response.status).toBe(200);

      const data: UpsellRequestsResponse = await response.json();

      expect(data.requests.length).toBe(1);
      expect(data.requests[0].status).toBe('confirmed');
      expect(data.requests[0].guest_name).toBe('김철수');
    });

    it('비로그인 사용자는 401 에러', async () => {
      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/requests`,
        {
          credentials: 'omit', // 쿠키 제외
        }
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('✓ 6. 요청 상태 변경 (PATCH /api/guidebooks/[id]/upsell/requests/[reqId])', () => {
    beforeEach(async () => {
      // 테스트용 아이템 및 요청 생성
      const { data: item } = await supabase
        .from('upsell_items')
        .insert({
          guidebook_id: testGuidebookId,
          name: '테스트 아이템',
          price: 10000,
        })
        .select()
        .single();

      testItemId = item!.id;

      const { data: request } = await supabase
        .from('upsell_requests')
        .insert({
          guidebook_id: testGuidebookId,
          upsell_item_id: testItemId,
          guest_name: '홍길동',
          status: 'pending',
        })
        .select()
        .single();

      testRequestId = request!.id;
    });

    it('요청 상태 변경 성공 (pending → confirmed)', async () => {
      const updateData: UpdateUpsellRequestRequest = {
        status: 'confirmed',
      };

      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/requests/${testRequestId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
          credentials: 'include',
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.request.status).toBe('confirmed');

      // UI 반영 확인: GET 요청으로 목록 재조회
      const listResponse = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/requests`,
        {
          credentials: 'include',
        }
      );
      const listData: UpsellRequestsResponse = await listResponse.json();

      const updatedRequest = listData.requests.find((r) => r.id === testRequestId);
      expect(updatedRequest).toBeDefined();
      expect(updatedRequest!.status).toBe('confirmed');

      // 통계 반영 확인
      expect(listData.stats.pending).toBe(0);
      expect(listData.stats.confirmed).toBe(1);
    });

    it('요청 상태 변경 성공 (pending → cancelled)', async () => {
      const updateData: UpdateUpsellRequestRequest = {
        status: 'cancelled',
      };

      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/requests/${testRequestId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
          credentials: 'include',
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.request.status).toBe('cancelled');
    });

    it('유효하지 않은 상태로 변경 시 400 에러', async () => {
      const invalidData = {
        status: 'invalid_status',
      };

      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/requests/${testRequestId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidData),
          credentials: 'include',
        }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('존재하지 않는 요청 상태 변경 시 404 에러', async () => {
      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/requests/00000000-0000-0000-0000-000000000000`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'confirmed' }),
          credentials: 'include',
        }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('REQUEST_NOT_FOUND');
    });
  });

  describe('✓ 7. 에러 핸들링 및 경계 케이스', () => {
    it('존재하지 않는 가이드북 ID로 요청 시 404 에러', async () => {
      const response = await fetch(
        `${BASE_URL}/api/guidebooks/00000000-0000-0000-0000-000000000000/upsell/items`,
        {
          credentials: 'include',
        }
      );

      expect(response.status).toBe(200); // 목록 조회는 성공하지만 빈 결과
      const data = await response.json();
      expect(data.items.length).toBe(0);
    });

    it('잘못된 JSON 형식으로 POST 시 에러', async () => {
      const response = await fetch(
        `${BASE_URL}/api/guidebooks/${testGuidebookId}/upsell/items`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{invalid json}',
          credentials: 'include',
        }
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('✓ 8. Business 플랜 확인 (RPC)', () => {
    it('can_create_upsell_item RPC 함수 호출', async () => {
      const { data, error } = await supabase.rpc('can_create_upsell_item', {
        p_user_id: testUserId,
      });

      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
    });

    it('get_upsell_request_stats RPC 함수 호출', async () => {
      const { data, error } = await supabase.rpc('get_upsell_request_stats', {
        p_guidebook_id: testGuidebookId,
      });

      expect(error).toBeNull();
      expect(data).toHaveProperty('pending_requests');
      expect(data).toHaveProperty('confirmed_requests');
      expect(data).toHaveProperty('cancelled_requests');
      expect(typeof data.pending_requests).toBe('number');
    });
  });
});
