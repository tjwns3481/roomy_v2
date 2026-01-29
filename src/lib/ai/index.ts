/**
 * @TASK P3-T3.5 - AI 관련 유틸리티 모듈
 * @TASK P8-R6 - AI Chatbot RAG
 * @SPEC docs/planning/02-trd.md#AI-Features
 */

export {
  checkAiLimit,
  recordAiUsage,
  getAiUsageHistory,
  getPlanLimits,
  createLimitExceededError,
  type AiLimitInfo,
  type RecordAiUsageParams,
  type AiUsageHistoryItem,
} from './usage';

export {
  generateChatbotResponse,
  checkChatbotLimit,
  hasOpenAIKey,
  getGuidebookContext,
  formatContextForRAG,
  CHATBOT_LIMITS,
  type ChatbotContext,
  type ChatbotRequest,
  type ChatbotResponse,
  type ChatbotLimitInfo,
} from './chatbot';
