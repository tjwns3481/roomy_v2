# P8-R3: Upsell Items API - 완료 보고서

## 구현 완료 항목

### 1. 데이터베이스 (✅ 완료)

**파일**: `supabase/migrations/025_upsell_items.sql`

- **테이블**: `upsell_items` 생성
  - 필드: id, guidebook_id, name, description, price, image_url, is_active, sort_order
  - 인덱스: guidebook_id, (guidebook_id, is_active), (guidebook_id, sort_order)
  - Updated_at 트리거 자동 적용

- **RLS 정책**:
  - 조회: 호스트 본인 전체 + 게스트 활성화된 것만
  - 생성/수정/삭제: 호스트 본인만

- **Helper 함수**:
  - `can_create_upsell_item(user_id)`: Business 플랜 체크

### 2. TypeScript 타입 (✅ 완료)

**파일**: `src/types/upsell.ts`

- `UpsellItem`: DB 스키마 타입
- `CreateUpsellItemRequest`: 생성 요청
- `UpdateUpsellItemRequest`: 수정 요청
- `UpsellItemsResponse`: 목록 응답
- `UpsellItemResponse`: 단일 아이템 응답

### 3. Zod 검증 스키마 (✅ 완료)

**파일**: `src/lib/validations/upsell.ts`

- `createUpsellItemSchema`: 생성 시 검증
  - name: 1~100자 필수
  - description: 최대 500자
  - price: 0~10,000,000원
  - image_url: 유효한 URL
  - is_active: 기본값 true
  - sort_order: 기본값 0

- `updateUpsellItemSchema`: 수정 시 검증
  - 최소 1개 필드 필수

### 4. API Routes (✅ 완료)

#### 4.1. 목록/생성 API
**파일**: `src/app/api/guidebooks/[id]/upsell/items/route.ts`

- **GET**: 아이템 목록 조회
  - 호스트: 모든 아이템
  - 게스트: 활성화된 아이템만
  - 정렬: sort_order ASC

- **POST**: 아이템 생성
  - 인증 확인
  - 가이드북 소유권 확인
  - Business 플랜 체크 (RPC)
  - Zod 검증
  - 생성 후 201 응답

#### 4.2. 수정/삭제 API
**파일**: `src/app/api/guidebooks/[id]/upsell/items/[itemId]/route.ts`

- **PUT**: 아이템 수정
  - 소유권 확인
  - Zod 검증
  - 수정 후 200 응답

- **DELETE**: 아이템 삭제
  - 소유권 확인
  - 삭제 후 200 응답

### 5. 에러 핸들링 (✅ 완료)

모든 API에서 표준화된 에러 응답:

| 상태 코드 | 에러 코드 | 설명 |
|---------|----------|------|
| 400 | VALIDATION_ERROR | 입력 데이터 검증 실패 |
| 401 | UNAUTHORIZED | 인증 필요 |
| 402 | PLAN_UPGRADE_REQUIRED | Business 플랜 필요 |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | NOT_FOUND | 리소스 없음 |
| 500 | FETCH_ERROR, CREATE_ERROR, UPDATE_ERROR, DELETE_ERROR | 서버 에러 |

### 6. 테스트 (✅ 완료)

**파일**: `tests/api/upsell/items.test.ts`

총 **11개 테스트 케이스**:

- **GET 테스트** (3개):
  - ✅ 호스트는 모든 아이템 조회
  - ✅ 게스트는 활성화된 아이템만 조회
  - ✅ 조회 에러 시 500 반환

- **POST 테스트** (5개):
  - ✅ Business 플랜 사용자는 생성 가능
  - ✅ Business 플랜 아니면 402 반환
  - ✅ 인증 없으면 401 반환
  - ✅ 다른 사용자 가이드북에는 403 반환
  - ✅ 유효하지 않은 데이터는 400 반환

- **PUT 테스트** (3개):
  - ✅ 호스트는 자신의 아이템 수정 가능
  - ✅ 다른 사용자 아이템은 403 반환
  - ✅ 존재하지 않는 아이템은 404 반환

- **DELETE 테스트** (2개):
  - ✅ 호스트는 자신의 아이템 삭제 가능
  - ✅ 다른 사용자 아이템은 403 반환

### 7. 문서화 (✅ 완료)

- **API 문서**: `docs/api/P8-R3-upsell-items.md`
  - 엔드포인트 설명
  - 요청/응답 예시
  - 에러 코드 목록
  - 사용 예시 코드

- **마이그레이션 스크립트**: `scripts/run-upsell-migration.js`
  - 환경 변수 검증
  - SQL 실행 자동화

### 8. 빌드 검증 (✅ 완료)

- ✅ TypeScript 타입 체크 통과
- ✅ Next.js 빌드 성공
- ✅ 모든 파일 생성 확인

## 파일 목록

```
worktree/phase-8-production/
├── supabase/migrations/
│   └── 025_upsell_items.sql                           # DB 마이그레이션
├── src/
│   ├── app/api/guidebooks/[id]/upsell/items/
│   │   ├── route.ts                                   # GET, POST
│   │   └── [itemId]/route.ts                          # PUT, DELETE
│   ├── types/
│   │   └── upsell.ts                                  # TypeScript 타입
│   └── lib/validations/
│       └── upsell.ts                                  # Zod 스키마
├── tests/api/upsell/
│   └── items.test.ts                                  # API 테스트 (11개)
├── scripts/
│   └── run-upsell-migration.js                        # 마이그레이션 스크립트
└── docs/api/
    └── P8-R3-upsell-items.md                          # API 문서
```

## API 엔드포인트 요약

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/guidebooks/[id]/upsell/items` | 아이템 목록 조회 | Public (게스트는 활성화된 것만) |
| POST | `/api/guidebooks/[id]/upsell/items` | 아이템 생성 | Business 플랜 호스트 |
| PUT | `/api/guidebooks/[id]/upsell/items/[itemId]` | 아이템 수정 | 호스트 본인 |
| DELETE | `/api/guidebooks/[id]/upsell/items/[itemId]` | 아이템 삭제 | 호스트 본인 |

## 주요 특징

1. **플랜 기반 접근 제어**: Business 플랜만 Upsell 아이템 생성 가능
2. **RLS 자동 적용**: 호스트/게스트 권한 자동 분리
3. **검증 계층**: Zod 스키마 + DB 제약 조건 이중 검증
4. **에러 응답 표준화**: upgradeUrl 포함으로 UX 개선
5. **테스트 커버리지**: 11개 테스트로 핵심 시나리오 검증

## 다음 단계

- **P8-R4**: Upsell Request API 구현 (게스트가 아이템 요청)
  - 게스트가 아이템 선택 + 연락처 입력
  - 호스트가 요청 승인/거부
  - 알림톡 연동 (P8-T8.9)

## 주의사항

⚠️ **마이그레이션 수동 실행 필요**:
- Worktree에 `.env.local` 파일이 없어 자동 마이그레이션 실패
- Supabase Studio에서 `025_upsell_items.sql` 수동 실행 필요
- 또는 프로덕션 환경에서 스크립트 실행

## 태그

`@TASK P8-R3` - 모든 파일에 태그 추가 완료

---

**TASK_DONE**: P8-R3 Upsell Items API 구현 완료 ✅
