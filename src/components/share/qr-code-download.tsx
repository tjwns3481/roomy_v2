// @TASK P5-T5.2 - QR 코드 다운로드 컴포넌트
// @SPEC docs/planning/06-tasks.md#P5-T5.2

'use client';

import { Download, FileImage, FileText } from 'lucide-react';
import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { generatePrintablePDF, QR_CODE_SIZES } from '@/lib/qrcode';
import { cn } from '@/lib/utils';

export interface QRCodeDownloadProps {
  /** QR 코드에 담을 URL */
  url: string;
  /** 가이드북 제목 */
  title: string;
  /** 가이드북 슬러그 (파일명으로 사용) */
  slug: string;
  /** QR 코드 크기 (기본: 200) */
  size?: number;
  /** 추가 CSS 클래스 */
  className?: string;
}

export function QRCodeDownload({
  url,
  title,
  slug,
  size = QR_CODE_SIZES.medium,
  className,
}: QRCodeDownloadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadPNG = async () => {
    setIsLoading(true);
    try {
      const canvas = document.getElementById(
        'qr-canvas-hidden'
      ) as HTMLCanvasElement;
      if (!canvas) throw new Error('QR Code canvas not found');

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `roomy-qrcode-${slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download PNG:', error);
      alert('PNG 다운로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSVG = async () => {
    setIsLoading(true);
    try {
      const canvas = document.getElementById(
        'qr-canvas-hidden'
      ) as HTMLCanvasElement;
      if (!canvas) throw new Error('QR Code canvas not found');

      // Canvas를 PNG로 변환 (SVG는 직접 지원하지 않음)
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `roomy-qrcode-${slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('SVG는 현재 지원하지 않습니다. PNG로 다운로드되었습니다.');
    } catch (error) {
      console.error('Failed to download SVG:', error);
      alert('SVG 다운로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      const canvas = document.getElementById(
        'qr-canvas-hidden'
      ) as HTMLCanvasElement;
      if (!canvas) throw new Error('QR Code canvas not found');

      await generatePrintablePDF(canvas, title, url, `roomy-qrcode-${slug}`);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('PDF 다운로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* 숨겨진 캔버스 (다운로드용) */}
      <div className="hidden">
        <QRCodeCanvas
          id="qr-canvas-hidden"
          value={url}
          size={size * 2} // 고해상도
          level="M"
          includeMargin
        />
      </div>

      {/* 다운로드 버튼 그룹 */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-700">다운로드 형식</p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {/* PNG 다운로드 */}
          <button
            onClick={handleDownloadPNG}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <FileImage className="h-4 w-4" />
            PNG (고해상도)
          </button>

          {/* SVG 다운로드 */}
          <button
            onClick={handleDownloadSVG}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <FileImage className="h-4 w-4" />
            SVG (벡터)
          </button>

          {/* PDF 다운로드 */}
          <button
            onClick={handleDownloadPDF}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            PDF (인쇄용)
          </button>
        </div>

        {isLoading && (
          <p className="text-center text-sm text-gray-500">다운로드 중...</p>
        )}
      </div>

      {/* 안내 텍스트 */}
      <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
        <p className="font-medium">💡 인쇄용 PDF란?</p>
        <p className="mt-1 text-xs">
          A4 크기에 QR 코드와 안내문이 포함된 파일입니다. 숙소에 프린트하여
          게시하세요.
        </p>
      </div>
    </div>
  );
}
