# DR-P5: 공통 컴포넌트 Coral 테마 통일

> **완료일**: 2026-01-30
> **목표**: 모든 공통 UI 컴포넌트에 Coral 테마를 일관되게 적용하여 디자인 시스템 통일

---

## 작업 요약

### 1. Globals CSS 업데이트
- **파일**: `src/app/globals.css`
- **변경사항**:
  - `:root` 및 `@theme` 섹션의 모든 컬러 변수를 Coral 테마로 전환
  - `--primary`: `#FF385C` (coral)
  - `--secondary`: `#00A699` (mint)
  - `--accent`: `#FFB400` (amber)
  - `--ring`: coral로 통일
  - `--radius`: `0.75rem` (12px, airbnb 스타일)

### 2. Dialog 컴포넌트
- **파일**: `src/components/ui/dialog.tsx`
- **개선사항**:
  - 오버레이: `bg-black/80` → `bg-ink/60 backdrop-blur-sm` (부드러운 반투명)
  - Content: `rounded-lg` → `rounded-airbnb-lg` (16px)
  - 그림자: `shadow-lg` → `shadow-airbnb-lg`
  - 닫기 버튼: `rounded-full`, hover 시 `bg-muted`, focus 링 coral

### 3. Sonner (Toast) 컴포넌트
- **파일**: `src/components/ui/sonner.tsx`
- **개선사항**:
  - Toast: `rounded-airbnb`, `shadow-airbnb-md`
  - Action 버튼: `bg-coral`, `hover:bg-coral-dark`, 폰트 semibold
  - 상태별 색상: success (green), error (red), warning (yellow), info (coral)

### 4. Loading 컴포넌트
- **파일**: `src/components/ui/loading-spinner.tsx`
- **개선사항**:
  - 기본 variant를 `coral`로 변경 (기존 `primary` 제거)
  - 색상: `border-coral-light`, `border-t-coral`
  - `default` variant: `border-muted`, `border-t-text-primary`

- **파일**: `src/components/ui/loading-overlay.tsx`
- **개선사항**:
  - LoadingSpinner variant를 `coral`로 변경
  - 배경: `bg-white/90`
  - 텍스트: `text-body`, `text-text-secondary`

### 5. Skeleton 컴포넌트
- **파일**: `src/components/ui/skeleton.tsx`
- **개선사항**:
  - `rounded-airbnb` 적용
  - 그라디언트 애니메이션: `from-muted via-muted/80 to-muted`
  - 커스텀 애니메이션 duration: `2s cubic-bezier(0.4, 0, 0.6, 1)`

### 6. Input 컴포넌트
- **파일**: `src/components/ui/input.tsx`
- **개선사항**:
  - Focus 링: `focus:border-coral`, `focus:ring-coral`
  - 텍스트 색상: `text-text-primary`
  - Placeholder: `text-text-tertiary`

### 7. Textarea 컴포넌트
- **파일**: `src/components/ui/textarea.tsx`
- **개선사항**:
  - Input과 동일한 스타일로 통일
  - `rounded-lg`, `px-4`, `py-3.5`
  - Focus 링 coral

### 8. Select 컴포넌트
- **파일**: `src/components/ui/select.tsx`
- **개선사항**:
  - Trigger: `h-[50px]`, `rounded-lg`, focus 링 coral
  - Content: `rounded-airbnb`, `shadow-airbnb-md`
  - Item: `rounded-lg`, `py-2.5`, focus 시 `bg-coral-light`, `text-coral`
  - Check 아이콘: `text-coral`

### 9. Tailwind Config
- **파일**: `tailwind.config.ts`
- **개선사항**:
  - `primary.dark` 추가: `#E31C5F` (coral-dark와 동일)

---

## 디자인 시스템 일관성 체크리스트

### 색상
- [x] Primary: Coral (`#FF385C`)
- [x] Secondary: Mint (`#00A699`)
- [x] Accent: Amber (`#FFB400`)
- [x] Focus 링: Coral
- [x] 텍스트: Ink, Charcoal, Mist

### Border Radius
- [x] 기본: `rounded-lg` (12px)
- [x] 큰 요소: `rounded-airbnb-lg` (16px)
- [x] 버튼/아이콘: `rounded-full`

### 그림자
- [x] 카드: `shadow-airbnb-md`
- [x] Dialog/Dropdown: `shadow-airbnb-lg`
- [x] 버튼: `shadow-airbnb-md`

### 타이포그래피
- [x] 본문: `text-base`, `text-text-primary`
- [x] Secondary: `text-text-secondary`
- [x] Placeholder: `text-text-tertiary`

### 간격
- [x] Input/Textarea: `px-4`, `py-3.5`
- [x] Button: `px-6`, `py-3.5`
- [x] Select: `px-4`, `h-[50px]`

---

## 테스트 결과

### 빌드
```bash
npm run build
```
✅ **성공** (15.7초, 57개 페이지 생성)

### 타입 체크
```bash
npm run type-check
```
✅ **성공** (타입 에러 없음)

---

## 영향받은 페이지

모든 페이지에서 공통 컴포넌트를 사용하므로 전체 앱에 일관된 Coral 테마가 적용됩니다.

1. **인증 페이지**: 로그인, 회원가입
2. **대시보드**: 호스트 대시보드, 통계
3. **에디터**: 가이드북 에디터, 브랜딩, 리뷰, Upsell
4. **게스트 뷰어**: 가이드북 공개 페이지
5. **설정**: 프로필, 구독, 알림
6. **랜딩**: 홈, 가격, 도움말

---

## 향후 작업

### Phase B: 페이지별 폴리싱
- [ ] 랜딩 페이지 리뉴얼 (DR-P6)
- [ ] 게스트 뷰어 리뉴얼 (DR-P7)
- [ ] 에디터 개선 (DR-P8)

### Phase C: 고급 인터랙션
- [ ] 애니메이션 강화 (Framer Motion)
- [ ] 마이크로 인터랙션
- [ ] 반응형 최적화

---

## Lessons Learned

1. **디자인 시스템 먼저**: globals.css와 tailwind.config를 먼저 정리하면 컴포넌트 작업이 훨씬 빠름
2. **shadcn/ui 구조 유지**: 기존 Radix UI 기반 구조를 유지하면서 스타일만 변경하여 안정성 확보
3. **일관된 네이밍**: `rounded-airbnb`, `shadow-airbnb`, `text-body` 등 명확한 네이밍으로 혼동 방지
4. **Focus 상태**: 접근성을 위해 focus 링을 모든 인터랙티브 요소에 일관되게 적용
5. **빌드 우선**: 변경사항마다 빌드로 즉시 검증하여 에러 조기 발견

---

## 커밋 메시지

```bash
feat(design): 공통 컴포넌트 Coral 테마 통일 (DR-P5)

- globals.css: :root 및 @theme 섹션 coral 테마 적용
- Dialog: 오버레이 부드럽게, rounded-airbnb-lg, 닫기 버튼 개선
- Sonner: coral 액션 버튼, 상태별 색상, rounded-airbnb
- Loading: coral variant 기본값, 부드러운 애니메이션
- Skeleton: 그라디언트 애니메이션, rounded-airbnb
- Input/Textarea: focus 링 coral, 텍스트 색상 통일
- Select: Trigger/Content/Item coral 테마, rounded-airbnb
- Tailwind: primary.dark 추가

✅ 빌드 성공
✅ 타입 체크 통과

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
