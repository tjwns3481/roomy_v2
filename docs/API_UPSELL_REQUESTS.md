# Upsell Requests API Reference

> @TASK P8-R4: 게스트 Upsell 요청 관리 API

## 개요

Upsell Requests API는 게스트가 가이드북에서 추가 서비스/상품을 요청하고, 호스트가 이를 관리할 수 있는 기능을 제공합니다.

### 주요 특징
- 게스트는 **인증 없이** 요청 생성 가능
- 호스트는 자신의 가이드북 요청만 조회/관리
- 상태별 통계 제공
- RLS로 자동 권한 제어

---

## 엔드포인트 목록

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/api/upsell/requests` | 게스트가 요청 생성 | 불필요 |
| GET | `/api/guidebooks/[id]/upsell/requests` | 호스트가 요청 목록 조회 | 필수 |
| PATCH | `/api/guidebooks/[id]/upsell/requests/[reqId]` | 호스트가 요청 상태 변경 | 필수 |
| DELETE | `/api/guidebooks/[id]/upsell/requests/[reqId]` | 호스트가 요청 삭제 | 필수 |

---

## API 상세

### 1. 요청 생성 (게스트)

게스트가 Upsell 아이템을 요청합니다.

**엔드포인트**: `POST /api/upsell/requests`

**인증**: 불필요 (공개 API)

**요청 바디**:
```typescript
{
  upsell_item_id: string;  // 필수, UUID 형식
  guest_name?: string;     // 선택, 최대 50자
  guest_contact?: string;  // 선택, 최대 50자
  message?: string;        // 선택, 최대 500자
}
```

**응답 (201 Created)**:
```json
{
  "request": {
    "id": "req-uuid",
    "upsell_item_id": "item-uuid",
    "guidebook_id": "guidebook-uuid",
    "guest_name": "홍길동",
    "guest_contact": "010-1234-5678",
    "message": "조식 추가 부탁드립니다",
    "status": "pending",
    "created_at": "2026-01-29T12:00:00Z"
  }
}
```

**에러 응답**:
| 코드 | 상태 | 설명 |
|------|------|------|
| VALIDATION_ERROR | 400 | 입력값 검증 실패 |
| ITEM_NOT_FOUND | 404 | 아이템을 찾을 수 없음 |
| ITEM_INACTIVE | 400 | 비활성 아이템 |
| CREATE_ERROR | 500 | 생성 실패 |

**사용 예시**:
```typescript
const response = await fetch('/api/upsell/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    upsell_item_id: 'item-123',
    guest_name: '홍길동',
    guest_contact: '010-1234-5678',
    message: '조식 2인분 추가 부탁드립니다',
  }),
});

