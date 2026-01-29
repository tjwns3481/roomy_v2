# Roomy 배포 가이드

이 문서는 Roomy를 프로덕션 환경에 배포하는 방법을 설명합니다.

## 목차

1. [배포 전 체크리스트](#배포-전-체크리스트)
2. [Vercel 배포](#vercel-배포)
3. [Supabase 설정](#supabase-설정)
4. [환경 변수 설정](#환경-변수-설정)
5. [Docker 배포](#docker-배포)
6. [CI/CD 파이프라인](#cicd-파이프라인)
7. [모니터링 및 로깅](#모니터링-및-로깅)
8. [트러블슈팅](#트러블슈팅)

## 배포 전 체크리스트

배포 전에 다음 항목들을 확인하세요:

- [ ] 로컬 환경에서 테스트 완료: `npm run test`
- [ ] 린팅 통과: `npm run lint`
- [ ] 타입 체크 통과: `npm run type-check`
- [ ] 프로덕션 빌드 성공: `npm run build`
- [ ] 환경 변수 모두 준비됨
- [ ] 데이터베이스 마이그레이션 계획 수립
- [ ] RLS 정책 검토
- [ ] 보안 감사 완료
- [ ] 로깅 및 모니터링 설정 완료
- [ ] 스케일링 계획 수립

## Vercel 배포

Vercel은 Next.js 최적화 배포 플랫폼입니다. 가장 간단한 배포 방법입니다.

### 1단계: Vercel 계정 생성

1. https://vercel.com 방문
2. GitHub/GitLab/Bitbucket 계정으로 가입
3. 이메일 인증 완료

### 2단계: 저장소 연결

1. Vercel 대시보드 → "New Project"
2. GitHub 저장소 선택
3. "Import" 클릭

### 3단계: 프로젝트 설정

```
Project Name: roomy
Framework Preset: Next.js
Root Directory: ./roomy_v2  (프로젝트 루트가 아닌 경우)
```

### 4단계: 환경 변수 설정

"Environment Variables" 섹션에서 다음 변수를 추가합니다:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com

# OpenAI
OPENAI_API_KEY=sk-...

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=pk_live_...
TOSS_SECRET_KEY=sk_live_...

# Analytics (선택사항)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### 5단계: 배포

"Deploy" 버튼을 클릭하면 자동으로 배포가 시작됩니다.

```
Vercel는 main 브랜치 푸시 시 자동으로 배포합니다.
PR은 미리보기(Preview) 배포를 생성합니다.
```

### 6단계: 도메인 연결

1. Vercel 프로젝트 설정 → "Domains"
2. "Add" 버튼 클릭
3. 도메인 입력
4. DNS 레코드 설정 (가비아, Route53 등)

**DNS 설정 예시 (Route53)**:
```
Type: CNAME
Name: roomy
Value: cname.vercel-dns.com
```

### Vercel CLI 배포

로컬에서 배포하려면:

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel --prod

# 프로덕션 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL
```

## Supabase 설정

### 1단계: Supabase 프로젝트 생성

1. https://supabase.com 방문
2. 새 프로젝트 생성
3. 프로젝트명, 데이터베이스 비밀번호 설정
4. 리전 선택 (권장: 서울 `ap-northeast-2`)

### 2단계: 데이터베이스 마이그레이션

```bash
# 로컬 환경에서 마이그레이션 스크립트 실행
npm run db:migrate

# 또는 수동으로 SQL 실행
# supabase/migrations/*.sql 파일들을 Supabase 에디터에 복사/붙여넣기
```

### 3단계: RLS (행 레벨 보안) 정책 활성화

Supabase 대시보드에서 다음을 확인합니다:

**Authentication → Policies**:
```sql
-- users 테이블
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
USING (auth.uid() = id);

-- guidebooks 테이블
CREATE POLICY "Users can read own guidebooks"
ON guidebooks
FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own guidebooks"
ON guidebooks
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Storage: guidebook-images 버킷
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'guidebook-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 4단계: 백업 설정

Supabase 대시보드 → Settings → Backups:
- Daily backups 활성화
- 백업 보관 기간: 최소 30일

### 5단계: 네트워크 보안

**IP Whitelist** (선택사항):
1. Settings → Network
2. Allowed IP Addresses 추가
3. Vercel IP 범위 추가 (필요 시)

## 환경 변수 설정

### 프로덕션 환경 변수

모든 환경에서 필수:

```env
# Supabase (https://supabase.com/dashboard/project/[id]/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # 서버 측 API 호출용

# App
NEXT_PUBLIC_APP_URL=https://roomy.example.com

# OpenAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-...

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=pk_live_...
TOSS_SECRET_KEY=sk_live_...
TOSS_MERCHANT_ID=roomy_...
```

### 선택사항 환경 변수

```env
# Analytics
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ANALYTICS_TYPE=gtag  # ga4, amplitude, etc

# Sentry (에러 추적)
NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/project

# Slack (알림)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Email (NotificationEmails)
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@roomy.example.com

# 로깅
LOG_LEVEL=info  # debug, info, warn, error
```

### 환경별 설정

**개발 환경** (`.env.local`):
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
OPENAI_API_KEY=sk-test-...
```

**스테이징 환경** (`.env.staging`):
```env
NEXT_PUBLIC_APP_URL=https://staging.roomy.example.com
NODE_ENV=production
OPENAI_API_KEY=sk-test-...
```

**프로덕션 환경** (`.env.production`):
```env
NEXT_PUBLIC_APP_URL=https://roomy.example.com
NODE_ENV=production
OPENAI_API_KEY=sk-...
```

## Docker 배포

자체 서버에 배포할 경우 Docker를 사용합니다.

### 1단계: Docker 이미지 빌드

```bash
# 이미지 빌드
docker build -t roomy:latest .

# 환경 변수 파일 준비
cat > .env.docker << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://roomy.example.com
OPENAI_API_KEY=sk-...
EOF
```

### 2단계: Docker 컨테이너 실행

```bash
# 개발 환경
docker run -d \
  --name roomy-dev \
  --env-file .env.docker \
  -p 3000:3000 \
  roomy:latest

# 프로덕션 환경 (Docker Compose)
docker-compose -f docker-compose.yml up -d
```

### Docker Compose (권장)

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  roomy:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - roomy
    restart: always
```

## CI/CD 파이프라인

### GitHub Actions 설정

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  slack-notification:
    needs: deploy
    runs-on: ubuntu-latest
    if: always()
    steps:
      - uses: slackapi/slack-github-action@v1.24.0
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "배포 완료",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*배포 결과*: ${{ needs.deploy.result == 'success' && '성공 ✅' || '실패 ❌' }}"
                  }
                }
              ]
            }
```

### Vercel CI/CD

Vercel은 자동으로 CI/CD를 제공합니다:

1. 모든 푸시는 자동으로 빌드/테스트됨
2. PR은 미리보기(Preview) 배포 생성
3. main 병합 시 프로덕션 배포

## 모니터링 및 로깅

### Vercel Analytics

1. Vercel 대시보드 → Analytics
2. 성능 메트릭 확인:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)

### Sentry 설정 (에러 추적)

```bash
# Sentry 설치
npm install @sentry/nextjs

# Sentry 초기화 스크립트 실행
npx @sentry/wizard@latest -i nextjs
```

`sentry.server.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV !== 'production',
});
```

### Google Analytics

```typescript
// src/lib/analytics.ts
import { useEffect } from 'react';

export function initGA(measurementId: string) {
  if (!measurementId) return;

  // Google Analytics 스크립트 로드
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', measurementId);
}

export function logEvent(name: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, params);
  }
}
```

### Supabase 로깅

Supabase 대시보드에서 로그 확인:
1. Logs → API Logs
2. Function Logs
3. Database Logs

## 롤백 전략

### Vercel 롤백

1. Vercel 대시보드 → Deployments
2. 이전 배포 선택
3. "Promote to Production" 클릭

### 수동 롤백

```bash
# 이전 커밋으로 되돌리기
git revert HEAD
git push origin main

