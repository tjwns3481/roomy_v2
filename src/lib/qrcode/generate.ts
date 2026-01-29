// @TASK P5-T5.2 - QR 코드 생성 유틸리티
// @SPEC docs/planning/06-tasks.md#P5-T5.2

import { QRCodeOptions } from './types';

/**
 * QR 코드를 캔버스로 렌더링하여 다운로드 가능한 형태로 변환
 */
export async function downloadQRCode(
  canvas: HTMLCanvasElement | null,
  filename: string,
  format: 'png' | 'svg' = 'png'
): Promise<void> {
  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  if (format === 'png') {
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // SVG 다운로드는 현재 qrcode.react가 Canvas 기반이므로 PNG로 fallback
    console.warn('SVG format not directly supported, falling back to PNG');
    await downloadQRCode(canvas, filename, 'png');
  }
}

/**
 * 인쇄용 PDF 생성 (QR 코드 + 안내문)
 */
export async function generatePrintablePDF(
  canvas: HTMLCanvasElement | null,
  guideTitle: string,
  guideUrl: string,
  filename: string
): Promise<void> {
  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  // 동적으로 jsPDF import
  const { jsPDF } = await import('jspdf');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // A4 크기 (210 x 297 mm)
  const pageWidth = 210;
  const pageHeight = 297;

  // QR 코드 이미지 추가 (중앙 정렬)
  const qrSize = 80; // mm
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = 60;

  const qrDataUrl = canvas.toDataURL('image/png');
  pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // 타이틀 추가
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(guideTitle, pageWidth / 2, 40, { align: 'center' });

  // 안내문 추가
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('숙소 가이드북 보기', pageWidth / 2, qrY + qrSize + 15, {
    align: 'center',
  });

  // URL 추가
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text(guideUrl, pageWidth / 2, qrY + qrSize + 25, { align: 'center' });

  // Powered by Roomy
  pdf.setFontSize(12);
  pdf.setTextColor(150);
  pdf.text('Powered by Roomy', pageWidth / 2, qrY + qrSize + 40, {
    align: 'center',
  });

  // PDF 다운로드
  pdf.save(`${filename}.pdf`);
}

/**
 * QR 코드 기본 옵션 생성
 */
export function createQRCodeOptions(
  size: number,
  customOptions?: Partial<QRCodeOptions>
): QRCodeOptions {
  return {
    size,
    fgColor: '#000000',
    bgColor: '#ffffff',
    includeMargin: true,
    level: 'M',
    ...customOptions,
  };
}
