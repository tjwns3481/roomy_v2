// @TASK P5-T5.2 - QR 코드 타입 정의
// @SPEC docs/planning/06-tasks.md#P5-T5.2

export type QRCodeSize = 'small' | 'medium' | 'large';

export type QRCodeFormat = 'png' | 'svg';

export interface QRCodeOptions {
  size: number;
  fgColor?: string;
  bgColor?: string;
  includeMargin?: boolean;
  level?: 'L' | 'M' | 'Q' | 'H';
}

export interface QRCodeDownloadOptions {
  format: QRCodeFormat;
  filename: string;
  size: number;
}

export const QR_CODE_SIZES: Record<QRCodeSize, number> = {
  small: 150,
  medium: 200,
  large: 300,
};