# Vercel 자동 재배포 (또는 수동 배포)
vercel --prod
```

## 성능 최적화

### Next.js 최적화

```typescript
// next.config.ts
export default {
  compress: true,           // 압축 활성화
  swcMinify: true,         // SWC 미니피케이션
  experimental: {
    optimizePackageImports: [
      "lodash",
      "date-fns",
      "@mui/material",
    ],
  },
  images: {
    domains: [
      'your-project.supabase.co',
      'cdn.example.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### 캐싱 전략

```typescript
// app/layout.tsx
export const revalidate = 60; // ISR: 60초마다 재생성

// app/g/[slug]/page.tsx
export const revalidate = 3600; // 게스트 가이드북: 1시간마다 재생성
```

### 데이터베이스 연결 풀링

Supabase는 자동으로 연결 풀링을 제공합니다.

## 스케일링

### 예상 사용량

```
Free 플랜:
- 2,000 guidebooks
- 100,000 monthly active users
- 1,000,000 page views

Pro/Business 플랜:
- Unlimited guidebooks
- 자동 스케일링
```

### 예상 비용

| 항목 | 월 비용 |
|------|-------|
| Vercel | $0-500 |
| Supabase | $100-2,000 |
| OpenAI API | $100-5,000 |
| Toss Payments | 거래액의 2-3% |
| **합계** | **$300-7,500** |

## 트러블슈팅

### 배포 실패

**문제**: Vercel 배포 실패
**해결**:
1. 빌드 로그 확인: Vercel 대시보드 → Deployments → 실패한 배포
2. 로컬에서 재현: `npm run build`
3. 환경 변수 확인
4. 의존성 업데이트: `npm install`

### 환경 변수 오류

**문제**: `NEXT_PUBLIC_SUPABASE_URL is not defined`
**해결**:
1. Vercel 대시보드 → Settings → Environment Variables 확인
2. 변수명 정확한지 확인 (대소문자 구분)
3. 배포 다시 시작

### Supabase 연결 오류

**문제**: Supabase 연결 실패
**해결**:
1. SUPABASE_URL이 올바른지 확인
2. SUPABASE_ANON_KEY 확인
3. Supabase 대시보드에서 프로젝트 상태 확인
4. 네트워크 요청 확인 (브라우저 개발자도구 → Network)

### 높은 API 요청 비용

**문제**: OpenAI API 비용이 예상보다 높음
**해결**:
1. 사용량 모니터링: OpenAI Dashboard → Usage
2. API 호출 최적화 (캐싱, 배치 처리)
3. 모델 변경 고려 (GPT-4o-mini → GPT-3.5-turbo)
4. Rate Limiting 설정

### 데이터베이스 성능 저하

**문제**: 쿼리가 느림
**해결**:
1. Supabase 대시보드 → Database → Indexes 확인
2. 느린 쿼리 식별 및 최적화
3. 읽기 전용 복제본 추가 고려

---

**문제가 있으신가요?**
- GitHub Issues에서 문제 보고
- Vercel/Supabase 공식 문서 참고
- support@roomy.example.com 으로 연락
