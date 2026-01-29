# P8-S2-T1: 게스트 뷰어 리디자인 (AirBnB 스타일)

## 개요
게스트 가이드북 뷰어를 AirBnB 스타일로 전면 리디자인하여 사용자 경험을 크게 개선했습니다.

## 변경사항

### 1. HeroBlock (히어로 블록)
- **풀스크린 히어로**: 85vh 높이로 더 강렬한 첫인상
- **하단 정렬 텍스트**: AirBnB처럼 텍스트를 하단에 배치
- **그라데이션 오버레이**: 부드러운 블랙 그라데이션으로 가독성 향상
- **스크롤 유도**: 애니메이션으로 사용자 행동 유도
- **부드러운 곡선**: 하단에 `rounded-t-3xl` 추가

### 2. QuickInfoBlock (빠른 정보)
- **AirBnB 카드 스타일**: `shadow-airbnb-sm` 적용
- **부드러운 곡선**: `rounded-xl`, `rounded-2xl` 사용
- **터치 친화적**: 버튼 최소 크기 44px 보장
- **호버 효과**: `hover:shadow-airbnb-md` 전환
- **아이콘 배경**: 반투명 색상 배경 (primary/10, secondary/10)

### 3. AmenitiesBlock (편의시설)
- **아이콘 그리드**: 2열 또는 3열 그리드
- **호버 애니메이션**: `hover:scale-105` 효과
- **카드 스타일**: 각 항목이 독립된 카드
- **색상 구분**: 이용 가능(success) / 불가(error)

### 4. RulesBlock (규칙)
- **섹션 구분**: 각 섹션이 독립된 카드
- **아이콘 배경**: 원형 아이콘 배경
- **체크리스트**: 프리미엄 스타일 (border-2, bg-primary/5)
- **완료 상태**: 체크리스트 진행률 표시

### 5. 메인 페이지 개선
- **배경색**: `bg-surface` (#F7F7F7)로 깔끔한 배경
- **헤더**: Hero 블록 없을 때만 표시
- **Footer**: AirBnB 스타일 풋터
- **간격 조정**: 블록 간 간격 최적화

## 디자인 시스템 적용

### 색상
- Primary: #FF385C (Rausch)
- Secondary: #00A699 (Teal)
- Accent: #FC642D (Orange)
- Surface: #F7F7F7
- Border: #DDDDDD

### 그림자
- `shadow-airbnb-sm`: 0 1px 2px rgba(0,0,0,0.08)
- `shadow-airbnb-md`: 0 2px 8px rgba(0,0,0,0.12)
- `shadow-airbnb-lg`: 0 4px 16px rgba(0,0,0,0.12)

### 곡선
- `rounded-xl`: 12px
- `rounded-2xl`: 16px
- `rounded-3xl`: 24px

### 타이포그래피
- Display: 48px (히어로 제목)
- H1: 32px
- H2: 24px
- H3: 20px
- Body: 16px

## 모바일 최적화
- **100vw**: 히어로 섹션 전체 너비
- **터치 버튼**: 최소 44px 크기
- **스크롤 스냅**: 부드러운 스크롤
- **반응형 간격**: px-4 (모바일), px-8 (태블릿), px-12 (데스크톱)

## 성능 최적화
- **Next.js Image**: priority 속성으로 히어로 이미지 우선 로드
- **Lazy Loading**: 다른 이미지는 지연 로딩
- **애니메이션**: GPU 가속 transform 사용

## 테스트
- `HeroBlock.test.tsx`: 히어로 블록 렌더링 테스트
- `QuickInfoBlock.test.tsx`: 복사 버튼, 토글 기능 테스트

## 스펙 참조
- `specs/screens/guest-viewer.yaml`
- `docs/DESIGN_SYSTEM.md`

## AC 체크리스트
- [x] AirBnB 디자인 시스템 적용
- [x] 부드러운 곡선 (rounded-xl, rounded-2xl)
- [x] 그림자 (shadow-airbnb-*)
- [x] 모바일 최적화 (터치 친화적 버튼)
- [x] 호버 효과
- [x] 애니메이션 (fade-up, bounce)
- [x] 기존 기능 유지 (복사, 토글, 지도)

## 스크린샷
### 히어로 블록
- 풀스크린 이미지 + 하단 정렬 텍스트
- 그라데이션 오버레이
- 스크롤 유도 애니메이션

### 빠른 정보 카드
- 깔끔한 카드 스타일
- 복사 버튼 (체크마크 피드백)
- 비밀번호 토글

### 편의시설 그리드
- 2열/3열 반응형 그리드
- 호버 애니메이션
- 이용 가능/불가 색상 구분

## 다음 단계
- P8-S2-T2: AI 챗봇 위젯 통합
- P8-S2-T3: Upsell 위젯 추가
