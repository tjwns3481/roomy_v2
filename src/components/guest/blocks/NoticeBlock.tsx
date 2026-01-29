// @TASK P2-T2.2 - 게스트용 NoticeBlock
// @SPEC docs/planning/06-tasks.md#P2-T2.2

'use client';

import React from 'react';
import { NoticeContent } from '@/types/block';
import { Card, CardContent } from '@/components/ui/card';
import { Info, AlertTriangle, XCircle } from 'lucide-react';

interface NoticeBlockProps {
  content: NoticeContent;
}

const NOTICE_TYPE_CONFIG = {
  info: {
    label: '안내',
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-300 dark:border-blue-700',
    textColor: 'text-blue-900 dark:text-blue-100',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    label: '주의',
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    textColor: 'text-yellow-900 dark:text-yellow-100',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  danger: {
    label: '경고',
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-300 dark:border-red-700',
    textColor: 'text-red-900 dark:text-red-100',
    iconColor: 'text-red-600 dark:text-red-400',
  },
};

/**
 * 게스트용 공지사항 블록
 * - 타입별 색상 구분 (info, warning, danger)
 * - 아이콘 + 제목 + 내용
 */
export function NoticeBlock({ content }: NoticeBlockProps) {
  const config = NOTICE_TYPE_CONFIG[content.type];
  const Icon = config.icon;

  return (
    <div className="px-4 py-6">
      <Card>
        <CardContent className="p-4">
          <div
            className={`rounded-lg border-2 p-4 ${config.bgColor} ${config.borderColor}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`h-6 w-6 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
              <div className="flex-1 space-y-2">
                {content.title && (
                  <h4 className={`text-lg font-bold ${config.textColor}`}>
                    {content.title}
                  </h4>
                )}
                {content.content && (
                  <p className={`text-base whitespace-pre-wrap leading-relaxed ${config.textColor}`}>
                    {content.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
