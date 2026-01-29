// @TASK P2-T2.4 - 게스트용 MapBlock (외부 지도 앱 연결)
// @SPEC docs/planning/06-tasks.md#P2-T2.4

'use client';

import { useState } from 'react';
import { MapContent } from '@/types/guidebook';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Copy, Check, Map as MapIcon } from 'lucide-react';
import {
  getKakaoMapLink,
  getNaverMapLink,
  getGoogleMapLink,
  copyAddressToClipboard,
} from '@/lib/map-utils';
import { toast } from 'sonner';

interface MapBlockProps {
  content: MapContent;
}

export function MapBlock({ content }: MapBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    const success = await copyAddressToClipboard(content.address);
    if (success) {
      setCopied(true);
      toast.success('주소가 복사되었습니다');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('주소 복사에 실패했습니다');
    }
  };

  const handleMapLinkClick = (
    provider: 'kakao' | 'naver' | 'google',
    e: React.MouseEvent
  ) => {
    const mapLinks = {
      kakao: getKakaoMapLink({
        lat: content.lat,
        lng: content.lng,
        address: content.address,
      }),
      naver: getNaverMapLink({
        lat: content.lat,
        lng: content.lng,
        address: content.address,
      }),
      google: getGoogleMapLink({
        lat: content.lat,
        lng: content.lng,
        address: content.address,
      }),
    };

    const link = mapLinks[provider];

    // 딥링크 시도 (모바일)
    if (link.startsWith('kakaomap://') || link.startsWith('nmap://')) {
      // 딥링크 시도
      window.location.href = link;

      // 2초 후에도 페이지에 있으면 (앱 미설치) 웹으로 폴백
      setTimeout(() => {
        // 웹 링크로 다시 생성 (isMobile false로 강제)
        if (provider === 'kakao' && content.lat && content.lng) {
          window.open(
            `https://map.kakao.com/link/map/${encodeURIComponent(content.address)},${content.lat},${content.lng}`,
            '_blank'
          );
        } else if (provider === 'naver' && content.lat && content.lng) {
          window.open(
            `https://map.naver.com/p/?c=${content.lng},${content.lat},15,0,0,0,dh&isCorrectAnswer=true`,
            '_blank'
          );
        }
      }, 2000);

      e.preventDefault();
      return;
    }

    // 일반 웹 링크
    window.open(link, '_blank');
    e.preventDefault();
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-4">
        {/* 제목 */}
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">위치</h3>
        </div>

        {/* 주소 */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-base leading-relaxed">{content.address}</p>
              {content.lat && content.lng && (
                <p className="text-sm text-muted-foreground mt-1">
                  {content.lat.toFixed(6)}, {content.lng.toFixed(6)}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAddress}
              className="shrink-0"
              aria-label="주소 복사"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  복사
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 지도 앱 버튼 */}
        <div className="space-y-3 pt-2">
          <p className="text-sm font-medium text-muted-foreground">지도에서 보기</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="w-full h-auto py-3 flex flex-col gap-1"
              onClick={(e) => handleMapLinkClick('kakao', e)}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-yellow-400 flex items-center justify-center text-xs font-bold">
                  K
                </div>
                <span className="font-medium">카카오맵</span>
              </div>
              <span className="text-xs text-muted-foreground">
                앱으로 열기
              </span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto py-3 flex flex-col gap-1"
              onClick={(e) => handleMapLinkClick('naver', e)}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center text-xs font-bold text-white">
                  N
                </div>
                <span className="font-medium">네이버 지도</span>
              </div>
              <span className="text-xs text-muted-foreground">
                앱으로 열기
              </span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto py-3 flex flex-col gap-1"
              onClick={(e) => handleMapLinkClick('google', e)}
            >
              <div className="flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-blue-500" />
                <span className="font-medium">구글 지도</span>
              </div>
              <span className="text-xs text-muted-foreground">
                웹으로 열기
              </span>
            </Button>
          </div>
        </div>

        {/* 주차 정보 (옵션) */}
        {content.parkingInfo && (
          <div className="pt-3 border-t">
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="shrink-0">
                주차
              </Badge>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content.parkingInfo}
              </p>
            </div>
          </div>
        )}

        {/* 좌표 없을 때 안내 */}
        {!content.lat || !content.lng ? (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground text-center">
              💡 정확한 위치는 지도 앱에서 주소를 검색해주세요
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
