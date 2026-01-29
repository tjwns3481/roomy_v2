// @TASK P8-S2-T2 - AI 챗봇 메시지 컴포넌트
'use client';

import { useState } from 'react';
import { Bot, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  themeColor: string;
  onFeedback?: (messageId: string, feedback: 'helpful' | 'not_helpful') => void;
  showFeedback?: boolean;
}

/**
 * AI 챗봇 메시지 컴포넌트
 *
 * 사용자 메시지와 AI 답변을 렌더링합니다.
 * - 마크다운 지원
 * - 피드백 버튼 (👍/👎)
 */
export function ChatMessage({
  id,
  role,
  content,
  themeColor,
  onFeedback,
  showFeedback = false,
}: ChatMessageProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'not_helpful' | null>(null);

  const handleFeedback = (feedback: 'helpful' | 'not_helpful') => {
    if (feedbackGiven || !onFeedback) return;

    setFeedbackGiven(feedback);
    onFeedback(id, feedback);
  };

  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'flex-row-reverse' : ''
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          isUser ? 'bg-gray-200' : ''
        )}
        style={!isUser ? { backgroundColor: `${themeColor}20` } : {}}
      >
        {isUser ? (
          <User className="w-4 h-4 text-gray-600" />
        ) : (
          <Bot className="w-4 h-4" style={{ color: themeColor }} />
        )}
      </div>

      {/* Message Bubble */}
      <div className={cn('flex-1', isUser ? 'flex justify-end' : '')}>
        <div
          className={cn(
            'max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm',
            isUser ? 'bg-gray-100 text-gray-900' : 'text-white'
          )}
          style={!isUser ? { backgroundColor: themeColor } : {}}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="text-sm prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Feedback Buttons (assistant only) */}
        {!isUser && showFeedback && (
          <div className="flex items-center gap-2 mt-2 ml-1">
            <button
              onClick={() => handleFeedback('helpful')}
              disabled={feedbackGiven !== null}
              aria-label="도움이 되었어요"
              className={cn(
                'p-1.5 rounded-lg transition-all',
                feedbackGiven === 'helpful'
                  ? 'bg-green-100 text-green-600'
                  : 'hover:bg-gray-100 text-gray-400 hover:text-green-600'
              )}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleFeedback('not_helpful')}
              disabled={feedbackGiven !== null}
              aria-label="도움이 안됐어요"
              className={cn(
                'p-1.5 rounded-lg transition-all',
                feedbackGiven === 'not_helpful'
                  ? 'bg-red-100 text-red-600'
                  : 'hover:bg-gray-100 text-gray-400 hover:text-red-600'
              )}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            {feedbackGiven && (
              <span className="text-xs text-gray-500 ml-1">
                피드백 감사합니다!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
