# Upsell Widget

> @TASK P8-S2-T3 - Upsell 위젯 구현
> @SPEC specs/shared/components.yaml#upsell_widget

## 개요

게스트 페이지에서 추가 서비스(Upsell)를 표시하고 요청할 수 있는 위젯입니다.

## 주요 기능

1. **카드 캐러셀**: 수평 스크롤 가능한 AirBnB 스타일 카드
2. **상세 모달**: 상품 정보 및 요청 폼 표시
3. **요청 생성**: 게스트가 직접 추가 서비스 요청
4. **Business 플랜 전용**: 활성화된 아이템만 표시

## 컴포넌트 구조

```
UpsellWidget (메인 컨테이너)
├── UpsellCard (아이템 카드)
└── UpsellRequestModal (요청 모달)
    ├── 상품 상세
    ├── 요청 폼
    └── 성공 확인
```

## 사용법

### 게스트 페이지에 추가

```tsx
import { UpsellWidget } from '@/components/guest/UpsellWidget';

export default function GuestGuidePage({ guidebook }) {
  return (
    <main>
      {/* 블록 렌더러 */}
      <BlockList blocks={blocks} />

      {/* Upsell 위젯 */}
      <UpsellWidget guidebookId={guidebook.id} />
    </main>
  );
}
```

## API 엔드포인트

### 아이템 조회
```
GET /api/guidebooks/[id]/upsell/items
```

**응답:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "조식 서비스",
      "description": "신선한 재료로 만든 건강한 아침식사",
      "price": 15000,
      "image_url": "https://...",
      "is_active": true,
      "sort_order": 0
    }
  ],
  "total": 3
}
```

### 요청 생성
```
POST /api/upsell/requests
```

**요청:**
```json
{
  "upsell_item_id": "uuid",
  "guest_name": "홍길동",
  "guest_contact": "010-1234-5678",
  "message": "2박 3일 조식 신청합니다"
}
```

**응답:**
```json
{
  "request": {
    "id": "uuid",
    "status": "pending",
    "created_at": "2024-01-29T..."
  }
}
```

## 디자인 특징

### AirBnB 스타일
- **카드**: `shadow-airbnb-sm` → `shadow-airbnb-lg` 호버 효과
- **이미지**: 4:3 비율, 호버 시 확대(scale-105)
- **곡선**: `rounded-xl` (12px)
- **그림자**: 부드러운 그림자 (0.08~0.18 투명도)

### 반응형
- **모바일**: 수평 스크롤 캐러셀, snap-scroll
- **데스크톱**: 동일한 캐러셀 (일관된 UX)

### 접근성
- **role="status"**: 로딩 상태 스크린 리더 지원
- **aria-label**: 모달 및 버튼에 명확한 레이블
- **키보드**: Tab, Enter로 모든 인터랙션 가능

## 상태 관리

### UpsellWidget
```tsx
const [items, setItems] = useState<UpsellItem[]>([]);
const [loading, setLoading] = useState(true);
const [selectedItem, setSelectedItem] = useState<UpsellItem | null>(null);
```

### UpsellRequestModal
```tsx
const [showForm, setShowForm] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
```

## 폼 검증

### Zod 스키마
```tsx
const requestFormSchema = z.object({
  guest_name: z.string()
    .min(1, '이름은 필수입니다')
    .max(50, '이름은 50자 이하여야 합니다'),
  guest_contact: z.string()
    .min(1, '연락처는 필수입니다')
    .max(50, '연락처는 50자 이하여야 합니다'),
  message: z.string()
    .max(500, '메시지는 500자 이하여야 합니다')
    .optional(),
});
```

### React Hook Form 통합
```tsx
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(requestFormSchema),
});
```

## 에러 처리

### API 에러
- **404**: 아이템을 찾을 수 없음
- **400**: 비활성화된 아이템
- **500**: 서버 오류

### 토스트 알림
```tsx
toast.success(toastMessages.upsell.requestSuccess);
toast.error(toastMessages.upsell.requestError);
```

## 플랜 제한

### Business 플랜만 표시
- API에서 `can_create_upsell_item` RPC 함수로 플랜 확인
- Free/Pro 플랜은 아이템 생성 불가 (402 Payment Required)
- 게스트는 활성화된 아이템만 조회 가능

## 성능 최적화

### 이미지 최적화
```tsx
<Image
  src={item.image_url}
  alt={item.name}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 256px, 256px"
/>
```

### 스켈레톤 로딩
- 3개의 카드 스켈레톤 표시
- `animate-pulse` 효과

### 조건부 렌더링
```tsx
if (items.length === 0) {
  return null; // 위젯 숨김
}
```

## 테스트

### 단위 테스트
- `tests/components/guest/UpsellWidget.test.tsx`
- 아이템 로딩, 모달 인터랙션, 요청 생성

### 통합 테스트
- `tests/components/guest/UpsellIntegration.test.tsx`
- API 연동, 전체 플로우

### 실행
```bash
npm test tests/components/guest/UpsellWidget.test.tsx
```

## 향후 개선 사항

1. **페이지네이션**: 아이템이 많을 경우 페이징 처리
2. **필터링**: 카테고리별 아이템 필터
3. **다국어**: 영어/일본어 지원
4. **알림**: 호스트에게 실시간 알림 전송 (Supabase Realtime)
5. **결제 연동**: 직접 결제 가능하도록 Toss Payments 연동

## 참고 자료

- [AirBnB Design System](https://airbnb.design/)
- [Tailwind CSS - Box Shadow](https://tailwindcss.com/docs/box-shadow)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
