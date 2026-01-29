// @TASK P1-T1.6 - RulesPreview 컴포넌트
// @SPEC docs/planning/06-tasks.md#P1-T1.6

'use client';

import { RulesContent } from '@/types/block';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertCircle,
  Recycle,
  CheckSquare,
  Home,
  Lightbulb,
} from 'lucide-react';

interface RulesPreviewProps {
  content: RulesContent;
}

// 아이콘 매핑
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  alert: AlertCircle,
  recycle: Recycle,
  check: CheckSquare,
  home: Home,
  bulb: Lightbulb,
};

/**
 * 간단한 마크다운 파서
 * - **굵게** → <strong>
 * - *기울임* → <em>
 * - `코드` → <code>
 */
function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // **굵게**
  let parsed = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // *기울임*
  parsed = parsed.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // `코드`
  parsed = parsed.replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');

  return <span dangerouslySetInnerHTML={{ __html: parsed }} />;
}

export function RulesPreview({ content }: RulesPreviewProps) {
  return (
    <div className="space-y-6">
      {/* 규칙 섹션 */}
      {content.sections.map((section) => {
        const IconComponent = ICON_MAP[section.icon || 'alert'];

        return (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {IconComponent && <IconComponent className="h-5 w-5" />}
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {section.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm leading-relaxed"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>{parseMarkdown(item)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}

      {/* 퇴실 체크리스트 */}
      {content.checkoutChecklist && content.checkoutChecklist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              퇴실 체크리스트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {content.checkoutChecklist.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Checkbox id={`checklist-${index}`} />
                  <label
                    htmlFor={`checklist-${index}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 빈 상태 */}
      {content.sections.length === 0 &&
        (!content.checkoutChecklist || content.checkoutChecklist.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <p className="text-sm">
                규칙을 추가하면 여기에 미리보기가 표시됩니다.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
