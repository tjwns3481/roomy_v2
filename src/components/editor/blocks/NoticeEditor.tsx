// @TASK P1-T1.7 - NoticeEditor 컴포넌트
// @SPEC docs/planning/06-tasks.md#P1-T1.7

'use client';

import { NoticeContent } from '@/types/block';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

interface NoticeEditorProps {
  content: NoticeContent;
  onChange: (content: NoticeContent) => void;
}

const NOTICE_TYPE_CONFIG = {
  info: {
    label: '정보',
    icon: Info,
    description: '일반적인 안내사항',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
  },
  warning: {
    label: '주의',
    icon: AlertTriangle,
    description: '주의가 필요한 사항',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
  },
  danger: {
    label: '경고',
    icon: XCircle,
    description: '중요한 경고사항',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
  },
};

export function NoticeEditor({ content, onChange }: NoticeEditorProps) {
  const handleTitleChange = (value: string) => {
    onChange({
      ...content,
      title: value,
    });
  };

  const handleContentChange = (value: string) => {
    onChange({
      ...content,
      content: value,
    });
  };

  const handleTypeChange = (type: 'info' | 'warning' | 'danger') => {
    onChange({
      ...content,
      type,
    });
  };

  const handleDismissibleChange = (checked: boolean) => {
    onChange({
      ...content,
      dismissible: checked,
    });
  };

  const currentTypeConfig = NOTICE_TYPE_CONFIG[content.type];
  const Icon = currentTypeConfig.icon;

  return (
    <div className="space-y-6">
      {/* 공지 유형 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            공지 유형
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="type">유형 선택</Label>
            <Select value={content.type} onValueChange={handleTypeChange}>
              <SelectTrigger id="type" className="mt-1">
                <SelectValue placeholder="유형 선택" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NOTICE_TYPE_CONFIG).map(([key, config]) => {
                  const TypeIcon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        <span>{config.label}</span>
                        <span className="text-xs text-muted-foreground">
                          ({config.description})
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dismissible">닫기 가능 여부</Label>
              <p className="text-sm text-muted-foreground">
                게스트가 공지를 닫을 수 있습니다
              </p>
            </div>
            <Switch
              id="dismissible"
              checked={content.dismissible || false}
              onCheckedChange={handleDismissibleChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* 공지 내용 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>공지 내용</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              type="text"
              value={content.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="중요 공지사항"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              value={content.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="게스트에게 전달할 중요한 내용을 입력하세요"
              rows={6}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              줄바꿈과 기본 서식이 유지됩니다
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 미리보기 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>미리보기</CardTitle>
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
                    제목과 내용을 입력하면 여기에 미리보기가 표시됩니다
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
    </div>
  );
}
