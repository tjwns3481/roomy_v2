// @TASK P8-S2-T1 - AirBnB 스타일 RulesBlock
// @SPEC specs/screens/guest-viewer.yaml

'use client';

import React, { useState } from 'react';
import { RulesContent } from '@/types/block';
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

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  alert: AlertCircle,
  recycle: Recycle,
  check: CheckSquare,
  home: Home,
  bulb: Lightbulb,
  circle: Circle,
};

function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  let parsed = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  parsed = parsed.replace(/\*(.+?)\*/g, '<em>$1</em>');
  parsed = parsed.replace(/`(.+?)`/g, '<code class="bg-surface px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  return <span dangerouslySetInnerHTML={{ __html: parsed }} />;
}

/**
 * AirBnB 스타일 규칙 블록
 * - 깔끔한 섹션 구분
 * - 부드러운 곡선 & 그림자
 * - 체크리스트 기능
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
    <div className="px-4 py-8 space-y-6">
      {/* 규칙 섹션 */}
      {content.sections.map((section) => {
        const IconComponent = ICON_MAP[section.icon || 'alert'] || AlertCircle;

        return (
          <div
            key={section.id}
            className="bg-white border border-border rounded-xl p-6 shadow-airbnb-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-h3 font-semibold text-text-primary">
                {section.title}
              </h3>
            </div>
            <ul className="space-y-3">
              {section.items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-body leading-relaxed text-text-primary"
                >
                  <Circle className="h-2 w-2 mt-2.5 flex-shrink-0 fill-primary text-primary" />
                  <span className="flex-1">{parseMarkdown(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* 퇴실 체크리스트 */}
      {content.checkoutChecklist && content.checkoutChecklist.length > 0 && (
        <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6 shadow-airbnb-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-h3 font-semibold text-text-primary">
                퇴실 체크리스트
              </h3>
              <p className="text-body-sm text-text-secondary">
                퇴실 전에 아래 항목들을 확인해주세요
              </p>
            </div>
          </div>
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
                  className={`text-body leading-relaxed cursor-pointer select-none flex-1 ${
                    checkedItems.has(index) ? 'line-through text-text-secondary' : 'text-text-primary'
                  }`}
                >
                  {item}
                </label>
              </div>
            ))}
          </div>

          {/* 완료 상태 */}
          {content.checkoutChecklist.length > 0 && (
            <div className="mt-6 pt-4 border-t border-primary/20">
              <p className="text-body-sm text-center text-text-secondary">
                완료: {checkedItems.size} / {content.checkoutChecklist.length}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
