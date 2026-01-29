# P8-R2: Branding API Documentation

## 개요

가이드북 커스텀 브랜딩 설정 API (로고, 색상, 폰트)

**플랜 제한**: Pro 이상 플랜만 사용 가능

---

## API 엔드포인트

### GET /api/guidebooks/[id]/branding

가이드북 브랜딩 설정 조회

**인증**: 필수 (소유자만)

**응답**:
```json
{
  "data": {
    "id": "uuid",
    "guidebook_id": "uuid",
    "logo_url": "https://example.com/logo.png",
    "favicon_url": "https://example.com/favicon.ico",
    "primary_color": "#1E40AF",
    "secondary_color": "#FBBF24",
    "font_preset": "pretendard",
    "custom_css": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**에러 코드**:
- `404 NOT_FOUND`: 브랜딩 설정이 없음
- `500 FETCH_ERROR`: DB 조회 실패

---

### PUT /api/guidebooks/[id]/branding

가이드북 브랜딩 설정 생성/수정 (Upsert)

**인증**: 필수 (Pro+ 플랜 소유자만)

**요청 본문**:
```json
{
  "logo_url": "https://example.com/logo.png",
  "favicon_url": "https://example.com/favicon.ico",
  "primary_color": "#1E40AF",
  "secondary_color": "#FBBF24",
  "font_preset": "pretendard",
  "custom_css": "body { font-size: 16px; }" // Business 플랜만
}
```

**필드 검증**:
- `logo_url`, `favicon_url`: 유효한 URL
- `primary_color`, `secondary_color`: HEX 형식 (#1E40AF)
- `font_preset`: `pretendard` | `noto_sans` | `nanum_gothic` | `gmarket_sans` | `spoqa_han_sans`
- `custom_css`: 최대 10KB

**응답**:
```json
{
  "data": {
    "id": "uuid",
    "guidebook_id": "uuid",
    "logo_url": "https://example.com/logo.png",
    ...
  }
}
```

**에러 코드**:
- `400 VALIDATION_ERROR`: 입력값 검증 실패
- `403 PERMISSION_DENIED`: Pro+ 플랜 아님
- `500 UPDATE_ERROR`: DB 저장 실패

---

## 데이터베이스 스키마

```sql
CREATE TABLE brandings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guidebook_id UUID NOT NULL UNIQUE REFERENCES guidebooks(id) ON DELETE CASCADE,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color TEXT CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  font_preset font_preset DEFAULT 'pretendard',
  custom_css TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## RLS 정책

1. **조회**: 소유자만 가능
2. **생성/수정**: Pro+ 플랜 소유자만 가능

```sql
-- 소유자만 조회 가능
CREATE POLICY "Users can view their own branding" ON brandings
  FOR SELECT
  USING (
    guidebook_id IN (
      SELECT id FROM guidebooks WHERE user_id = auth.uid()
    )
  );

-- Pro+ 플랜만 생성/수정 가능
CREATE POLICY "Pro+ users can upsert their own branding" ON brandings
  FOR ALL
  USING (
    guidebook_id IN (
      SELECT g.id
      FROM guidebooks g
      JOIN users u ON u.id = g.user_id
      WHERE g.user_id = auth.uid()
        AND u.plan IN ('pro', 'business')
    )
  );
```

---

## Helper 함수

```sql
-- 브랜딩 사용 가능 여부 확인
SELECT can_use_branding('user-uuid');
-- Returns: true (Pro+) | false (Free)
```

---

## 사용 예시

### 1. 브랜딩 조회

```typescript
const res = await fetch(`/api/guidebooks/${guidebookId}/branding`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

if (res.status === 404) {
  console.log('브랜딩 설정 없음');
} else {
  const { data } = await res.json();
  console.log(data.primary_color); // #1E40AF
}
```

### 2. 브랜딩 생성/수정

```typescript
const res = await fetch(`/api/guidebooks/${guidebookId}/branding`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    logo_url: 'https://example.com/logo.png',
    primary_color: '#1E40AF',
    font_preset: 'pretendard',
  }),
});

if (res.status === 403) {
  alert('Pro 플랜으로 업그레이드하세요!');
} else {
  const { data } = await res.json();
  console.log('브랜딩 저장 완료:', data);
}
```

---

## 폰트 프리셋 목록

| 프리셋 | 설명 |
|--------|------|
| `pretendard` | Pretendard (기본) |
| `noto_sans` | Noto Sans KR |
| `nanum_gothic` | 나눔고딕 |
| `gmarket_sans` | G마켓 산스 |
| `spoqa_han_sans` | 스포카 한 산스 |

---

## 플랜별 기능

| 기능 | Free | Pro | Business |
|------|------|-----|----------|
| 로고/파비콘 | ❌ | ✅ | ✅ |
| 색상 커스터마이징 | ❌ | ✅ | ✅ |
| 폰트 선택 | ❌ | ✅ | ✅ |
| 커스텀 CSS | ❌ | ❌ | ✅ |

---

## 테스트

```bash
# 단위 테스트
npm test src/app/api/guidebooks/[id]/branding/route.test.ts

# E2E 테스트
npx playwright test tests/e2e/branding.spec.ts
```

---

## 관련 리소스

- **P8-R1**: chatbot_log
- **P8-R3**: upsell_item
- **P8-R4**: upsell_request
- **P8-R5**: alimtalk_log

---

## 마이그레이션

```bash
# 로컬 적용
npx supabase db reset

# 프로덕션 적용
npx supabase db push
```

파일: `supabase/migrations/026_brandings.sql`
