# Roomy Core Database Setup

## 개요

이 문서는 Roomy 게스트 가이드북 SaaS의 Supabase 데이터베이스 스키마 설정 방법을 설명합니다.

## 마이그레이션 실행

### 1. Supabase CLI를 통한 마이그레이션 실행

프로젝트 루트에서:

```bash
# Supabase 프로젝트에 마이그레이션 적용
npx supabase migration up

# 또는 로컬 개발 환경
supabase start
```

### 2. 마이그레이션 파일 정보

#### 001_core_schema.sql
- **포함 사항**:
  - profiles 테이블 (auth.users 확장)
  - guidebooks 테이블
  - blocks 테이블
  - block_images 테이블
  - updated_at 자동 업데이트 트리거
  - RLS (Row Level Security) 정책

#### 002_storage_setup.sql (P0-T0.5)
- **포함 사항**:
  - guidebook-images Storage bucket 설정
  - Storage RLS 정책 (업로드/수정/삭제/조회)
  - view_stats 테이블 및 RLS 정책
  - Helper 함수 (get_storage_url, can_create_guidebook, can_generate_with_ai 등)

## TypeScript 타입 생성

### 1. Supabase 타입 자동 생성

```bash
npx supabase gen types typescript --project-id bzzdaptscqkshwqehpmc > src/lib/supabase/database.types.ts
```

**필수**: `bzzdaptscqkshwqehpmc`를 실제 Supabase 프로젝트 ID로 교체하세요.

### 2. 생성된 타입 확인

`src/lib/supabase/database.types.ts` 파일이 생성되면, 다음 타입들이 포함됩니다:

```typescript
// Profiles
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Guidebooks
export type Guidebook = Database['public']['Tables']['guidebooks']['Row'];
export type GuidebookInsert = Database['public']['Tables']['guidebooks']['Insert'];
export type GuidebookUpdate = Database['public']['Tables']['guidebooks']['Update'];

// Blocks
export type Block = Database['public']['Tables']['blocks']['Row'];
export type BlockInsert = Database['public']['Tables']['blocks']['Insert'];
export type BlockUpdate = Database['public']['Tables']['blocks']['Update'];

// Block Images
export type BlockImage = Database['public']['Tables']['block_images']['Row'];
export type BlockImageInsert = Database['public']['Tables']['block_images']['Insert'];
export type BlockImageUpdate = Database['public']['Tables']['block_images']['Update'];
```

## 테이블 구조

### profiles (사용자 프로필)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본 키 (auth.users.id와 연결) |
| email | TEXT | 이메일 주소 |
| display_name | TEXT | 표시 이름 |
| avatar_url | TEXT | 프로필 이미지 URL |
| plan | TEXT | 플랜 유형 (free/pro/business) |
| guidebook_count | INT | 생성한 가이드북 개수 |
| max_guidebooks | INT | 생성 가능한 최대 가이드북 개수 |
| ai_generation_count | INT | AI 생성 사용 횟수 |
| max_ai_generations | INT | 월별 AI 생성 한도 |
| created_at | TIMESTAMPTZ | 생성 시간 |
| updated_at | TIMESTAMPTZ | 최종 수정 시간 |

**인덱스**:
- idx_profiles_email (email)

**RLS 정책**:
- SELECT: 자신의 프로필만 조회
- UPDATE: 자신의 프로필만 수정

---

### guidebooks (가이드북)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본 키 |
| user_id | UUID | 소유자 (profiles.id) |
| title | TEXT | 가이드북 제목 |
| slug | TEXT | URL 슬러그 (/g/[slug]) |
| description | TEXT | 가이드북 설명 |
| airbnb_url | TEXT | Airbnb 링크 (AI 생성 시) |
| property_type | TEXT | 숙소 유형 |
| address | TEXT | 주소 |
| latitude | DECIMAL | 위도 |
| longitude | DECIMAL | 경도 |
| status | TEXT | 상태 (draft/published/archived) |
| is_password_protected | BOOLEAN | 비밀번호 보호 여부 |
| password_hash | TEXT | 비밀번호 해시 (bcrypt) |
| theme | TEXT | 테마 (modern/cozy/minimal/nature/luxury) |
| primary_color | TEXT | 주 색상 |
| secondary_color | TEXT | 보조 색상 |
| hero_image_url | TEXT | 히어로 이미지 |
| og_image_url | TEXT | SNS 공유 이미지 |
| view_count | INT | 조회수 |
| created_at | TIMESTAMPTZ | 생성 시간 |
| updated_at | TIMESTAMPTZ | 최종 수정 시간 |

**인덱스**:
- idx_guidebooks_slug (slug, UNIQUE)
- idx_guidebooks_user_id (user_id)
- idx_guidebooks_status (status)

**RLS 정책**:
- SELECT: 자신의 가이드북 또는 published 가이드북 조회
- INSERT: 자신의 사용자 ID로만 생성
- UPDATE: 자신의 가이드북만 수정
- DELETE: 자신의 가이드북만 삭제

---

