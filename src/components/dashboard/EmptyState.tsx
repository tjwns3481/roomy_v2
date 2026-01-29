// @TASK P4-T4.2 - 빈 상태 컴포넌트
// @SPEC docs/planning/06-tasks.md#P4-T4.2

'use client';

import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreateNew?: () => void;
}

/**
 * 가이드북 빈 상태 컴포넌트
 * - 가이드북이 없을 때 표시
 * - 첫 가이드북 생성 유도
 */
export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-full p-6 mb-6">
        <BookOpen className="w-12 h-12 text-primary" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        아직 가이드북이 없어요
      </h3>

      <p className="text-gray-600 text-center mb-8 max-w-md">
        첫 번째 가이드북을 만들어보세요!<br />
        AI가 자동으로 생성하거나 직접 작성할 수 있습니다.
      </p>

      <Button
        size="lg"
        onClick={onCreateNew}
        className="gap-2"
      >
        <Plus className="w-5 h-5" />
        새 가이드북 만들기
      </Button>

      {/* Tips */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
        <TipCard
          emoji="🤖"
          title="AI 자동 생성"
          description="에어비앤비 링크만 있으면 AI가 자동으로 가이드북을 만들어줍니다"
        />
        <TipCard
          emoji="✏️"
          title="직접 작성"
          description="드래그 앤 드롭으로 원하는 블록을 배치하고 내용을 채워보세요"
        />
        <TipCard
          emoji="🎨"
          title="테마 선택"
          description="5가지 프리셋 테마 중에서 숙소 분위기에 맞는 스타일을 고르세요"
        />
      </div>
    </div>
  );
}

/**
 * 팁 카드 컴포넌트
 */
interface TipCardProps {
  emoji: string;
  title: string;
  description: string;
}

function TipCard({ emoji, title, description }: TipCardProps) {
  return (
    <div className="text-center p-4">
      <div className="text-4xl mb-3">{emoji}</div>
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
