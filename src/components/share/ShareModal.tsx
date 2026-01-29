// @TASK P5-T5.3, P5-T5.5, P7-T7.8 - 공유 모달 UI (링크 + QR + SNS) + 이벤트 추적 + 동적 임포트
// @SPEC docs/planning/06-tasks.md#p5-t53

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ShareLinkSection } from './ShareLinkSection';
import { ShareSocialSection } from './ShareSocialSection';
import { Separator } from '@/components/ui/separator';
import { useTrackShare } from '@/hooks/useTrackShare';
import { Skeleton } from '@/components/ui/skeleton';

// @TASK P7-T7.8 - QR 코드 컴포넌트 동적 로딩 (qrcode.react 라이브러리 무거움)
const ShareQRSection = dynamic(() => import('./ShareQRSection').then(mod => ({ default: mod.ShareQRSection })), {
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-4 w-20" />
      <div className="flex justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <Skeleton className="h-48 w-48" />
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  ),
  ssr: false, // QR 코드는 클라이언트에서만 렌더링
});

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  guidebook: {
    id: string;
    title: string;
    slug: string;
    shortCode?: string;
  };
}

export function ShareModal({ isOpen, onClose, guidebook }: ShareModalProps) {
  const [qrSize, setQrSize] = useState<'small' | 'medium' | 'large'>('medium');

  // @TASK P5-T5.5 - 공유 이벤트 추적 훅
  const { trackLinkCopy, trackQrDownload, trackSocialShare } = useTrackShare(guidebook.id);

  const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.app'}/g/${guidebook.slug}`;
  const shortUrl = guidebook.shortCode
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.app'}/s/${guidebook.shortCode}`
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>공유하기</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 링크 복사 섹션 - 이벤트 추적 연동 */}
          <ShareLinkSection
            fullUrl={fullUrl}
            shortUrl={shortUrl}
            onCopy={trackLinkCopy}
          />

          <Separator />

          {/* QR 코드 섹션 - 이벤트 추적 연동 */}
          <ShareQRSection
            url={shortUrl || fullUrl}
            title={guidebook.title}
            size={qrSize}
            onSizeChange={setQrSize}
            onDownload={trackQrDownload}
          />

          <Separator />

          {/* SNS 공유 섹션 - 이벤트 추적 연동 */}
          <ShareSocialSection
            url={fullUrl}
            title={guidebook.title}
            onShare={trackSocialShare}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
