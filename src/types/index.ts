// @TASK P1-T1.2 - 타입 중앙 집중식 export
// @SPEC docs/planning/06-tasks.md#P1-T1.2

/**
 * 중앙 집중식 타입 export
 * - 모든 타입을 여기서 import할 수 있도록 통합
 */

// Auth 타입
export * from './auth';

// Database 타입
export * from './database.types';

// Editor 타입
export * from './editor';

// Block 타입 (8종)
export * from './block';

// Guidebook 타입 (블록 content 타입은 block.ts에서 export하므로 제외)
export {
  type GuidebookStatus,
  type Theme,
  type Guidebook,
  type BlockType,
  type Block,
  type BlockContent,
  type GuidebookWithBlocks,
} from './guidebook';

// Blocks 타입 (레거시, 삭제됨 - ./block으로 대체)
// export * from './blocks';

// Airbnb 타입 (P3-T3.1)
export * from './airbnb';

// AI 타입 (P3-T3.2)
export * from './ai';

// AI Generate 타입 (P3-T3.3)
export * from './ai-generate';

// 공유 통계 타입 (P5-T5.5)
export * from './share';