if (response.ok) {
  const { request } = await response.json();
  console.log('요청 생성 완료:', request.id);
} else {
  const { error } = await response.json();
  console.error('에러:', error.message);
}
```

---

### 2. 요청 목록 조회 (호스트)

호스트가 자신의 가이드북에 대한 Upsell 요청 목록을 조회합니다.

**엔드포인트**: `GET /api/guidebooks/[id]/upsell/requests`

**인증**: 필수 (Bearer Token)

**쿼리 파라미터**:
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| status | string | - | 상태 필터 (pending/confirmed/cancelled) |
| limit | number | 50 | 페이지 크기 |
| offset | number | 0 | 페이지 오프셋 |

**응답 (200 OK)**:
```json
{
  "requests": [
    {
      "id": "req-uuid",
      "upsell_item_id": "item-uuid",
      "guidebook_id": "guidebook-uuid",
      "guest_name": "홍길동",
      "guest_contact": "010-1234-5678",
      "message": "조식 추가 부탁드립니다",
      "status": "pending",
      "created_at": "2026-01-29T12:00:00Z",
      "item_name": "조식 서비스",
      "item_price": 15000
    }
  ],
  "total": 25,
  "stats": {
    "pending": 10,
    "confirmed": 12,
    "cancelled": 3
  }
}
```

**에러 응답**:
| 코드 | 상태 | 설명 |
|------|------|------|
| UNAUTHORIZED | 401 | 로그인 필요 |
| GUIDEBOOK_NOT_FOUND | 404 | 가이드북을 찾을 수 없음 |
| FORBIDDEN | 403 | 권한 없음 |
| FETCH_ERROR | 500 | 조회 실패 |

**사용 예시**:
```typescript
// pending 요청만 조회 (첫 20개)
const response = await fetch(
  '/api/guidebooks/guidebook-123/upsell/requests?status=pending&limit=20',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

const { requests, total, stats } = await response.json();
console.log(`총 ${total}개 요청, pending: ${stats.pending}`);
```

---

### 3. 요청 상태 변경 (호스트)

호스트가 Upsell 요청의 상태를 변경합니다.

**엔드포인트**: `PATCH /api/guidebooks/[id]/upsell/requests/[reqId]`

**인증**: 필수 (Bearer Token)

**요청 바디**:
```typescript
{
  status: 'pending' | 'confirmed' | 'cancelled'
}
```

**응답 (200 OK)**:
```json
{
  "request": {
    "id": "req-uuid",
    "upsell_item_id": "item-uuid",
    "guidebook_id": "guidebook-uuid",
    "guest_name": "홍길동",
    "guest_contact": "010-1234-5678",
    "message": "조식 추가 부탁드립니다",
    "status": "confirmed",
    "created_at": "2026-01-29T12:00:00Z"
  }
}
```

**에러 응답**:
| 코드 | 상태 | 설명 |
|------|------|------|
| VALIDATION_ERROR | 400 | 입력값 검증 실패 |
| UNAUTHORIZED | 401 | 로그인 필요 |
| GUIDEBOOK_NOT_FOUND | 404 | 가이드북을 찾을 수 없음 |
| FORBIDDEN | 403 | 권한 없음 |
| REQUEST_NOT_FOUND | 404 | 요청을 찾을 수 없음 |
| UPDATE_ERROR | 500 | 업데이트 실패 |

**사용 예시**:
```typescript
// 요청 승인
const response = await fetch(
  '/api/guidebooks/guidebook-123/upsell/requests/req-456',
  {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status: 'confirmed' }),
  }
);

if (response.ok) {
  const { request } = await response.json();
  console.log('상태 변경 완료:', request.status);
}
```

---

### 4. 요청 삭제 (호스트)

호스트가 Upsell 요청을 삭제합니다.

**엔드포인트**: `DELETE /api/guidebooks/[id]/upsell/requests/[reqId]`

**인증**: 필수 (Bearer Token)

**응답 (200 OK)**:
```json
{
  "success": true
}
```

**에러 응답**:
| 코드 | 상태 | 설명 |
|------|------|------|
| UNAUTHORIZED | 401 | 로그인 필요 |
| GUIDEBOOK_NOT_FOUND | 404 | 가이드북을 찾을 수 없음 |
| FORBIDDEN | 403 | 권한 없음 |
| DELETE_ERROR | 500 | 삭제 실패 |

**사용 예시**:
```typescript
const response = await fetch(
  '/api/guidebooks/guidebook-123/upsell/requests/req-456',
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

if (response.ok) {
  console.log('요청 삭제 완료');
}
```

---

## 데이터 모델

### UpsellRequest

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string (UUID) | 요청 고유 ID |
| upsell_item_id | string (UUID) | 아이템 ID (FK) |
| guidebook_id | string (UUID) | 가이드북 ID (FK) |
| guest_name | string \| null | 게스트 이름 |
| guest_contact | string \| null | 게스트 연락처 |
| message | string \| null | 추가 메시지 |
| status | UpsellRequestStatus | 요청 상태 |
| created_at | string (ISO 8601) | 생성 시각 |

### UpsellRequestStatus

```typescript
type UpsellRequestStatus =
  | 'pending'     // 대기 중
  | 'confirmed'   // 승인됨
  | 'cancelled';  // 취소됨
```

---

## 권한 및 보안

### RLS 정책

| 작업 | 권한 | 설명 |
|------|------|------|
| INSERT | 공개 | 게스트 누구나 요청 생성 가능 |
| SELECT | 호스트 | 본인 가이드북의 요청만 조회 |
| UPDATE | 호스트 | 본인 가이드북의 요청만 수정 |
| DELETE | 호스트 | 본인 가이드북의 요청만 삭제 |

### 검증 규칙

| 필드 | 규칙 |
|------|------|
| upsell_item_id | UUID 형식, 존재하는 활성 아이템 |
| guest_name | 최대 50자 |
| guest_contact | 최대 50자 |
| message | 최대 500자 |
| status | pending, confirmed, cancelled 중 하나 |

---

## 사용 시나리오

### 시나리오 1: 게스트가 조식 추가 요청

```typescript
// 1. 가이드북 페이지에서 Upsell 아이템 목록 표시
const { data: items } = await fetch('/api/guidebooks/my-pension/upsell/items');

// 2. 게스트가 "조식 서비스" 선택 후 요청 폼 작성
const requestData = {
  upsell_item_id: items[0].id,
  guest_name: '김철수',
  guest_contact: '010-9876-5432',
  message: '성인 2, 어린이 1 (5세) 조식 부탁드립니다',
};

// 3. 요청 생성
const response = await fetch('/api/upsell/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestData),
});

