# QR Code Library

> QR 코드 생성 및 다운로드 유틸리티

## 📦 설치된 패키지

- `qrcode.react`: React 컴포넌트용 QR 코드 렌더링
- `qrcode`: Node.js 서버용 QR 코드 생성
- `jspdf`: PDF 생성
- `html2canvas`: 캔버스 캡처

## 🎯 주요 기능

### 1. QR 코드 크기 프리셋

```typescript
import { QR_CODE_SIZES, type QRCodeSize } from '@/lib/qrcode';

const size: QRCodeSize = 'medium';
const pixels = QR_CODE_SIZES[size]; // 200
```

**사이즈:**
- `small`: 150px
- `medium`: 200px
- `large`: 300px

### 2. QR 코드 다운로드

```typescript
import { downloadQRCode } from '@/lib/qrcode';

// Canvas 요소를 PNG로 다운로드
await downloadQRCode(canvasElement, 'my-qrcode', 'png');
```

### 3. 인쇄용 PDF 생성

```typescript
import { generatePrintablePDF } from '@/lib/qrcode';

await generatePrintablePDF(
  canvasElement,
  'My Guide Title',
  'https://roomy.app/g/my-guide',
  'my-guide'
);
```

**PDF 레이아웃:**
- A4 크기 (210 x 297 mm)
- QR 코드: 80x80mm (중앙 정렬)
- 타이틀: 20pt, 볼드
- URL: 10pt, 그레이
- Powered by Roomy 워터마크

### 4. QR 코드 옵션 생성

```typescript
import { createQRCodeOptions } from '@/lib/qrcode';

const options = createQRCodeOptions(200, {
  fgColor: '#1E40AF',
  bgColor: '#DBEAFE',
  level: 'H',
});
```

**옵션:**
- `size`: 픽셀 크기
- `fgColor`: QR 코드 색상 (기본: #000000)
- `bgColor`: 배경 색상 (기본: #ffffff)
- `includeMargin`: 여백 포함 여부 (기본: true)
- `level`: 에러 정정 레벨 (L, M, Q, H)

## 🔧 타입 정의

### QRCodeSize

```typescript
type QRCodeSize = 'small' | 'medium' | 'large';
```

### QRCodeFormat

```typescript
type QRCodeFormat = 'png' | 'svg';
```

### QRCodeOptions

```typescript
interface QRCodeOptions {
  size: number;
  fgColor?: string;
  bgColor?: string;
  includeMargin?: boolean;
  level?: 'L' | 'M' | 'Q' | 'H';
}
```

### QRCodeDownloadOptions

```typescript
interface QRCodeDownloadOptions {
  format: QRCodeFormat;
  filename: string;
  size: number;
}
```

## 📚 사용 예시

### 컴포넌트에서 사용

```tsx
'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { QR_CODE_SIZES, downloadQRCode } from '@/lib/qrcode';

export function MyComponent() {
  const handleDownload = async () => {
    const canvas = document.querySelector('canvas');
    await downloadQRCode(canvas, 'my-qr', 'png');
  };

  return (
    <div>
      <QRCodeCanvas
        value="https://roomy.app/g/my-guide"
        size={QR_CODE_SIZES.medium}
      />
      <button onClick={handleDownload}>Download</button>
    </div>
  );
}
```

### API Route에서 사용

```typescript
import QRCode from 'qrcode';

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url');

  const buffer = await QRCode.toBuffer(url, {
    width: 200,
    margin: 2,
  });

  return new Response(buffer, {
    headers: { 'Content-Type': 'image/png' },
  });
}
```

## 🎨 에러 정정 레벨

| Level | 복원 가능 손상 비율 | 사용 권장 |
|-------|-------------------|----------|
| L (Low) | ~7% | 깨끗한 환경 |
| M (Medium) | ~15% | **일반적 사용** (권장) |
| Q (Quartile) | ~25% | 약간 손상 가능성 |
| H (High) | ~30% | 높은 손상 가능성 |

**참고:** 레벨이 높을수록 QR 코드가 복잡해집니다.

## 🚀 성능 최적화

1. **고해상도 다운로드**: `size * 2`로 캔버스 생성 후 다운로드
2. **캐싱**: API 응답에 `Cache-Control: max-age=31536000` 설정
3. **Edge Runtime**: API Route를 Edge에서 실행하여 응답 속도 향상

## 📖 참고 자료

- [QR Code Error Correction](https://www.qrcode.com/en/about/error_correction.html)
- [qrcode.react GitHub](https://github.com/zpao/qrcode.react)
- [node-qrcode GitHub](https://github.com/soldair/node-qrcode)
