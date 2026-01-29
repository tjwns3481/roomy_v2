# Design System (Clean Modern)

> Roomy: 한국 숙박 시설을 위한 디지털 게스트 가이드북 SaaS 디자인 시스템

---

## MVP 캡슐

| # | 항목 | 내용 |
|---|------|------|
| 1 | 목표 | AI 가이드북 자동 생성 + 블록 에디터 MVP 완성 |
| 2 | 페르소나 | 펜션/에어비앤비 호스트 (반복 문의 줄이고 싶은) |
| 3 | 핵심 기능 | FEAT-1: AI 가이드북 생성 (에어비앤비 링크 → 한국어 가이드북) |
| 4 | 성공 지표 (노스스타) | MRR ₩500만원 (유료 구독자 ~122명) |
| 5 | 디자인 목표 | 깔끔하고 신뢰감 있는 SaaS 디자인 + 따뜻한 숙박 감성 |

---

## 1. 디자인 철학

### 1.1 디자인 원칙

| 원칙 | 설명 | 구현 방법 |
|------|------|----------|
| **Clean & Simple** | 깔끔하고 직관적인 UI | 여백 활용, 미니멀 요소 |
| **Warm & Welcoming** | 따뜻하고 환영하는 느낌 | 부드러운 컬러, 둥근 모서리 |
| **Professional** | 전문적이고 신뢰감 있는 | 일관된 타이포, 정돈된 레이아웃 |
| **Mobile-First** | 모바일 우선 설계 | 터치 친화적, 반응형 |

### 1.2 핵심 스타일 요소

```
┌─────────────────────────────────────────────────────┐
│  Roomy Design = Clean Cards + Soft Shadows + Warmth │
│                                                     │
│   ┌──────────────────────────────────┐              │
│   │                                  │              │
│   │   Card with subtle shadow        │              │
│   │   & rounded corners (12px)       │              │
│   │                                  │              │
│   └──────────────────────────────────┘              │
│        ↑                                            │
│   box-shadow: 0 4px 12px rgba(0,0,0,0.08)          │
│   border-radius: 12px                              │
└─────────────────────────────────────────────────────┘
```

### 1.3 참고 서비스 (무드보드)

| 서비스 | 참고할 점 | 참고하지 않을 점 |
|--------|----------|-----------------|
| **Touch Stay** | 3열 에디터 레이아웃, 블록 구조 | 영문 UI |
| **Notion** | 블록 에디터 UX, 드래그앤드롭 | 복잡한 기능 |
| **Airbnb** | 따뜻한 톤, 숙소 감성 | 과도한 애니메이션 |
| **Linear** | 깔끔한 SaaS 대시보드 | 차가운 느낌 |
| **Figma** | 에디터 UI, 실시간 미리보기 | - |

### 1.4 브랜드 키워드

```
Roomy = "호스트의 든든한 파트너"

- CLEAN (깔끔한)
- WARM (따뜻한)
- PROFESSIONAL (전문적인)
- EFFORTLESS (쉬운)
```

---

## 2. 컬러 팔레트

### 2.1 Primary 컬러

| 역할 | 컬러명 | Hex | 사용처 | 미리보기 |
|------|--------|-----|--------|----------|
| **Primary** | Roomy Blue | `#2563EB` | 주요 버튼, 링크, 브랜드 | 🟦 |
| **Primary Light** | Sky Blue | `#3B82F6` | 호버 상태 | 💙 |
| **Primary Dark** | Deep Blue | `#1D4ED8` | 액티브 상태 | 🔵 |

### 2.2 Secondary 컬러 (따뜻한 톤)

| 역할 | 컬러명 | Hex | 사용처 | 미리보기 |
|------|--------|-----|--------|----------|
| **Secondary** | Warm Coral | `#F97316` | CTA 강조, 배지 | 🧡 |
| **Accent** | Soft Amber | `#FBBF24` | 하이라이트, 별점 | 🟡 |
| **Tertiary** | Forest Green | `#059669` | 성공, 완료 상태 | 🟢 |

