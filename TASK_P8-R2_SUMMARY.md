# P8-R2: Branding 리소스 API 구현 완료

## 작업 개요

- **태스크 ID**: P8-R2
- **리소스**: branding
- **테이블**: brandings
- **완료일**: 2026-01-29
- **담당**: backend-specialist

---

## 생성된 파일

### 1. 마이그레이션
- `supabase/migrations/026_brandings.sql`
  - brandings 테이블 생성
  - font_preset ENUM 타입 정의
  - RLS 정책 (소유자 + Pro+ 플랜 제한)
  - Helper 함수: `can_use_branding(user_id)`
  - HEX 색상 검증 제약 조건

### 2. API Routes
- `src/app/api/guidebooks/[id]/branding/route.ts`
  - GET: 브랜딩 조회
  - PUT: 브랜딩 생성/수정 (Upsert)
  - Zod 검증 통합
  - RLS 권한 에러 처리

### 3. 검증 스키마
- `src/lib/validations/branding.ts`
  - `BrandingUpdateSchema`: Zod 스키마
  - `FontPresetEnum`: 폰트 프리셋 Enum
  - HEX 색상 정규식 검증

### 4. 타입 정의
- `src/types/branding.ts`
  - `Branding`: DB 타입
  - `BrandingUpdateInput`: API 요청 타입
  - `FontPreset`: 폰트 프리셋 타입

### 5. 테스트
- `src/app/api/guidebooks/[id]/branding/route.test.ts`
  - 단위 테스트 (Vitest)
  - GET/PUT 엔드포인트 테스트
  - 검증 에러 케이스

- `tests/e2e/branding.spec.ts`
  - E2E 테스트 (Playwright)
  - Pro 플랜 제한 검증
  - Upsert 동작 검증

### 6. 문서
- `docs/api/P8-R2-BRANDING.md`
  - API 명세
  - 스키마 설명
  - 사용 예시

---

## API 엔드포인트

### GET /api/guidebooks/[id]/branding
- **설명**: 브랜딩 조회
- **인증**: 소유자만
- **응답**: 200 (성공) | 404 (없음) | 500 (에러)

### PUT /api/guidebooks/[id]/branding
- **설명**: 브랜딩 생성/수정
- **인증**: Pro+ 플랜 소유자만
- **응답**: 200 (성공) | 400 (검증 실패) | 403 (권한 없음) | 500 (에러)

---

## 데이터베이스 스키마

```sql
CREATE TABLE brandings (
  id UUID PRIMARY KEY,
  guidebook_id UUID UNIQUE REFERENCES guidebooks(id),
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT CHECK (HEX 형식),
  secondary_color TEXT CHECK (HEX 형식),
  font_preset font_preset DEFAULT 'pretendard',
  custom_css TEXT, -- Business 플랜 전용
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**RLS 정책**:
1. 소유자만 조회 가능
2. Pro+ 플랜만 생성/수정 가능

---

## 검증 규칙

| 필드 | 규칙 |
|------|------|
| logo_url | 유효한 URL |
| favicon_url | 유효한 URL |
| primary_color | HEX 형식 (#1E40AF) |
| secondary_color | HEX 형식 (#FBBF24) |
| font_preset | Enum (5개 옵션) |
| custom_css | 최대 10KB |

---

## 폰트 프리셋

1. `pretendard` (기본)
2. `noto_sans`
3. `nanum_gothic`
4. `gmarket_sans`
5. `spoqa_han_sans`

---

## 플랜별 기능

| 기능 | Free | Pro | Business |
|------|------|-----|----------|
| 로고/파비콘 | ❌ | ✅ | ✅ |
| 색상 | ❌ | ✅ | ✅ |
| 폰트 | ❌ | ✅ | ✅ |
| 커스텀 CSS | ❌ | ❌ | ✅ |

---

## TDD 프로세스

1. **RED**: 테스트 먼저 작성
2. **GREEN**: API 구현하여 테스트 통과
3. **REFACTOR**: Zod 검증 추가, 에러 처리 개선

---

## 다음 단계

- **P8-R3**: upsell_item 리소스 구현
- **P8-R4**: upsell_request 리소스 구현
- **P8-R5**: alimtalk_log 리소스 구현

---

## 관련 문서

- `specs/domain/resources.yaml` - 리소스 정의
- `docs/planning/04-database-design.md` - DB 설계
- `docs/api/P8-R2-BRANDING.md` - API 문서

---

## Guardrails 체크

✅ RLS 정책 적용
✅ Zod 검증 사용
✅ HEX 색상 검증
✅ Pro+ 플랜 제한
✅ Service role 미사용 (anon key 사용)
✅ SQL Injection 방지 (파라미터화 쿼리)

---

## 커밋 메시지

```
feat(branding): P8-R2 브랜딩 리소스 API 구현

- brandings 테이블 생성 (마이그레이션 026)
- GET/PUT /api/guidebooks/[id]/branding 구현
- Pro+ 플랜 RLS 정책 적용
- Zod 검증 (HEX 색상, 폰트 프리셋)
- 단위 테스트 및 E2E 테스트 작성

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

**TASK_DONE**: P8-R2 완료
