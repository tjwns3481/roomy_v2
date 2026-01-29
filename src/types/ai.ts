/**
 * @TASK P3-T3.2 - AI 콘텐츠 생성 타입 정의
 * @SPEC docs/planning/06-tasks.md#P3-T3.2
 */

import type { Block, BlockType } from './guidebook';

// ============================================
// 입력 타입
// ============================================

/**
 * 숙소 정보 입력 (AI 콘텐츠 생성용)
 */
export interface ListingInput {
  /** 숙소 제목 */
  title: string;
  /** 숙소 설명 */
  description: string;
  /** 주소 */
  address: string;
  /** 편의시설 목록 */
  amenities: string[];
  /** 체크인 시간 (HH:mm) */
  checkIn?: string;
  /** 체크아웃 시간 (HH:mm) */
  checkOut?: string;
  /** 숙소 규칙 */
  houseRules?: string[];
  /** 호스트 이름 */
  hostName?: string;
  /** 대표 이미지 URL */
  imageUrl?: string;
  /** 숙소 유형 (아파트, 단독주택 등) */
  propertyType?: string;
}

// ============================================
// 출력 타입
// ============================================

/**
 * AI가 생성한 블록 데이터
 */
export interface GeneratedBlock {
  type: BlockType;
  content: Record<string, unknown>;
}

/**
 * AI 콘텐츠 생성 결과
 */
export interface GeneratedContent {
  /** 생성된 블록 목록 */
  blocks: GeneratedBlock[];
  /** 사용된 토큰 수 */
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  /** 생성 모델 */
  model: string;
}

// ============================================
// API 타입
// ============================================

/**
 * /api/ai/generate 요청 바디
 */
export interface AIGenerateRequest {
  listingInfo: ListingInput;
  /** 생성할 블록 타입 (선택, 기본값: 모든 타입) */
  blockTypes?: BlockType[];
}

/**
 * /api/ai/generate 성공 응답
 */
export interface AIGenerateSuccessResponse {
  success: true;
  data: GeneratedContent;
}

/**
 * /api/ai/generate 에러 응답
 */
export interface AIGenerateErrorResponse {
  success: false;
  error: {
    code: AIErrorCode;
    message: string;
    details?: string;
  };
}

/**
 * /api/ai/generate 응답 타입 유니온
 */
export type AIGenerateResponse = AIGenerateSuccessResponse | AIGenerateErrorResponse;

/**
 * AI 에러 코드
 * @TASK P3-T3.5 - AI_LIMIT_EXCEEDED 추가
 * @TASK P6-T6.7 - LIMIT_EXCEEDED 추가 (402 Payment Required)
 */
export type AIErrorCode =
  | 'MISSING_API_KEY'
  | 'INVALID_INPUT'
  | 'RATE_LIMIT'
  | 'TOKEN_LIMIT'
  | 'PARSE_ERROR'
  | 'API_ERROR'
  | 'TIMEOUT'
  | 'AI_LIMIT_EXCEEDED' // P3-T3.5: 플랜별 월간 제한 초과
  | 'LIMIT_EXCEEDED' // P6-T6.7: 제한 초과 (402 응답)
  | 'UNKNOWN';

// ============================================
// 스트리밍 타입 (선택적)
// ============================================

/**
 * 스트리밍 이벤트 타입
 */
export interface StreamingEvent {
  type: 'start' | 'chunk' | 'done' | 'error';
  data?: string;
  error?: {
    code: AIErrorCode;
    message: string;
  };
}

// ============================================
// 내부 타입
// ============================================

/**
 * OpenAI API 응답에서 파싱된 블록 구조
 */
export interface ParsedBlocksResponse {
  blocks: GeneratedBlock[];
}