### 2.3 베이스 컬러

| 역할 | 컬러명 | Hex | 사용처 |
|------|--------|-----|--------|
| **Background** | Snow White | `#FAFAFA` | 전체 배경 |
| **Surface** | Pure White | `#FFFFFF` | 카드 배경 |
| **Surface Alt** | Warm Gray | `#F5F5F4` | 섹션 배경 |
| **Border** | Light Gray | `#E5E5E5` | 테두리 |
| **Border Dark** | Medium Gray | `#D4D4D4` | 강조 테두리 |

### 2.4 텍스트 컬러

| 역할 | 컬러명 | Hex | 사용처 |
|------|--------|-----|--------|
| **Text Primary** | Charcoal | `#171717` | 제목, 본문 |
| **Text Secondary** | Gray | `#525252` | 설명, 캡션 |
| **Text Tertiary** | Light Gray | `#A3A3A3` | 비활성, 플레이스홀더 |
| **Text Inverse** | White | `#FFFFFF` | 어두운 배경 위 |

### 2.5 피드백 컬러

| 상태 | 컬러명 | Hex | 배경 | 사용처 |
|------|--------|-----|------|--------|
| **Success** | Green | `#059669` | `#ECFDF5` | 성공, 완료 |
| **Error** | Red | `#DC2626` | `#FEF2F2` | 에러, 삭제 |
| **Warning** | Amber | `#D97706` | `#FFFBEB` | 경고, 주의 |
| **Info** | Blue | `#2563EB` | `#EFF6FF` | 안내, 정보 |

### 2.6 Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
        },
        secondary: {
          DEFAULT: '#F97316',
          light: '#FB923C',
        },
        accent: '#FBBF24',
        success: '#059669',
        error: '#DC2626',
        warning: '#D97706',
      },
    },
  },
}
```

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

| 용도 | 폰트 | Fallback | 비고 |
|------|------|----------|------|
| **한글** | Pretendard | Noto Sans KR, sans-serif | 가독성 우수 |
| **영문** | Inter | -apple-system, sans-serif | 숫자 가독성 |
| **숫자** | Roboto Mono | monospace | 고정폭 (통계) |

### 3.2 폰트 스케일

| 레벨 | 이름 | 크기 | 행간 | 용도 |
|------|------|------|------|------|
| H1 | Display | 36px | 44px | 페이지 제목 |
| H2 | Heading | 24px | 32px | 섹션 제목 |
| H3 | Subheading | 20px | 28px | 카드 제목 |
| H4 | Title | 16px | 24px | 소제목 |
| Body | Body | 14px | 22px | 본문 |
| Small | Caption | 12px | 18px | 캡션, 라벨 |
| XSmall | Tiny | 10px | 14px | 배지, 태그 |

### 3.3 폰트 웨이트

| 웨이트 | 값 | 용도 |
|--------|-----|------|
| Regular | 400 | 본문, 설명 |
| Medium | 500 | 버튼, 레이블 |
| Semibold | 600 | 제목, 강조 |
| Bold | 700 | 페이지 제목 |

### 3.4 Tailwind 설정

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    fontFamily: {
      sans: ['Pretendard', 'Inter', '-apple-system', 'sans-serif'],
      mono: ['Roboto Mono', 'monospace'],
    },
    fontSize: {
      'xs': ['12px', '18px'],
      'sm': ['14px', '22px'],
      'base': ['16px', '24px'],
      'lg': ['20px', '28px'],
      'xl': ['24px', '32px'],
      '2xl': ['36px', '44px'],
    },
  },
}
```

---

## 4. 스페이싱 & 레이아웃

### 4.1 스페이싱 스케일 (4px 기반)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `space-1` | 4px | 아이콘-텍스트 간격 |
| `space-2` | 8px | 인라인 요소 간격 |
| `space-3` | 12px | 작은 패딩 |
| `space-4` | 16px | 기본 패딩 |
| `space-6` | 24px | 카드 패딩 |
| `space-8` | 32px | 섹션 간격 |
| `space-12` | 48px | 큰 섹션 간격 |
| `space-16` | 64px | 페이지 간격 |

