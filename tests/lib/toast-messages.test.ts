// @TASK P7-T7.7 - 토스트 메시지 상수 테스트
// @SPEC docs/planning/06-tasks.md#P7-T7.7

import { describe, it, expect } from 'vitest';
import { TOAST_MESSAGES, createToastMessages } from '@/lib/toast-messages';

describe('TOAST_MESSAGES 상수', () => {
  it('저장 관련 메시지가 정의되어 있다', () => {
    expect(TOAST_MESSAGES.SAVE_SUCCESS).toBe('저장되었습니다');
    expect(TOAST_MESSAGES.SAVE_ERROR).toBe('저장에 실패했습니다');
    expect(TOAST_MESSAGES.SAVE_LOADING).toBe('저장 중...');
  });

  it('복사 관련 메시지가 정의되어 있다', () => {
    expect(TOAST_MESSAGES.COPY_SUCCESS).toBe('클립보드에 복사되었습니다');
    expect(TOAST_MESSAGES.COPY_ERROR).toBe('복사에 실패했습니다');
  });

  it('삭제 관련 메시지가 정의되어 있다', () => {
    expect(TOAST_MESSAGES.DELETE_SUCCESS).toBe('삭제되었습니다');
    expect(TOAST_MESSAGES.DELETE_ERROR).toBe('삭제에 실패했습니다');
  });

  it('인증 관련 메시지가 정의되어 있다', () => {
    expect(TOAST_MESSAGES.LOGIN_SUCCESS).toBe('로그인되었습니다');
    expect(TOAST_MESSAGES.LOGIN_ERROR).toBe('로그인에 실패했습니다');
  });

  it('결제 관련 메시지가 정의되어 있다', () => {
    expect(TOAST_MESSAGES.PAYMENT_SUCCESS).toBe('결제가 완료되었습니다');
    expect(TOAST_MESSAGES.PAYMENT_ERROR).toBe('결제에 실패했습니다');
  });

  it('AI 관련 메시지가 정의되어 있다', () => {
    expect(TOAST_MESSAGES.AI_GENERATING).toBe('AI가 콘텐츠를 생성 중입니다...');
    expect(TOAST_MESSAGES.AI_SUCCESS).toBe('AI 생성이 완료되었습니다');
    expect(TOAST_MESSAGES.AI_ERROR).toBe('AI 생성에 실패했습니다');
  });

  it('가이드북 관련 메시지가 정의되어 있다', () => {
    expect(TOAST_MESSAGES.GUIDEBOOK_CREATE_SUCCESS).toBe('가이드북이 생성되었습니다');
    expect(TOAST_MESSAGES.GUIDEBOOK_DELETE_SUCCESS).toBe('가이드북이 삭제되었습니다');
  });

  it('플랜 제한 경고 메시지를 동적으로 생성한다', () => {
    const message = TOAST_MESSAGES.PLAN_LIMIT_WARNING(2, 3);
    expect(message).toBe('2/3개 사용 중입니다. 곧 제한에 도달합니다.');
  });
});

describe('createToastMessages 헬퍼', () => {
  it('저장 중 Promise 메시지를 생성한다', () => {
    const messages = createToastMessages.saving();

    expect(messages).toEqual({
      loading: TOAST_MESSAGES.SAVE_LOADING,
      success: TOAST_MESSAGES.SAVE_SUCCESS,
      error: TOAST_MESSAGES.SAVE_ERROR,
    });
  });

  it('삭제 중 Promise 메시지를 생성한다', () => {
    const messages = createToastMessages.deleting('가이드북');

    expect(messages).toEqual({
      loading: '가이드북을 삭제 중...',
      success: TOAST_MESSAGES.DELETE_SUCCESS,
      error: TOAST_MESSAGES.DELETE_ERROR,
    });
  });

  it('삭제 중 항목명이 없을 경우 기본값을 사용한다', () => {
    const messages = createToastMessages.deleting();

    expect(messages.loading).toBe('항목을 삭제 중...');
  });

  it('업로드 중 Promise 메시지를 생성한다', () => {
    const messages = createToastMessages.uploading();

    expect(messages).toEqual({
      loading: TOAST_MESSAGES.UPLOAD_LOADING,
      success: TOAST_MESSAGES.UPLOAD_SUCCESS,
      error: TOAST_MESSAGES.UPLOAD_ERROR,
    });
  });

  it('AI 생성 중 Promise 메시지를 생성한다', () => {
    const messages = createToastMessages.aiGenerating();

    expect(messages).toEqual({
      loading: TOAST_MESSAGES.AI_GENERATING,
      success: TOAST_MESSAGES.AI_SUCCESS,
      error: TOAST_MESSAGES.AI_ERROR,
    });
  });

  it('결제 중 Promise 메시지를 생성한다', () => {
    const messages = createToastMessages.processing();

    expect(messages).toEqual({
      loading: TOAST_MESSAGES.PAYMENT_LOADING,
      success: TOAST_MESSAGES.PAYMENT_SUCCESS,
      error: TOAST_MESSAGES.PAYMENT_ERROR,
    });
  });
});
