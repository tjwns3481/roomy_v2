# 구독 및 결제 컴포넌트

**P6-T6.8: 무료 사용자를 위한 업그레이드 유도 배너**

Free 플랜 사용자에게 Pro 플랜 업그레이드를 유도하는 배너 컴포넌트 세트입니다.

---

## 📦 컴포넌트 목록

### 1. UpgradeBanner

Pro 플랜 업그레이드를 유도하는 메인 배너입니다.

#### Props

```typescript
interface UpgradeBannerProps {
  variant?: 'default' | 'compact' | 'sidebar';
  dismissable?: boolean;
  className?: string;
}
```

#### 사용 예시

```tsx
import { UpgradeBanner } from '@/components/subscription';

// 대시보드 상단 - 전체 배너, 닫기 가능
<UpgradeBanner variant="default" dismissable />

// 컴팩트 배너
<UpgradeBanner variant="compact" dismissable />

// 사이드바 - 항상 표시
<UpgradeBanner variant="sidebar" dismissable={false} />
```

#### Variants

| Variant | 설명 | 표시 위치 |
|---------|------|----------|
| `default` | 전체 너비 배너 | 대시보드 상단 |
| `compact` | 작은 배너 | 인라인 알림 |
| `sidebar` | 사이드바용 카드 | 사이드바 하단 |

---

### 2. LimitWarningBanner

플랜별 사용량 제한에 근접하거나 도달했을 때 표시되는 경고 배너입니다.

#### Props

```typescript
interface LimitWarningBannerProps {
  type: 'guidebooks' | 'ai';
  current: number;
  limit: number;
  className?: string;
}
```

#### 사용 예시

```tsx
import { LimitWarningBanner } from '@/components/subscription';
import { useSubscription } from '@/hooks/useSubscription';

function Dashboard() {
  const { usage, planLimits } = useSubscription();

  return (
    <div>
      {/* 가이드북 생성 제한 경고 */}
      <LimitWarningBanner
        type="guidebooks"
        current={usage.guidebooks}
        limit={planLimits.maxGuidebooks}
      />

      {/* AI 생성 제한 경고 */}
      <LimitWarningBanner
        type="ai"
        current={usage.aiGenerations}
        limit={planLimits.maxAiGenerationsPerMonth}
      />
    </div>
  );
}
```

#### 표시 조건

| 사용률 | 배너 타입 | 스타일 |
|--------|----------|--------|
| 0~79% | 표시 안 함 | - |
| 80~99% | 경고 (warning) | 노란색 |
| 100% | 제한 도달 (critical) | 빨간색 |

---

### 3. SidebarUpgradeBanner

사이드바 하단에 표시되는 업그레이드 배너입니다.

#### Props

```typescript
interface SidebarUpgradeBannerProps {
  className?: string;
}
```

#### 사용 예시

```tsx
import { SidebarUpgradeBanner } from '@/components/subscription';

function Sidebar() {
  return (
    <div className="sidebar">
      {/* 메뉴 아이템들 */}

      {/* 하단 업그레이드 배너 */}
      <SidebarUpgradeBanner />
    </div>
  );
}
```

---

## 🪝 훅

### useBannerDismiss

배너 닫기 상태를 관리하는 훅입니다.

#### 반환 값

```typescript
interface UseBannerDismissReturn {
  isDismissed: boolean;
  dismiss: () => void;
  reset: () => void;
}
```

#### 사용 예시

```tsx
import { useBannerDismiss } from '@/hooks/useBannerDismiss';

function CustomBanner() {
  const { isDismissed, dismiss } = useBannerDismiss();

  if (isDismissed) {
    return null;
  }

  return (
    <div>
      <p>배너 내용</p>
      <button onClick={dismiss}>닫기</button>
    </div>
  );
}
```

#### 동작 방식

1. **localStorage 저장**: 닫기 상태를 `roomy_upgrade_banner_dismissed` 키로 저장
2. **7일 만료**: 닫은 지 7일이 지나면 자동으로 다시 표시
3. **타임스탬프**: 닫은 시각을 함께 저장하여 만료 계산

---

## 📍 통합 위치

### 1. 대시보드 상단

```tsx
// src/app/(host)/dashboard/page.tsx
import { UpgradeBanner } from '@/components/subscription';

export default function DashboardPage() {
  return (
    <div>
      <UpgradeBanner className="mb-6" dismissable />
      {/* 대시보드 컨텐츠 */}
    </div>
  );
}
```

### 2. 사이드바 하단

```tsx
// src/components/dashboard/Sidebar.tsx
import { SidebarUpgradeBanner } from '@/components/subscription';

export default function Sidebar() {
  return (
    <div className="sidebar">
      {/* 메뉴 */}
      <SidebarUpgradeBanner />
    </div>
  );
}
```

