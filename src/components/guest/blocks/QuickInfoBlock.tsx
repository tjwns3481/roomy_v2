// @TASK P8-S2-T1 - AirBnB 스타일 QuickInfoBlock
// @SPEC specs/screens/guest-viewer.yaml

'use client';

import React, { useState } from 'react';
import { QuickInfoContent } from '@/types/block';
import { Clock, Wifi, Lock, MapPin, Copy, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface QuickInfoBlockProps {
  content: QuickInfoContent;
}

/**
 * AirBnB 스타일 빠른 정보 블록
 * - 깔끔한 카드 스타일 (shadow-airbnb-sm)
 * - 부드러운 곡선 (rounded-xl, rounded-2xl)
 * - 복사 버튼 & 토글 기능
 * - 터치 친화적 버튼 (min-h-[44px])
 */
export function QuickInfoBlock({ content }: QuickInfoBlockProps) {
  const [wifiPasswordVisible, setWifiPasswordVisible] = useState(false);
  const [doorLockVisible, setDoorLockVisible] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { copy } = useCopyToClipboard();

  const copyToClipboard = async (text: string, field: string) => {
    await copy(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="px-4 py-8 space-y-4 -mt-4">
      {/* 체크인/체크아웃 */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-airbnb-sm hover:shadow-airbnb-md transition-shadow">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Clock className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary mb-1">체크인</p>
              <p className="text-h3 font-semibold text-text-primary">{content.checkIn}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Clock className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-body-sm text-text-secondary mb-1">체크아웃</p>
              <p className="text-h3 font-semibold text-text-primary">{content.checkOut}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 와이파이 */}
      {content.wifi && (content.wifi.ssid || content.wifi.password) && (
        <div className="bg-white border border-border rounded-xl p-6 shadow-airbnb-sm hover:shadow-airbnb-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/10">
              <Wifi className="h-7 w-7 text-mint" />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-h4 font-semibold text-text-primary">와이파이</p>

              {/* SSID */}
              {content.wifi.ssid && (
                <div className="flex items-center justify-between bg-surface rounded-xl p-4">
                  <div className="flex-1">
                    <p className="text-body-sm text-text-secondary mb-1">네트워크</p>
                    <p className="text-body font-semibold text-text-primary">{content.wifi.ssid}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(content.wifi!.ssid, 'wifi-ssid')}
                    className="flex-shrink-0 min-h-[44px] min-w-[44px]"
                    aria-label="WiFi 네트워크 이름 복사"
                  >
                    {copiedField === 'wifi-ssid' ? (
                      <Check className="h-5 w-5 text-success" />
                    ) : (
                      <Copy className="h-5 w-5 text-text-secondary" />
                    )}
                  </Button>
                </div>
              )}

              {/* 비밀번호 */}
              {content.wifi.password && (
                <div className="flex items-center justify-between bg-surface rounded-xl p-4">
                  <div className="flex-1">
                    <p className="text-body-sm text-text-secondary mb-1">비밀번호</p>
                    <p className="text-body font-mono text-text-primary">
                      {wifiPasswordVisible ? content.wifi.password : '•'.repeat(12)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setWifiPasswordVisible(!wifiPasswordVisible)}
                      className="min-h-[44px] min-w-[44px]"
                      aria-label={wifiPasswordVisible ? 'WiFi 비밀번호 숨기기' : 'WiFi 비밀번호 표시'}
                    >
                      {wifiPasswordVisible ? (
                        <EyeOff className="h-5 w-5 text-text-secondary" />
                      ) : (
                        <Eye className="h-5 w-5 text-text-secondary" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(content.wifi!.password, 'wifi-password')}
                      className="min-h-[44px] min-w-[44px]"
                      aria-label="WiFi 비밀번호 복사"
                    >
                      {copiedField === 'wifi-password' ? (
                        <Check className="h-5 w-5 text-success" />
                      ) : (
                        <Copy className="h-5 w-5 text-text-secondary" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 도어락 */}
      {content.doorLock && (content.doorLock.password || content.doorLock.instructions) && (
        <div className="bg-white border border-border rounded-xl p-6 shadow-airbnb-sm hover:shadow-airbnb-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/10">
              <Lock className="h-7 w-7 text-amber" />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-h4 font-semibold text-text-primary">도어락</p>

              {/* 비밀번호 */}
              {content.doorLock.password && (
                <div className="flex items-center justify-between bg-surface rounded-xl p-4">
                  <div className="flex-1">
                    <p className="text-body-sm text-text-secondary mb-1">비밀번호</p>
                    <p className="text-h3 font-mono font-bold text-text-primary">
                      {doorLockVisible ? content.doorLock.password : '•'.repeat(content.doorLock.password.length)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDoorLockVisible(!doorLockVisible)}
                      className="min-h-[44px] min-w-[44px]"
                      aria-label={doorLockVisible ? '도어락 비밀번호 숨기기' : '도어락 비밀번호 표시'}
                    >
                      {doorLockVisible ? (
                        <EyeOff className="h-5 w-5 text-text-secondary" />
                      ) : (
                        <Eye className="h-5 w-5 text-text-secondary" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(content.doorLock!.password, 'doorlock')}
                      className="min-h-[44px] min-w-[44px]"
                      aria-label="도어락 비밀번호 복사"
                    >
                      {copiedField === 'doorlock' ? (
                        <Check className="h-5 w-5 text-success" />
                      ) : (
                        <Copy className="h-5 w-5 text-text-secondary" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* 사용 방법 */}
              {content.doorLock.instructions && (
                <div className="bg-surface rounded-xl p-4">
                  <p className="text-body-sm text-text-secondary mb-2">사용 방법</p>
                  <p className="text-body text-text-primary leading-relaxed whitespace-pre-wrap">
                    {content.doorLock.instructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 주소 */}
      {content.address && (
        <div className="bg-white border border-border rounded-xl p-6 shadow-airbnb-sm hover:shadow-airbnb-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral/10">
              <MapPin className="h-7 w-7 text-coral" />
            </div>
            <div className="flex-1">
              <p className="text-h4 font-semibold text-text-primary mb-3">주소</p>
              <div className="flex items-start justify-between gap-3 bg-surface rounded-xl p-4">
                <p className="text-body text-text-primary leading-relaxed flex-1">{content.address}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(content.address!, 'address')}
                  className="flex-shrink-0 min-h-[44px] min-w-[44px]"
                  aria-label="주소 복사"
                >
                  {copiedField === 'address' ? (
                    <Check className="h-5 w-5 text-success" />
                  ) : (
                    <Copy className="h-5 w-5 text-text-secondary" />
                  )}
                </Button>
              </div>
              {content.coordinates && (
                <p className="mt-3 text-body-sm text-tertiary">
                  좌표: {content.coordinates.lat.toFixed(6)}, {content.coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
