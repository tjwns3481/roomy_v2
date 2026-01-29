# P8-R4: upsell_request 리소스 API 구현 완료 보고서

## 📋 태스크 개요

- **태스크 ID**: P8-R4
- **담당 리소스**: upsell_request (게스트 Upsell 요청)
- **완료일**: 2026-01-29
- **상태**: ✅ 완료

---

## 🎯 구현 목표

게스트가 가이드북에서 Upsell 아이템을 요청하고, 호스트가 이를 관리할 수 있는 API 구축

### 핵심 요구사항
1. **게스트**: 인증 없이 Upsell 아이템 요청 생성 가능
2. **호스트**: 자신의 가이드북에 대한 요청 목록 조회 및 상태 관리
3. **RLS**: 삽입은 공개, 조회/수정은 호스트만
4. **통계**: 요청 상태별 통계 제공

---

## 📁 생성된 파일

### 1. DB 마이그레이션
```
supabase/migrations/026_upsell_requests.sql
```

**주요 내용**:
- `upsell_requests` 테이블 생성
- 인덱스: `guidebook_id`, `item_id`, `status`, `created_at`
- RLS 정책:
  - 삽입: 공개 (게스트 사용)
  - 조회/수정/삭제: 호스트만
- Helper 함수: `get_upsell_request_stats()`

**테이블 스키마**:
| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | 요청 ID |
| upsell_item_id | UUID | 아이템 ID (FK) |
| guidebook_id | UUID | 가이드북 ID (FK) |
| guest_name | TEXT | 게스트 이름 (선택) |
| guest_contact | TEXT | 게스트 연락처 (선택) |
| message | TEXT | 추가 메시지 (선택) |
| status | TEXT | 상태 (pending/confirmed/cancelled) |
| created_at | TIMESTAMPTZ | 생성 시각 |

### 2. 타입 정의
```
src/types/upsell.ts (업데이트)
```

**추가된 타입**:
- `UpsellRequestStatus`: 요청 상태 타입
- `UpsellRequest`: DB 스키마 타입
- `CreateUpsellRequestRequest`: 생성 요청 타입
- `UpdateUpsellRequestRequest`: 상태 변경 요청 타입
- `UpsellRequestsResponse`: 목록 응답 타입 (통계 포함)
- `UpsellRequestResponse`: 단일 응답 타입

### 3. 검증 스키마
```
src/lib/validations/upsell.ts (업데이트)
```

**추가된 스키마**:
- `createUpsellRequestSchema`: 게스트 요청 생성 검증
  - `upsell_item_id`: UUID 검증
  - `guest_name`: 최대 50자
  - `guest_contact`: 최대 50자
  - `message`: 최대 500자
- `updateUpsellRequestSchema`: 상태 변경 검증
  - `status`: pending/confirmed/cancelled 중 하나

### 4. API 엔드포인트

#### 4.1 게스트 요청 생성 API
```
src/app/api/upsell/requests/route.ts
```

**엔드포인트**: `POST /api/upsell/requests`

**요청 바디**:
```typescript
{
  upsell_item_id: string;  // 필수
  guest_name?: string;
  guest_contact?: string;
  message?: string;
}
```

**응답 (201 Created)**:
```typescript
{
  request: {
    id: string;
    upsell_item_id: string;
    guidebook_id: string;
    guest_name: string | null;
    guest_contact: string | null;
    message: string | null;
    status: 'pending';
    created_at: string;
  }
}
```

**에러 응답**:
- `400 VALIDATION_ERROR`: 입력값 검증 실패
- `404 ITEM_NOT_FOUND`: 아이템을 찾을 수 없음
- `400 ITEM_INACTIVE`: 비활성 아이템
- `500 CREATE_ERROR`: 생성 실패

**특징**:
- 인증 불필요 (게스트 공개 API)
- 아이템 존재 및 활성화 상태 확인
- RLS로 자동 보안 처리

#### 4.2 호스트 요청 목록 조회 API
```
src/app/api/guidebooks/[id]/upsell/requests/route.ts
```

**엔드포인트**: `GET /api/guidebooks/[id]/upsell/requests`

**쿼리 파라미터**:
- `status`: 'pending' | 'confirmed' | 'cancelled' (선택)
- `limit`: 개수 제한 (기본 50)
- `offset`: 페이지네이션 (기본 0)

**응답 (200 OK)**:
```typescript
{
  requests: Array<{
    id: string;
    upsell_item_id: string;
    guidebook_id: string;
    guest_name: string | null;
    guest_contact: string | null;
    message: string | null;
    status: 'pending' | 'confirmed' | 'cancelled';
    created_at: string;
    item_name: string;  // JOIN된 아이템 정보
    item_price: number;
  }>;
  total: number;
  stats: {
    pending: number;
    confirmed: number;
    cancelled: number;
  };
}
```