### 4.2 컨테이너 너비

| 크기 | 값 | 용도 |
|------|-----|------|
| `max-w-sm` | 384px | 모바일 모달 |
| `max-w-md` | 448px | 로그인 폼 |
| `max-w-lg` | 512px | 대화상자 |
| `max-w-2xl` | 672px | 게스트 뷰 (모바일) |
| `max-w-4xl` | 896px | 콘텐츠 영역 |
| `max-w-6xl` | 1152px | 대시보드 |
| `max-w-7xl` | 1280px | 에디터 전체 |

### 4.3 에디터 레이아웃 (3열)

```
┌──────────────────────────────────────────────────────────┐
│  Header (64px)                                           │
├────────┬─────────────────────────────────┬───────────────┤
│  TOC   │         Editor                  │   Preview     │
│ (240px)│        (flexible)               │   (375px)     │
│        │                                 │               │
│        │                                 │  [iPhone      │
│        │                                 │   Frame]      │
│        │                                 │               │
├────────┴─────────────────────────────────┴───────────────┤
│  (Mobile: Bottom Sheet)                                  │
└──────────────────────────────────────────────────────────┘
```

### 4.4 반응형 Breakpoints

| 이름 | 너비 | 용도 |
|------|------|------|
| `sm` | 640px | 대형 모바일 |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 소형 데스크탑 |
| `xl` | 1280px | 데스크탑 |
| `2xl` | 1536px | 대형 모니터 |

---

## 5. 컴포넌트 스타일

### 5.1 버튼

#### Primary Button
```css
.btn-primary {
  background-color: #2563EB;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.15s;
}
.btn-primary:hover {
  background-color: #1D4ED8;
}
.btn-primary:active {
  transform: scale(0.98);
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: white;
  color: #171717;
  border: 1px solid #E5E5E5;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
}
.btn-secondary:hover {
  background-color: #F5F5F4;
  border-color: #D4D4D4;
}
```

#### Button Sizes

| 크기 | 패딩 | 폰트 | 용도 |
|------|------|------|------|
| `sm` | 8px 16px | 12px | 인라인 액션 |
| `md` | 12px 24px | 14px | 일반 버튼 |
| `lg` | 16px 32px | 16px | CTA 버튼 |

### 5.2 카드