### blocks (콘텐츠 블록)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본 키 |
| guidebook_id | UUID | 소속 가이드북 |
| type | TEXT | 블록 타입 |
| order_index | INT | 블록 순서 |
| content | JSONB | 블록 콘텐츠 |
| is_visible | BOOLEAN | 표시 여부 |
| created_at | TIMESTAMPTZ | 생성 시간 |
| updated_at | TIMESTAMPTZ | 최종 수정 시간 |

**블록 타입**:
- `hero`: 히어로 섹션
- `quickInfo`: 체크인/와이파이/도어락 정보
- `amenities`: 편의시설
- `rules`: 이용 규칙
- `map`: 지도
- `gallery`: 이미지 갤러리
- `notice`: 공지사항
- `custom`: 커스텀 섹션

**인덱스**:
- idx_blocks_guidebook_order (guidebook_id, order_index)
- idx_blocks_type (type)

**RLS 정책**:
- SELECT: 자신의 가이드북 또는 published 가이드북 블록 조회
- INSERT/UPDATE/DELETE: 자신의 가이드북 블록만 관리

---

### block_images (블록 이미지)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본 키 |
| block_id | UUID | 소속 블록 |
| storage_path | TEXT | Supabase Storage 경로 |
| file_name | TEXT | 파일명 |
| file_size | INT | 파일 크기 (바이트) |
| mime_type | TEXT | MIME 타입 |
| alt_text | TEXT | 대체 텍스트 |
| caption | TEXT | 캡션 |
| order_index | INT | 순서 |
| created_at | TIMESTAMPTZ | 생성 시간 |

**인덱스**:
- idx_block_images_block_order (block_id, order_index)

**RLS 정책**:
- SELECT: 자신의 가이드북 또는 published 가이드북 이미지 조회
- INSERT/UPDATE/DELETE: 자신의 가이드북 이미지만 관리

---

## Storage 버킷 설정 (P0-T0.5)

### guidebook-images 버킷

| 속성 | 값 | 설명 |
|------|------|------|
| 이름 | `guidebook-images` | 버킷 ID 및 이름 |
| 공개 | 예 (public: true) | 게스트 뷰어에서 접근 가능 |
| 파일 크기 제한 | 10MB | 개당 이미지 크기 제한 |
| 허용 MIME 타입 | image/jpeg, image/png, image/webp, image/gif | 이미지 파일만 허용 |

### Storage RLS 정책

#### 1. 업로드 정책 (INSERT)
- **대상**: 인증된 사용자
- **조건**: 경로는 `{user_id}/{guidebook_id}/{filename}` 형식
- **효과**: 사용자는 자신의 폴더에만 파일 업로드 가능

#### 2. 수정 정책 (UPDATE)
- **대상**: 인증된 사용자
- **조건**: 본인이 업로드한 파일만
- **효과**: 사용자는 자신의 파일만 수정 가능

#### 3. 삭제 정책 (DELETE)
- **대상**: 인증된 사용자
- **조건**: 본인이 업로드한 파일만
- **효과**: 사용자는 자신의 파일만 삭제 가능

#### 4. 조회 정책 (SELECT)
- **대상**: 공개 사용자 (public)
- **조건**: guidebook-images 버킷
- **효과**: 누구나 공개 이미지 조회 가능 (게스트 뷰어에서 접근)

### 이미지 URL 구성

Storage에 저장된 이미지의 공개 URL:

```
https://bzzdaptscqkshwqehpmc.supabase.co/storage/v1/object/public/guidebook-images/{user_id}/{guidebook_id}/{filename}
```

또는 `get_storage_url()` 함수 사용:

```sql
SELECT get_storage_url('guidebook-images', 'user_id/guidebook_id/filename');
```

---

## 조회 통계 테이블 (P2 단계)

### view_stats 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본 키 |
| guidebook_id | UUID | 가이드북 ID (guidebooks.id) |
| date | DATE | 통계 날짜 |
| views | INT | 조회수 |
| unique_visitors | INT | 고유 방문자 수 |
| created_at | TIMESTAMPTZ | 생성 시간 |
| updated_at | TIMESTAMPTZ | 최종 수정 시간 |

**인덱스**:
- idx_view_stats_guidebook_date (guidebook_id, date)

**고유 제약**:
- unique_guidebook_date (guidebook_id별 date 중복 방지)

**RLS 정책**:
- SELECT: 가이드북 소유자만 통계 조회 가능
- ALL: 서비스 롤(service_role)만 통계 업데이트 가능

---

## 트리거 및 함수

### update_updated_at_column()

모든 테이블의 `updated_at` 컬럼을 자동으로 현재 시간으로 업데이트하는 함수입니다.

**적용 테이블**:
- profiles
- guidebooks
- blocks
- view_stats

---

## Helper 함수 (P0-T0.5)

### get_storage_url(bucket_name, file_path)

Storage URL을 동적으로 생성합니다.

```sql
SELECT get_storage_url('guidebook-images', 'user_id/guidebook_id/filename');
```

