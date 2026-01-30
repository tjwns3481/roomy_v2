# Design Refresh TASKS.md - Roomy 프로덕션 디자인 개선

> Stitch MCP를 활용한 전체 디자인 리프레시

---

## 목표

1. **프로덕션 품질** - 상용 서비스 수준의 세련된 UI/UX
2. **일관성** - 통일된 디자인 시스템 적용
3. **모바일 최적화** - 모바일 퍼스트 반응형 디자인
4. **접근성** - WCAG 2.1 AA 준수

---

## Phase 1: 디자인 시스템 정비 (DR-P1)

| Task | 설명 | 상태 | 담당 |
|------|------|------|------|
| DR-P1-T1 | Tailwind 컬러 팔레트 정리 (현재 미정의 색상 수정) | [ ] | frontend-specialist |
| DR-P1-T2 | 타이포그래피 시스템 정의 (text-h1~h6, text-body) | [ ] | frontend-specialist |
| DR-P1-T3 | 스페이싱/레이아웃 토큰 정의 | [ ] | frontend-specialist |
| DR-P1-T4 | 그림자 시스템 정의 (shadow-soft, shadow-airbnb) | [ ] | frontend-specialist |
| DR-P1-T5 | 컴포넌트 기본 스타일 (Button, Card, Input) 개선 | [ ] | frontend-specialist |

---

## Phase 2: 랜딩 페이지 리디자인 (DR-P2)

| Task | 설명 | 상태 | 담당 |
|------|------|------|------|
| DR-P2-T1 | 히어로 섹션 재설계 (Stitch MCP 활용) | [ ] | frontend-specialist |
| DR-P2-T2 | 기능 소개 섹션 개선 | [ ] | frontend-specialist |
| DR-P2-T3 | How It Works 섹션 개선 | [ ] | frontend-specialist |
| DR-P2-T4 | 가격 섹션 개선 | [ ] | frontend-specialist |
| DR-P2-T5 | FAQ 섹션 개선 | [ ] | frontend-specialist |
| DR-P2-T6 | CTA 및 Footer 개선 | [ ] | frontend-specialist |
| DR-P2-T7 | 애니메이션 및 인터랙션 추가 | [ ] | frontend-specialist |

---

## Phase 3: 게스트 뷰어 리디자인 (DR-P3)

| Task | 설명 | 상태 | 담당 |
|------|------|------|------|
| DR-P3-T1 | 히어로 블록 리디자인 | [ ] | frontend-specialist |
| DR-P3-T2 | QuickInfo 카드 개선 | [ ] | frontend-specialist |
| DR-P3-T3 | Amenities 블록 개선 | [ ] | frontend-specialist |
| DR-P3-T4 | Rules 블록 개선 | [ ] | frontend-specialist |
| DR-P3-T5 | Map 블록 개선 | [ ] | frontend-specialist |
| DR-P3-T6 | Gallery 블록 개선 | [ ] | frontend-specialist |
| DR-P3-T7 | 하단 네비게이션 개선 | [ ] | frontend-specialist |
| DR-P3-T8 | AI 챗봇 위젯 개선 | [ ] | frontend-specialist |

---

## Phase 4: 호스트 대시보드 리디자인 (DR-P4)

| Task | 설명 | 상태 | 담당 |
|------|------|------|------|
| DR-P4-T1 | 사이드바 및 네비게이션 개선 | [ ] | frontend-specialist |
| DR-P4-T2 | 대시보드 메인 레이아웃 개선 | [ ] | frontend-specialist |
| DR-P4-T3 | 가이드북 카드 그리드 개선 | [ ] | frontend-specialist |
| DR-P4-T4 | 통계 페이지 차트 개선 | [ ] | frontend-specialist |
| DR-P4-T5 | 에디터 UI 개선 | [ ] | frontend-specialist |
| DR-P4-T6 | 설정 페이지 개선 | [ ] | frontend-specialist |

---

## Phase 5: 공통 컴포넌트 및 최적화 (DR-P5)

| Task | 설명 | 상태 | 담당 |
|------|------|------|------|
| DR-P5-T1 | 모달/다이얼로그 스타일 통일 | [ ] | frontend-specialist |
| DR-P5-T2 | 폼 컴포넌트 스타일 통일 | [ ] | frontend-specialist |
| DR-P5-T3 | 로딩/스켈레톤 UI 개선 | [ ] | frontend-specialist |
| DR-P5-T4 | 토스트/알림 스타일 개선 | [ ] | frontend-specialist |
| DR-P5-T5 | 다크모드 지원 (선택) | [ ] | frontend-specialist |

---

## 디자인 참고

### 컬러 팔레트 (권장)

```css
/* Primary - Coral (AirBnB 스타일) */
--color-coral: #FF385C;
--color-coral-light: #FFE4E8;
--color-coral-dark: #E31C5F;

/* Secondary - Mint */
--color-mint: #00A699;
--color-mint-light: #E0F7F5;

/* Neutral */
--color-ink: #222222;
--color-charcoal: #484848;
--color-mist: #767676;
--color-cloud: #DDDDDD;
--color-snow: #F7F7F7;
--color-white: #FFFFFF;

/* Accent */
--color-amber: #FFB400;
```

### 타이포그래피 (권장)

```css
/* Headings */
--text-h1: 2.5rem (40px), font-weight: 700, line-height: 1.1
--text-h2: 2rem (32px), font-weight: 700, line-height: 1.2
--text-h3: 1.5rem (24px), font-weight: 600, line-height: 1.3
--text-h4: 1.25rem (20px), font-weight: 600, line-height: 1.4

/* Body */
--text-body: 1rem (16px), font-weight: 400, line-height: 1.5
--text-body-sm: 0.875rem (14px), font-weight: 400, line-height: 1.5
--text-body-xs: 0.75rem (12px), font-weight: 400, line-height: 1.4
```

### 그림자 (권장)

```css
--shadow-soft: 0 2px 4px rgba(0,0,0,0.06);
--shadow-soft-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-soft-lg: 0 8px 24px rgba(0,0,0,0.12);
--shadow-airbnb-sm: 0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05);
--shadow-airbnb: 0 6px 20px rgba(0,0,0,0.2);
```

---

## 진행 상황

| Phase | 진행률 | 상태 |
|-------|--------|------|
| DR-P1 | 0% | ⏳ 대기 |
| DR-P2 | 0% | ⏳ 대기 |
| DR-P3 | 0% | ⏳ 대기 |
| DR-P4 | 0% | ⏳ 대기 |
| DR-P5 | 0% | ⏳ 대기 |

---

## 참고 자료

- Touch Stay: https://touchstay.com
- Hostfully: https://hostfully.com
- AirBnB Host Dashboard
- Dribbble SaaS Landing Pages