```css
.card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E5E5;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

### 5.3 입력 필드

```css
.input {
  background-color: white;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.15s;
}
.input:focus {
  border-color: #2563EB;
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.input::placeholder {
  color: #A3A3A3;
}
```

### 5.4 블록 컴포넌트 (에디터)

```css
.block {
  background-color: white;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: grab;
}
.block:hover {
  border-color: #2563EB;
}
.block.selected {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.block.dragging {
  opacity: 0.5;
  cursor: grabbing;
}
```

### 5.5 토스트/알림

```css
.toast {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.toast-success {
  background-color: #ECFDF5;
  color: #059669;
}
.toast-error {
  background-color: #FEF2F2;
  color: #DC2626;
}
```

---

## 6. 아이콘 시스템

### 6.1 아이콘 라이브러리

- **Primary**: Lucide React (경량, 일관된 스타일)
- **Secondary**: Heroicons (대체용)

### 6.2 아이콘 크기

| 크기 | 픽셀 | 용도 |
|------|------|------|
| `xs` | 16px | 인라인, 태그 |
| `sm` | 20px | 버튼 내부 |
| `md` | 24px | 일반 아이콘 |
| `lg` | 32px | 강조 아이콘 |
| `xl` | 48px | 빈 상태, 일러스트 |

### 6.3 블록 타입 아이콘

| 블록 | 아이콘 | Lucide 이름 |
|------|--------|-------------|
| Hero | 🖼️ | `Image` |
| QuickInfo | ⚡ | `Zap` |
| Amenities | 🛋️ | `Sofa` |
| Rules | 📋 | `ClipboardList` |
| Map | 📍 | `MapPin` |
| Gallery | 🎨 | `Images` |
| Notice | 📢 | `Megaphone` |
| Custom | ✏️ | `Pencil` |

### 6.4 핵심 정보 아이콘

| 항목 | 아이콘 | Lucide 이름 |
|------|--------|-------------|
| WiFi | 📶 | `Wifi` |
| 도어락 | 🚪 | `DoorOpen` |
| 체크인 | ⏰ | `Clock` |
| 전화 | 📞 | `Phone` |
| 주소 | 📍 | `MapPin` |
| 주차 | 🅿️ | `ParkingSquare` |

---

## 7. 모션 & 애니메이션

### 7.1 기본 원칙

- **Subtle & Purposeful**: 미묘하고 목적 있는 애니메이션
- **Fast**: 150ms ~ 300ms 사이 (빠른 피드백)
- **Easing**: ease-out (자연스러운 감속)

### 7.2 Transition 설정

```css
/* 기본 전환 */
.transition-default {
  transition: all 0.15s ease-out;
}

/* 버튼 호버 */
.transition-button {
  transition: background-color 0.15s ease-out,
              transform 0.1s ease-out;
}

/* 카드 호버 */
.transition-card {
  transition: box-shadow 0.2s ease-out,
              border-color 0.15s ease-out;
}

/* 모달 */
.transition-modal {
  transition: opacity 0.2s ease-out,
              transform 0.3s ease-out;
}
```

### 7.3 애니메이션 프리셋

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## 8. 게스트 뷰 특화 스타일

### 8.1 모바일 최적화

```css
/* 터치 타겟 최소 44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* 스크롤 스냅 */
.scroll-snap {
  scroll-snap-type: y mandatory;
}
.scroll-snap-item {
  scroll-snap-align: start;
}

/* Safe Area (노치 대응) */
.safe-area {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 8.2 핵심 정보 카드 (QuickInfo)

```css
.quick-info-card {
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border-radius: 16px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.quick-info-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}
.quick-info-icon {
  width: 40px;
  height: 40px;
  margin: 0 auto 8px;
  color: #2563EB;
}
.quick-info-value {
  font-size: 18px;
  font-weight: 600;
  color: #171717;
}
.quick-info-label {
  font-size: 12px;
  color: #525252;
}
```

### 8.3 하단 네비게이션 (모바일)

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #E5E5E5;
  display: flex;
  padding: 8px 16px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}
.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  color: #A3A3A3;
}
.bottom-nav-item.active {
  color: #2563EB;
}
```

---

## 9. 다크모드 (Phase 2)

### 9.1 컬러 매핑

| Light | Dark |
|-------|------|
| `#FAFAFA` (Background) | `#171717` |
| `#FFFFFF` (Surface) | `#262626` |
| `#E5E5E5` (Border) | `#404040` |
| `#171717` (Text) | `#F5F5F5` |
| `#525252` (Text Secondary) | `#A3A3A3` |

### 9.2 구현 방식

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}
```

---

## 10. 접근성

### 10.1 색상 대비

- 모든 텍스트: WCAG AA 기준 충족 (4.5:1 이상)
- Primary Blue on White: 4.6:1 ✅
- Text Primary on Background: 17.8:1 ✅

### 10.2 포커스 상태

```css
.focus-ring {
  outline: none;
}
.focus-ring:focus-visible {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.4);
}
```

### 10.3 스크린 리더

- 모든 아이콘에 `aria-label` 또는 숨김 텍스트
- 폼 필드에 `label` 연결 필수
- 에러 메시지 `role="alert"`

---

## Decision Log

- **Clean Modern 선택**: 숙박 서비스에 맞는 따뜻하고 신뢰감 있는 디자인
- **Pretendard 폰트**: 한글 가독성 최우선
- **Tailwind CSS**: 빠른 개발, 일관된 스타일
- **Lucide 아이콘**: 경량, MIT 라이선스
- **12px Border Radius**: 부드럽고 모던한 느낌
- **Blue Primary**: 전문성 + 신뢰감 (SaaS 표준)
