// @TASK P8-S2-T2 - AI 챗봇 위젯
// @SPEC specs/screens/guest-viewer.yaml#ai_chatbot_widget
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChatMessage } from './ChatMessage';
import { useChatbot } from '@/hooks/useChatbot';
import { cn } from '@/lib/utils';

interface ChatWidgetProps {
  guidebookId: string;
  guidebookTitle?: string;
  themeColor?: string;
  quickQuestions?: string[];
}

const DEFAULT_QUICK_QUESTIONS = [
  '체크인 시간은?',
  '와이파이 비밀번호는?',
  '주변 맛집은?',
];

/**
 * AI 챗봇 플로팅 위젯
 *
 * Touch Stay 스타일의 24/7 자동 응답 챗봇 위젯:
 * - 우하단 고정 플로팅 버튼
 * - 슬라이드 업 채팅 패널
 * - 자주 묻는 질문 자동 추천
 * - 마크다운 렌더링
 * - 피드백 버튼 (👍/👎)
 */
export function ChatWidget({
  guidebookId,
  guidebookTitle = '가이드북',
  themeColor = '#FF385C',
  quickQuestions = DEFAULT_QUICK_QUESTIONS,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, sendFeedback } = useChatbot({
    guidebookId,
    guidebookTitle,
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage(input);
    setInput('');
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  // 플로팅 버튼 (닫힌 상태)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ backgroundColor: themeColor }}
        aria-label="AI 챗봇 열기"
      >
        <MessageCircle className="w-6 h-6" />
        <span
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: '#10B981' }}
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card
        role="dialog"
        aria-label="AI 가이드"
        className={cn(
          'w-[360px] max-w-[calc(100vw-48px)] shadow-2xl overflow-hidden transition-all duration-300',
          isMinimized ? 'h-14' : 'h-[70vh] max-h-[600px]'
        )}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 text-white cursor-pointer"
          style={{ backgroundColor: themeColor }}
          onClick={() => isMinimized && setIsMinimized(false)}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold text-sm">AI 가이드</h3>
              {!isMinimized && <p className="text-xs opacity-90">무엇이든 물어보세요</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              aria-label="최소화"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex flex-col h-[calc(100%-56px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  id={message.id}
                  role={message.role}
                  content={message.content}
                  themeColor={themeColor}
                  onFeedback={sendFeedback}
                  showFeedback={message.role === 'assistant' && index > 0}
                />
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3" data-testid="typing-indicator">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${themeColor}20` }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: themeColor }} />
                  </div>
                  <div
                    className="rounded-2xl px-4 py-2.5 shadow-sm flex items-center gap-1.5"
                    style={{ backgroundColor: `${themeColor}20` }}
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions (환영 메시지만 있을 때) */}
            {messages.length === 1 && (
              <div className="px-4 pb-3 border-t pt-3">
                <p className="text-xs text-gray-500 mb-2">💡 자주 묻는 질문</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q)}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-shadow disabled:bg-gray-50 disabled:cursor-not-allowed"
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full shrink-0 h-10 w-10 transition-transform hover:scale-105"
                  style={{ backgroundColor: themeColor }}
                  disabled={!input.trim() || isLoading}
                  aria-label="전송"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
