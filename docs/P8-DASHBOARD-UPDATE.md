# P8-S5-T1: 대시보드 폴리싱 (AirBnB 스타일)

## 완료 사항

### 1. StatCard 컴포넌트 (신규)
**파일**: `src/components/dashboard/StatCard.tsx`

**특징**:
- AirBnB 스타일 디자인 적용
- `shadow-airbnb-sm`, `hover:shadow-airbnb-md` 그림자
- `rounded-xl` 모서리
- 아이콘 기반 시각화 (lucide-react)
- Trend 표시 기능 (증감률)
- Primary 컬러 아이콘 배경

**사용 예시**:
```tsx
<StatCard
  title="총 가이드북"
  value="5"
  description="생성된 가이드북"
  icon="book"
  trend={{ value: 12.5, label: '지난주 대비' }}
/>
```

### 2. GuidebookCard 컴포넌트 (리팩토링)
**파일**: `src/components/dashboard/GuidebookCard.tsx`

**특징**:
- 카드 레이아웃 (썸네일 + 정보)
- 호버 효과 (그림자, 이미지 확대, 제목 색상 변경)
- 상태 뱃지 (초안/공개/보관)
- 조회수 및 최근 수정일 표시
- 편집/미리보기 액션 버튼
- AirBnB 스타일 그림자 및 트랜지션

### 3. 대시보드 페이지 업데이트
**파일**: `src/app/(host)/dashboard/page.tsx`

**변경 사항**:
- AirBnB 호스트 대시보드 스타일 적용
- 환영 메시지 헤더 (text-display)
- 통계 카드 그리드 (4개)
- 가이드북 카드 그리드 (3열)
- 반응형 레이아웃 (모바일: 1열, 태블릿: 2열, 데스크톱: 3열)
- 빈 상태 디자인 개선 (BookOpen 아이콘 + CTA)
- 로딩 스켈레톤 개선

## 디자인 시스템 적용

### 컬러
- Primary: `#FF385C` (Rausch)
- Background: `bg-surface` (#F7F7F7)
- Text: `text-text-primary`, `text-text-secondary`, `text-text-tertiary`

### 타이포그래피
- 헤더: `text-display` (3rem, 700)
- 섹션 제목: `text-h2` (1.5rem, 600)
- 카드 제목: `text-h3` (1.25rem, 600)
- 본문: `text-body` (1rem, 400)
- 캡션: `text-body-sm` (0.875rem, 400)

### 그림자
- 카드 기본: `shadow-airbnb-sm`
- 카드 호버: `shadow-airbnb-md`
- 버튼: `shadow-airbnb-md`, 호버 시 `shadow-airbnb-lg`

### 간격
- 카드 간격: `gap-4` (모바일), `gap-6` (데스크톱)
- 패딩: `p-4`, `p-5`, `p-6`
- 마진: `mb-4`, `mb-6`, `mb-8`

### 애니메이션
- 트랜지션: `transition-all duration-300`
- 호버 효과: 그림자 변화, 이미지 확대(scale-105), 색상 변경

## 반응형 디자인

### 브레이크포인트
- 모바일: 기본 (< 640px)
- 태블릿: `sm:` (≥ 640px)
- 데스크톱: `lg:` (≥ 1024px)

### 레이아웃 변화
- 통계 카드: 1열 → 2열 (sm) → 4열 (lg)
- 가이드북 카드: 1열 → 2열 (md) → 3열 (lg)
- 헤더 버튼: 세로 배치 → 가로 배치 (sm)

## 테스트

### StatCard 테스트
- 제목, 값, 설명 표시
- 변화량(trend) 표시
- AirBnB 그림자 적용
- rounded-xl 모서리
- 호버 효과

### GuidebookCard 테스트
- 가이드북 정보 표시
- 상태 뱃지 표시
- 썸네일 이미지 표시
- 기본 아이콘 표시 (썸네일 없을 때)
- AirBnB 그림자 적용
- 호버 효과
- 편집/미리보기 콜백

## AC (Acceptance Criteria) 체크리스트

- [x] 새 디자인 시스템 적용 (AirBnB 스타일)
- [x] 깔끔하고 직관적인 대시보드
- [x] 반응형 (모바일: 카드 세로 배치)
- [x] Primary 컬러 (#FF385C) 사용
- [x] shadow-airbnb-* 그림자 사용
- [x] rounded-xl 모서리 적용
- [x] 통계 카드 (아이콘 + 숫자)
- [x] 가이드북 카드 (썸네일 + 정보 + 액션)
- [x] 빈 상태 디자인
- [x] 호버 효과
- [x] 로딩 스켈레톤

## 스크린샷 (개발 서버 실행 후 확인 필요)

1. 대시보드 헤더 (환영 메시지 + CTA)
2. 통계 카드 그리드 (4개)
3. 가이드북 카드 그리드 (카드 레이아웃)
4. 빈 상태 (가이드북 없을 때)
5. 로딩 상태 (스켈레톤)

## 다음 단계

### P8-S8-T1: 통계 페이지 (데이터 대시보드)
- 고급 차트 및 그래프
- 날짜 범위 필터
- 방문자 통계 상세 정보

### P8-S9-T1: 에디터 미리보기 개선
- 실시간 미리보기 패널
- 반응형 프리뷰 (모바일/태블릿/데스크톱)
- 디바이스 전환 버튼
