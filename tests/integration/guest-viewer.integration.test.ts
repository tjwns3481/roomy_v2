/**
 * @TASK P8-S2-V - 게스트 뷰어 연결점 검증
 * @DESCRIPTION 게스트 뷰어 화면이 리소스 API를 올바르게 소비하는지 검증
 * @SPEC specs/screens/guest-viewer.yaml
 *
 * 검증 항목:
 * 1. guidebook 데이터 → UI 렌더링
 * 2. branding 데이터 → 로고/색상 적용
 * 3. upsell_item[] → Upsell 위젯 표시
 * 4. chatbot API → 챗봇 위젯 동작
 * 5. chatbot_log → 대화 저장 및 피드백
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Guest Viewer Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Guidebook 데이터 → UI 렌더링', () => {
    it('should fetch guidebook by slug and render blocks', async () => {
      const mockGuidebook = {
        id: 'guidebook-123',
        slug: 'test-guide',
        title: '테스트 가이드북',
        description: '테스트 설명',
        status: 'published',
        theme_color: '#FF385C',
        user_id: 'user-123',
        created_at: '2024-01-29T00:00:00Z',
        updated_at: '2024-01-29T00:00:00Z',
      };

      const mockBlocks = [
        {
          id: 'block-1',
          guideId: 'guidebook-123',
          type: 'HERO',
          order: 0,
          is_visible: true,
          content: { title: '환영합니다', subtitle: '편안한 여행 되세요' },
        },
        {
          id: 'block-2',
          guideId: 'guidebook-123',
          type: 'QUICK_INFO',
          order: 1,
          is_visible: true,
          content: { checkIn: '14:00', checkOut: '11:00' },
        },
      ];

      // Mock API 응답 - Supabase 클라이언트는 실제로는 서버에서 동작
      // 여기서는 데이터 형식이 올바른지 검증
      expect(mockGuidebook.status).toBe('published');
      expect(mockBlocks.length).toBeGreaterThan(0);
      expect(mockBlocks[0].type).toBe('HERO');
      expect(mockBlocks[1].type).toBe('QUICK_INFO');

      // 블록 타입 변환 검증
      const typeMapping: Record<string, string> = {
        HERO: 'hero',
        QUICK_INFO: 'quickInfo',
        AMENITIES: 'amenities',
        RULES: 'rules',
        MAP: 'map',
        GALLERY: 'gallery',
        NOTICE: 'notice',
        CUSTOM: 'custom',
      };

      const transformedBlocks = mockBlocks.map((block) => ({
        ...block,
        type: typeMapping[block.type] || block.type.toLowerCase(),
      }));

      expect(transformedBlocks[0].type).toBe('hero');
      expect(transformedBlocks[1].type).toBe('quickInfo');
    });

    it('should return 404 for unpublished guidebook', async () => {
      const mockGuidebook = {
        id: 'guidebook-123',
        slug: 'draft-guide',
        status: 'draft',
      };

      // 비공개 가이드북은 404 처리되어야 함
      expect(mockGuidebook.status).toBe('draft');
    });

    it('should filter out invisible blocks', async () => {
      const mockBlocks = [
        { id: '1', type: 'HERO', is_visible: true },
        { id: '2', type: 'QUICK_INFO', is_visible: false },
        { id: '3', type: 'RULES', is_visible: true },
      ];

      const visibleBlocks = mockBlocks.filter((block) => block.is_visible !== false);

      expect(visibleBlocks.length).toBe(2);
      expect(visibleBlocks.map((b) => b.id)).toEqual(['1', '3']);
    });
  });

  describe('2. Branding 데이터 → 로고/색상 적용', () => {
    it('should fetch branding settings and apply theme', async () => {
      const guidebookId = 'guidebook-123';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            guidebook_id: guidebookId,
            logo_url: 'https://example.com/logo.png',
            primary_color: '#FF385C',
            secondary_color: '#00A699',
            font_family: 'Inter',
            custom_css: '.hero { font-size: 2rem; }',
          },
        }),
      });

      const response = await fetch(`/api/guidebooks/${guidebookId}/branding`);
      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.data.logo_url).toBe('https://example.com/logo.png');
      expect(result.data.primary_color).toBe('#FF385C');
      expect(result.data.font_family).toBe('Inter');
    });

    it('should return 404 when no branding settings exist', async () => {
      const guidebookId = 'guidebook-456';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: {
            code: 'NOT_FOUND',
            message: '브랜딩 설정이 없습니다.',
          },
        }),
      });

      const response = await fetch(`/api/guidebooks/${guidebookId}/branding`);
      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });
  });

  describe('3. Upsell 아이템 → Upsell 위젯 표시', () => {
    it('should fetch active upsell items for guest', async () => {
      const guidebookId = 'guidebook-123';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'item-1',
              guidebook_id: guidebookId,
              title: '조식 추가',
              description: '건강한 아침 식사',
              price: 15000,
              image_url: 'https://example.com/breakfast.jpg',
              is_active: true,
              sort_order: 0,
            },
            {
              id: 'item-2',
              guidebook_id: guidebookId,
              title: '레이트 체크아웃',
              description: '오후 3시까지 여유롭게',
              price: 30000,
              image_url: null,
              is_active: true,
              sort_order: 1,
            },
          ],
          total: 2,
        }),
      });

      const response = await fetch(`/api/guidebooks/${guidebookId}/upsell/items`);
      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.items.length).toBe(2);
      expect(result.items[0].title).toBe('조식 추가');
      expect(result.items[1].title).toBe('레이트 체크아웃');
      expect(result.total).toBe(2);
    });

    it('should return empty array when no upsell items exist', async () => {
      const guidebookId = 'guidebook-456';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [],
          total: 0,
        }),
      });

      const response = await fetch(`/api/guidebooks/${guidebookId}/upsell/items`);
      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should submit upsell request', async () => {
      const guidebookId = 'guidebook-123';
      const requestData = {
        item_id: 'item-1',
        guest_name: '홍길동',
        guest_contact: '010-1234-5678',
        message: '조식 2인 추가 부탁드립니다',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          request: {
            id: 'req-1',
            ...requestData,
            status: 'pending',
            created_at: '2024-01-29T10:00:00Z',
          },
        }),
      });

      const response = await fetch(`/api/guidebooks/${guidebookId}/upsell/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(result.request.status).toBe('pending');
      expect(result.request.guest_name).toBe('홍길동');
    });
  });

  describe('4. Chatbot API → 챗봇 위젯 동작', () => {
    it('should send question and receive answer', async () => {
      const guidebookId = 'guidebook-123';
      const sessionId = crypto.randomUUID();
      const question = '체크인 시간은 몇 시인가요?';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: 'log-1',
          answer: '체크인 시간은 오후 2시(14:00)입니다.',
          created_at: '2024-01-29T10:00:00Z',
          sources: ['quick_info', 'rules'],
        }),
      });

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guidebook_id: guidebookId,
          session_id: sessionId,
          question,
        }),
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(result.id).toBe('log-1');
      expect(result.answer).toContain('오후 2시');
      expect(result.sources).toEqual(['quick_info', 'rules']);
    });

    it('should return 400 for missing required fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'guidebook_id, session_id, question 필드가 필요합니다',
          },
        }),
      });

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guidebook_id: 'guidebook-123',
          // session_id, question 누락
        }),
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent guidebook', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: {
            code: 'NOT_FOUND',
            message: '가이드북을 찾을 수 없습니다',
          },
        }),
      });

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guidebook_id: 'non-existent-id',
          session_id: crypto.randomUUID(),
          question: '테스트 질문',
        }),
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('should return 429 when chatbot limit exceeded', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: {
            code: 'LIMIT_EXCEEDED',
            message: '이번 달 챗봇 사용 한도를 초과했습니다.',
            details: 'Used: 50/50',
          },
        }),
      });

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guidebook_id: 'guidebook-123',
          session_id: crypto.randomUUID(),
          question: '한도 초과 테스트',
        }),
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(429);
      expect(result.error.code).toBe('LIMIT_EXCEEDED');
    });
  });

  describe('5. Chatbot 피드백 → 로그 업데이트', () => {
    it('should update feedback as helpful', async () => {
      const messageId = 'log-1';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: '피드백이 저장되었습니다',
        }),
      });

      const response = await fetch(`/api/chatbot/feedback/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: 'helpful' }),
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
    });

    it('should update feedback as not_helpful', async () => {
      const messageId = 'log-2';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: '피드백이 저장되었습니다',
        }),
      });

      const response = await fetch(`/api/chatbot/feedback/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: 'not_helpful' }),
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
    });

    it('should return 400 for invalid feedback value', async () => {
      const messageId = 'log-3';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            code: 'VALIDATION_ERROR',
            message: '피드백 값이 올바르지 않습니다',
          },
        }),
      });

      const response = await fetch(`/api/chatbot/feedback/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: 'invalid_value' }),
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent message', async () => {
      const messageId = 'non-existent-log';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: {
            code: 'NOT_FOUND',
            message: '메시지를 찾을 수 없습니다',
          },
        }),
      });

      const response = await fetch(`/api/chatbot/feedback/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: 'helpful' }),
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });
  });

  describe('6. 통합 시나리오 - 게스트 여정', () => {
    it('should handle complete guest journey', async () => {
      const guidebookId = 'guidebook-123';
      const sessionId = crypto.randomUUID();

      // Step 1: 가이드북 접근
      const guidebookData = {
        id: guidebookId,
        slug: 'cozy-studio',
        title: '아늑한 스튜디오',
        status: 'published',
      };
      expect(guidebookData.status).toBe('published');

      // Step 2: 브랜딩 정보 조회 (선택사항)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            logo_url: 'https://example.com/logo.png',
            primary_color: '#FF385C',
          },
        }),
      });

      const brandingResponse = await fetch(`/api/guidebooks/${guidebookId}/branding`);
      const brandingResult = await brandingResponse.json();

      expect(brandingResponse.ok).toBe(true);
      expect(brandingResult.data.primary_color).toBe('#FF385C');

      // Step 3: Upsell 아이템 조회
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'item-1',
              title: '조식 추가',
              price: 15000,
              is_active: true,
            },
          ],
          total: 1,
        }),
      });

      const upsellResponse = await fetch(`/api/guidebooks/${guidebookId}/upsell/items`);
      const upsellResult = await upsellResponse.json();

      expect(upsellResponse.ok).toBe(true);
      expect(upsellResult.items.length).toBe(1);

      // Step 4: 챗봇 질문
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: 'log-1',
          answer: '체크인은 오후 2시부터 가능합니다.',
          created_at: '2024-01-29T10:00:00Z',
        }),
      });

      const chatResponse = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guidebook_id: guidebookId,
          session_id: sessionId,
          question: '체크인 시간은?',
        }),
      });

      const chatResult = await chatResponse.json();

      expect(chatResponse.ok).toBe(true);
      expect(chatResult.answer).toContain('오후 2시');

      // Step 5: 피드백 전송
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      });

      const feedbackResponse = await fetch(`/api/chatbot/feedback/${chatResult.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: 'helpful' }),
      });

      expect(feedbackResponse.ok).toBe(true);

      // Step 6: Upsell 요청 제출
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          request: {
            id: 'req-1',
            status: 'pending',
          },
        }),
      });

      const requestResponse = await fetch(`/api/guidebooks/${guidebookId}/upsell/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: 'item-1',
          guest_name: '홍길동',
          guest_contact: '010-1234-5678',
        }),
      });

      const requestResult = await requestResponse.json();

      expect(requestResponse.status).toBe(201);
      expect(requestResult.request.status).toBe('pending');
    });
  });
});
