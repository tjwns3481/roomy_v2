/**
 * @TASK P3-T3.2 - OpenAI 라이브러리 엔트리포인트
 * @SPEC docs/planning/06-tasks.md#P3-T3.2
 */

// 클라이언트
export {
  getOpenAIClient,
  hasApiKey,
  getApiKey,
  resetOpenAIClient,
  DEFAULT_MODEL,
  MAX_TOKENS,
  TEMPERATURE,
  REQUEST_TIMEOUT,
} from './client';

// 프롬프트
export {
  GUIDEBOOK_SYSTEM_PROMPT,
  buildUserPrompt,
  estimateTokenCount,
  validateListingInput,
} from './prompts';

// 생성기
export {
  generateGuidebookContent,
  generateGuidebookContentStream,
  parseBlocksFromResponse,
  AIGenerationError,
} from './generator';

// 타입 재내보내기
export type {
  ListingInput,
  GeneratedContent,
  GeneratedBlock,
  AIGenerateRequest,
  AIGenerateResponse,
  AIGenerateSuccessResponse,
  AIGenerateErrorResponse,
  AIErrorCode,
  StreamingEvent,
} from '@/types/ai';
