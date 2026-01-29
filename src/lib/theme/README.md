# 테마 시스템 (Theme System)

> @TASK P2-T2.6 - 5종 테마 프리셋 시스템

## 개요

Roomy 게스트 가이드북에서 사용하는 테마 시스템입니다. 호스트가 숙소 스타일에 맞는 테마를 선택하면, 게스트 뷰어에서 해당 테마가 적용됩니다.

## 테마 프리셋 (5종)

| 테마 | 이름 | 적합한 숙소 | Primary | Background | Font |
|------|------|-------------|---------|------------|------|
| `modern` | 모던 | 도심형 숙소, 비즈니스 호텔 | `#3B82F6` | `#FFFFFF` | Pretendard |
| `cozy` | 따뜻한 | 펜션, 게스트하우스 | `#F59E0B` | `#FFFBEB` | Noto Sans KR |
| `minimal` | 미니멀 | 디자이너 숙소, 갤러리 공간 | `#6B7280` | `#F9FAFB` | Inter |
| `nature` | 자연 | 전원형 숙소, 캠핑장, 리조트 | `#10B981` | `#ECFDF5` | Noto Sans KR |
| `luxury` | 럭셔리 | 부티크 호텔, 프리미엄 숙소 | `#1F2937` | `#FAFAF9` | Cormorant Garamond |

## 사용 방법

### 1. 게스트 뷰어에서 테마 적용

```tsx
// app/(guest)/g/[slug]/page.tsx
import { ThemeWrapper } from '@/components/guest/ThemeWrapper';
import { getGuidebook } from '@/lib/api/guidebook';

export default async function GuestPage({ params }: { params: { slug: string } }) {
  const guidebook = await getGuidebook(params.slug);

  return (
    <ThemeWrapper themeName={guidebook.theme}>
      <GuestContent guidebook={guidebook} />
    </ThemeWrapper>
  );
}
```

### 2. 에디터에서 테마 선택

```tsx
// components/editor/SettingsPanel.tsx
import { ThemeSelector } from '@/components/editor/ThemeSelector';
import { useState } from 'react';
import { ThemeName } from '@/lib/theme/types';

function SettingsPanel() {
  const [theme, setTheme] = useState<ThemeName>('modern');

  const handleSave = async () => {
    await updateGuidebook({ theme });
  };

  return (
    <div>
      <ThemeSelector
        selectedTheme={theme}
        onThemeChange={setTheme}
      />
      <button onClick={handleSave}>저장</button>
    </div>
  );
}
```

### 3. CSS 변수 활용

테마가 적용되면 다음 CSS 변수를 사용할 수 있습니다:

```css
/* 색상 변수 */
var(--theme-primary)      /* 주요 색상 */
var(--theme-background)   /* 배경 색상 */
var(--theme-text)         /* 텍스트 색상 */
var(--theme-accent)       /* 강조 색상 */
var(--theme-font-family)  /* 폰트 패밀리 */
```

#### CSS 클래스 사용 예시

```tsx
// Primary 색상 적용
<h1 className="theme-primary">제목</h1>
<button className="theme-bg-primary">버튼</button>

// Accent 색상 적용
<span className="theme-accent">강조</span>
<div className="theme-border-accent">카드</div>

// 조합 사용
<div className="theme-card theme-border-primary">
  <h2 className="theme-primary">카드 제목</h2>
  <p className="theme-text">카드 내용</p>
</div>
```

## 파일 구조

```
src/lib/theme/
├── index.ts               # 배럴 파일
├── types.ts               # 타입 정의
├── presets.ts             # 5종 테마 프리셋
├── ThemeProvider.tsx      # 테마 Provider 컴포넌트
└── README.md              # 이 파일

src/components/
├── guest/
│   └── ThemeWrapper.tsx   # 게스트 뷰 테마 래퍼
└── editor/
    └── ThemeSelector.tsx  # 에디터 테마 선택기
```

## API 참조

### ThemeProvider

```tsx
interface ThemeProviderProps {
  theme: ThemePreset;
  children: ReactNode;
}
```

CSS 변수를 통해 테마를 적용하는 Provider 컴포넌트.

### ThemeWrapper

```tsx
interface ThemeWrapperProps {
  themeName?: ThemeName;
  children: ReactNode;
}
```

게스트 뷰에서 사용하는 테마 래퍼 컴포넌트. `themeName`을 받아 자동으로 테마를 적용합니다.

### ThemeSelector

```tsx
interface ThemeSelectorProps {
  selectedTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}
```

에디터에서 사용하는 테마 선택 UI 컴포넌트.

### getThemePreset()

```tsx
function getThemePreset(themeName: ThemeName): ThemePreset
```

테마 이름으로 테마 프리셋 객체를 가져옵니다.

## 데모

테마 시스템 데모 페이지: `/demo/theme`

- 5종 테마 실시간 전환
- 각 테마별 색상 미리보기
- 버튼, 카드, 텍스트 스타일 예시

## 커스터마이징

### 새 테마 추가

```typescript
// src/lib/theme/presets.ts
export const THEME_PRESETS: Record<ThemeName, ThemePreset> = {
  // 기존 테마들...
  custom: {
    name: '커스텀',
    primary: '#FF6B6B',
    background: '#FFFEF9',
    text: '#2C2C2C',
    accent: '#FFD93D',
    fontFamily: 'Poppins, sans-serif',
  },
};
```

### CSS 커스터마이징

```css
/* src/app/globals.css */
.theme-root {
  /* 추가 스타일 */
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

.theme-custom-button {
  background-color: var(--theme-primary);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
}
```

## 테스트

```bash
# 타입 체크
npx tsc --noEmit

# 빌드 테스트
npm run build

# 개발 서버
npm run dev

# 데모 페이지 접속
# http://localhost:3000/demo/theme
```

## 관련 문서

- [디자인 시스템](../../../docs/DESIGN_SYSTEM.md)
- [User Flow](../../../docs/planning/03-user-flow.md)
- [Tasks](../../../TASKS.md)

## 변경 이력

- **2026-01-28**: 초기 구현 (P2-T2.6)
  - 5종 테마 프리셋 정의
  - ThemeProvider, ThemeWrapper 구현
  - ThemeSelector UI 컴포넌트
  - 데모 페이지 생성
