// @TASK P8-S2-T2 - AI 챗봇 로직 훅
'use client';

import { useState, useCallback } from 'react';
import { ChatbotMessageRequest, ChatbotMessageResponse } from '@/types/chatbot';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseChatbotOptions {
  guidebookId: string;
  guidebookTitle: string;
  onError?: (error: Error) => void;
}

/**
 * AI 챗봇 로직을 관리하는 커스텀 훅
 *
 * - 메시지 전송/수신
 * - 로딩 상태 관리
 * - 세션 ID 자동 생성
 * - 피드백 전송
 */
export function useChatbot({ guidebookId, guidebookTitle, onError }: UseChatbotOptions) {
  // 세션 ID 생성 (브라우저 세션당 1개)
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return '';
    const stored = sessionStorage.getItem(`chatbot-session-${guidebookId}`);
    if (stored) return stored;

    const newSessionId = crypto.randomUUID();
    sessionStorage.setItem(`chatbot-session-${guidebookId}`, newSessionId);
    return newSessionId;
  });

  // 초기 환영 메시지
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `안녕하세요! ${guidebookTitle}에 대해 궁금한 점이 있으시면 편하게 물어보세요. 체크인, WiFi, 주변 정보 등 무엇이든 도와드릴게요! 😊`,
      timestamp: new Date(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  /**
   * 메시지 전송
   */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const requestBody: ChatbotMessageRequest = {
          guidebook_id: guidebookId,
          session_id: sessionId,
          question: text.trim(),
        };

        const response = await fetch('/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || '답변을 받지 못했습니다.');
        }

        const data: ChatbotMessageResponse = await response.json();

        const assistantMessage: Message = {
          id: data.id,
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(data.created_at),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('[useChatbot] Error:', error);

        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);

        if (onError && error instanceof Error) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [guidebookId, sessionId, isLoading, onError]
  );

  /**
   * 피드백 전송
   */
  const sendFeedback = useCallback(
    async (messageId: string, feedback: 'helpful' | 'not_helpful') => {
      try {
        const response = await fetch(`/api/chatbot/feedback/${messageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback }),
        });

        if (!response.ok) {
          throw new Error('피드백 전송에 실패했습니다.');
        }
      } catch (error) {
        console.error('[useChatbot] Feedback error:', error);
        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    },
    [onError]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    sendFeedback,
  };
}
