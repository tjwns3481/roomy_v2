// @TASK P1-T1.7 - NoticePreview 컴포넌트
// @SPEC docs/planning/06-tasks.md#P1-T1.7

'use client';

import { NoticeContent } from '@/types/block';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, AlertTriangle, XCircle } from 'lucide-react';

interface NoticePreviewProps {
  content: NoticeContent;
}

const NOTICE_TYPE_CONFIG = {
  info: {
    label: '정보',
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
  },
  warning: {
    label: '주의',
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
  },
  danger: {
    label: '경고',
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
  },
};

export function NoticePreview({ content }: NoticePreviewProps) {
  const currentTypeConfig = NOTICE_TYPE_CONFIG[content.type];
  const Icon = currentTypeConfig.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            공지사항
          </div>
          <span className="text-xs text-muted-foreground">
            {currentTypeConfig.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`rounded-lg border-2 p-4 ${currentTypeConfig.bgColor} ${currentTypeConfig.borderColor}`}
        >
          <div className="flex items-start gap-3">
            <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${currentTypeConfig.textColor}`} />
            <div className="flex-1 space-y-2">
              {content.title && (
                <h4 className={`font-semibold ${currentTypeConfig.textColor}`}>
                  {content.title}
                </h4>
              )}
              {content.content && (
                <p className={`text-sm whitespace-pre-wrap ${currentTypeConfig.textColor}`}>
                  {content.content}
                </p>
              )}
              {!content.title && !content.content && (
                <p className="text-sm text-muted-foreground italic">
                  공지 내용을 입력하세요
                </p>
              )}
            </div>
            {content.dismissible && (
              <button
                type="button"
                className={`${currentTypeConfig.textColor} hover:opacity-70 transition-opacity`}
                aria-label="닫기"
                disabled
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
