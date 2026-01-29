# Roomy - 게스트 가이드북 SaaS

> 에어비앤비 링크 하나로 게스트 가이드북을 자동 생성하세요

Roomy는 호스트가 숙소 정보를 모바일 친화적인 디지털 가이드북으로 제공할 수 있는 한국형 SaaS입니다. AI 기반 자동 생성, 직관적인 블록 에디터, QR 코드 기반 공유로 게스트에게 최고의 체크인 경험을 제공합니다.

## 주요 기능

- **AI 자동 생성**: Airbnb 링크만으로 가이드북 자동 생성
- **블록 에디터**: 드래그 앤 드롭 기반 직관적인 편집
- **QR 코드 공유**: 단축 URL 기반 QR 코드 즉시 생성
- **다양한 블록 타입**: 히어로, 갤러리, 맵, 편의시설, 공지사항 등
- **게스트 뷰어**: 모바일 최적화 뷰어로 아름다운 가이드북 표시
- **플랜 시스템**: Free/Pro/Business 플랜으로 유연한 가격 정책
- **AI 챗봇**: 게스트가 가이드북에 질문할 수 있는 AI 챗봇
- **통계**: 조회수, 클릭 추적 등 가이드북 성과 분석
- **결제 연동**: 토스 페이먼츠 기반 안전한 결제

## 기술 스택

### Frontend
- **Next.js 15** (App Router, React Server Components)
- **React 19** (최신 피처 활용)
- **TypeScript** (타입 안정성)
- **Tailwind CSS 4** (모던 CSS)
- **shadcn/ui** (컴포넌트 라이브러리)
- **Zustand** (상태 관리)
- **SWR** (데이터 페칭)

### Backend & Infrastructure
- **Next.js API Routes** (엣지 런타임 지원)
- **Supabase** (PostgreSQL, Auth, Storage)
- **Supabase RLS** (행 레벨 보안)

### AI & External Services
- **OpenAI GPT-4o** (가이드북 생성, AI 챗봇)
- **Toss Payments** (결제 처리)

### Testing & Quality
- **Vitest** (단위/통합 테스트)
- **@testing-library/react** (컴포넌트 테스트)
- **ESLint** (코드 린팅)
- **TypeScript** (정적 타입 체크)

## 빠른 시작

### 필수 조건

