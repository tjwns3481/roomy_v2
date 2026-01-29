// @TASK P1-T1.1 - 에디터 타입 정의
// @SPEC docs/planning/06-tasks.md#P1-T1.1

/**
 * 블록 데이터 구조
 */
export interface Block {
  id: string;
  type: string;
  order: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

/**
 * 가이드북 구조
 */
export interface Guide {
  id: string;
  title: string;
  slug: string;
  blocks: Block[];
}

/**
 * 에디터 상태
 */
export interface EditorState {
  selectedBlockId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}

/**
 * 저장 상태
 */
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
