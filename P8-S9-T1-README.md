# P8-S9-T1: 에디터 미리보기 개선

## 작업 내용

### 1. DeviceFrame 컴포넌트 생성
- **파일**: `src/components/editor/DeviceFrame.tsx`
- **기능**:
  - iPhone SE (375x667), iPhone 14 (390x844), iPad (768x1024) 프레임
  - 노치/다이나믹 아일랜드 표시 (iPhone 14)
  - 상태바 (시간, WiFi, 배터리 아이콘)
  - 홈 인디케이터
  - 라이트/다크 모드 지원
  - 부드러운 곡선 프레임 (`border-radius`)

### 2. PreviewPanel 컴포넌트 개선
- **파일**: `src/components/editor/PreviewPanel.tsx`
- **기능**:
  - 디바이스 크기 선택 버튼 (iPhone SE, iPhone 14, iPad)
  - 라이트/다크 모드 토글
  - 실시간 블록 렌더링 (게스트 뷰어와 동일한 Preview 컴포넌트 사용)
  - 선택된 블록 하이라이트 (`ring-2`, `outline`)
  - 빈 상태 표시 (블록 없을 때)
  - 접근성: `role="button"`, `tabIndex`, `onKeyDown`

### 3. EditorLayout 통합
- **파일**: `src/components/editor/EditorLayout.tsx`
- **수정**:
  - 기존 간단한 iPhone 프레임 제거
  - 새로운 `PreviewPanel` 컴포넌트로 교체
  - `selectedBlockId`, `setSelectedBlockId` props 전달

### 4. 테스트 작성
- **파일**: `tests/components/editor/PreviewPanel.test.tsx`
- **테스트 케이스**:
  - 디바이스 크기 선택 버튼 렌더링
  - 디바이스 크기 변경 시 프레임 크기 변경
  - 라이트/다크 모드 토글
  - 노치 표시 (iPhone만)
  - 선택된 블록 하이라이트
  - 블록 클릭 시 `onBlockSelect` 호출
  - 빈 상태 메시지 표시
  - 상태바, 홈 인디케이터 표시

## 주요 개선 사항

### 1. 실제 게스트 뷰어 렌더링
- 기존: 단순한 블록 제목만 표시
- 개선: `HeroPreview`, `QuickInfoPreview` 등 실제 Preview 컴포넌트 사용
- 에디터 변경 → 미리보기 실시간 반영

### 2. 디바이스 크기별 미리보기
- iPhone SE (375px): 작은 화면 테스트
- iPhone 14 (390px): 최신 iPhone 기본 크기
- iPad (768px): 태블릿 레이아웃 확인

### 3. 다크 모드 지원
- 토글 버튼으로 라이트/다크 전환
- `DeviceFrame`에 `isDarkMode` prop 전달
- 배경색, 텍스트 색상 자동 변경

### 4. 향상된 UX
- **선택 피드백**: `ring-2` + `outline` 이중 하이라이트
- **접근성**: 키보드 네비게이션 (Enter, Space)
- **상태 표시**: 시간, WiFi, 배터리 아이콘
- **빈 상태**: 블록 없을 때 안내 메시지

## 디자인 시스템 준수

### 컬러
- Primary: `#2563EB` (버튼, 하이라이트)
- Border: `#E5E7EB` (프레임 테두리)
- 다크 모드: `bg-gray-900`, `text-white`

### 간격
- 컨트롤 바: `px-4 py-3`
- 버튼 간격: `gap-2`
- 프레임 패딩: `p-6`

### Border Radius
- 디바이스 프레임: `40px` (iPhone SE), `48px` (iPhone 14), `24px` (iPad)
- 버튼: `rounded-lg` (기본)

## 의존성

- 기존 Preview 컴포넌트:
  - `HeroPreview`
  - `QuickInfoPreview`
  - `RulesPreview`
  - `AmenitiesPreview`
  - `MapPreview`
  - `GalleryPreview`
  - `NoticePreview`
- lucide-react 아이콘:
  - `SmartphoneIcon`, `TabletIcon`, `MonitorIcon`
  - `MoonIcon`, `SunIcon`
  - `WifiIcon`, `BatteryFullIcon`

## 사용 방법

```tsx
import { PreviewPanel } from '@/components/editor/PreviewPanel';

<PreviewPanel
  blocks={blocks}
  selectedBlockId={selectedBlockId}
  onBlockSelect={setSelectedBlockId}
/>
```

## AC (Acceptance Criteria) 달성

- [x] 게스트 뷰어와 동일한 UI 미리보기
- [x] 디바이스 크기별 정확한 표시 (iPhone SE, iPhone 14, iPad)
- [x] 에디터와 실시간 동기화
- [x] 노치/다이나믹 아일랜드 표시
- [x] 상태바 (시간, WiFi, 배터리)
- [x] 라이트/다크 모드 토글
- [x] 선택된 블록 하이라이트
- [x] 접근성 (키보드 네비게이션)

## 다음 단계

- [ ] 실제 개발 서버에서 테스트
- [ ] E2E 테스트 추가 (Playwright)
- [ ] 디바이스 회전 (세로/가로) 지원 고려
- [ ] 줌 인/아웃 기능 추가 고려