### 3. 에디터 - 제한 경고

```tsx
// src/app/(host)/editor/[id]/page.tsx
import { LimitWarningBanner } from '@/components/subscription';
import { useSubscription } from '@/hooks/useSubscription';

export default function EditorPage() {
  const { usage, planLimits } = useSubscription();

  return (
    <div>
      <LimitWarningBanner
        type="guidebooks"
        current={usage.guidebooks}
        limit={planLimits.maxGuidebooks}
      />
      {/* 에디터 */}
    </div>
  );
}
```

### 4. AI 생성 모달

```tsx
// src/components/ai/GenerateModal.tsx
import { LimitWarningBanner } from '@/components/subscription';
import { useSubscription } from '@/hooks/useSubscription';

export default function GenerateModal() {
  const { usage, planLimits } = useSubscription();

  return (
    <div>
      <LimitWarningBanner
        type="ai"
        current={usage.aiGenerations}
        limit={planLimits.maxAiGenerationsPerMonth}
      />
      {/* AI 생성 폼 */}
    </div>
  );
}
```

---

## 🎨 디자인 시스템

### 색상

| 요소 | 색상 | 용도 |
|------|------|------|
| 배너 배경 | `bg-gradient-to-br from-primary/10 to-primary/5` | 부드러운 강조 |
| 테두리 | `border-primary/20` | 미묘한 구분 |
| 경고 (warning) | `bg-yellow-50 border-yellow-200` | 80~99% 사용 |
| 위험 (critical) | `bg-red-50 border-red-200` | 100% 도달 |

### 타이포그래피

| 요소 | 스타일 |
|------|--------|
| 제목 | `text-sm font-semibold text-gray-900` |
| 설명 | `text-xs text-gray-600` |
| 버튼 | `text-sm font-medium` |

---

## 🧪 테스트

### 테스트 실행

```bash
# 모든 테스트
npm test

# 배너 컴포넌트만
npm test src/components/subscription/__tests__/

# 훅 테스트
npm test src/hooks/__tests__/useBannerDismiss.test.ts
```

### 테스트 커버리지

- ✅ Free 플랜에서만 배너 표시
- ✅ Pro/Business 플랜에서 배너 숨김
- ✅ 닫기 버튼 동작
- ✅ localStorage 저장/복원
- ✅ 7일 후 자동 재표시
- ✅ 사용량 80% 미만 시 경고 배너 숨김
- ✅ 80~99% 사용 시 경고 배너 (노란색)
- ✅ 100% 도달 시 제한 배너 (빨간색)

---

## 📊 데모

데모 페이지에서 모든 배너 상태를 확인할 수 있습니다:

```bash
npm run dev
# 브라우저에서 http://localhost:3000/demo/subscription-banners 접속
```

### 데모 기능

1. **UpgradeBanner**: 3가지 variant 전환
2. **LimitWarningBanner**: 가이드북/AI 제한 시뮬레이션
3. **SidebarUpgradeBanner**: 사이드바 크기로 렌더링
4. **통합 시나리오**: 실제 사용 예시

---

## 🔧 커스터마이징

### 닫기 기간 변경

```typescript
// src/hooks/useBannerDismiss.ts
const DISMISS_DURATION_DAYS = 7; // 원하는 일수로 변경
```

### CTA 링크 변경

```tsx
// src/components/subscription/UpgradeBanner.tsx
<Link href="/settings/billing"> {/* 원하는 경로로 변경 */}
  업그레이드
</Link>
```

### 임계값 변경

```typescript
// src/components/subscription/LimitWarningBanner.tsx
function getBannerType(percentage: number) {
  if (percentage < 80) { // 80% → 원하는 값으로 변경
    return 'none';
  }
  // ...
}
```

---

## 📝 체크리스트

### 완료 기준

- [x] Free 플랜에서만 배너 표시
- [x] 닫기 기능 작동 (7일간 숨김)
- [x] 반응형 레이아웃
- [x] 업그레이드 링크 작동
- [x] 사용량 80% 이상 시 경고 배너
- [x] 사용량 100% 도달 시 제한 배너
- [x] 사이드바 배너 항상 표시
- [x] 모든 테스트 통과
- [x] 접근성 (ARIA, 키보드)

---

## 🐛 알려진 이슈

없음

---

## 📚 참고 문서

- [PRD](../../../docs/planning/01-prd.md#구독-플랜)
- [Database Design](../../../docs/planning/04-database-design.md#subscriptions)
- [Tasks](../../../docs/planning/06-tasks.md#P6-T6.8)
- [useSubscription](../../hooks/useSubscription.ts)
