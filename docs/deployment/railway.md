# Railway 배포 가이드

이 문서는 Vibe Store를 Railway에 배포하는 방법을 설명합니다. Railway는 간단한 원클릭 배포를 제공하는 현대적인 플랫폼입니다.

## 개요

- **플랫폼**: Railway
- **배포 방식**: Git 기반 자동 배포 또는 CLI
- **빌드 시간**: 약 2-4분
- **다운타임**: 0초
- **비용**: Pay-as-you-go (시작가 $5/월)
- **장점**: 간단한 UI, 빠른 배포, PostgreSQL 자동 통합

## 전제 조건

1. GitHub 계정
2. Railway 계정 (https://railway.app)
3. 프로젝트가 GitHub 리포지토리에 푸시됨

## 1단계: Railway 계정 생성

### 1.1 가입

```bash
# 웹 브라우저에서
https://railway.app

# GitHub로 로그인 권장
```

### 1.2 프로젝트 생성

1. Railway 대시보드에서 "New Project" 클릭
2. 옵션 선택:
   - "Deploy from GitHub" (자동 배포)
   - "Create a new service" (수동 설정)

## 2단계: GitHub 리포지토리 연동

### 2.1 리포지토리 선택

1. Railway 대시보드 > "New Project"
2. "Deploy from GitHub" 선택
3. GitHub 인증 (필요 시)
4. 리포지토리 목록에서 `vibeShop` 선택

### 2.2 배포 설정

| 설정 | 값 |
|------|-----|
| Branch to deploy | `main` |
| Deployment trigger | GitHub push (자동) |

## 3단계: 환경 변수 설정

### 3.1 환경 변수 추가

Railway 프로젝트 대시보드에서:

1. Variables 탭 클릭
2. "Add Variable" 클릭
3. 다음 변수 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
TOSS_CLIENT_KEY=your_client_key
TOSS_SECRET_KEY=your_secret_key
NEXT_PUBLIC_APP_URL=https://your-railway-domain.up.railway.app
NODE_ENV=production
```

### 3.2 각 환경별 설정

Railway에서는 다음 환경을 지원합니다:

- **Preview**: PR별 자동 생성
- **Production**: 메인 브랜치

```bash
# 환경별 변수 설정
# Variables > Production / Preview 선택 후 추가
```

## 4단계: 자동 배포

### 4.1 GitHub Push 시 자동 배포

```bash
# 로컬에서
git push origin main

# Railway가 자동으로:
# 1. 코드 변경 감지
# 2. 빌드 시작
# 3. 배포
```

### 4.2 배포 상태 확인

Railway 대시보드에서:

1. "Deployments" 탭
2. 실시간 빌드 로그 확인
3. 배포 완료 후 녹색 체크마크 확인

## 5단계: 도메인 설정

### 5.1 Railway 도메인 (임시)

자동으로 할당되는 도메인:

```
https://vibe-store-production-xxxx.up.railway.app
```

### 5.2 커스텀 도메인 설정

1. Railway 프로젝트 > Settings > Domains
2. "Add Custom Domain" 클릭
3. 도메인 입력 (예: vibeshop.com)
4. DNS 설정 지시사항 따르기

### 5.3 DNS 레코드 설정

도메인 제공자에서:

```
Type: CNAME
Name: www
Value: [Railway에서 제공한 CNAME]
```

## 6단계: 데이터베이스 통합 (선택)

### 6.1 PostgreSQL 추가

Railway 대시보드에서:

1. "+ Add Service" 클릭
2. "PostgreSQL" 선택
3. 자동 생성되는 연결 정보 확인

### 6.2 연결 문자열

자동으로 생성되는 환경 변수:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

## 7단계: CLI로 배포 (선택)

### 7.1 Railway CLI 설치

```bash
npm install -g @railway/cli
```

### 7.2 로그인

```bash
railway login
```

### 7.3 프로젝트 연동

```bash
# 프로젝트 디렉토리에서
railway init

# 기존 프로젝트 선택
railway link
```

### 7.4 배포

```bash
# 현재 상태 배포
railway up

# 서비스 상태 확인
railway services

# 로그 확인
railway logs

# 환경 변수 확인
railway variables
```

## 8단계: PR 미리보기

### 8.1 자동 Preview 배포

GitHub에서 Pull Request 생성 시:

1. Railway가 자동으로 Preview 환경 생성
2. PR에 배포 URL 댓글
3. 검토 후 메인 브랜치에 머지

### 8.2 Preview URL

```
https://vibe-store-preview-{branch}-xxxx.up.railway.app
```

## 9단계: 모니터링

### 9.1 로그 확인

```bash
# Railway 대시보드
Deployments > Logs

# CLI
railway logs --follow
```

### 9.2 메트릭

Railway 대시보드에서:

- CPU 사용량
- 메모리 사용량
- 네트워크 트래픽
- 배포 시간

### 9.3 에러 알림

Railway 프로젝트 Settings에서:

1. Alerts 설정
2. 이메일 또는 Slack 알림 구성

## 10단계: 배포 전략

### 10.1 Blue-Green 배포

```bash
# 기본 설정 (자동)
# Railway는 새 버전 배포 시 자동으로 Blue-Green 처리
```

### 10.2 롤백

```bash
# Railway 대시보드
Deployments > 이전 배포 선택 > "Rollback" 클릭

# 또는 CLI
railway deploy --id [previous-deployment-id]
```

### 10.3 Cron 작업 (선택)

```bash
# railway.json
{
  "jobs": {
    "cleanup": "node scripts/cleanup.js"
  },
  "crons": {
    "cleanup": "0 2 * * *"
  }
}
```

## 문제 해결

### 빌드 실패

```bash
# 로컬 빌드 테스트
npm run build

# 타입 체크
npm run type-check

# 린트
npm run lint

# 로그에서 에러 확인
railway logs --error
```

### 환경 변수 누락

```bash
# 환경 변수 확인
railway variables

# 변수 추가
railway variables:set KEY=value

# 변수 제거
railway variables:unset KEY
```

### 배포 시간 초과

```bash
# Build timeout 증가
# railway.json
{
  "buildTimeout": 900
}
```

### 메모리 부족

Railway 프로젝트 Settings > Resource Limits:

- RAM 증가 (예: 512MB → 1GB)
- 자동 재시작 설정

## 프로덕션 체크리스트

배포 전 다음을 확인하세요:

- [ ] 모든 환경 변수 설정됨
- [ ] 로컬에서 `npm run build` 성공
- [ ] `npm run type-check` 통과
- [ ] `npm run lint` 통과
- [ ] `npm run test` 통과
- [ ] GitHub에 최신 코드 푸시됨
- [ ] 도메인 DNS 설정됨
- [ ] 에러 모니터링 구성됨
- [ ] 백업 전략 수립됨

## 원클릭 배포 버튼

프로젝트 README에 다음을 추가하면 원클릭 배포 가능:

```markdown
## 빠른 배포

### Railway에서 배포

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new?template=https%3A%2F%2Fgithub.com%2Fyour-username%2FvibeShop&envs=NEXT_PUBLIC_SUPABASE_URL%2CNEXT_PUBLIC_SUPABASE_ANON_KEY%2CSUPABASE_SERVICE_ROLE_KEY%2CTOSS_CLIENT_KEY%2CTOSS_SECRET_KEY&NEXT_PUBLIC_SUPABASE_URLDesc=Your+Supabase+URL&NEXT_PUBLIC_SUPABASE_ANON_KEYDesc=Your+Supabase+Anon+Key)
```

### 버튼 URL 구조

```
https://railway.app/new?template=GITHUB_URL&envs=ENV1,ENV2,ENV3
```

## 배포 상태 대시보드

외부 모니터링 서비스 통합:

```bash
# UptimeRobot
# Pingdom
# StatusPage.io

# 체크 URL
https://your-railway-domain.up.railway.app/api/health
```

## 비용 추정

### 기본 설정

| 항목 | 비용 |
|------|------|
| 기본 Service (512MB) | $5/월 |
| 추가 RAM (1GB) | $10/월 |
| PostgreSQL | $5/월 |
| **합계** | ~$20/월 |

## 참고 자료

- [Railway 공식 문서](https://docs.railway.app/)
- [Railway CLI 가이드](https://docs.railway.app/cli)
- [Next.js on Railway](https://docs.railway.app/guides/nextjs)
- [환경 변수 관리](https://docs.railway.app/develop/variables)
- [도메인 설정](https://docs.railway.app/deploy/exposing-your-app)
