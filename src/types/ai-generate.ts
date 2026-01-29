/**
 * @TASK P3-T3.3 - AI 가이드북 생성 UI 타입 정의
 * @SPEC docs/planning/06-tasks.md#P3-T3.3
 */

import type { Block } from './guidebook';
import type { ManualListingInput } from './airbnb';

// ============================================
// 입력 방식
// ============================================

/**
 * AI 생성 입력 방식
 */
export type GenerationInputMode = 'url' | 'manual';

/**
 * URL 입력 데이터
 */
export interface UrlInputData {
  mode: 'url';
  url: string;
}

/**
 * 수동 입력 데이터
 */
export interface ManualInputData extends ManualListingInput {
  mode: 'manual';
}

/**
 * 생성 입력 데이터 (Union)
 */
export type GenerationInputData = UrlInputData | ManualInputData;

// ============================================
// 생성 진행 상태
// ============================================

/**
 * 생성 단계
 */
export type GenerationStep =
  | 'idle'
  | 'parsing'
  | 'analyzing'
  | 'generating_hero'
  | 'generating_quickInfo'
  | 'generating_amenities'
  | 'generating_rules'
  | 'generating_notice'
  | 'generating_map'
  | 'complete'
  | 'error';

/**
 * 생성 단계별 상태
 */
export interface GenerationStepStatus {
  step: GenerationStep;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
}

/**
 * 생성 진행 상태
 */
export interface GenerationProgress {
  currentStep: GenerationStep;
  steps: GenerationStepStatus[];
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // seconds
}

// ============================================
// 생성 결과
// ============================================

/**
 * AI 생성 결과
 */
export interface GenerationResult {
  success: boolean;
  blocks: Block[];
  metadata?: {
    tokensUsed?: number;
    duration?: number;
    model?: string;
  };
  error?: GenerationError;
}

/**
 * 생성 에러
 */
export interface GenerationError {
  code:
    | 'API_KEY_MISSING'
    | 'API_KEY_INVALID'
    | 'RATE_LIMIT_EXCEEDED'
    | 'TOKEN_LIMIT_EXCEEDED'
    | 'GENERATION_FAILED'
    | 'NETWORK_ERROR'
    | 'UNKNOWN';
  message: string;
  retryable: boolean;
}

// ============================================
// API 요청/응답
// ============================================

/**
 * /api/ai/generate 요청 바디
 */
export interface GenerateRequest {
  guidebookId: string;
  input: GenerationInputData;
}

/**
 * /api/ai/generate SSE 이벤트
 */
export type GenerateSSEEvent =
  | {
      type: 'progress';
      data: GenerationProgress;
    }
  | {
      type: 'block';
      data: Block;
    }
  | {
      type: 'complete';
      data: GenerationResult;
    }
  | {
      type: 'error';
      data: GenerationError;
    };

// ============================================
// UI 상태
// ============================================

/**
 * AI 생성 모달 상태
 */
export interface AiGenerateModalState {
  isOpen: boolean;
  mode: GenerationInputMode;
  inputData: Partial<GenerationInputData>;
  progress: GenerationProgress | null;
  result: GenerationResult | null;
  error: GenerationError | null;
}
