# 배포 스크립트 가이드

Vibe Store의 배포 자동화 스크립트 사용 가이드입니다.

## 목차

- [deploy-vercel.ts](#deploy-vercelts) - Vercel 배포 자동화

---

## deploy-vercel.ts

Vercel 플랫폼에 자동으로 배포하는 스크립트입니다.

### 기능

1. **Vercel CLI 확인**
   - Vercel CLI 설치 여부 확인
   - 미설치 시 설치 가이드 제공

2. **프로젝트 연결 확인**
   - `.vercel` 디렉토리 확인
   - 미연결 시 `vercel link` 실행 옵션 제공

3. **환경변수 검증**
   - 필수 환경변수 체크
   - 선택 환경변수 체크
   - 누락된 변수 목록 표시

4. **배포 실행**
   - 프리뷰 또는 프로덕션 배포
   - 배포 진행 상황 실시간 표시

5. **결과 안내**
   - 성공 시 배포 URL 및 다음 단계 안내
   - 실패 시 문제 해결 가이드 제공

### 사용법

#### 프리뷰 배포

```bash
npm run deploy:vercel
```

**프리뷰 배포는:**
- 고유한 URL 생성 (예: `vibe-store-abc123.vercel.app`)
- PR 리뷰 및 테스트용
- 프로덕션에 영향 없음

#### 프로덕션 배포

```bash
npm run deploy:vercel -- --prod
```

**프로덕션 배포는:**
- 실제 서비스 도메인에 배포
- 자동 HTTPS 인증서 발급
- CDN 캐싱 최적화

### 실행 단계

스크립트는 5단계로 진행됩니다:

#### Step 1: Vercel CLI 확인

```
[1/5] Vercel CLI 확인
────────────────────────────────────────────────────────────
✓ Vercel CLI 설치됨 (v33.0.0)
```

**실패 시:**
```
✗ Vercel CLI가 설치되지 않았습니다

다음 명령어로 설치하세요:
  npm install -g vercel

또는:
  npx vercel --version  (매번 npx 사용)
```

#### Step 2: 프로젝트 연결 확인

```
[2/5] 프로젝트 연결 확인
────────────────────────────────────────────────────────────
✓ Vercel 프로젝트가 연결되어 있습니다
```

**미연결 시:**
```
✗ Vercel 프로젝트가 연결되지 않았습니다

다음 명령어로 프로젝트를 연결하세요:
  vercel link

처음 배포하는 경우:
  vercel  (자동으로 프로젝트 생성 및 연결)

지금 프로젝트를 연결하시겠습니까? (y/N):
```

#### Step 3: 환경변수 확인

```
[3/5] 환경변수 확인
────────────────────────────────────────────────────────────

필수 환경변수:
  ✓ NEXT_PUBLIC_SUPABASE_URL
  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
  ✓ SUPABASE_SERVICE_ROLE_KEY
  ✓ NEXT_PUBLIC_APP_URL

선택 환경변수:
  ✓ TOSS_CLIENT_KEY
  ✓ TOSS_SECRET_KEY
```

**환경변수 누락 시:**
```
필수 환경변수:
  ✓ NEXT_PUBLIC_SUPABASE_URL
  ✗ NEXT_PUBLIC_SUPABASE_ANON_KEY (누락)
  ✗ SUPABASE_SERVICE_ROLE_KEY (누락)

⚠️  필수 환경변수가 누락되었습니다!

Vercel 대시보드에서 환경변수를 설정하세요:
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택 > Settings > Environment Variables
3. 다음 변수들을 추가:
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

또는 CLI로 설정:
  vercel env add NEXT_PUBLIC_SUPABASE_URL
  vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
  vercel env add SUPABASE_SERVICE_ROLE_KEY

⚠️  계속 진행하면 배포는 성공하지만 앱이 정상 작동하지 않을 수 있습니다.

계속 진행하시겠습니까? (y/N):
```

#### Step 4: 배포 실행

```
[4/5] 프로덕션 배포 시작
────────────────────────────────────────────────────────────

실행 명령어: vercel --prod
배포를 시작합니다...

Vercel CLI 33.0.0
🔍  Inspect: https://vercel.com/xxx/vibe-store/xxx [1s]
✅  Production: https://vibe-store.vercel.app [2m 34s]
```

#### Step 5: 배포 완료

```
[5/5] 배포 완료
────────────────────────────────────────────────────────────

✓ 배포가 성공적으로 완료되었습니다!

프로덕션 URL:
  배포된 URL을 확인하려면 Vercel 대시보드를 확인하세요.

다음 단계:
1. 배포된 사이트에 접속하여 동작 확인
2. Supabase 연결 확인
3. 결제 시스템 테스트 (Toss Payments)
4. 관리자 페이지 접근 확인 (/admin)

유용한 명령어:
  vercel logs        - 배포 로그 확인
  vercel domains     - 도메인 설정
  vercel env ls      - 환경변수 목록
```

### 환경변수 목록

#### 필수 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 키 | `eyJhbGc...` |
| `NEXT_PUBLIC_APP_URL` | 앱 URL | `https://vibe-store.vercel.app` |

#### 선택 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `TOSS_CLIENT_KEY` | Toss Payments 클라이언트 키 | `test_ck_xxx` |
| `TOSS_SECRET_KEY` | Toss Payments 시크릿 키 | `test_sk_xxx` |

### 에러 처리

스크립트는 각 단계에서 발생할 수 있는 에러를 처리하고 가이드를 제공합니다.

#### Vercel CLI 미설치

```
✗ Vercel 배포 스크립트에서 문제가 발생했습니다

문제 해결:
1. Vercel CLI가 최신 버전인지 확인:
   npm install -g vercel@latest

2. Vercel 계정 로그인 확인:
   vercel login

3. 프로젝트 연결 재시도:
   rm -rf .vercel
   vercel link

4. 환경변수 확인:
   .env.local 파일 또는 Vercel 대시보드

자세한 도움말:
  https://vercel.com/docs
```

### 고급 사용

#### 환경별 배포

```bash
# Development (로컬 개발)
npm run dev

# Preview (테스트/리뷰)
npm run deploy:vercel

# Production (실제 서비스)
npm run deploy:vercel -- --prod
```

#### 배포 전 자동 체크

스크립트에 빌드 검증을 추가하려면:

```typescript
// scripts/deploy-vercel.ts 수정
async function preBuildCheck() {
  logStep(0, '배포 전 검증');

  try {
    execCommand('npm run lint');
    execCommand('npm run type-check');
    execCommand('npm run test');
    return true;
  } catch {
    return false;
  }
}
```

#### 배포 후 자동 테스트

배포 후 smoke test 실행:

```bash
# 배포 URL 저장
DEPLOY_URL=$(vercel --prod 2>&1 | grep -o 'https://[^ ]*')

# Health check
curl $DEPLOY_URL/api/health

# 주요 페이지 확인
curl -I $DEPLOY_URL
curl -I $DEPLOY_URL/products
```

### 문제 해결

#### Q: "command not found: vercel"

**A:** Vercel CLI가 설치되지 않았습니다.

```bash
# 글로벌 설치
npm install -g vercel

# 또는 npx 사용
npx vercel --version
```

#### Q: "Error: No existing credentials found"

**A:** Vercel 계정 로그인이 필요합니다.

```bash
vercel login
```

#### Q: "Error: Environment variable not found"

**A:** 환경변수를 Vercel에 추가해야 합니다.

```bash
# CLI로 추가
vercel env add VARIABLE_NAME

# 또는 대시보드에서
# Settings > Environment Variables
```

#### Q: 배포는 성공했지만 앱이 작동하지 않음

**A:** 환경변수 확인 및 재배포

```bash
# 환경변수 확인
vercel env ls

# 강제 재배포
vercel --prod --force
```

#### Q: "Error: Failed to load .env.local"

**A:** 로컬 환경변수 파일이 없습니다.

```bash
# .env.example 복사
cp .env.example .env.local

# 또는 Setup Wizard 실행
npm run setup
```

### 관련 파일

- `vercel.json` - Vercel 설정 파일
- `docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md` - 상세 가이드
- `.vercel/` - Vercel 프로젝트 연결 정보 (gitignore됨)

### 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [환경변수 관리](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 다음 단계

배포 스크립트 외 다른 기능:

- `migrate.ts` - DB 마이그레이션
- `seed.ts` - 시드 데이터 삽입
- `setup-wizard.ts` - 초기 설정 위저드

**CI/CD 자동화:**
- GitHub Actions 연동
- 자동 테스트 및 배포
- 참고: `docs/deployment/github-actions.md`