**반환**: `https://bzzdaptscqkshwqehpmc.supabase.co/storage/v1/object/public/{bucket}/{path}`

### get_user_guidebook_count(user_id)

사용자의 현재 가이드북 개수를 반환합니다 (archived 제외).

### can_create_guidebook(user_id)

사용자가 새 가이드북을 생성할 수 있는지 확인합니다.

**로직**:
- free: 최대 1개
- pro: 최대 5개
- business: 무제한

### get_user_ai_generation_count_this_month(user_id)

현재 월의 AI 생성 횟수를 반환합니다.

### can_generate_with_ai(user_id)

사용자가 AI로 가이드북을 생성할 수 있는지 확인합니다.

**로직**:
- free: 월 3회
- pro: 월 30회
- business: 무제한

---

## 보안 (RLS)

모든 테이블에 Row Level Security 정책이 적용되어 있습니다.

### 정책 원칙

1. **profiles**: 사용자는 자신의 프로필만 조회/수정 가능
2. **guidebooks**: 사용자는 자신의 가이드북 조회/수정 가능, 누구나 published 가이드북 조회 가능
3. **blocks**: 자신의 가이드북 블록만 관리 가능, published 가이드북 블록은 누구나 조회 가능
4. **block_images**: blocks와 동일한 정책 적용

---

## Supabase 프로젝트 설정

### 필수 사전 설정

1. Supabase 프로젝트 생성
2. Authentication 활성화 (Email/Password, OAuth 등)
3. Database 마이그레이션 실행
4. Storage 버킷 생성 (가이드북 이미지용)

### Storage 버킷 설정 (자동)

마이그레이션 파일 `002_storage_setup.sql`을 실행하면 다음이 자동으로 설정됩니다:

1. **guidebook-images 버킷 생성**
   - 공개 버킷 (public: true)
   - 파일 크기: 10MB 제한
   - MIME 타입: 이미지만 허용

2. **Storage RLS 정책 설정**
   - 인증된 사용자: 업로드, 수정, 삭제 가능
   - 공개 사용자: 읽기만 가능

### Storage 수동 설정 (선택)

Supabase 대시보드에서 직접 설정하려면:

1. **Storage > Create New Bucket**
2. **이름**: `guidebook-images`
3. **Public**: 체크 (RLS 정책으로 보호)
4. **File size limit**: 10 MB
5. **Allowed MIME types**:
   - image/jpeg
   - image/png
   - image/webp
   - image/gif

**RLS 정책은 마이그레이션에서 자동으로 설정됩니다.**

---

## 개발 환경 설정

### 1. 로컬 Supabase 시작

```bash
supabase start
```

### 2. 마이그레이션 적용

```bash
supabase migration up
```

### 3. 타입 생성

```bash
npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

---

## 주의사항

1. **비밀번호**: `password_hash`는 반드시 bcrypt로 해시된 값을 저장하세요.
2. **JSON 스키마**: `content` 컬럼은 JSONB 형식으로, 블록별 스키마 정의 필요
3. **Storage 경로**: `storage_path`는 `/bucket_name/file_path` 형식
4. **RLS 정책**: 프로덕션 환경에서는 모든 정책이 활성화되어야 합니다.

---

---

## 단축 URL 테이블 (P5-T5.4)

### short_urls 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본 키 |
| guidebook_id | UUID | 가이드북 ID (guidebooks.id) |
| short_code | VARCHAR(10) | 단축 코드 (고유) |
| expires_at | TIMESTAMPTZ | 만료 일시 (NULL=영구) |
| clicks | INTEGER | 클릭 수 |
| is_active | BOOLEAN | 활성화 여부 |
| created_at | TIMESTAMPTZ | 생성 시간 |
| updated_at | TIMESTAMPTZ | 최종 수정 시간 |

**인덱스**:
- idx_short_urls_short_code (short_code, UNIQUE)
- idx_short_urls_guidebook_id (guidebook_id)
- idx_short_urls_expires_at (expires_at)

**RLS 정책**:
- SELECT: 누구나 조회 가능 (리다이렉트용)
- INSERT/UPDATE/DELETE: 가이드북 소유자만 가능

### 관련 RPC 함수

#### increment_short_url_clicks(p_code)
단축 코드로 조회하고 클릭 수를 증가시킵니다.

**반환값**:
- `guidebook_slug`: 리다이렉트할 가이드북 slug (없으면 NULL)
- `is_expired`: 만료 여부 (true=만료됨, false=유효, NULL=존재하지 않음)

#### generate_short_code(p_length)
충돌 방지 문자셋(혼동되는 문자 제외)으로 단축 코드를 생성합니다.

#### create_short_url(p_guidebook_id, p_expires_in_days)
새 단축 URL을 생성합니다.

**반환값**:
- `id`: 생성된 short_url의 UUID
- `short_code`: 생성된 단축 코드
- `expires_at`: 만료 일시

---

## 참고 자료

- Supabase 문서: https://supabase.com/docs
- PostgreSQL RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- JSONB 타입: https://www.postgresql.org/docs/current/datatype-json.html
