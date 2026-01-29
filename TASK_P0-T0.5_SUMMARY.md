# P0-T0.5 작업 완료 요약

**작업**: RLS 정책 완성 및 Supabase Storage 설정
**Phase**: P0 (초기 설정)
**상태**: DONE

---

## 1. 생성된 파일

### supabase/migrations/002_storage_setup.sql
Storage 및 조회 통계 관련 마이그레이션 파일

**포함 사항**:
- guidebook-images Storage bucket 설정
- Storage RLS 정책 4가지
- view_stats 테이블 (조회 통계)
- view_stats RLS 정책 2가지
- Helper 함수 6가지

### supabase/migrations/002_STORAGE_SETUP_SUMMARY.md
마이그레이션 파일 상세 설명서

### supabase/DATABASE_SETUP.md (업데이트)
전체 데이터베이스 설정 가이드에 다음 섹션 추가:
- Storage 버킷 설정 (P0-T0.5)
- 조회 통계 테이블 (view_stats)
- Storage RLS 정책 설명
- Helper 함수 설명

---

## 2. AC (Acceptance Criteria) 검증

### AC 1: supabase/migrations/002_storage_setup.sql 파일 생성
✅ **완료** - 파일 생성됨

### AC 2: guidebook-images bucket 설정 (10MB, 이미지 전용)
✅ **완료**
- 버킷명: guidebook-images
- 공개: true (게스트 뷰어 접근 필요)
- 파일 크기 제한: 10MB
- 허용 MIME: image/jpeg, image/png, image/webp, image/gif

### AC 3: Storage RLS 정책 (업로드/수정/삭제/조회)
✅ **완료** - 4가지 정책 구현
1. authenticated_users_can_upload_images: 인증된 사용자만 업로드 가능
2. users_can_update_own_images: 본인 파일만 수정
3. users_can_delete_own_images: 본인 파일만 삭제
4. anyone_can_read_public_images: 누구나 조회 가능

### AC 4: view_stats 테이블 및 RLS
✅ **완료**
- 테이블 생성 (id, guidebook_id, date, views, unique_visitors)
- 인덱스: idx_view_stats_guidebook_date
- RLS 정책 2가지 (소유자 조회, 서비스 롤 업데이트)
- Trigger: updated_at 자동 업데이트

### AC 5: 문서 업데이트
✅ **완료**
- DATABASE_SETUP.md에 Storage 설정 가이드 추가
- Helper 함수 설명 추가
- view_stats 테이블 구조 설명 추가

---

## 3. 추가 구현: Helper 함수 6가지

### 1. get_storage_url(bucket_name, file_path)
Storage URL을 동적으로 생성합니다.

```sql
SELECT get_storage_url('guidebook-images', 'user_id/guidebook_id/filename');
```

### 2. get_user_guidebook_count(user_id)
사용자의 현재 가이드북 개수 반환 (archived 제외)

### 3. can_create_guidebook(user_id)
사용자가 새 가이드북을 생성할 수 있는지 확인
- free: 최대 1개
- pro: 최대 5개
- business: 무제한

### 4. get_user_ai_generation_count_this_month(user_id)
현재 월의 AI 생성 횟수 반환

### 5. can_generate_with_ai(user_id)
사용자가 AI로 가이드북을 생성할 수 있는지 확인
- free: 월 3회
- pro: 월 30회
- business: 무제한

이들 함수는 P1+ 단계에서 가이드북 생성, AI 생성 제한 기능 구현 시 활용됩니다.

---

## 4. 마이그레이션 특징

### 멱등성 (Idempotent)
모든 정책과 함수는 DROP IF EXISTS로 시작하여 여러 번 실행해도 안전합니다.

### 보안
- Storage RLS로 이미지 접근 제어
  - 인증된 사용자: 자신의 폴더에만 업로드/수정/삭제
  - 공개 사용자: 조회만 가능
- view_stats는 소유자만 조회 가능
- 서비스 롤로만 통계 업데이트 가능

### 확장성
- P2 단계: view_stats를 활용한 조회 통계 기능
- P1+ 단계: Helper 함수로 가이드북/AI 생성 제한 구현

---

## 5. 마이그레이션 실행 방법

### Supabase 프로젝트에 적용
```bash
npx supabase migration up
```

### 로컬 개발 환경
```bash
supabase start
supabase migration up
```

### 타입 생성 (P1 단계 예정)
```bash
npx supabase gen types typescript --project-id bzzdaptscqkshwqehpmc > src/types/database.types.ts
```

---

## 6. 관련 문서

| 문서 | 경로 | 내용 |
|------|------|------|
| 마이그레이션 요약 | supabase/migrations/002_STORAGE_SETUP_SUMMARY.md | 상세 설명 |
| 전체 DB 가이드 | supabase/DATABASE_SETUP.md | Storage 설정 + 모든 테이블 |
| DB 설계 명세 | docs/planning/04-database-design.md | ERD, 제약조건, RLS 정책 |

---

## 7. P0 Phase 진행 상황

| Task | 상태 | 완료일 |
|------|------|--------|
| P0-T0.1 프로젝트 초기화 | ✅ DONE | - |
| P0-T0.2 기획 문서 작성 | ✅ DONE | - |
| P0-T0.3 Supabase 클라이언트 | ✅ DONE | - |
| P0-T0.4 Core Schema | ✅ DONE | - |
| **P0-T0.5 Storage + RLS** | **✅ DONE** | **2024-01-28** |

---

## 8. 다음 단계 (P1)

P1 단계에서 이 마이그레이션을 활용하여:
1. **호스트 가이드북 생성**: can_create_guidebook 함수로 제한 확인
2. **AI 가이드북 생성**: can_generate_with_ai 함수로 제한 확인
3. **이미지 업로드**: Storage RLS로 안전한 파일 관리
4. **조회 통계 추적**: view_stats 테이블에 조회수 기록

---

## 체크리스트

- [x] 002_storage_setup.sql 마이그레이션 파일 생성
- [x] guidebook-images bucket 설정 (10MB, 이미지 전용)
- [x] Storage RLS 정책 4가지 구현
- [x] view_stats 테이블 및 RLS 정책 구현
- [x] Helper 함수 6가지 구현
- [x] DATABASE_SETUP.md 문서 업데이트
- [x] 마이그레이션 요약 문서 작성
- [x] @TASK 태그 추가 (마이그레이션 파일)
- [x] 멱등성 확인 (DROP IF EXISTS)
- [x] 보안 검증 (RLS 정책 검증)
