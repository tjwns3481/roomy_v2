// @TASK P1-T1.8 - 블록 서비스 export
// @SPEC docs/planning/06-tasks.md#P1-T1.8

export {
  BlockService,
  BlockServiceError,
  validateBlockContent,
  type Block,
  type CreateBlockInput,
  type UpdateBlockInput,
  type ReorderBlockInput,
} from './service';
