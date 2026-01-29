# P8-R3: Upsell Items API

> Business 플랜 전용 - 추가 서비스/상품 판매 기능

## 개요

호스트가 게스트에게 추가 서비스나 상품을 판매할 수 있는 Upsell 기능을 제공합니다.

**예시**: 조기 체크인, 늦은 체크아웃, 공항 픽업, 간식 세트, 자전거 대여 등

## 데이터베이스 스키마

### `upsell_items` 테이블

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| guidebook_id | UUID | 가이드북 ID (FK) |
| name | TEXT | 아이템 이름 (예: "조기 체크인") |
| description | TEXT | 아이템 설명 |
| price | INTEGER | 가격 (원 단위) |
| image_url | TEXT | 아이템 이미지 URL |
| is_active | BOOLEAN | 활성화 여부 |
| sort_order | INTEGER | 정렬 순서 |
| created_at | TIMESTAMPTZ | 생성일 |
| updated_at | TIMESTAMPTZ | 수정일 |

### RLS 정책

- **조회**: 호스트는 모든 아이템, 게스트는 활성화된 아이템만
- **생성/수정/삭제**: 호스트 본인 가이드북만
- **플랜 제한**: Business 플랜만 생성 가능

## API 엔드포인트

### 1. 아이템 목록 조회

```http
GET /api/guidebooks/[id]/upsell/items
```

**권한**: Public (게스트는 활성화된 아이템만)

**응답**:
```json
{
  "items": [
    {
      "id": "uuid",
      "guidebook_id": "uuid",
      "name": "조기 체크인",
      "description": "체크인 시간을 2시간 앞당깁니다",
      "price": 20000,
      "image_url": "https://...",
      "is_active": true,
      "sort_order": 0,
      "created_at": "2024-01-28T00:00:00Z",
      "updated_at": "2024-01-28T00:00:00Z"
    }
  ],
  "total": 1
}
```

### 2. 아이템 생성

```http
POST /api/guidebooks/[id]/upsell/items
```

**권한**: Business 플랜 호스트만

**요청**:
```json
{
  "name": "조기 체크인",
  "description": "체크인 시간을 2시간 앞당깁니다",
  "price": 20000,
  "image_url": "https://...",
  "is_active": true,
  "sort_order": 0
}
```

**응답** (201 Created):
```json
{
  "item": {
    "id": "uuid",
    "guidebook_id": "uuid",
    "name": "조기 체크인",
    "description": "체크인 시간을 2시간 앞당깁니다",
    "price": 20000,
    "image_url": "https://...",
    "is_active": true,
    "sort_order": 0,
    "created_at": "2024-01-28T00:00:00Z",
    "updated_at": "2024-01-28T00:00:00Z"
  }
}
```

**에러** (402 Payment Required):
```json
{
  "error": {
    "code": "PLAN_UPGRADE_REQUIRED",
    "message": "Upsell 기능은 Business 플랜에서만 사용할 수 있습니다",
    "upgradeUrl": "/settings/subscription"
  }
}
```

### 3. 아이템 수정

```http
PUT /api/guidebooks/[id]/upsell/items/[itemId]
```

**권한**: 호스트 본인만

**요청**:
```json
{
  "name": "조기 체크인 (할인)",
  "price": 15000,
  "is_active": false
}
```

**응답** (200 OK):
```json
{
  "item": {
    "id": "uuid",
    "name": "조기 체크인 (할인)",
    "price": 15000,
    "is_active": false,
    ...
  }
}
```

### 4. 아이템 삭제

```http
DELETE /api/guidebooks/[id]/upsell/items/[itemId]
```

**권한**: 호스트 본인만

**응답** (200 OK):
```json
{
  "success": true
}
```

## 사용 예시

### 프론트엔드에서 아이템 목록 표시

```typescript
// 게스트 뷰어에서 Upsell 아이템 표시
async function fetchUpsellItems(guidebookId: string) {
  const response = await fetch(`/api/guidebooks/${guidebookId}/upsell/items`);
  const data = await response.json();

  return data.items; // 활성화된 아이템만 반환됨
}
```

### 호스트 대시보드에서 아이템 생성

```typescript
async function createUpsellItem(guidebookId: string, itemData: CreateUpsellItemRequest) {
  const response = await fetch(`/api/guidebooks/${guidebookId}/upsell/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  });

  if (!response.ok) {
    if (response.status === 402) {
      // Business 플랜 업그레이드 필요
      const error = await response.json();
      window.location.href = error.error.upgradeUrl;
    }
    throw new Error('Failed to create upsell item');
  }

  return response.json();
}
```

## 검증 규칙

- **name**: 필수, 1~100자
- **description**: 선택, 최대 500자
- **price**: 필수, 0 이상, 1,000만원 이하
- **image_url**: 선택, 유효한 URL
- **is_active**: 선택, 기본값 true
- **sort_order**: 선택, 0 이상, 기본값 0

## 플랜별 제한

| 플랜 | Upsell 생성 |
|------|------------|
| Free | ❌ 불가 |
| Pro | ❌ 불가 |
| **Business** | ✅ **가능** |

## 마이그레이션

```bash
# Supabase Studio에서 실행
supabase/migrations/025_upsell_items.sql
```

또는 스크립트 사용:

```bash
node scripts/run-upsell-migration.js
```

## 관련 파일

- **마이그레이션**: `supabase/migrations/025_upsell_items.sql`
- **API Routes**:
  - `src/app/api/guidebooks/[id]/upsell/items/route.ts`
  - `src/app/api/guidebooks/[id]/upsell/items/[itemId]/route.ts`
- **타입**: `src/types/upsell.ts`
- **검증**: `src/lib/validations/upsell.ts`
- **테스트**: `tests/api/upsell/items.test.ts`

## 다음 단계

P8-R4에서 Upsell Request (게스트가 아이템 요청) 기능을 구현합니다.
