# TRD (기술 요구사항 정의서)

> Roomy: 한국 숙박 시설을 위한 디지털 게스트 가이드북 SaaS 기술 아키텍처

---

## MVP 캡슐

| # | 항목 | 내용 |
|---|------|------|
| 1 | 목표 | AI 가이드북 자동 생성 + 블록 에디터 MVP 완성 |
| 2 | 페르소나 | 펜션/에어비앤비 호스트 (반복 문의 줄이고 싶은) |
| 3 | 핵심 기능 | FEAT-1: AI 가이드북 생성 (에어비앤비 링크 → 한국어 가이드북) |
| 4 | 성공 지표 (노스스타) | MRR ₩500만원 (유료 구독자 ~122명) |
| 5 | 입력 지표 | 가이드북 생성 수, 게스트 조회수, 유료 전환율 |
| 6 | Out-of-scope | 카카오 알림톡, PMS 연동 (Phase 2) |
| 7 | Top 리스크 | 에어비앤비 크롤링 차단, AI 생성 품질 |
| 8 | 다음 단계 | 블록 에디터 MVP 구현 |

---

## 1. 시스템 아키텍처

### 1.1 고수준 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel                                   │
│  ┌─────────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │  Next.js 15     │  │  API Routes │  │  Edge Functions    │  │
│  │  (App Router)   │  │  (/api/*)   │  │  (Middleware)      │  │
│  └─────────────────┘  └─────────────┘  └────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
┌───────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Supabase     │  │  OpenAI API     │  │  External APIs  │
│  ┌─────────┐  │  │  (GPT-4o)       │  │  ┌───────────┐  │
│  │PostgreSQL│  │  │                 │  │  │ 에어비앤비 │  │
│  │(Database)│  │  │  AI 가이드북    │  │  │ (크롤링)  │  │
│  ├─────────┤  │  │  자동 생성      │  │  ├───────────┤  │
│  │ Auth    │  │  └─────────────────┘  │  │ 네이버    │  │
│  │ (인증)  │  │                       │  │ 지도 API  │  │
│  ├─────────┤  │                       │  └───────────┘  │
│  │ Storage │  │                       └─────────────────┘
│  │ (이미지)│  │
│  └─────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Row Level Security (RLS)                              │  │
│  │  - 호스트만 본인 가이드북 수정 가능                   │  │
│  │  - 게스트는 공개 가이드북만 조회 가능                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 핵심 데이터 흐름

```
[호스트] ──▶ 에어비앤비 링크 입력
              │
              ▼
[API] ──────▶ 에어비앤비 페이지 크롤링
              │
              ▼
[OpenAI] ───▶ GPT-4o로 한국어 가이드북 생성
              │
              ▼
[Supabase] ─▶ 가이드북 + 블록 데이터 저장
              │
              ▼
[게스트] ◀── 모바일 웹에서 가이드북 조회
```

### 1.3 컴포넌트 설명

| 컴포넌트 | 역할 | 왜 이 선택? |
|----------|------|-------------|
| Next.js 15 (App Router) | 풀스택 프레임워크 | SSR, API Routes, 한국어 SEO |
| Supabase | BaaS | Auth+DB+Storage 통합, RLS 보안 |
| OpenAI GPT-4o | AI 가이드북 생성 | 한국어 품질 우수, JSON 출력 |
| Vercel | 호스팅 | Next.js 최적화, Edge Functions |
| Toss Payments | 결제 | 국내 결제 1위, 구독 결제 지원 |

---

## 2. 권장 기술 스택

### 2.1 프론트엔드

| 항목 | 선택 | 이유 | 벤더 락인 리스크 |
|------|------|------|-----------------|
| 프레임워크 | Next.js 15 (App Router) | React 19, 서버 컴포넌트 | 중간 (React 생태계) |
| 언어 | TypeScript 5.x | 타입 안전성, AI 코딩 친화적 | 낮음 |
| 스타일링 | Tailwind CSS 3.x | 유틸리티 우선, 빠른 개발 | 낮음 |
| 상태관리 | Zustand | 간단하고 직관적 | 낮음 |
| 폼 처리 | React Hook Form + Zod | 성능 좋고 타입 안전 | 낮음 |
| UI 컴포넌트 | shadcn/ui | 복사-붙여넣기, 커스터마이징 쉬움 | 없음 |
| 에디터 | @tiptap/react | 블록 에디터, 확장 가능 | 낮음 |
| DnD | @dnd-kit | 드래그앤드롭, 접근성 우수 | 낮음 |

### 2.2 백엔드 (Supabase)

| 항목 | 선택 | 이유 | 벤더 락인 리스크 |
|------|------|------|-----------------|
| 데이터베이스 | PostgreSQL (Supabase) | JSONB, RLS, Full-text search | 중간 |
| 인증 | NextAuth.js + Supabase | 구글 OAuth, 이메일 인증 | 낮음 |
| 스토리지 | Supabase Storage | 이미지 업로드, Signed URL | 중간 |
| 실시간 | Supabase Realtime | 협업 편집 (Phase 2) | 중간 |

### 2.3 AI/ML

| 항목 | 선택 | 이유 |
|------|------|------|
| LLM | OpenAI GPT-4o | 한국어 품질, JSON 모드 |
| 크롤링 | Cheerio + Puppeteer | 에어비앤비 동적 페이지 파싱 |
| Fallback | Claude 3.5 Sonnet | GPT 장애 시 대체 |

### 2.4 외부 서비스

| 서비스 | 용도 | 필수/선택 | Phase |
|--------|------|----------|-------|
| OpenAI API | AI 가이드북 생성 | 필수 | MVP |
| Toss Payments | 구독 결제 | 필수 | MVP |
| Naver Maps API | 지도 연동 | 선택 | MVP |
| Kakao Alimtalk | 알림톡 발송 | 선택 | Phase 2 |
| Vercel Analytics | 트래픽 분석 | 선택 | MVP |

---

## 3. 비기능 요구사항

### 3.1 성능

| 항목 | 요구사항 | 측정 방법 |
|------|----------|----------|
| FCP (First Contentful Paint) | < 1.5s | Lighthouse |
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| 게스트 뷰 로딩 | < 2s | Real User Monitoring |
| AI 가이드북 생성 | < 30s | API 응답 시간 |
| 에디터 응답 | < 100ms | 사용자 체감 |

### 3.2 보안

| 항목 | 요구사항 |
|------|----------|
| 인증 | NextAuth.js (JWT + Session) |
| 권한 | Supabase RLS (호스트별 격리) |
| HTTPS | 필수 (Vercel 자동) |
| 입력 검증 | Zod 스키마 (서버 측 필수) |
| XSS 방지 | 블록 콘텐츠 Sanitize |

### 3.3 확장성

| 항목 | MVP | Phase 2 |
|------|------|---------|
| 동시 사용자 | 100명 | 1,000명 |
| 가이드북 수 | 500개 | 5,000개 |
| 이미지 저장소 | 10GB | 100GB |
| AI 요청 | 100회/일 | 1,000회/일 |

---

## 4. 외부 API 연동

### 4.1 인증 (NextAuth.js + Supabase)

| 제공자 | 용도 | 필수/선택 |
|--------|------|----------|
| Google OAuth | 소셜 로그인 | 필수 |
| 이메일/비밀번호 | 기본 인증 | 필수 |
| Kakao OAuth | 한국 사용자 | 선택 (Phase 2) |

### 4.2 AI 가이드북 생성 (OpenAI)

```typescript
// AI 가이드북 생성 요청
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  response_format: { type: 'json_object' },
  messages: [
    {
      role: 'system',
      content: `한국 펜션/숙소 가이드북을 생성하세요.
        다음 블록 타입을 사용: hero, quickInfo, amenities, rules, map, gallery
        반드시 한국어로 작성하고, 한국 특화 내용 포함:
        - 분리수거 방법
        - 온돌/보일러 사용법
        - 도어락 비밀번호 입력 방법`
    },
    {
      role: 'user',
      content: `에어비앤비 숙소 정보:\n${scrapedData}`
    }
  ]
});
```

### 4.3 에어비앤비 크롤링

```typescript
// 에어비앤비 페이지 스크래핑 (Puppeteer)
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(airbnbUrl, { waitUntil: 'networkidle0' });

const data = await page.evaluate(() => ({
  title: document.querySelector('h1')?.textContent,
  description: document.querySelector('[data-section-id="DESCRIPTION"]')?.textContent,
  amenities: Array.from(document.querySelectorAll('[data-section-id="AMENITIES"] li'))
    .map(el => el.textContent),
  // ... 추가 필드
}));
```

### 4.4 결제 (Toss Payments - 구독)

| API | 용도 | 비고 |
|-----|------|------|
| 빌링키 발급 | 정기 결제 등록 | 카드 정보 저장 |
| 자동 결제 | 월간/연간 구독 | 빌링키로 결제 |
| 웹훅 | 결제 상태 변경 | API Route에서 수신 |

---

## 5. 접근제어 권한 모델

### 5.1 역할 정의

| 역할 | 설명 | 식별 방법 |
|------|------|----------|
| Guest | 비로그인 게스트 | auth.uid() IS NULL |
| Host | 가이드북 소유자 | users.role = 'host' |
| Admin | 관리자 | users.role = 'admin' |

### 5.2 권한 매트릭스

| 리소스 | Guest | Host | Admin |
|--------|-------|------|-------|
| 공개 가이드북 조회 | O | O | O |
| 비공개 가이드북 조회 | - | O (본인) | O |
| 가이드북 생성 | - | O | O |
| 가이드북 편집 | - | O (본인) | O |
| 가이드북 삭제 | - | O (본인) | O |
| 블록 추가/편집/삭제 | - | O (본인) | O |
| 이미지 업로드 | - | O | O |
| 구독 관리 | - | O (본인) | O |
| 전체 통계 | - | - | O |

### 5.3 RLS 정책

```sql
-- 가이드북: 공개 또는 소유자만 조회
CREATE POLICY "View public or own guidebooks"
ON guidebooks FOR SELECT
USING (
  is_published = true
  OR user_id = auth.uid()
);

-- 가이드북: 소유자만 수정
CREATE POLICY "Update own guidebooks"
ON guidebooks FOR UPDATE
USING (user_id = auth.uid());

-- 블록: 소유자만 수정
CREATE POLICY "Manage own blocks"
ON blocks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM guidebooks
    WHERE guidebooks.id = blocks.guidebook_id
    AND guidebooks.user_id = auth.uid()
  )
);

-- 게스트: 공개 블록만 조회
CREATE POLICY "View public blocks"
ON blocks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM guidebooks
    WHERE guidebooks.id = blocks.guidebook_id
    AND guidebooks.is_published = true
  )
);
```

---

## 6. 블록 시스템 설계

### 6.1 블록 타입 정의

| 블록 타입 | 용도 | 필수 필드 |
|----------|------|----------|
| `hero` | 메인 이미지 + 숙소명 | title, imageUrl |
| `quickInfo` | 체크인/아웃, WiFi, 도어락 | items[] |
| `amenities` | 편의시설 목록 | categories[], items[] |
| `rules` | 숙소 규칙 | items[] |
| `map` | 위치 지도 | lat, lng, address |
| `gallery` | 이미지 갤러리 | images[] |
| `notice` | 공지사항 | title, content |
| `custom` | 자유 형식 | title, content |

### 6.2 블록 데이터 구조

```typescript
interface Block {
  id: string;
  guidebook_id: string;
  type: BlockType;
  title: string;
  content: Record<string, any>; // JSONB
  order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// 예시: QuickInfo 블록
{
  type: 'quickInfo',
  title: '핵심 정보',
  content: {
    items: [
      { icon: 'wifi', label: 'WiFi', value: 'roomy_5G', subtext: '비밀번호: 12345678' },
      { icon: 'door', label: '도어락', value: '1234*', subtext: '* 누르고 입력' },
      { icon: 'clock', label: '체크인', value: '15:00', subtext: '체크아웃 11:00' }
    ]
  }
}
```

---

## 7. 테스트 전략

### 7.1 테스트 피라미드

| 레벨 | 도구 | 커버리지 목표 |
|------|------|-------------|
| Unit | Vitest | ≥ 70% |
| Integration | Vitest + MSW | Critical paths |
| E2E | Playwright | Key user flows |

### 7.2 테스트 우선순위 (MVP)

1. **AI 가이드북 생성**: 에어비앤비 링크 → 블록 데이터 변환
2. **블록 에디터**: 추가/편집/삭제/순서변경
3. **게스트 뷰**: 모바일 렌더링, 블록 표시
4. **RLS 정책**: 권한 없는 접근 차단

### 7.3 품질 게이트

```bash
# PR 병합 전 필수 통과
npm run lint         # ESLint
npm run type-check   # TypeScript
npm run test         # Vitest
npm run e2e          # Playwright (주요 플로우)
```

---

## 8. API 설계

### 8.1 라우트 구조

```
/api/
├── auth/
│   ├── [...nextauth]/    # NextAuth.js
│   └── verify/           # 이메일 인증
├── guidebooks/
│   ├── route.ts          # GET (목록), POST (생성)
│   ├── [id]/
│   │   ├── route.ts      # GET, PUT, DELETE
│   │   ├── blocks/       # 블록 관리
│   │   └── publish/      # 공개/비공개 토글
│   └── generate/         # AI 가이드북 생성
├── blocks/
│   ├── [id]/route.ts     # GET, PUT, DELETE
│   └── reorder/          # 순서 변경
├── upload/
│   └── image/            # 이미지 업로드
├── subscriptions/
│   ├── route.ts          # 구독 관리
│   └── webhook/          # Toss 웹훅
└── guest/
    └── [slug]/           # 게스트용 공개 API
```

### 8.2 주요 API 엔드포인트

#### AI 가이드북 생성

```
POST /api/guidebooks/generate
Content-Type: application/json

{
  "airbnbUrl": "https://www.airbnb.co.kr/rooms/12345678"
}

Response:
{
  "data": {
    "id": "uuid",
    "title": "제주 감성 펜션",
    "blocks": [ ... ]
  }
}
```

#### 블록 순서 변경

```
PUT /api/blocks/reorder
Content-Type: application/json

{
  "guidebookId": "uuid",
  "blockIds": ["block1", "block2", "block3"]
}
```

### 8.3 응답 형식

**성공:**
```json
{
  "data": { ... },
  "meta": {
    "total": 10
  }
}
```

**에러:**
```json
{
  "error": {
    "code": "GUIDEBOOK_LIMIT_EXCEEDED",
    "message": "무료 플랜은 가이드북 1개까지만 생성할 수 있습니다."
  }
}
```

---

## 9. 프로젝트 구조

```
roomy/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # 인증 페이지
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (host)/             # 호스트 전용
│   │   │   ├── dashboard/      # 가이드북 목록
│   │   │   ├── editor/[id]/    # 블록 에디터
│   │   │   ├── create/         # 가이드북 생성
│   │   │   └── settings/       # 설정, 구독
│   │   ├── g/[slug]/           # 게스트 뷰 (공개)
│   │   └── api/                # API Routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui
│   │   ├── blocks/             # 블록 컴포넌트
│   │   │   ├── editors/        # 편집 모드
│   │   │   └── viewers/        # 조회 모드 (게스트)
│   │   ├── editor/             # 에디터 레이아웃
│   │   └── guest/              # 게스트 뷰
│   ├── lib/
│   │   ├── supabase/           # Supabase 클라이언트
│   │   ├── openai/             # OpenAI 유틸
│   │   ├── scraper/            # 에어비앤비 크롤러
│   │   └── toss/               # 토스페이먼츠
│   ├── stores/                 # Zustand
│   │   ├── editor-store.ts     # 에디터 상태
│   │   └── auth-store.ts       # 인증 상태
│   ├── types/                  # TypeScript 타입
│   │   ├── guidebook.ts
│   │   ├── block.ts
│   │   └── subscription.ts
│   └── hooks/                  # 커스텀 훅
├── supabase/
│   ├── migrations/             # DB 마이그레이션
│   └── seed.sql                # 시드 데이터
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    └── planning/               # 기획 문서
```

---

## 10. 환경 변수

```bash
# .env.local (커밋 X)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# NextAuth.js
AUTH_SECRET=xxx
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# Toss Payments
TOSS_CLIENT_KEY=test_ck_xxx
TOSS_SECRET_KEY=test_sk_xxx

# Naver Maps (선택)
NAVER_CLIENT_ID=xxx
NAVER_CLIENT_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Decision Log

- **Next.js 15 선택**: App Router, 서버 컴포넌트로 성능 최적화
- **Supabase 선택**: Auth + DB + Storage + RLS 통합
- **OpenAI GPT-4o 선택**: 한국어 품질, JSON 출력 모드
- **블록 시스템**: Touch Stay 3-Level 계층 참고, 단순화 (Category > Block)
- **에어비앤비 크롤링**: MVP에서 시작, 차단 시 수동 입력 대안
- **Puppeteer vs Cheerio**: 동적 페이지 처리를 위해 Puppeteer 선택
- **구독 결제**: Toss Payments 빌링키 방식 (자동 갱신)