// 4. 성공 메시지 표시
const { request } = await response.json();
alert('요청이 접수되었습니다. 호스트 확인 후 연락드리겠습니다.');
```

### 시나리오 2: 호스트가 요청 관리

```typescript
// 1. 대시보드에서 새 요청 확인
const { requests, stats } = await fetch(
  '/api/guidebooks/my-pension/upsell/requests?status=pending',
  { headers: { 'Authorization': `Bearer ${token}` } }
).then(r => r.json());

console.log(`새 요청 ${stats.pending}개`);

// 2. 요청 상세 확인 후 승인
for (const req of requests) {
  console.log(`${req.item_name} - ${req.guest_name} (${req.guest_contact})`);

  // 호스트가 승인 버튼 클릭
  if (confirm('이 요청을 승인하시겠습니까?')) {
    await fetch(
      `/api/guidebooks/my-pension/upsell/requests/${req.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'confirmed' }),
      }
    );

    // 게스트에게 확정 알림 발송 (카카오톡, 이메일 등)
    sendNotification(req.guest_contact, '조식 서비스가 확정되었습니다.');
  }
}
```

### 시나리오 3: 통계 대시보드

```typescript
// 호스트가 Upsell 요청 통계 확인
const { stats } = await fetch(
  '/api/guidebooks/my-pension/upsell/requests',
  { headers: { 'Authorization': `Bearer ${token}` } }
).then(r => r.json());

// 대시보드에 표시
renderDashboard({
  total: stats.pending + stats.confirmed + stats.cancelled,
  pending: stats.pending,
  confirmed: stats.confirmed,
  cancelled: stats.cancelled,
  conversionRate: (stats.confirmed / (stats.pending + stats.confirmed)) * 100,
});
```

---

## 에러 처리 가이드

### 클라이언트 측 에러 처리

```typescript
async function createUpsellRequest(data: CreateUpsellRequestRequest) {
  try {
    const response = await fetch('/api/upsell/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const { error } = await response.json();

      switch (error.code) {
        case 'VALIDATION_ERROR':
          alert('입력 정보를 확인해주세요.');
          break;
        case 'ITEM_NOT_FOUND':
          alert('요청하신 아이템을 찾을 수 없습니다.');
          break;
        case 'ITEM_INACTIVE':
          alert('현재 이용할 수 없는 아이템입니다.');
          break;
        default:
          alert('요청 생성 중 오류가 발생했습니다.');
      }

      return null;
    }

    const { request } = await response.json();
    return request;
  } catch (error) {
    console.error('Network error:', error);
    alert('네트워크 오류가 발생했습니다.');
    return null;
  }
}
```

---

## 관련 API

- [Upsell Items API](./API_UPSELL_ITEMS.md) - Upsell 아이템 관리
- [Guidebooks API](./API_GUIDEBOOKS.md) - 가이드북 관리
- [Notifications API](./API_NOTIFICATIONS.md) - 알림 발송 (향후 추가)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-01-29 | 초기 버전 (P8-R4) |

---

**태그**: `@API` `@UPSELL` `@P8-R4` `@GUEST` `@HOST`