**에러 응답**:
- `401 UNAUTHORIZED`: 로그인 필요
- `404 GUIDEBOOK_NOT_FOUND`: 가이드북을 찾을 수 없음
- `403 FORBIDDEN`: 권한 없음
- `500 FETCH_ERROR`: 조회 실패

**특징**:
- 인증 필수
- 가이드북 소유권 확인
- 아이템 정보와 JOIN
- RPC 함수로 통계 조회
- 상태별 필터링 지원
- 페이지네이션 지원

#### 4.3 호스트 요청 상태 변경 API
```
src/app/api/guidebooks/[id]/upsell/requests/[reqId]/route.ts
```

**엔드포인트**: `PATCH /api/guidebooks/[id]/upsell/requests/[reqId]`

**요청 바디**:
```typescript
{
  status: 'pending' | 'confirmed' | 'cancelled'
}
```

**응답 (200 OK)**:
```typescript
{
  request: {
    id: string;
    upsell_item_id: string;
    guidebook_id: string;
    guest_name: string | null;
    guest_contact: string | null;
    message: string | null;
    status: 'pending' | 'confirmed' | 'cancelled';
    created_at: string;
  }
}
```

**에러 응답**:
- `400 VALIDATION_ERROR`: 입력값 검증 실패
- `401 UNAUTHORIZED`: 로그인 필요
- `404 GUIDEBOOK_NOT_FOUND`: 가이드북을 찾을 수 없음
- `403 FORBIDDEN`: 권한 없음
- `404 REQUEST_NOT_FOUND`: 요청을 찾을 수 없음
- `500 UPDATE_ERROR`: 업데이트 실패

**엔드포인트**: `DELETE /api/guidebooks/[id]/upsell/requests/[reqId]`

**응답 (200 OK)**:
```typescript
{
  success: true
}
```

**특징**:
- 인증 필수
- 가이드북 소유권 확인
- 요청 존재 확인
- 상태 변경만 가능 (다른 필드는 수정 불가)

### 5. 테스트 파일
```
tests/api/upsell-requests.test.ts
```

**테스트 커버리지**:

#### POST /api/upsell/requests
- ✅ 게스트가 Upsell 요청을 생성할 수 있어야 함
- ✅ 존재하지 않는 아이템은 404 에러를 반환해야 함
- ✅ 비활성 아이템은 400 에러를 반환해야 함
- ✅ 유효하지 않은 데이터는 400 에러를 반환해야 함

#### GET /api/guidebooks/[id]/upsell/requests
- ✅ 호스트가 자신의 가이드북 요청 목록을 조회할 수 있어야 함
- ✅ 인증되지 않은 사용자는 401 에러를 반환해야 함
- ✅ 다른 사용자의 가이드북은 403 에러를 반환해야 함

#### PATCH /api/guidebooks/[id]/upsell/requests/[reqId]
- ✅ 호스트가 요청 상태를 변경할 수 있어야 함
- ✅ 유효하지 않은 상태는 400 에러를 반환해야 함

#### DELETE /api/guidebooks/[id]/upsell/requests/[reqId]
- ✅ 호스트가 요청을 삭제할 수 있어야 함

---

## 🔐 보안 및 RLS 정책

### RLS 정책 요약

| 작업 | 권한 | 정책 |
|------|------|------|
| INSERT | 공개 | `true` (게스트 누구나 요청 가능) |
| SELECT | 호스트 | 본인 가이드북 요청만 |
| UPDATE | 호스트 | 본인 가이드북 요청만 |
| DELETE | 호스트 | 본인 가이드북 요청만 |

### 보안 특징
1. **게스트 요청**: 인증 없이 누구나 요청 생성 가능 (스팸 방지는 애플리케이션 레벨에서)
2. **호스트 관리**: 본인 가이드북의 요청만 조회/수정/삭제 가능
3. **CASCADE 삭제**: 가이드북/아이템 삭제 시 관련 요청 자동 삭제
4. **검증**: Zod 스키마로 입력값 검증
5. **에러 처리**: 명확한 에러 코드 및 메시지

---

## 📊 Helper 함수

### `get_upsell_request_stats(p_guidebook_id UUID)`

**목적**: 가이드북별 Upsell 요청 통계 조회

**반환값**:
```sql
TABLE (
  total_requests BIGINT,
  pending_requests BIGINT,
  confirmed_requests BIGINT,
  cancelled_requests BIGINT
)
```

**사용 예시**:
```typescript
const { data, error } = await supabase
  .rpc('get_upsell_request_stats', {
    p_guidebook_id: 'guidebook-123'
  })
  .single();

// 결과: { total_requests: 10, pending_requests: 5, ... }
```

