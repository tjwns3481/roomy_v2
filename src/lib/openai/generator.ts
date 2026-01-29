/**
 * @TASK P3-T3.2 - 콘텐츠 생성 로직
 * @SPEC docs/planning/06-tasks.md#P3-T3.2
 */

import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { ListingInput, GeneratedContent, GeneratedBlock, AIErrorCode } from '@/types/ai';
import {
  getOpenAIClient,
  hasApiKey,
  DEFAULT_MODEL,
  MAX_TOKENS,
  TEMPERATURE,
  REQUEST_TIMEOUT,
} from './client';
import { GUIDEBOOK_SYSTEM_PROMPT, buildUserPrompt, validateListingInput } from './prompts';

// ============================================
// 에러 클래스
// ============================================

/**
 * AI 생성 에러
 */
export class AIGenerationError extends Error {
  code: AIErrorCode;
  details?: string;

  constructor(code: AIErrorCode, message: string, details?: string) {
    super(message);
    this.name = 'AIGenerationError';
    this.code = code;
    this.details = details;
  }
}

// ============================================
// 콘텐츠 생성 함수
// ============================================

/**
 * 숙소 정보를 기반으로 가이드북 콘텐츠 생성
 *
 * @param input - 숙소 정보
 * @returns 생성된 블록 및 토큰 사용량
 * @throws AIGenerationError
 */
export async function generateGuidebookContent(input: ListingInput): Promise<GeneratedContent> {
  // 1. API 키 확인
  if (!hasApiKey()) {
    throw new AIGenerationError(
      'MISSING_API_KEY',
      'OpenAI API 키가 설정되지 않았습니다. 환경 변수 OPENAI_API_KEY를 확인하세요.'
    );
  }

  // 2. 입력 검증
  const validation = validateListingInput(input);
  if (!validation.valid) {
    throw new AIGenerationError(
      'INVALID_INPUT',
      '입력 데이터가 유효하지 않습니다.',
      validation.errors.join(', ')
    );
  }

  // 3. 프롬프트 생성
  const userPrompt = buildUserPrompt(input);
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: GUIDEBOOK_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  // 4. OpenAI API 호출
  const client = getOpenAIClient();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await client.chat.completions.create(
      {
        model: DEFAULT_MODEL,
        messages,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        response_format: { type: 'json_object' },
      },
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // 5. 응답 파싱
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new AIGenerationError('PARSE_ERROR', 'AI 응답이 비어있습니다.');
    }

    const blocks = parseBlocksFromResponse(content);

    // 6. 결과 반환
    return {
      blocks,
      tokensUsed: {
        prompt: response.usage?.prompt_tokens ?? 0,
        completion: response.usage?.completion_tokens ?? 0,
        total: response.usage?.total_tokens ?? 0,
      },
      model: response.model,
    };
  } catch (error) {
    // 에러 타입별 처리
    if (error instanceof AIGenerationError) {
      throw error;
    }

    if (error instanceof Error) {
      // AbortController 타임아웃
      if (error.name === 'AbortError') {
        throw new AIGenerationError('TIMEOUT', 'AI 요청이 시간 초과되었습니다.');
      }

      // OpenAI API 에러
      const message = error.message.toLowerCase();

      if (message.includes('rate limit') || message.includes('429')) {
        throw new AIGenerationError(
          'RATE_LIMIT',
          'API 요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.'
        );
      }

      if (message.includes('context length') || message.includes('token')) {
        throw new AIGenerationError(
          'TOKEN_LIMIT',
          '입력 데이터가 너무 깁니다. 설명을 줄여서 다시 시도하세요.'
        );
      }

      if (message.includes('api key') || message.includes('authentication')) {
        throw new AIGenerationError('MISSING_API_KEY', 'API 키가 유효하지 않습니다.');
      }

      throw new AIGenerationError('API_ERROR', 'AI API 호출 중 오류가 발생했습니다.', error.message);
    }

    throw new AIGenerationError('UNKNOWN', '알 수 없는 오류가 발생했습니다.');
  }
}

// ============================================
// 응답 파싱
// ============================================

/**
 * AI 응답에서 블록 배열 파싱
 */
export function parseBlocksFromResponse(content: string): GeneratedBlock[] {
  try {
    // JSON 파싱
    const parsed = JSON.parse(content);

    // blocks 배열 확인
    if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
      throw new Error('응답에 blocks 배열이 없습니다.');
    }

    // 각 블록 검증
    const validBlocks: GeneratedBlock[] = [];
    const validTypes = ['hero', 'quickInfo', 'amenities', 'rules', 'map', 'gallery', 'notice', 'custom'];

    for (const block of parsed.blocks) {
      if (!block.type || !validTypes.includes(block.type)) {
        console.warn(`유효하지 않은 블록 타입 무시: ${block.type}`);
        continue;
      }

      if (!block.content || typeof block.content !== 'object') {
        console.warn(`블록 content가 없음: ${block.type}`);
        continue;
      }

      validBlocks.push({
        type: block.type,
        content: block.content,
      });
    }

    if (validBlocks.length === 0) {
      throw new Error('유효한 블록이 없습니다.');
    }

    return validBlocks;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new AIGenerationError(
        'PARSE_ERROR',
        'AI 응답을 JSON으로 파싱할 수 없습니다.',
        content.substring(0, 200)
      );
    }

    if (error instanceof AIGenerationError) {
      throw error;
    }

    throw new AIGenerationError(
      'PARSE_ERROR',
      error instanceof Error ? error.message : 'AI 응답 파싱 중 오류가 발생했습니다.'
    );
  }
}

// ============================================
// 스트리밍 생성 (선택적)
// ============================================

/**
 * 스트리밍 방식으로 콘텐츠 생성
 * Server-Sent Events로 실시간 응답
 */
export async function* generateGuidebookContentStream(
  input: ListingInput
): AsyncGenerator<string, void, unknown> {
  // API 키 확인
  if (!hasApiKey()) {
    throw new AIGenerationError(
      'MISSING_API_KEY',
      'OpenAI API 키가 설정되지 않았습니다.'
    );
  }

  // 입력 검증
  const validation = validateListingInput(input);
  if (!validation.valid) {
    throw new AIGenerationError(
      'INVALID_INPUT',
      '입력 데이터가 유효하지 않습니다.',
      validation.errors.join(', ')
    );
  }

  // 프롬프트 생성
  const userPrompt = buildUserPrompt(input);
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: GUIDEBOOK_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  // OpenAI 스트리밍 호출
  const client = getOpenAIClient();
  const stream = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    stream: true,
  });

  // 스트림 청크 전달
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
