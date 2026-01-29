# Share Components

> 가이드북 공유 관련 컴포넌트

## 📦 컴포넌트 목록

### QR 코드 (P5-T5.2)

1. **QRCodeDisplay** - QR 코드 표시 및 간단한 다운로드
2. **QRCodeDownload** - 다양한 형식으로 QR 코드 다운로드

### 공유 기능 (P5-T5.3)

3. **ShareModal** - 공유 모달 (링크/QR/소셜)
4. **ShareLinkSection** - 링크 복사 섹션
5. **ShareQRSection** - QR 코드 섹션
6. **ShareSocialSection** - 소셜 미디어 공유 섹션

---

## 🎨 QRCodeDisplay

실시간 QR 코드를 표시하고 간단한 다운로드 기능을 제공합니다.

### Props

```typescript
interface QRCodeDisplayProps {
  url: string;              // QR 코드에 담을 URL (필수)
  size?: QRCodeSize;        // 'small' | 'medium' | 'large' (기본: 'medium')
  title?: string;           // 가이드북 제목
  showDownload?: boolean;   // 다운로드 버튼 표시 (기본: false)
  fgColor?: string;         // QR 코드 색상 (기본: '#000000')
  bgColor?: string;         // 배경 색상 (기본: '#ffffff')
  className?: string;       // 추가 CSS 클래스
}
```

### 사용 예시

```tsx
import { QRCodeDisplay } from '@/components/share';

<QRCodeDisplay
  url="https://roomy.app/g/my-guide"
  title="숙소 가이드북"
  size="medium"
  showDownload
/>
```

### 특징

- ✨ 실시간 QR 코드 렌더링
- 📏 3가지 크기 프리셋 (150/200/300px)
- 🎨 커스텀 색상 지원
- ⬇️ PNG 다운로드 버튼 (선택)
- 📱 반응형 레이아웃

---

## 📥 QRCodeDownload

다양한 형식으로 QR 코드를 다운로드할 수 있는 컴포넌트입니다.

### Props

```typescript
interface QRCodeDownloadProps {
  url: string;              // QR 코드에 담을 URL (필수)
  title: string;            // 가이드북 제목 (필수)
  slug: string;             // 가이드북 슬러그 (파일명으로 사용)
  size?: number;            // QR 코드 크기 (기본: 200)
  className?: string;       // 추가 CSS 클래스
}
```

### 사용 예시

```tsx
import { QRCodeDownload } from '@/components/share';

<QRCodeDownload
  url="https://roomy.app/g/my-guide"
  title="숙소 가이드북"
  slug="my-guide"
  size={200}
/>
```

### 다운로드 형식

| 형식 | 설명 | 파일명 |
|------|------|--------|
| PNG | 고해상도 이미지 (프린트용) | `roomy-qrcode-{slug}.png` |
| SVG | 벡터 이미지 (디자인용)* | `roomy-qrcode-{slug}.png` |
| PDF | 인쇄용 템플릿 (A4) | `roomy-qrcode-{slug}.pdf` |

*현재 SVG는 PNG로 fallback됩니다.

### 특징

- 📦 3가지 다운로드 형식
- 🖨️ 인쇄용 PDF 템플릿
- 💡 안내 텍스트 포함
- 🎨 그리드 레이아웃
- ⚡ 고해상도 렌더링 (2x)

---

## 📄 PDF 템플릿

QRCodeDownload의 PDF 다운로드는 다음과 같은 구조로 생성됩니다:

```
┌─────────────────────────────────┐
│                                 │
│       [가이드북 제목]            │
│            (20pt)               │
│                                 │
│        [QR 코드]                │
│        (80x80mm)                │
│                                 │
│     숙소 가이드북 보기           │
│            (14pt)               │
│                                 │
│   https://roomy.app/g/...       │
│            (10pt)               │
│                                 │
│     Powered by Roomy            │
│            (12pt)               │
│                                 │
└─────────────────────────────────┘
```

**용지:**
- A4 크기 (210 x 297 mm)
- 세로 방향 (portrait)

**용도:**
- 숙소 입구/거실에 부착
- 체크인 안내문에 포함
- 예약 확정 메일에 첨부

---

## 🎨 스타일 가이드

### 색상

```typescript
// 기본 QR 코드 (권장)
fgColor: '#000000'  // 검정
bgColor: '#ffffff'  // 흰색

// 브랜드 색상 (선택)
fgColor: '#1E40AF'  // 파란색
bgColor: '#DBEAFE'  // 연한 파란색
```

### 크기

```typescript
// QRCodeDisplay
size="small"   // 150px (작은 화면)
size="medium"  // 200px (일반적)
size="large"   // 300px (프린트용)

// QRCodeDownload
size={200}     // 일반적
size={400}     // 고해상도
```

---

## 🧪 테스트

### QRCodeDisplay 테스트

```bash
npm test src/__tests__/components/qr-code-display.test.tsx
```

**테스트 케이스:**
- 기본 렌더링
- 제목 표시
- 다운로드 버튼 표시/숨김
- QR 코드 캔버스 렌더링
- 커스텀 크기 적용

### QRCodeDownload 테스트

```bash
npm test src/__tests__/components/qr-code-download.test.tsx
```

**테스트 케이스:**
- 기본 렌더링
- PNG/SVG/PDF 버튼 표시
- 안내 텍스트 표시
- 숨겨진 캔버스 존재

---

## 📖 관련 문서

- [QR Code Library README](../../../lib/qrcode/README.md)
- [API Route: /api/qrcode](../../../app/api/qrcode/route.ts)
- [Demo Page: /demo/qrcode](../../../app/demo/qrcode/page.tsx)

---

## 🔄 향후 개선

1. **SVG 직접 지원**: 현재 PNG fallback → 순수 SVG 다운로드
2. **로고 오버레이**: QR 코드 중앙에 Roomy 로고 추가
3. **프레임 스타일**: 다양한 프레임/패턴 옵션
4. **벌크 다운로드**: 여러 가이드북 QR 한 번에 생성
