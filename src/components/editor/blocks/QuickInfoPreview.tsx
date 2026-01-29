// @TASK P1-T1.4 - QuickInfoPreview 컴포넌트
// @SPEC docs/planning/06-tasks.md#P1-T1.4

'use client';

import { QuickInfoContent } from '@/types/blocks';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Wifi, Lock, MapPin, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickInfoPreviewProps {
  content: QuickInfoContent;
}

export function QuickInfoPreview({ content }: QuickInfoPreviewProps) {
  const maskPassword = (password: string) => {
    return '•'.repeat(password.length);
  };

  return (
    <div className="space-y-3">
      {/* 체크인/체크아웃 */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">체크인</p>
                <p className="font-semibold">{content.checkIn}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">체크아웃</p>
                <p className="font-semibold">{content.checkOut}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 와이파이 */}
      {content.wifi && (content.wifi.ssid || content.wifi.password) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Wifi className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">와이파이</p>
                {content.wifi.ssid && (
                  <div className="mt-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">네트워크</p>
                      <p className="font-semibold">{content.wifi.ssid}</p>
                    </div>
                    <Button variant="ghost" size="sm" aria-label="SSID 복사">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {content.wifi.password && (
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">비밀번호</p>
                      <p className="font-mono">{maskPassword(content.wifi.password)}</p>
                    </div>
                    <Button variant="ghost" size="sm" aria-label="비밀번호 복사">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 도어락 */}
      {content.doorLock && (content.doorLock.password || content.doorLock.instructions) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Lock className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">도어락</p>
                {content.doorLock.password && (
                  <div className="mt-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">비밀번호</p>
                      <p className="font-mono text-lg">
                        {maskPassword(content.doorLock.password)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" aria-label="비밀번호 복사">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {content.doorLock.instructions && (
                  <div className="mt-2">
                    <p className="text-xs font-medium">사용 방법</p>
                    <p className="text-sm text-muted-foreground">
                      {content.doorLock.instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 주소 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">주소</p>
              <div className="mt-1 flex items-start justify-between">
                <p className="font-semibold">{content.address}</p>
                <Button variant="ghost" size="sm" aria-label="주소 복사">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {content.coordinates && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {content.coordinates.lat.toFixed(4)}, {content.coordinates.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
