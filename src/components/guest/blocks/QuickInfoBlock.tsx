// @TASK P2-T2.3 - QuickInfo 카드 UI (복사 버튼 포함)
// @SPEC docs/planning/06-tasks.md#P2-T2.3

'use client';

import React, { useState } from 'react';
import { QuickInfoContent } from '@/types/block';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Wifi, Lock, MapPin, Copy, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface QuickInfoBlockProps {
  content: QuickInfoContent;
}

/**
 * 게스트용 빠른 정보 블록
 * - 체크인/아웃, 와이파이, 도어락, 주소 표시
 * - 복사 버튼 기능 (useCopyToClipboard 훅 사용)
 * - 비밀번호 토글 기능
 * - 토스트 알림 (복사 성공)
 */
export function QuickInfoBlock({ content }: QuickInfoBlockProps) {
  const [wifiPasswordVisible, setWifiPasswordVisible] = useState(false);
  const [doorLockVisible, setDoorLockVisible] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { copy } = useCopyToClipboard();

  // 클립보드 복사 (토스트 알림 포함)
  const copyToClipboard = async (text: string, field: string) => {
    await copy(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-3 px-4 py-6">
      {/* 체크인/체크아웃 */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">체크인</p>
                <p className="text-lg font-semibold">{content.checkIn}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">체크아웃</p>
                <p className="text-lg font-semibold">{content.checkOut}</p>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Wifi className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">와이파이</p>

                {/* SSID */}
                {content.wifi.ssid && (
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">네트워크</p>
                      <p className="text-base font-semibold mt-0.5">{content.wifi.ssid}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(content.wifi!.ssid, 'wifi-ssid')}
                      className="flex-shrink-0"
                      aria-label="WiFi 네트워크 이름 복사"
                    >
                      {copiedField === 'wifi-ssid' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}

                {/* 비밀번호 */}
                {content.wifi.password && (
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">비밀번호</p>
                      <p className="text-base font-mono mt-0.5">
                        {wifiPasswordVisible ? content.wifi.password : '•'.repeat(12)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setWifiPasswordVisible(!wifiPasswordVisible)}
                        aria-label={wifiPasswordVisible ? 'WiFi 비밀번호 숨기기' : 'WiFi 비밀번호 표시'}
                      >
                        {wifiPasswordVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(content.wifi!.password, 'wifi-password')}
                        aria-label="WiFi 비밀번호 복사"
                      >
                        {copiedField === 'wifi-password' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">도어락</p>

                {/* 비밀번호 */}
                {content.doorLock.password && (
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">비밀번호</p>
                      <p className="text-lg font-mono font-semibold mt-0.5">
                        {doorLockVisible ? content.doorLock.password : '•'.repeat(content.doorLock.password.length)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDoorLockVisible(!doorLockVisible)}
                        aria-label={doorLockVisible ? '도어락 비밀번호 숨기기' : '도어락 비밀번호 표시'}
                      >
                        {doorLockVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(content.doorLock!.password, 'doorlock')}
                        aria-label="도어락 비밀번호 복사"
                      >
                        {copiedField === 'doorlock' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* 사용 방법 */}
                {content.doorLock.instructions && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">사용 방법</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <MapPin className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-muted-foreground mb-2">주소</p>
              <div className="flex items-start justify-between gap-2 bg-muted/50 rounded-lg p-3">
                <p className="text-base leading-relaxed flex-1">{content.address}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(content.address, 'address')}
                  className="flex-shrink-0"
                  aria-label="주소 복사"
                >
                  {copiedField === 'address' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {content.coordinates && (
                <p className="mt-2 text-xs text-muted-foreground">
                  좌표: {content.coordinates.lat.toFixed(6)}, {content.coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
