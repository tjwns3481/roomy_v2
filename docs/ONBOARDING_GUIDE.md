# Roomy 온보딩 가이드

이 문서는 Roomy 사용자를 위한 온보딩 흐름과 각 컴포넌트의 사용 방법을 설명합니다.

## 목차

1. [온보딩 개요](#온보딩-개요)
2. [WelcomeModal 컴포넌트](#welcomemodal-컴포넌트)
3. [FeatureTour 컴포넌트](#featuretour-컴포넌트)
4. [도움말 페이지](#도움말-페이지)
5. [구현 가이드](#구현-가이드)
6. [베스트 프랙티스](#베스트-프랙티스)

## 온보딩 개요

온보딩은 새로운 사용자가 Roomy를 쉽게 시작할 수 있도록 도와주는 일련의 상호작용입니다.

### 온보딩 흐름

```
사용자 회원가입
    ↓
[WelcomeModal] 3단계 튜토리얼
    ↓
대시보드 진입
    ↓
[FeatureTour] 대시보드 투어 (선택사항)
    ↓
첫 가이드북 생성
    ↓
[FeatureTour] 에디터 투어 (선택사항)
    ↓
가이드북 완성 & 공유
    ↓
[Help] 도움말 페이지 링크
```

### 온보딩 목표

1. **사용자 교육**: Roomy의 주요 기능 소개
2. **행동 유도**: 첫 가이드북 생성 유도
3. **자신감 구축**: 기본 워크플로우 이해
4. **지속 사용 유도**: 통계, 고급 기능 활용

## WelcomeModal 컴포넌트

환영 모달은 첫 로그인 시 표시되는 3단계 튜토리얼입니다.

### 특징

- **3단계 구성**: Roomy 소개 → 주요 기능 → 시작하기
- **건너뛰기 옵션**: 사용자가 언제든 건너뛸 수 있음
- **localStorage 저장**: 다시 표시하지 않도록 설정 가능
- **반응형 디자인**: 모바일/데스크톱 모두 지원

### 사용 방법

#### 기본 사용

```typescript
import { WelcomeModal } from '@/components/onboarding';

export default function DashboardLayout() {
  return (
    <div>
      <WelcomeModal />
      {/* 나머지 컨텐츠 */}
    </div>
  );
}
```

#### 제어되는 모달

```typescript
'use client';

import { useState } from 'react';
import { WelcomeModal } from '@/components/onboarding';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [showWelcome, setShowWelcome] = useState(false);

  return (
    <div>
      <Button onClick={() => setShowWelcome(true)}>
        환영 모달 다시 보기
      </Button>

      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
    </div>
  );
}
```

### 커스터마이징

모달의 스텝을 커스터마이징하려면 `WelcomeModal.tsx`의 `steps` 배열을 수정합니다:

```typescript
const steps: Step[] = [
  {
    id: 1,
    title: '사용자 정의 제목',
    description: '설명',
    icon: <CustomIcon />,
    details: [
      '상세 내용 1',
      '상세 내용 2',
    ],
  },
  // ...
];
```

## FeatureTour 컴포넌트

기능 투어는 특정 UI 요소를 강조하며 단계별로 가이드합니다.

### 특징

- **UI 요소 강조**: 투어 대상 요소를 하이라이트
- **스마트 위치 지정**: 툴팁 위치 자동 계산
- **진행 추적**: 진행 바로 현재 단계 표시
- **localStorage 저장**: 완료된 투어 기억

### 사용 방법

#### 대시보드 투어

```typescript
import { FeatureTour, dashboardTourSteps } from '@/components/onboarding';

export default function DashboardLayout() {
  return (
    <>
      <FeatureTour
        steps={dashboardTourSteps}
        tourId="dashboard-tour"
        autoStart={true}
        onComplete={() => console.log('투어 완료')}
      />

      <div>
        <button data-tour-target="new-guidebook-button">
          새 가이드북
        </button>
        {/* 다른 요소들 */}
      </div>
    </>
  );
}
```

#### 에디터 투어

```typescript
import { FeatureTour, editorTourSteps } from '@/components/onboarding';

export default function EditorPage() {
  return (
    <>
      <FeatureTour
        steps={editorTourSteps}
        tourId="editor-tour"
        autoStart={true}
      />

      <div>
        {/* 에디터 UI */}
        <button data-tour-target="add-block-button">+ 블록 추가</button>
      </div>
    </>
  );
}
```

### 커스텀 투어 생성

```typescript
import { FeatureTour, type TourStep } from '@/components/onboarding';

const customTourSteps: TourStep[] = [
  {
    id: 'step-1',
    title: '첫 번째 단계',
    description: '이것이 첫 번째 단계입니다',
    target: '[data-tour-target="element-1"]',
    position: 'bottom', // 'top', 'bottom', 'left', 'right'
  },
  {
    id: 'step-2',
    title: '두 번째 단계',
    description: '이것이 두 번째 단계입니다',
    target: '[data-tour-target="element-2"]',
    position: 'right',
  },
  // ...
];

export default function CustomPage() {
  return (
    <>
      <FeatureTour
        steps={customTourSteps}
        tourId="custom-tour"
        autoStart={false}
      />
      {/* UI 요소들 */}
    </>
  );
}
```

### HTML 속성 설정

투어가 작동하려면 HTML 요소에 `data-tour-target` 속성을 추가합니다:

```html
<!-- 대시보드 -->
<button data-tour-target="new-guidebook-button">새 가이드북</button>
<div data-tour-target="guidebook-list">가이드북 목록</div>
<a data-tour-target="stats-link">통계</a>
<a data-tour-target="settings-link">설정</a>

<!-- 에디터 -->
<button data-tour-target="add-block-button">+ 블록 추가</button>
<div data-tour-target="block-list">블록 목록</div>
<div data-tour-target="preview-panel">미리보기</div>
<button data-tour-target="save-button">저장</button>
```

## 도움말 페이지

도움말 페이지(`/help`)는 포괄적인 FAQ와 리소스를 제공합니다.

### 주요 내용

- **FAQ**: 카테고리별 자주 묻는 질문
  - 시작하기
  - 에디터 & 블록
  - AI 기능
  - 플랜 & 결제
  - 통계 & 분석
  - 트러블슈팅

- **빠른 연락**: 3가지 지원 채널
  - 이메일: support@roomy.example.com
  - 실시간 채팅
  - 커뮤니티

- **추가 리소스**: 문서 및 API 문서 링크

### 헤더에 도움말 링크 추가

```typescript
// src/components/layout/Header.tsx
import Link from 'next/link';

export function Header() {
  return (
    <header>
      {/* ... */}
      <nav>
        <Link href="/help">도움말</Link>
      </nav>
    </header>
  );
}
```

### 컨텍스트 기반 도움말

특정 기능에서 도움말로 연결:

```typescript
// src/app/(host)/editor/[id]/page.tsx
<a
  href="/help?category=에디터 & 블록"
  target="_blank"
  className="text-blue-500 hover:text-blue-600"
>
  도움이 필요하신가요?
</a>
```

## 구현 가이드

### 1단계: 기본 구조 설정

레이아웃에 온보딩 컴포넌트 추가:

```typescript
// src/app/(host)/layout.tsx
import { WelcomeModal, FeatureTour, dashboardTourSteps } from '@/components/onboarding';

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WelcomeModal />
      <FeatureTour steps={dashboardTourSteps} tourId="dashboard-tour" autoStart={true} />
      {children}
    </>
  );
}
```

### 2단계: HTML 속성 추가

각 페이지에서 투어 대상 요소에 속성 추가:

```typescript
// src/app/(host)/dashboard/page.tsx
export default function Dashboard() {
  return (
    <div>
      <button data-tour-target="new-guidebook-button">새 가이드북</button>
      <div data-tour-target="guidebook-list">
        {/* 가이드북 목록 */}
      </div>
    </div>
  );
}
```

### 3단계: 커스텀 투어 구성 (선택)

특정 페이지용 커스텀 투어 생성:

```typescript
// src/components/onboarding/custom-tours.ts
import type { TourStep } from './FeatureTour';

export const settingsTourSteps: TourStep[] = [
  {
    id: 'profile',
    title: '프로필 설정',
    description: '프로필 정보를 관리하세요',
    target: '[data-tour-target="profile-section"]',
    position: 'bottom',
  },
  // ...
];
```

### 4단계: 분석 연동 (선택)

온보딩 이벤트 추적:

```typescript
import { logEvent } from '@/lib/analytics';

function WelcomeModal() {
  const handleStepComplete = (stepId: string) => {
    logEvent('onboarding_step_complete', { step: stepId });
  };

  const handleComplete = () => {
    logEvent('onboarding_complete');
  };

  // ...
}
```

## 베스트 프랙티스

### 타이밍

- **WelcomeModal**: 첫 로그인 직후
- **Dashboard Tour**: WelcomeModal 완료 후, 선택사항
- **Editor Tour**: 첫 가이드북 생성 후 에디터 진입 시

### 사용자 경험

1. **선택성**: 모든 투어는 건너뛸 수 있어야 함
2. **비침해성**: 오버레이는 어둡지 않게 유지
3. **명확성**: 단계별 설명은 간결하고 명확해야 함
4. **시각성**: 강조 요소는 충분히 눈에 띄어야 함

### 성능

```typescript
// 투어 로드 방지
const FeatureTourLazy = dynamic(
  () => import('@/components/onboarding').then(m => m.FeatureTour),
  { ssr: false }
);
```

### 접근성

```typescript
// 스크린 리더 지원
<button
  aria-label="투어 건너뛰기"
  onClick={handleSkip}
>
  건너뛰기
</button>

// 키보드 네비게이션
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') handleNext();
  if (e.key === 'ArrowLeft') handlePrevious();
  if (e.key === 'Escape') handleSkip();
};
```

### 반복 방지

```typescript
// localStorage로 완료 기록
localStorage.setItem(`${tourId}_completed`, 'true');
localStorage.setItem(`${tourId}_skipped`, 'true');

// 조건부 렌더링
{!localStorage.getItem('dashboard-tour_completed') && <FeatureTour />}
```

## 모니터링

### 추적할 이벤트

```
- onboarding_modal_shown
- onboarding_modal_step_1_viewed
- onboarding_modal_step_2_viewed
- onboarding_modal_step_3_viewed
- onboarding_modal_completed
- onboarding_modal_skipped

- dashboard_tour_started
- dashboard_tour_step_X_viewed
- dashboard_tour_completed
- dashboard_tour_skipped

- first_guidebook_created
- editor_tour_started
- editor_tour_completed
```

### 분석 대시보드

```
완료율 = (완료 수) / (시작 수) × 100%
중단율 = (건너뛴 수) / (시작 수) × 100%
완료 시간 = 평균 시간
```

---

**팁**: 정기적으로 사용자 피드백을 수집하여 온보딩 흐름을 개선하세요.
