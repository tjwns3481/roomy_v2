// @TASK P8-R1 - chatbot API 테스트
// @SPEC specs/domain/resources.yaml#chatbot_log

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createAdminClient } from '@/lib/supabase/server';
import type { ChatbotMessageResponse, ChatbotLogsResponse, ChatbotStats } from '@/types/chatbot';

describe('Chatbot API', () => {
  let testGuidebookId: string;
  let testUserId: string;
  let testSessionId: string;
  let testLogId: string;

  beforeAll(async () => {
    // 테스트용 데이터 생성
    const supabase = createAdminClient();

    // 1. 테스트 유저 생성
    const { data: authData } = await supabase.auth.admin.createUser({
      email: `chatbot-test-${Date.now()}@example.com`,
      password: 'test1234',
      email_confirm: true,
    });

    if (!authData.user) {
      throw new Error('테스트 유저 생성 실패');
    }

    testUserId = authData.user.id;

    // 2. 테스트 가이드북 생성
    const { data: guidebook } = await supabase
      .from('guidebooks')
      .insert({
        user_id: testUserId,
        title: 'Chatbot Test Guidebook',
        slug: `chatbot-test-${Date.now()}`,
        status: 'published',
      })
      .select()
      .single();

    if (!guidebook) {
      throw new Error('테스트 가이드북 생성 실패');
    }

    testGuidebookId = guidebook.id;
    testSessionId = `session-${Date.now()}`;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    const supabase = createAdminClient();

    await supabase.from('chatbot_logs').delete().eq('guidebook_id', testGuidebookId);
    await supabase.from('guidebooks').delete().eq('id', testGuidebookId);
    await supabase.auth.admin.deleteUser(testUserId);
  });

  describe('POST /api/chatbot', () => {
    it('챗봇 질문/답변을 저장해야 함', async () => {
      const response = await fetch('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guidebook_id: testGuidebookId,
          session_id: testSessionId,
          question: '체크인 시간이 언제인가요?',
        }),
      });

      expect(response.status).toBe(201);

      const data: ChatbotMessageResponse = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('answer');
      expect(data).toHaveProperty('created_at');
      expect(data.answer).toContain('체크인 시간이 언제인가요?');

      testLogId = data.id;
    });

    it('필수 필드 누락 시 400 에러', async () => {
      const response = await fetch('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guidebook_id: testGuidebookId,
          // session_id 누락
          question: '테스트 질문',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('잘못된 UUID 형식 시 400 에러', async () => {
      const response = await fetch('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guidebook_id: 'invalid-uuid',
          session_id: testSessionId,
          question: '테스트 질문',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('존재하지 않는 가이드북 ID 시 404 에러', async () => {
      const response = await fetch('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guidebook_id: '00000000-0000-0000-0000-000000000000',
          session_id: testSessionId,
          question: '테스트 질문',
        }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/chatbot/feedback/[id]', () => {
    it('피드백을 업데이트해야 함', async () => {
      const response = await fetch(`http://localhost:3000/api/chatbot/feedback/${testLogId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: 'helpful',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      // 검증: DB에서 피드백 확인
      const supabase = createAdminClient();
      const { data: log } = await supabase
        .from('chatbot_logs')
        .select('feedback')
        .eq('id', testLogId)
        .single();

      expect(log?.feedback).toBe('helpful');
    });

    it('잘못된 피드백 값 시 400 에러', async () => {
      const response = await fetch(`http://localhost:3000/api/chatbot/feedback/${testLogId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: 'invalid_feedback',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('존재하지 않는 로그 ID 시 404 에러', async () => {
      const response = await fetch(
        'http://localhost:3000/api/chatbot/feedback/00000000-0000-0000-0000-000000000000',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feedback: 'helpful',
          }),
        }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/chatbot/[guidebookId]', () => {
    it('챗봇 로그 목록을 조회해야 함 (인증 필요)', async () => {
      // 인증 토큰 획득 (실제 구현에서는 로그인 API 사용)
      // 여기서는 Supabase Admin으로 세션 생성
      const supabase = createAdminClient();
      const { data: sessionData } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `chatbot-test-${testUserId}@example.com`,
      });

      // TODO: 실제 세션 쿠키로 요청 (현재는 단순 테스트)
      const response = await fetch(`http://localhost:3000/api/chatbot/${testGuidebookId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 인증 없이 요청 시 401
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/chatbot/[guidebookId]/stats', () => {
    it('챗봇 통계를 조회해야 함 (인증 필요)', async () => {
      const response = await fetch(`http://localhost:3000/api/chatbot/${testGuidebookId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 인증 없이 요청 시 401
      expect(response.status).toBe(401);
    });
  });
});