---

## 🔄 API 사용 예시

### 게스트: Upsell 아이템 요청
```typescript
// 1. 가이드북 페이지에서 아이템 목록 표시
const { data: items } = await fetch('/api/guidebooks/guidebook-123/upsell/items');

// 2. 게스트가 아이템 선택 후 요청 생성
const response = await fetch('/api/upsell/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    upsell_item_id: 'item-123',
    guest_name: '홍길동',
    guest_contact: '010-1234-5678',
    message: '조식 추가 부탁드립니다',
  }),
});

const { request } = await response.json();
// request.status === 'pending'
```

### 호스트: 요청 목록 조회 및 관리
```typescript
// 1. 대시보드에서 pending 요청만 조회
const response = await fetch(
  '/api/guidebooks/guidebook-123/upsell/requests?status=pending&limit=20'
);

const { requests, total, stats } = await response.json();
// stats: { pending: 5, confirmed: 3, cancelled: 1 }

// 2. 요청 승인
await fetch('/api/guidebooks/guidebook-123/upsell/requests/request-123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'confirmed' }),
});

// 3. 요청 취소
await fetch('/api/guidebooks/guidebook-123/upsell/requests/request-456', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'cancelled' }),
});

// 4. 요청 삭제
await fetch('/api/guidebooks/guidebook-123/upsell/requests/request-789', {
  method: 'DELETE',
});
```

---

## 🎓 Lessons Learned

### 1. 공개 API 설계
- **문제**: 게스트가 인증 없이 요청을 생성해야 함
- **해결**: RLS 정책에서 INSERT는 `true`로 설정하여 누구나 삽입 가능
- **교훈**: 공개 API는 스팸 방지를 위해 rate limiting, CAPTCHA 등 추가 보안 필요

### 2. JOIN과 통계 조회
- **문제**: 요청 목록에 아이템 정보와 통계를 함께 반환해야 함
- **해결**:
  - Supabase의 nested select로 아이템 정보 JOIN
  - RPC 함수로 통계 조회
- **교훈**: 복잡한 쿼리는 RPC 함수로 캡슐화하면 API 코드가 간결해짐

### 3. 상태별 필터링
- **문제**: 호스트가 pending 요청만 보고 싶어함
- **해결**: 쿼리 파라미터로 `status` 필터링 지원
- **교훈**: 선택적 필터링은 쿼리 파라미터로 구현하면 유연성 향상

### 4. 소유권 확인 패턴
- **문제**: 호스트가 다른 가이드북의 요청을 수정하지 못하도록 해야 함
- **해결**:
  1. 가이드북 조회 → 소유권 확인
  2. 요청 조회 → guidebook_id 일치 확인
- **교훈**: 이중 확인으로 보안 강화 (RLS + 애플리케이션 레벨)

### 5. 에러 응답 표준화
- **문제**: 다양한 에러 상황에 대한 일관된 응답 필요
- **해결**: 에러 코드 체계 정립
  - `VALIDATION_ERROR`: 입력값 문제
  - `UNAUTHORIZED`: 인증 필요
  - `FORBIDDEN`: 권한 없음
  - `*_NOT_FOUND`: 리소스 없음
  - `*_ERROR`: 서버 오류
- **교훈**: 에러 코드는 클라이언트가 적절히 대응할 수 있도록 구체적으로 정의

---

## 🚀 다음 단계

### 프론트엔드 통합 (frontend-specialist에게 전달)
1. **게스트 뷰어**: Upsell 아이템 요청 폼
2. **호스트 대시보드**: 요청 목록 및 상태 관리 UI
3. **알림**: 새 요청 발생 시 호스트에게 알림

### 추가 기능 고려사항
1. **스팸 방지**: Rate limiting, CAPTCHA
2. **알림톡 연동**: 요청 생성/상태 변경 시 호스트/게스트에게 알림
3. **결제 연동**: 확정된 요청에 대한 결제 처리
4. **통계 대시보드**: 아이템별 요청 통계, 전환율 분석

---

## ✅ 완료 체크리스트

- [x] DB 마이그레이션 작성
- [x] RLS 정책 설정
- [x] Helper 함수 구현
- [x] 타입 정의
- [x] 검증 스키마
- [x] POST /api/upsell/requests API
- [x] GET /api/guidebooks/[id]/upsell/requests API
- [x] PATCH /api/guidebooks/[id]/upsell/requests/[reqId] API
- [x] DELETE /api/guidebooks/[id]/upsell/requests/[reqId] API
- [x] 테스트 작성 (단위 테스트)
- [x] 타입 체크 통과
- [x] 문서화

---

## 📝 태그

`@TASK P8-R4` `@RESOURCE upsell_request` `@API` `@RLS` `@TDD`

**TASK_DONE**
