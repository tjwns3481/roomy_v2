// @TASK P4-T4.6 - 알림 설정
// @SPEC docs/planning/06-tasks.md#P4-T4.6

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  initialData: {
    dailyStats: boolean;
    newFeatures: boolean;
    marketing: boolean;
  };
}

export function NotificationSettings({ initialData }: NotificationSettingsProps) {
  const [settings, setSettings] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '알림 설정 업데이트에 실패했습니다');
      }

      toast.success('알림 설정이 업데이트되었습니다');
    } catch (error) {
      console.error('Notification settings update error:', error);
      toast.error(error instanceof Error ? error.message : '알림 설정 업데이트에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
        <CardDescription>이메일 알림 수신 설정을 관리하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* 조회수 알림 */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="dailyStats"
                checked={settings.dailyStats}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, dailyStats: checked === true }))
                }
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="dailyStats"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  조회수 알림
                </Label>
                <p className="text-sm text-muted-foreground">가이드북 조회수 일간 요약을 받습니다</p>
              </div>
            </div>

            {/* 새로운 기능 안내 */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="newFeatures"
                checked={settings.newFeatures}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, newFeatures: checked === true }))
                }
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="newFeatures"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  새로운 기능 안내
                </Label>
                <p className="text-sm text-muted-foreground">
                  Roomy의 새로운 기능 및 업데이트 소식을 받습니다
                </p>
              </div>
            </div>

            {/* 마케팅 이메일 */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="marketing"
                checked={settings.marketing}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, marketing: checked === true }))
                }
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="marketing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  마케팅 이메일
                </Label>
                <p className="text-sm text-muted-foreground">
                  프로모션 및 마케팅 정보를 받습니다 (선택)
                </p>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : '변경사항 저장'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
