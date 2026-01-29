# P0-T0.4: Roomy Core DB 스키마 생성 완료

## 요약

Roomy 게스트 가이드북 SaaS의 핵심 데이터베이스 스키마를 Supabase에 구현했습니다.

## 생성된 테이블 (4개)

### 1. profiles (사용자 프로필)
- **용도**: 사용자 정보 및 플랜 관리
- **주요 필드**: id, email, display_name, avatar_url, plan, guidebook_count, max_guidebooks, ai_generation_count, max_ai_generations
- **특징**: auth.users와 1:1 연결, 플랜별 제한 관리

### 2. guidebooks (가이드북)
- **용도**: 숙소 가이드북 메타데이터
- **주요 필드**: id, user_id, title, slug, status, theme, hero_image_url, view_count
- **특징**:
  - slug을 통한 공개 접근 (/g/[slug])
  - 5가지 테마 지원 (modern, cozy, minimal, nature, luxury)
  - 상태 관리 (draft, published, archived)
  - 비밀번호 보호 옵션
  - 조회수 추적

### 3. blocks (콘텐츠 블록)
- **용도**: 가이드북 내 콘텐츠 블록
- **주요 필드**: id, guidebook_id, type, order_index, content(JSONB), is_visible
- **블록 타입 (8가지)**:
  1. hero - 히어로 섹션
  2. quickInfo - 체크인/와이파이/도어락 정보
  3. amenities - 편의시설
  4. rules - 이용 규칙
  5. map - 지도
  6. gallery - 이미지 갤러리
  7. notice - 공지사항
  8. custom - 커스텀 섹션

### 4. block_images (블록 이미지)
- **용도**: 블록 내 이미지 관리
- **주요 필드**: id, block_id, storage_path, alt_text, caption, order_index
- **특징**: Supabase Storage와 연동, 메타데이터 저장

---

## 인덱스 최적화

| 테이블 | 인덱스 | 용도 |
|--------|--------|------|
| profiles | idx_profiles_email | 사용자 검색 |
| guidebooks | idx_guidebooks_slug | 공개 가이드북 접근 |
| guidebooks | idx_guidebooks_user_id | 사용자별 가이드북 조회 |
| guidebooks | idx_guidebooks_status | 상태별 필터링 |
| blocks | idx_blocks_guidebook_order | 블록 순서 조회 |
| blocks | idx_blocks_type | 블록 타입 필터링 |
| block_images | idx_block_images_block_order | 이미지 순서 조회 |

---

## 자동 기능

### 1. updated_at 자동 업데이트
- `update_updated_at_column()` 트리거 함수
- 적용 테이블: profiles, guidebooks, blocks
- 언제: 데이터 수정 시 자동으로 현재 시간으로 업데이트

### 2. RLS (Row Level Security) 정책
모든 테이블에 세밀한 접근 제어 정책 적용:

**profiles**:
- SELECT: 자신의 프로필만 조회 가능
- UPDATE: 자신의 프로필만 수정 가능

**guidebooks**:
- SELECT: 자신의 가이드북 + 누구나 published 가이드북 조회
- INSERT: 자신의 사용자 ID로만 생성
- UPDATE/DELETE: 자신의 가이드북만 관리

**blocks**:
- SELECT: 자신의 가이드북 블록 + 누구나 published 가이드북 블록 조회
- INSERT/UPDATE/DELETE: 자신의 가이드북 블록만 관리

**block_images**:
- blocks와 동일한 정책 (다단계 JOIN을 통해 권한 확인)

---

## 타입 생성

TypeScript 타입 자동 생성:

```bash
npx supabase gen types typescript --project-id bzzdaptscqkshwqehpmc > src/lib/supabase/database.types.ts
```

생성되는 타입 예시:
- `Profile`, `ProfileInsert`, `ProfileUpdate`
- `Guidebook`, `GuidebookInsert`, `GuidebookUpdate`
- `Block`, `BlockInsert`, `BlockUpdate`
- `BlockImage`, `BlockImageInsert`, `BlockImageUpdate`

---

## AC (Acceptance Criteria) 체크리스트

- [x] `supabase/migrations/001_core_schema.sql` 파일 생성
- [x] profiles 테이블 정의 (auth.users 확장)
- [x] guidebooks 테이블 정의
- [x] blocks 테이블 정의 (8가지 블록 타입)
- [x] block_images 테이블 정의
- [x] 인덱스 최적화 (7개)
- [x] updated_at 자동 업데이트 트리거 구현
- [x] RLS 정책 완전 구현
- [x] 타입 생성 가이드 포함

---

## 다음 단계

### 즉시 실행 필요 (Phase 0)
1. ✅ P0-T0.4: Roomy Core DB 스키마 생성 (완료)
2. 예정: P0-T0.5 - Supabase 프로젝트 설정
3. 예정: P0-T0.6 - 타입 생성 및 클라이언트 초기화

### Phase 1 (호스트 에디터)
- 블록 에디터 구현
- 가이드북 CRUD API

### Phase 2 (게스트 뷰어)
- 게스트 페이지 구현
- 공개 가이드북 렌더링

### Phase 3 (AI 챗봇)
- OpenAI API 연동
- 챗 인터페이스 구현

---

## 파일 목록

| 파일 | 설명 |
|------|------|
| `supabase/migrations/001_core_schema.sql` | 핵심 스키마 정의 (272줄) |
| `supabase/DATABASE_SETUP.md` | 설치 및 설정 가이드 |
| `supabase/migrations/001_CORE_SCHEMA_SUMMARY.md` | 이 파일 |

---

## 주의사항

1. **마이그레이션 실행**: `npx supabase migration up` 또는 Supabase 대시보드에서 실행
2. **RLS 프로덕션 활성화**: 프로덕션 환경에서는 모든 RLS 정책이 반드시 활성화되어야 함
3. **타입 동기화**: 스키마 변경 후 반드시 타입 재생성 필요
4. **Storage 버킷**: block_images 저장용 Supabase Storage 버킷 별도 생성 필요

---

## 스키마 다이어그램

```
auth.users (Supabase 기본)
    ↓ (1:1)
profiles (사용자 프로필 + 플랜 관리)
    ↓ (1:N)
guidebooks (가이드북 메타데이터)
    ↓ (1:N)
blocks (콘텐츠 블록 8가지 타입)
    ↓ (1:N)
block_images (블록 내 이미지)
```

---

**생성 일시**: 2026-01-28
**마이그레이션 ID**: 001_core_schema
**STATUS**: ✅ COMPLETE
