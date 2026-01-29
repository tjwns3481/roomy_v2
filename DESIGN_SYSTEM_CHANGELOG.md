# Design System Changelog

## P8-S1-T1: AirBnB 스타일 디자인 시스템 업데이트

### 변경 사항

#### 1. Primary Color 변경
- **이전**: `#FF6B5B` (Coral)
- **이후**: `#FF385C` (AirBnB Rausch)

#### 2. 색상 팔레트
| 이름 | Hex | 용도 |
|------|-----|------|
| Primary | `#FF385C` | 주요 CTA, 강조 |
| Primary Light | `#FFE4E8` | 호버 배경 |
| Primary Dark | `#E31C5F` | 버튼 호버 |
| Secondary | `#00A699` | 보조 액션, 성공 |
| Accent | `#FC642D` | 특별 강조, 알림 |

#### 3. Neutral Colors
| 이름 | Hex | 용도 |
|------|-----|------|
| Text Primary | `#222222` | 주요 텍스트 |
| Text Secondary | `#717171` | 보조 텍스트 |
| Text Tertiary | `#B0B0B0` | 비활성 텍스트 |
| Surface | `#F7F7F7` | 카드 배경 |
| Border | `#DDDDDD` | 테두리 |

#### 4. Semantic Colors
| 이름 | Hex | 용도 |
|------|-----|------|
| Success | `#00A699` | 성공 상태 |
| Warning | `#FFB400` | 경고 |
| Error | `#C13515` | 에러 |
| Info | `#008489` | 정보 |

#### 5. Typography
- **Display**: 48px (3rem), Bold
- **H1**: 32px (2rem), Bold
- **H2**: 24px (1.5rem), SemiBold
- **H3**: 20px (1.25rem), SemiBold
- **H4**: 18px (1.125rem), Medium
- **Body Large**: 18px (1.125rem), Regular
- **Body**: 16px (1rem), Regular
- **Body Small**: 14px (0.875rem), Regular
- **Caption**: 12px (0.75rem), Regular

#### 6. Border Radius
- **LG**: 8px (버튼, 인풋)
- **XL**: 12px (카드, 모달)
- **2XL**: 16px (큰 카드)
- **3XL**: 24px (히어로 이미지)
- **Full**: 9999px (아바타, 태그)

#### 7. Shadows (AirBnB 스타일)
| 이름 | CSS | 용도 |
|------|-----|------|
| airbnb-sm | `0 1px 2px rgba(0,0,0,0.08)` | 인풋, 작은 카드 |
| airbnb-md | `0 2px 8px rgba(0,0,0,0.12)` | 카드 기본 |
| airbnb-lg | `0 4px 16px rgba(0,0,0,0.12)` | 호버 카드 |
| airbnb-xl | `0 8px 28px rgba(0,0,0,0.15)` | 모달 |
| airbnb-2xl | `0 16px 40px rgba(0,0,0,0.18)` | 플로팅 패널 |

#### 8. 컴포넌트 업데이트

##### Button
- 기본 padding: `px-6 py-3.5`
- 기본 rounded: `rounded-lg`
- Active 효과: `active:scale-[0.98]`
- Shadow: `shadow-airbnb-md` → `shadow-airbnb-lg` on hover

##### Input
- Padding: `px-4 py-3.5`
- Border: `border-border`
- Focus: `focus:border-text-primary focus:ring-1 focus:ring-text-primary`

##### Card
- Rounded: `rounded-xl`
- Shadow: `shadow-airbnb-md` → `shadow-airbnb-lg` on hover
- Transition: `transition-shadow duration-300`

### 사용 예시

#### 버튼
```tsx
<Button variant="default">Primary Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
```

#### 카드
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
</Card>
```

#### 인풋
```tsx
<Input placeholder="Enter email" type="email" />
```

### 디자인 시스템 데모 페이지

개발 서버에서 `/design-system` 경로로 이동하여 모든 컴포넌트와 스타일을 확인할 수 있습니다.

```bash
npm run dev
# http://localhost:3000/design-system
```

### 마이그레이션 가이드

#### 기존 코드 업데이트

1. **색상 클래스 변경**
```tsx
// Before
className="bg-coral text-white"

// After
className="bg-primary text-white"
```

2. **그림자 클래스 변경**
```tsx
// Before
className="shadow-soft"

// After
className="shadow-airbnb-md"
```

3. **Border Radius 변경**
```tsx
// Before
className="rounded-2xl"

// After (동일하게 사용 가능)
className="rounded-xl" // 12px (권장)
className="rounded-2xl" // 16px (큰 카드)
```

4. **타이포그래피 클래스 변경**
```tsx
// Before
className="text-ink"

// After
className="text-text-primary"
```

### 호환성

- shadcn/ui 컴포넌트: ✅ 완전 호환
- 다크 모드: ✅ 지원
- 반응형: ✅ 모바일 우선
- 접근성: ✅ WCAG AA 준수

### 참고 문서

- [AirBnB Design](https://airbnb.design/)
- [DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
