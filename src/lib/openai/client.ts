/**
 * @TASK P3-T3.2 - OpenAI 클라이언트 초기화
 * @SPEC docs/planning/06-tasks.md#P3-T3.2
 */

import OpenAI from 'openai';

// ============================================
// 환경 변수 검증
// ============================================

/**
 * OpenAI API 키 존재 여부 확인
 */
export function hasApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * OpenAI API 키 가져오기
 * @throws API 키가 없으면 에러
 */
export function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
  }
  return apiKey;
}

// ============================================
// OpenAI 클라이언트
// ============================================

let openaiClient: OpenAI | null = null;

/**
 * OpenAI 클라이언트 인스턴스 가져오기 (싱글톤)
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: getApiKey(),
    });
  }
  return openaiClient;
}

/**
 * OpenAI 클라이언트 초기화 (테스트용)
 */
export function resetOpenAIClient(): void {
  openaiClient = null;
}

// ============================================
// 설정 상수
// ============================================

/**
 * 사용할 모델
 */
export const DEFAULT_MODEL = 'gpt-4o';

/**
 * 최대 토큰 수 (응답)
 */
export const MAX_TOKENS = 4096;

/**
 * 온도 (창의성 수준, 0-2)
 */
export const TEMPERATURE = 0.7;

/**
 * 타임아웃 (ms)
 */
export const REQUEST_TIMEOUT = 60000;
