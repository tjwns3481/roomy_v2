// @TASK P5-T5.2 - QR 코드 표시 컴포넌트
// @SPEC docs/planning/06-tasks.md#P5-T5.2

'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState } from 'react';
import { QR_CODE_SIZES, type QRCodeSize } from '@/lib/qrcode';
import { cn } from '@/lib/utils';

export interface QRCodeDisplayProps {
  /** QR 코드에 담을 URL */
  url: string;
  /** QR 코드 크기 (기본: medium) */
  size?: QRCodeSize;
  /** 가이드북 제목 (선택) */
  title?: string;
  /** 다운로드 버튼 표시 여부 */
  showDownload?: boolean;
  /** 커스텀 색상 (기본: 검정) */
  fgColor?: string;
  /** 배경 색상 (기본: 흰색) */
  bgColor?: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

export function QRCodeDisplay({
  url,
  size = 'medium',
  title,
  showDownload = false,
  fgColor = '#000000',
  bgColor = '#ffffff',
  className,
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const qrSize = QR_CODE_SIZES[size];

  const handleDownloadPNG = async () => {
    setIsLoading(true);
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) throw new Error('QR Code canvas not found');

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode-${title || 'guidebook'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      alert('QR 코드 다운로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      )}

      <div
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        style={{ backgroundColor: bgColor }}
      >
        <QRCodeCanvas
          value={url}
          size={qrSize}
          fgColor={fgColor}
          bgColor={bgColor}
          level="M"
          includeMargin
        />
      </div>

      {showDownload && (
        <button
          onClick={handleDownloadPNG}
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Downloading...' : 'Download PNG'}
        </button>
      )}

      <p className="text-center text-sm text-gray-500">{url}</p>
    </div>
  );
}
