# Roomy Design System V2 - 감성 중심 디자인

> @TASK UI-Refresh - 세련되고 감성 중심의 타이포그래피 및 컬러 플레이

## 디자인 철학

### Anti-AI-Slop 원칙
1. **비대칭 레이아웃** - 중앙 정렬 남발 금지
2. **뉴트럴 우선** - 과한 그라데이션 금지
3. **대담한 타이포그래피** - 크기 대비, 자간, 행간 활용
4. **여백의 미** - 빈 공간을 두려워하지 않기
5. **포인트 컬러** - 한두 가지 액센트만 사용

---

## 🎨 컬러 팔레트 V2

### Base Colors (뉴트럴 중심)
| 이름 | Hex | 용도 |
|------|-----|------|
| Ink | `#1A1A1A` | 메인 텍스트, 헤드라인 |
| Charcoal | `#3D3D3D` | 본문 텍스트 |
| Stone | `#6B6B6B` | 보조 텍스트 |
| Mist | `#A3A3A3` | 비활성 텍스트 |
| Cloud | `#E8E8E8` | 구분선, 테두리 |
| Snow | `#F7F7F7` | 섹션 배경 |
| White | `#FFFFFF` | 기본 배경 |

### Accent Colors (포인트)
| 이름 | Hex | 용도 |
|------|-----|------|
| Coral | `#FF6B5B` | 주요 CTA, 하이라이트 |
| Coral Light | `#FFF0EE` | 호버 배경 |
| Mint | `#00C9A7` | 성공, 활성 상태 |
| Mint Light | `#E6FAF6` | 성공 배경 |
| Amber | `#FFB800` | 경고, 강조 |
| Amber Light | `#FFFAE6` | 경고 배경 |

### Brand Gradient (절제된 사용)
```css
/* 히어로 텍스트 그라데이션 - 코랄 → 앰버 */
background: linear-gradient(135deg, #FF6B5B 0%, #FFB800 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 📝 타이포그래피 V2

### 폰트 패밀리
```css
/* 한글 - Pretendard Variable */
--font-sans: 'Pretendard Variable', 'Pretendard', -apple-system, sans-serif;

/* 영문 강조 - Space Grotesk (대담한 느낌) */
--font-display: 'Space Grotesk', 'Pretendard Variable', sans-serif;
```

### 타이포그래피 스케일
| 레벨 | 크기 | 자간 | 행간 | 굵기 | 용도 |
|------|------|------|------|------|------|
| Display | 72px | -0.03em | 1.0 | 700 | 히어로 헤드라인 |
| H1 | 48px | -0.02em | 1.1 | 700 | 섹션 제목 |
| H2 | 36px | -0.01em | 1.2 | 600 | 서브 제목 |
| H3 | 24px | 0 | 1.3 | 600 | 카드 제목 |
| Body Large | 18px | 0.01em | 1.7 | 400 | 강조 본문 |
| Body | 16px | 0.01em | 1.6 | 400 | 일반 본문 |
| Caption | 14px | 0.02em | 1.5 | 500 | 캡션 |
| Small | 12px | 0.03em | 1.5 | 500 | 작은 텍스트 |

### 타이포그래피 사용 예시
```tsx
{/* 대담한 헤드라인 - 왼쪽 정렬 */}
<h1 className="text-display font-bold tracking-tight leading-none text-ink">
  에어비앤비 링크 하나로
</h1>

{/* 강조 텍스트 */}
<span className="text-display font-bold bg-gradient-to-r from-coral to-amber bg-clip-text text-transparent">
  가이드북 완성
</span>
```

---

## 📏 레이아웃 원칙

### 비대칭 그리드
```tsx
{/* 2/3 + 1/3 레이아웃 */}
<div className="grid grid-cols-12 gap-8">
  <div className="col-span-8">메인 콘텐츠</div>
  <div className="col-span-4">사이드 콘텐츠</div>
</div>

{/* 불균형 카드 그리드 */}
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-5">큰 카드</div>
  <div className="col-span-4">중간 카드</div>
  <div className="col-span-3">작은 카드</div>
</div>
```

### 여백 시스템
| 크기 | 값 | 용도 |
|------|------|------|
| 4xs | 4px | 아이콘 간격 |
| 3xs | 8px | 인라인 요소 |
| 2xs | 12px | 작은 간격 |
| xs | 16px | 기본 간격 |
| sm | 24px | 컴포넌트 내부 |
| md | 32px | 컴포넌트 간 |
| lg | 48px | 섹션 내부 |
| xl | 64px | 섹션 간 |
| 2xl | 96px | 히어로 패딩 |
| 3xl | 128px | 대형 섹션 |

---

## 🔲 컴포넌트 스타일 V2

### 버튼
```tsx
{/* Primary CTA - 코랄 */}
<button className="px-8 py-4 bg-coral text-white font-semibold rounded-full
  hover:bg-coral/90 transition-all duration-300
  shadow-[0_8px_32px_rgba(255,107,91,0.3)] hover:shadow-[0_12px_40px_rgba(255,107,91,0.4)]">
  무료로 시작하기
</button>

{/* Secondary - 아웃라인 */}
<button className="px-8 py-4 bg-transparent text-ink font-semibold rounded-full
  border-2 border-ink hover:bg-ink hover:text-white transition-all duration-300">
  데모 보기
</button>

{/* Ghost - 미니멀 */}
<button className="px-6 py-3 text-stone font-medium hover:text-ink transition-colors">
  자세히 보기 →
</button>
```

### 카드
```tsx
{/* 미니멀 카드 */}
<div className="group bg-white border border-cloud rounded-2xl p-8
  hover:border-coral/30 hover:shadow-[0_24px_64px_rgba(0,0,0,0.08)]
  transition-all duration-500">
  <span className="text-caption text-stone uppercase tracking-widest">01</span>
  <h3 className="text-h3 text-ink mt-4 mb-2">AI 자동 생성</h3>
  <p className="text-body text-charcoal">설명 텍스트</p>
</div>
```

### 배지
```tsx
{/* 미니멀 배지 */}
<span className="inline-flex items-center gap-2 px-4 py-2
  bg-snow text-charcoal text-caption font-medium rounded-full">
  <span className="w-2 h-2 bg-mint rounded-full" />
  AI 기반
</span>
```

---

## 🎭 인터랙션

### Hover Effects
```tsx
{/* 부드러운 상승 */}
hover:-translate-y-1 transition-transform duration-500 ease-out

{/* 테두리 변화 */}
hover:border-coral/30 transition-colors duration-300

{/* 그림자 확장 */}
hover:shadow-[0_24px_64px_rgba(0,0,0,0.08)] transition-shadow duration-500
```

### Scroll Animations
```tsx
// Framer Motion - 부드러운 페이드 업
const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
};
```

---

## 📱 모바일 고려사항

### 터치 타겟
- 최소 44px × 44px
- 버튼 패딩: py-4 (16px 상하)

### 반응형 타이포그래피
```tsx
{/* 히어로 헤드라인 */}
<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
```

---

## ✨ 핵심 변경 사항

| 기존 | 변경 후 |
|------|---------|
| Blue-600 (#2563EB) | Ink (#1A1A1A) + Coral (#FF6B5B) |
| 보라색 그라데이션 | 뉴트럴 베이스 + 포인트 컬러 |
| 중앙 정렬 | 왼쪽 정렬 + 비대칭 |
| rounded-lg (8px) | rounded-2xl (16px) 또는 rounded-full |
| shadow-md | 대형 그림자 (0_24px_64px) |
| 과한 아이콘 색상 | 단색 아이콘 |
