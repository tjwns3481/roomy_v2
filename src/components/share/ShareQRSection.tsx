// @TASK P5-T5.3 - QR 코드 섹션
// @SPEC docs/planning/06-tasks.md#p5-t53

'use client';

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface ShareQRSectionProps {
  url: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  onSizeChange: (size: 'small' | 'medium' | 'large') => void;
  /** @TASK P5-T5.5 - QR 다운로드 시 이벤트 추적 콜백 */
  onDownload?: () => void;
}

const QR_SIZES = {
  small: 128,
  medium: 192,
  large: 256,
} as const;

export function ShareQRSection({
  url,
  title,
  size,
  onSizeChange,
  onDownload,
}: ShareQRSectionProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    try {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) {
        throw new Error('QR 코드를 찾을 수 없습니다');
      }

      // SVG를 Canvas로 변환
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas를 생성할 수 없습니다');
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        // PNG 다운로드
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${title}-qr-code.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
            toast.success('PNG 파일이 다운로드되었습니다');

            // @TASK P5-T5.5 - 이벤트 추적
            onDownload?.();
          }
        });
      };

      img.src = url;
    } catch (error) {
      console.error('PNG download error:', error);
      toast.error('PNG 다운로드에 실패했습니다');
    }
  };

  const handleDownloadSVG = () => {
    try {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) {
        throw new Error('QR 코드를 찾을 수 없습니다');
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}-qr-code.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('SVG 파일이 다운로드되었습니다');

      // @TASK P5-T5.5 - 이벤트 추적
      onDownload?.();
    } catch (error) {
      console.error('SVG download error:', error);
      toast.error('SVG 다운로드에 실패했습니다');
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-900">QR 코드</Label>

      {/* QR 코드 미리보기 */}
      <div className="flex justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div ref={qrRef}>
          <QRCodeSVG
            value={url}
            size={QR_SIZES[size]}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
      </div>

      {/* 크기 선택 */}
      <div>
        <Label className="text-sm text-gray-700 mb-2 block">크기 선택</Label>
        <RadioGroup value={size} onValueChange={onSizeChange}>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small" id="size-small" />
              <Label htmlFor="size-small" className="cursor-pointer">
                작음
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="size-medium" />
              <Label htmlFor="size-medium" className="cursor-pointer">
                중간
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="size-large" />
              <Label htmlFor="size-large" className="cursor-pointer">
                큼
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* 다운로드 버튼 */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
          <Download className="w-4 h-4 mr-2" />
          PNG 다운로드
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadSVG}>
          <Download className="w-4 h-4 mr-2" />
          SVG 다운로드
        </Button>
      </div>
    </div>
  );
}
