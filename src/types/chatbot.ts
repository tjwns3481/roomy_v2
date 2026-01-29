// @TASK P8-R1 - chatbot_log 리소스 타입
// @SPEC specs/domain/resources.yaml#chatbot_log

/**
 * 챗봇 로그 피드백 타입
 */
export type ChatbotFeedback = 'helpful' | 'not_helpful' | null;

/**
 * 챗봇 로그 (DB Row)
 */
export interface ChatbotLog {
  id: string;
  guidebook_id: string;
  session_id: string;
  question: string;
  answer: string;
  feedback: ChatbotFeedback;
  created_at: string;
}

/**
 * 챗봇 질문/답변 요청
 */
export interface ChatbotMessageRequest {
  guidebook_id: string;
  session_id: string;
  question: string;
}

/**
 * 챗봇 질문/답변 응답
 */
export interface ChatbotMessageResponse {
  id: string;
  answer: string;
  created_at: string;
  sources?: string[]; // @TASK P8-R6 - RAG 답변에 사용된 블록 제목
}

/**
 * 챗봇 피드백 업데이트 요청
 */
export interface ChatbotFeedbackRequest {
  feedback: 'helpful' | 'not_helpful';
}

/**
 * 챗봇 대화 로그 목록 응답 (호스트용)
 */
export interface ChatbotLogsResponse {
  logs: ChatbotLog[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 챗봇 통계 (가이드북별)
 */
export interface ChatbotStats {
  total_questions: number;
  helpful_count: number;
  not_helpful_count: number;
  avg_session_length: number;
  satisfaction_rate: number; // helpful / (helpful + not_helpful)
}

/**
 * 자주 묻는 질문 (Top N)
 */
export interface FrequentQuestion {
  question: string;
  count: number;
  latest_answer: string;
}