- **Node.js** 18.17 이상
- **npm** 9.0 이상 또는 **yarn** 3.0 이상
- **Supabase 계정** (https://supabase.com)
- **OpenAI API 키** (가이드북 생성 기능용)
- **Toss Payments 계정** (결제 기능용, 선택사항)

### 1단계: 저장소 복제

```bash
git clone https://github.com/your-repo/roomy.git
cd roomy_v2
```

### 2단계: 의존성 설치

```bash
npm install
```

### 3단계: 환경 변수 설정

`.env.example` 파일을 복사하여 `.env.local` 파일을 생성합니다:

```bash
cp .env.example .env.local
```

`.env.local` 파일을 편집하여 다음 환경 변수를 설정합니다:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI (가이드북 생성용)
OPENAI_API_KEY=sk-...

# Toss Payments (결제용)
NEXT_PUBLIC_TOSS_CLIENT_KEY=pk_test_...
TOSS_SECRET_KEY=sk_test_...

# 선택사항
NEXT_PUBLIC_ANALYTICS_ID=
```

### 4단계: Supabase 설정

#### 4-1. Supabase 프로젝트 생성

1. https://supabase.com에서 로그인
2. 새 프로젝트 생성
3. 프로젝트 URL과 API 키 복사

#### 4-2. 데이터베이스 마이그레이션 실행

```bash
npm run db:migrate
```

#### 4-3. RLS 정책 활성화

Supabase 대시보드에서 다음을 설정합니다:

1. **Storage** → **guidebook-images** 버킷 생성
2. **RLS 정책** 추가:
   - 업로드: 인증 사용자만 가능
   - 수정/삭제: 본인 파일만 가능
   - 조회: 공개 이미지 누구나 가능

### 5단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속합니다.

## 프로젝트 구조

```
roomy_v2/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 인증 관련 페이지
│   │   │   ├── login/                # 로그인
│   │   │   ├── signup/               # 회원가입
│   │   │   ├── reset-password/       # 비밀번호 재설정
│   │   │   └── update-password/      # 비밀번호 변경
│   │   ├── (host)/                   # 호스트 전용 페이지 (로그인 필요)
│   │   │   ├── dashboard/            # 대시보드
│   │   │   │   ├── guidebooks/       # 가이드북 목록
│   │   │   │   ├── stats/            # 통계
│   │   │   │   └── [id]/             # 가이드북 상세
│   │   │   ├── editor/[id]/          # 블록 에디터
│   │   │   ├── settings/             # 설정 (결제, 알림 등)
│   │   │   ├── pricing/              # 요금제 페이지
│   │   │   ├── checkout/             # 결제 페이지
│   │   │   └── help/                 # 도움말 페이지
│   │   ├── (guest)/                  # 게스트 공개 페이지
│   │   │   └── g/[slug]/             # 가이드북 뷰어
│   │   ├── s/[code]/                 # 단축 URL 리다이렉트
│   │   ├── api/                      # API Routes
│   │   ├── demo/                     # 데모 페이지 (개발용)
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   └── page.tsx                  # 랜딩 페이지
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 컴포넌트
│   │   ├── blocks/                   # 블록 컴포넌트
│   │   ├── blocks/editors/           # 블록 에디터
│   │   ├── onboarding/               # 온보딩 컴포넌트
│   │   ├── editor/                   # 에디터 UI
│   │   ├── guest/                    # 게스트 뷰어 컴포넌트
│   │   └── ...                       # 기타 컴포넌트
│   │
│   ├── lib/
│   │   ├── supabase/                 # Supabase 클라이언트
│   │   ├── api/                      # API 클라이언트
│   │   ├── utils.ts                  # 유틸리티 함수
│   │   └── validators.ts             # Zod 스키마
│   │
│   ├── stores/                       # Zustand 스토어
│   │   ├── editor-store.ts           # 에디터 상태
│   │   ├── auth-store.ts             # 인증 상태
│   │   └── ...
│   │
│   ├── types/                        # TypeScript 타입
│   │   ├── guide.ts                  # 가이드북 타입
│   │   ├── block.ts                  # 블록 타입
│   │   └── ...
│   │
│   ├── hooks/                        # 커스텀 React 훅
│   │   ├── useGuide.ts               # 가이드북 관련
│   │   ├── useAuth.ts                # 인증 관련
│   │   └── ...
│   │
│   └── middleware.ts                 # Next.js 미들웨어
│
├── supabase/
│   └── migrations/                   # 데이터베이스 마이그레이션
│
├── tests/                            # 테스트 파일
│   ├── unit/                         # 단위 테스트
│   ├── integration/                  # 통합 테스트
│   └── fixtures/                     # 테스트 픽스처
│
├── public/                           # 정적 자산
│   ├── images/                       # 이미지
│   ├── icons/                        # 아이콘
│   └── ...
│
├── docs/
│   ├── planning/                     # 기획 문서
│   │   ├── 01-prd.md                 # Product Requirements Document
│   │   ├── 02-trd.md                 # Technical Requirements Document
│   │   ├── 03-user-flow.md           # User Flow
│   │   ├── 04-database-design.md     # Database Design
│   │   ├── 05-design-system.md       # Design System
│   │   ├── 06-tasks.md               # Task List
│   │   └── 07-coding-convention.md   # Coding Convention
│   └── DESIGN_SYSTEM.md              # Design System
│
├── .env.example                      # 환경 변수 예제
├── .gitignore                        # Git 제외 파일
├── package.json                      # 프로젝트 설정
├── tsconfig.json                     # TypeScript 설정
├── tailwind.config.ts                # Tailwind CSS 설정
├── next.config.ts                    # Next.js 설정
├── components.json                   # shadcn/ui 설정
├── vitest.config.ts                  # Vitest 설정
├── eslint.config.mjs                 # ESLint 설정
└── README.md                         # 이 파일
```

## 개발 가이드

### 스크립트 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린팅
npm run lint

# 타입 체크
npm run type-check

# 테스트 실행
npm run test

# 테스트 감시 모드
npm run test:watch

# 테스트 UI
npm run test:ui

# 데이터베이스 마이그레이션
npm run db:migrate

# 데이터 시드
npm run db:seed

# 데이터베이스 초기화
npm run db:reset
```

### 코드 작성 규칙

- **파일 네이밍**: kebab-case (`guide-editor.tsx`)
- **컴포넌트**: PascalCase (`GuideEditor`)
- **변수/함수**: camelCase (`guidebookId`)
- **상수**: SCREAMING_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Server Component 우선**: 클라이언트 컴포넌트는 필요할 때만 `'use client'` 추가
- **타입 안정성**: 모든 함수에 명시적 타입 정의
- **RLS 우선**: 모든 데이터 접근은 Supabase RLS로 보호
- **TAG 주석**: 모든 구현에 `@TASK P#-T#` 주석 추가

### Git 워크플로우

1. **브랜치 생성**: `phase-N-feature-name`, `feat/feature-name`, `fix/bug-name`
2. **커밋 메시지**: Conventional Commits 따르기
   ```
   feat(editor): 블록 추가 기능 구현
   fix(viewer): 모바일 레이아웃 수정
   docs(readme): 설치 가이드 업데이트
   ```
3. **Pull Request**: 설명과 함께 작은 단위의 PR 제출
4. **코드 리뷰**: 최소 1개 승인 후 병합

## API 문서

### 주요 엔드포인트

#### 인증

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/reset-password` - 비밀번호 재설정

#### 가이드북

- `GET /api/guidebooks` - 가이드북 목록 조회
- `POST /api/guidebooks` - 가이드북 생성
- `GET /api/guidebooks/[id]` - 가이드북 상세 조회
- `PATCH /api/guidebooks/[id]` - 가이드북 수정
- `DELETE /api/guidebooks/[id]` - 가이드북 삭제
- `GET /api/guidebooks/[id]/stats` - 통계 조회

#### AI

- `POST /api/ai/generate` - AI로 가이드북 생성
- `POST /api/ai/chat` - AI 챗봇 대화

#### 결제

- `GET /api/payments/plans` - 플랜 목록
- `POST /api/payments/checkout` - 결제 요청
- `POST /api/payments/webhook` - 결제 웹훅

자세한 API 문서는 개발 서버 실행 후 다음 경로에서 확인 가능합니다:
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/openapi.json

## 배포

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

### 빠른 배포 (Vercel)

1. [Vercel](https://vercel.com)에 로그인
2. 저장소 연결
3. 환경 변수 설정
4. 배포 버튼 클릭

```bash
npm run deploy:vercel
```

## 기여 가이드

기여하고 싶으신가요? [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.

이 프로젝트는 다음의 가이드라인을 따릅니다:
- 코드 스타일: ESLint + Prettier
- 브랜치 전략: Git Flow
- 커밋 메시지: Conventional Commits
- 테스트 작성: 모든 기능에 테스트 포함

## 테스트

```bash
# 모든 테스트 실행
npm run test

# 특정 파일 테스트
npm run test -- src/components/Button.test.tsx

# 감시 모드
npm run test:watch

# UI 모드
npm run test:ui

# 커버리지 레포트
npm run test -- --coverage
```

## 트러블슈팅

### 빌드 오류

```bash
# 캐시 삭제 후 재빌드
rm -rf .next node_modules
npm install
npm run build
```

### Supabase 연결 오류

1. 환경 변수 확인: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Supabase 프로젝트 상태 확인
3. 네트워크 연결 확인

### 테스트 실패

```bash
# 테스트 디버깅
npm run test:watch

# 특정 테스트만 실행
npm run test -- -t "test name"
```

## 성능 최적화

- Next.js Image 최적화 활용
- 코드 스플리팅과 동적 임포트
- Vercel 엣지 런타임 활용
- 캐싱 전략 (SWR, next/cache)
- 이미지 최적화 (WebP, 적응형 이미지)

## 보안

- Supabase RLS (행 레벨 보안)로 모든 데이터 보호
- 환경 변수로 민감한 정보 관리
- CORS 설정으로 크로스 오리진 요청 제어
- CSRF 토큰 검증
- Rate Limiting (Toss Payments, OpenAI API)

## 라이선스

MIT License - [LICENSE](./LICENSE) 파일 참고

## 지원

문제가 발생했나요?

- GitHub Issues: 버그 리포팅
- Discussion: 기능 제안 및 논의
- 이메일: support@roomy.example.com

## 변경 로그

주요 버전별 변경사항은 [CHANGELOG.md](./CHANGELOG.md)를 참고하세요.

---

**Roomy**로 게스트에게 최고의 경험을 제공하세요! 🎉
