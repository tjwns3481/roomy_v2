# P0-T0.5 Storage 설정 마이그레이션 요약

## 마이그레이션 파일
- **파일**: `002_storage_setup.sql`
- **목적**: RLS 정책 완성 및 Supabase Storage 설정
- **Phase**: P0 (초기 설정)

## 포함 사항

### 1. Storage Bucket: guidebook-images
- **이름**: `guidebook-images`
- **공개 여부**: 공개 (public: true)
- **파일 크기 제한**: 10MB
- **허용 MIME 타입**: image/jpeg, image/png, image/webp, image/gif

### 2. Storage RLS 정책 (4가지)

| 정책명 | 작업 | 대상 사용자 | 조건 |
|--------|------|-----------|------|
| authenticated_users_can_upload_images | INSERT | 인증된 사용자 | 경로: {user_id}/{guidebook_id}/{filename} |
| users_can_update_own_images | UPDATE | 인증된 사용자 | 본인 파일만 |
| users_can_delete_own_images | DELETE | 인증된 사용자 | 본인 파일만 |
| anyone_can_read_public_images | SELECT | 공개 사용자 | 게스트 뷰어 접근 |

### 3. view_stats 테이블 (조회 통계)
- **목적**: P2 단계에서 가이드북 조회수 추적
- **구조**:
  - id (UUID, PK)
  - guidebook_id (UUID, FK → guidebooks.id)
  - date (DATE, 기본값: 현재 날짜)
  - views (INT, 조회수)
  - unique_visitors (INT, 고유 방문자 수)
  - unique_guidebook_date (제약: 중복 방지)
  - created_at, updated_at

**인덱스**: idx_view_stats_guidebook_date (guidebook_id, date)

**RLS 정책**:
- 가이드북 소유자만 통계 조회 가능
- 서비스 롤만 통계 업데이트 가능

### 4. Helper 함수 (6가지)

#### get_storage_url(bucket_name, file_path)
Storage URL을 동적으로 생성합니다.

```sql
SELECT get_storage_url('guidebook-images', 'user_id/guidebook_id/filename');
-- 반환: https://bzzdaptscqkshwqehpmc.supabase.co/storage/v1/object/public/guidebook-images/...
```

#### get_user_guidebook_count(user_id)
사용자의 현재 가이드북 개수 반환 (archived 제외)

#### can_create_guidebook(user_id)
사용자가 새 가이드북을 생성할 수 있는지 확인
- free: 최대 1개
- pro: 최대 5개
- business: 무제한

#### get_user_ai_generation_count_this_month(user_id)
현재 월의 AI 생성 횟수 반환

#### can_generate_with_ai(user_id)
사용자가 AI로 가이드북을 생성할 수 있는지 확인
- free: 월 3회
- pro: 월 30회
- business: 무제한

## 마이그레이션 특징

### 멱등성 (Idempotent)
모든 정책과 함수는 DROP IF EXISTS로 시작하여 여러 번 실행해도 안전합니다.

### 보안
- Storage RLS로 이미지 접근 제어
- view_stats는 소유자만 조회 가능
- 서비스 롤로만 통계 업데이트 가능

### 확장성
Helper 함수들은 P1+ 단계에서 가이드북 생성, AI 생성 제한 구현 시 활용됩니다.

## 마이그레이션 실행

```bash
# Supabase 마이그레이션 적용
npx supabase migration up

# 로컬 개발
supabase start
```

## 관련 문서

- DATABASE_SETUP.md: 전체 데이터베이스 설정 가이드
- docs/planning/04-database-design.md: DB 설계 명세
