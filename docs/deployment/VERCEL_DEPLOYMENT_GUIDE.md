# Vercel 배포 가이드

Vibe Store를 Vercel에 배포하는 전체 가이드입니다.

## 목차

1. [사전 준비](#사전-준비)
2. [배포 체크리스트](#배포-체크리스트)
3. [자동 배포 (권장)](#자동-배포-권장)
4. [수동 배포](#수동-배포)
5. [환경변수 설정](#환경변수-설정)
6. [배포 후 확인](#배포-후-확인)
7. [문제 해결](#문제-해결)

---

## 사전 준비

### 1. Vercel 계정 생성

1. [vercel.com](https://vercel.com) 접속
2. GitHub 계정으로 회원가입 (권장)
3. 무료 Hobby 플랜 선택

### 2. 필수 서비스 설정

#### Supabase 프로젝트

- [ ] Supabase 프로젝트 생성
- [ ] Database 마이그레이션 완료
- [ ] RLS 정책 활성화 확인
- [ ] API 키 확보:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

#### Toss Payments (선택)

- [ ] Toss Payments 가맹점 등록
- [ ] API 키 확보:
  - `TOSS_CLIENT_KEY`
  - `TOSS_SECRET_KEY`

---

## 배포 체크리스트

배포 전 다음 항목을 확인하세요:

### 코드 준비

- [ ] 모든 변경사항 커밋
- [ ] `npm run build` 로컬 빌드 성공
- [ ] `npm run test` 테스트 통과
- [ ] `npm run lint` 린트 오류 없음
- [ ] `.env.local` 파일 확인 (배포 시 제외됨)

### 환경변수

- [ ] 필수 환경변수 준비
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL`
- [ ] 선택 환경변수 준비 (필요시)
  - `TOSS_CLIENT_KEY`
  - `TOSS_SECRET_KEY`

### Vercel 설정

- [ ] Vercel CLI 설치됨
- [ ] Vercel 계정 로그인됨
- [ ] 프로젝트 준비됨

---

## 자동 배포 (권장)

Vibe Store는 배포 자동화 스크립트를 제공합니다.

### 1. Vercel CLI 설치

```bash
# 글로벌 설치
npm install -g vercel

# 또는 npx 사용 (설치 없이)
npx vercel --version
```

### 2. 프리뷰 배포

```bash
npm run deploy:vercel
```

**동작:**
1. Vercel CLI 설치 확인
2. 프로젝트 연결 확인
3. 환경변수 확인
4. 프리뷰 배포 실행

### 3. 프로덕션 배포

```bash
npm run deploy:vercel -- --prod
```

**프로덕션 배포 시:**
- 프로덕션 도메인에 배포
- 자동 HTTPS 인증서 발급
- CDN 캐싱 최적화

### 4. 대화형 프롬프트

스크립트 실행 중 다음 안내를 따르세요:

```
[1/5] Vercel CLI 확인
────────────────────────────────────────────────────────────
✓ Vercel CLI 설치됨 (v33.0.0)

[2/5] 프로젝트 연결 확인
────────────────────────────────────────────────────────────
✗ Vercel 프로젝트가 연결되지 않았습니다

다음 명령어로 프로젝트를 연결하세요:
  vercel link

지금 프로젝트를 연결하시겠습니까? (y/N): y

[3/5] 환경변수 확인
────────────────────────────────────────────────────────────
필수 환경변수:
  ✓ NEXT_PUBLIC_SUPABASE_URL
  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
  ✗ SUPABASE_SERVICE_ROLE_KEY (누락)

⚠️  필수 환경변수가 누락되었습니다!
계속 진행하시겠습니까? (y/N):
```

---

## 수동 배포

자동 스크립트를 사용하지 않는 경우:

### 1. Vercel 로그인

```bash
vercel login
```

### 2. 프로젝트 연결

```bash
vercel link
```

**질문에 답하기:**
- Set up and deploy: `Y`
- Which scope: 개인 계정 선택
- Link to existing project: `N` (처음) 또는 `Y` (기존)
- Project name: `vibe-store` (원하는 이름)
- Directory: `.` (현재 디렉토리)

### 3. 환경변수 설정

```bash
# 필수 변수 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL

# 선택 변수 (Toss Payments 사용 시)
vercel env add TOSS_CLIENT_KEY
vercel env add TOSS_SECRET_KEY
```

**각 명령어 실행 시:**
1. 변수 값 입력
2. 환경 선택: `Production`, `Preview`, `Development` 모두 선택

### 4. 배포 실행

```bash
# 프리뷰 배포
vercel

# 프로덕션 배포
vercel --prod
```

---

## 환경변수 설정

### CLI로 설정

```bash
# 대화형 추가
vercel env add VARIABLE_NAME

# 파일에서 가져오기
vercel env pull .env.vercel.local
```

### Vercel 대시보드에서 설정

1. [vercel.com/dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** > **Environment Variables**
4. **Add New** 클릭
5. 변수 입력:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJxxx...` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJxxx...` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | All |
| `TOSS_CLIENT_KEY` | `test_ck_xxx` | All |
| `TOSS_SECRET_KEY` | `test_sk_xxx` | Production, Preview |

### 환경변수 확인

```bash
# 목록 확인
vercel env ls

# 특정 환경 다운로드
vercel env pull .env.vercel.local
```

---

## 배포 후 확인

### 1. 배포 상태 확인

```bash
# 최근 배포 목록
vercel ls

# 특정 배포 로그
vercel logs [deployment-url]
```

### 2. 기능 테스트

배포된 사이트에서 다음을 확인하세요:

#### 기본 기능

- [ ] 홈페이지 로딩
- [ ] 상품 목록 조회
- [ ] 상품 상세 페이지
- [ ] 이미지 로딩

#### 인증

- [ ] 로그인 페이지 접근
- [ ] 소셜 로그인 (Google, Kakao)
- [ ] 매직 링크 로그인
- [ ] 프로필 페이지

#### 상품 기능

- [ ] 장바구니 담기
- [ ] 장바구니 수량 변경
- [ ] 결제 페이지 접근

#### 결제 (테스트 모드)

- [ ] Toss Payments 연동
- [ ] 테스트 결제 완료
- [ ] 다운로드 권한 생성

#### 관리자

- [ ] `/admin` 접근 제어
- [ ] 관리자 대시보드
- [ ] 상품 등록/수정

### 3. Supabase 연결 확인

```bash
# 브라우저 콘솔에서
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

**또는 API 라우트 테스트:**

```bash
curl https://your-domain.vercel.app/api/health
```

### 4. 도메인 설정

커스텀 도메인 사용 시:

```bash
# CLI로 도메인 추가
vercel domains add your-domain.com

# 대시보드에서
# Settings > Domains > Add Domain
```

---

## 문제 해결

### 빌드 실패

**증상:** 배포 중 빌드 오류

**해결:**

```bash
# 로컬에서 빌드 테스트
npm run build

# 타입 체크
npm run type-check

# 린트 확인
npm run lint
```

**일반적인 원인:**
- TypeScript 타입 오류
- 환경변수 누락
- 패키지 의존성 문제

### 환경변수 인식 안됨

**증상:** `undefined` 또는 빈 값

**해결:**

1. Vercel 대시보드에서 환경변수 확인
2. 변수 이름 정확성 확인 (`NEXT_PUBLIC_` 접두사)
3. 재배포 필요 (환경변수 변경 후)

```bash
vercel --prod --force
```

### Supabase 연결 실패

**증상:** Database connection error

**해결:**

1. Supabase URL 확인
2. RLS 정책 확인
3. ANON_KEY vs SERVICE_ROLE_KEY 확인

```bash
# Supabase 프로젝트 설정에서 키 재확인
# Settings > API > Project API keys
```

### 404 에러 (페이지를 찾을 수 없음)

**증상:** 특정 라우트 404

**해결:**

1. `vercel.json` 확인
2. Next.js App Router 경로 확인
3. 동적 라우트 `[slug]` 확인

### Toss Payments 웹훅 실패

**증상:** 결제 후 상태 업데이트 안됨

**해결:**

1. Toss 대시보드에서 웹훅 URL 설정:
   ```
   https://your-domain.vercel.app/api/webhooks/toss
   ```

2. HTTPS 확인 (Vercel은 자동 HTTPS)

3. 웹훅 로그 확인:
   ```bash
   vercel logs --follow
   ```

### 메모리 부족 (Out of Memory)

**증상:** 빌드 중 메모리 에러

**해결:**

1. `next.config.ts`에 메모리 제한 설정:
   ```typescript
   export default {
     experimental: {
       workerThreads: false,
       cpus: 1
     }
   }
   ```

2. Vercel Pro 플랜 고려 (더 많은 리소스)

### CORS 에러

**증상:** API 요청 CORS 차단

**해결:**

`vercel.json`에 헤더 설정 확인:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

---

## 유용한 명령어

```bash
# 배포 목록
vercel ls

# 배포 로그 확인
vercel logs [deployment-url]
vercel logs --follow

# 환경변수 관리
vercel env ls
vercel env add [name]
vercel env rm [name]

# 도메인 관리
vercel domains ls
vercel domains add [domain]

# 프로젝트 제거
vercel remove [project-name]

# 배포 롤백
vercel rollback [deployment-url]

# Vercel 설정 확인
vercel inspect [deployment-url]
```

---

## 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [Supabase Vercel 통합](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Toss Payments 웹훅](https://docs.tosspayments.com/guides/webhook)

---

## 다음 단계

배포 완료 후:

1. [ ] 실제 도메인 연결
2. [ ] Analytics 설정 (Vercel Analytics)
3. [ ] 모니터링 설정 (Sentry, LogRocket 등)
4. [ ] CI/CD 파이프라인 구축 (GitHub Actions)
5. [ ] 성능 최적화 (이미지, 캐싱)

**관련 가이드:**
- `docs/deployment/github-actions.md` - CI/CD 자동화
- `docs/deployment/docker.md` - Docker 배포
- `docs/deployment/railway.md` - Railway 배포
