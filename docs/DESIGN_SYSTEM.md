# Roomy Design System

> @TASK P0-T0.2 - Roomy Clean Modern 디자인 시스템

## 🎨 컬러 팔레트

### Primary Colors
| 이름 | Hex | Tailwind | 용도 |
|------|-----|----------|------|
| Primary | `#2563EB` | `bg-primary`, `text-primary` | 주요 버튼, 링크, 강조 |
| Primary Light | `#DBEAFE` | `bg-primary-light` | 호버 배경, 연한 강조 |

### Secondary Colors
| 이름 | Hex | Tailwind | 용도 |
|------|-----|----------|------|
| Secondary | `#F97316` | `bg-secondary`, `text-secondary` | CTA, 강조 액션 |

### Neutral Colors
| 이름 | Hex | Tailwind | 용도 |
|------|-----|----------|------|
| Background | `#FFFFFF` | `bg-background` | 전체 배경 |
| Surface | `#F9FAFB` | `bg-surface` | 카드 배경 |
| Border | `#E5E7EB` | `border` | 테두리 |
| Text Primary | `#111827` | `text-text-primary` | 주요 텍스트 |
| Text Secondary | `#6B7280` | `text-text-secondary` | 보조 텍스트 |

### Semantic Colors
| 이름 | Hex | Tailwind | 용도 |
|------|-----|----------|------|
| Success | `#10B981` | `bg-success`, `text-success` | 성공 메시지 |
| Warning | `#F59E0B` | `bg-warning`, `text-warning` | 경고 |
| Error | `#EF4444` | `bg-error`, `text-error` | 에러 |

---

## 📝 타이포그래피

### 폰트
- **Primary**: Pretendard (CDN 로드)
- **Fallback**: system-ui, -apple-system, sans-serif

### 폰트 크기 및 스타일
| 레벨 | 크기 | Line Height | Weight | Tailwind | 용도 |
|------|------|-------------|--------|----------|------|
| H1 | 36px (2.25rem) | 1.2 | Bold (700) | `text-h1` | 페이지 제목 |
| H2 | 30px (1.875rem) | 1.3 | SemiBold (600) | `text-h2` | 섹션 제목 |
| H3 | 24px (1.5rem) | 1.4 | SemiBold (600) | `text-h3` | 서브 섹션 |
| H4 | 20px (1.25rem) | 1.5 | SemiBold (600) | `text-h4` | 카드 제목 |
| Body | 16px (1rem) | 1.6 | Regular (400) | `text-body` | 본문 |
| Caption | 14px (0.875rem) | 1.5 | Regular (400) | `text-caption` | 캡션, 설명 |
| Small | 12px (0.75rem) | 1.5 | Regular (400) | `text-small` | 작은 텍스트 |

### 사용 예시
```tsx
<h1 className="text-h1">페이지 제목</h1>
<h2 className="text-h2">섹션 제목</h2>
<p className="text-body text-text-primary">본문 텍스트</p>
<span className="text-caption text-text-secondary">보조 설명</span>
```

---

## 📏 간격 시스템 (Tailwind 기본)

| 이름 | 크기 | Tailwind | 용도 |
|------|------|----------|------|
| xs | 4px | `space-1`, `gap-1` | 미세 간격 |
| sm | 8px | `space-2`, `gap-2` | 작은 간격 |
| md | 16px | `space-4`, `gap-4` | 기본 간격 |
| lg | 24px | `space-6`, `gap-6` | 큰 간격 |
| xl | 32px | `space-8`, `gap-8` | 매우 큰 간격 |
| 2xl | 48px | `space-12`, `gap-12` | 섹션 간격 |

---

## 🔲 Border Radius

| 이름 | 크기 | Tailwind | 용도 |
|------|------|----------|------|
| lg | 8px | `rounded-lg` | 버튼, 카드 기본 |
| xl | 12px | `rounded-xl` | 모달, 큰 컴포넌트 |
| 2xl | 16px | `rounded-2xl` | 큰 카드, 섹션 |

### 사용 예시
```tsx
<button className="rounded-lg">버튼</button>
<div className="rounded-xl">모달</div>
<div className="rounded-2xl">큰 카드</div>
```

---

## 🌑 그림자 (Shadows)

| 이름 | Tailwind | 용도 |
|------|----------|------|
| sm | `shadow-sm` | 미세한 그림자 (인풋, 작은 카드) |
| md | `shadow-md` | 카드 기본 그림자 |
| lg | `shadow-lg` | 모달, 드롭다운 |
| xl | `shadow-xl` | 플로팅 버튼 |

### 사용 예시
```tsx
<div className="shadow-sm">인풋</div>
<div className="shadow-md">카드</div>
<div className="shadow-lg">모달</div>
```

---

## 🎯 컴포넌트 스타일 가이드

### 버튼
```tsx
// Primary 버튼
<button className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md">
  Primary Button
</button>

// Secondary 버튼
<button className="px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-colors shadow-md">
  Secondary Button
</button>

// Outline 버튼
<button className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary-light transition-colors">
  Outline Button
</button>
```

### 카드
```tsx
<div className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
  <h3 className="text-h3 text-text-primary">카드 제목</h3>
  <p className="text-body text-text-secondary mt-2">카드 내용</p>
</div>
```

### 인풋
```tsx
<input
  type="text"
  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
  placeholder="텍스트 입력"
/>
```

---

## ♿ 접근성 (Accessibility)

1. **색상 대비**: WCAG AA 준수 (4.5:1)
2. **포커스 링**: 모든 인터랙티브 요소에 `focus-visible:ring-2` 적용
3. **키보드 네비게이션**: Tab, Enter, Space 키 지원
4. **시맨틱 HTML**: `<button>`, `<a>`, `<nav>` 등 적절한 태그 사용

---

## 📱 반응형 브레이크포인트 (Tailwind 기본)

| 이름 | 크기 | 용도 |
|------|------|------|
| sm | 640px | 태블릿 세로 |
| md | 768px | 태블릿 가로 |
| lg | 1024px | 데스크톱 |
| xl | 1280px | 대형 데스크톱 |
| 2xl | 1536px | 초대형 |

### 모바일 우선 예시
```tsx
<div className="px-4 sm:px-6 lg:px-8">
  <h1 className="text-2xl sm:text-3xl lg:text-4xl">반응형 제목</h1>
</div>
```

---

## 🚀 빠른 시작

1. **컬러 사용**
```tsx
<div className="bg-primary text-white">Primary Color</div>
<div className="bg-surface text-text-primary">Surface Color</div>
```

2. **타이포그래피**
```tsx
<h1 className="text-h1">제목</h1>
<p className="text-body text-text-secondary">본문</p>
```

3. **간격**
```tsx
<div className="flex gap-4">
  <button>버튼 1</button>
  <button>버튼 2</button>
</div>
```

4. **그림자**
```tsx
<div className="shadow-md rounded-xl">카드</div>
```

---

## 📚 참고 자료

- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Pretendard 폰트](https://github.com/orioncactus/pretendard)
- [WCAG 접근성 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
