// @TASK P2-T2.2 - 게스트용 RulesBlock
// @SPEC docs/planning/06-tasks.md#P2-T2.2

'use client';

import React, { useState } from 'react';
import { RulesContent } from '@/types/block';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertCircle,
  Recycle,
  CheckSquare,
  Home,
  Lightbulb,
  Circle,
} from 'lucide-react';

interface RulesBlockProps {
  content: RulesContent;
}

// 아이콘 매핑
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  alert: AlertCircle,
  recycle: Recycle,
  check: CheckSquare,
  home: Home,
  bulb: Lightbulb,
  circle: Circle,
};

/**
 * 간단한 마크다운 파서
 * - **굵게** → <strong>
 * - *기울임* → <em>
 * - `코드` → <code>
 */
function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  let parsed = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  parsed = parsed.replace(/\*(.+?)\*/g, '<em>$1</em>');
  parsed = parsed.replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  return <span dangerouslySetInnerHTML={{ __html: parsed }} />;
}

/**
 * 게스트용 규칙 블록
 * - 섹션별 규칙 목록
 * - 퇴실 체크리스트 (체크 가능)
 */
export function RulesBlock({ content }: RulesBlockProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleCheckItem = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* 규칙 섹션 */}
      {content.sections.map((section) => {
        const IconComponent = ICON_MAP[section.icon || 'alert'] || AlertCircle;

        return (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconComponent className="h-5 w-5 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {section.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-base leading-relaxed"
                  >
                    <Circle className="h-2 w-2 mt-2 flex-shrink-0 fill-primary text-primary" />
                    <span className="flex-1">{parseMarkdown(item)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}

      {/* 퇴실 체크리스트 */}
      {content.checkoutChecklist && content.checkoutChecklist.length > 0 && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckSquare className="h-5 w-5 text-primary" />
              퇴실 체크리스트
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              퇴실 전에 아래 항목들을 확인해주세요
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.checkoutChecklist.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Checkbox
                    id={`checklist-${index}`}
                    checked={checkedItems.has(index)}
                    onCheckedChange={() => toggleCheckItem(index)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`checklist-${index}`}
                    className={`text-base leading-relaxed cursor-pointer select-none flex-1 ${
                      checkedItems.has(index) ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {item}
                  </label>
                </div>
              ))}
            </div>

            {/* 완료 상태 표시 */}
            {content.checkoutChecklist.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-center text-muted-foreground">
                  완료: {checkedItems.size} / {content.checkoutChecklist.length}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
