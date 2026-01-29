# Vercel 배포 가이드

이 문서는 Vibe Store를 Vercel에 배포하는 단계별 과정을 설명합니다. Vercel은 Next.js의 제작자가 운영하는 플랫폼으로, 최적화된 성능을 제공합니다.

## 개요

- **플랫폼**: Vercel
- **배포 방식**: Git 기반 자동 배포
- **빌드 시간**: 약 3-5분
- **다운타임**: 0초 (자동 Blue-Green 배포)
- **비용**: 월 $20 (Pro Plan) 또는 Hobby (무료, 비프로덕션용)

## 전제 조건

1. GitHub 계정 (또는 GitLab, Bitbucket)
2. Vercel 계정 (https://vercel.com)
3. 프로젝트가 Git 리포지토리에 푸시됨

## 1단계: Vercel 계정 생성 및 GitHub 연동

### 1.1 Vercel에 가입하기

```bash
# 웹 브라우저에서
https://vercel.com/signup
```

GitHub 계정으로 가입하는 것을 권장합니다.

### 1.2 GitHub 리포지토리 연동

1. https://vercel.com/new 방문
2. "GitHub 리포지토리 임포트" 클릭
3. Vibe Store 리포지토리 선택
4. "Import" 클릭

## 2단계: 프로젝트 설정

### 2.1 기본 설정

Vercel 대시보드에서:

| 설정 | 값 |
|------|-----|
| Framework | Next.js |
| Root Directory | ./ (프로젝트 루트) |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

### 2.2 환경 변수 설정

Vercel 대시보드 > Settings > Environment Variables에서 다음을 추가:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Toss Payments
TOSS_CLIENT_KEY=your_client_key
TOSS_SECRET_KEY=your_secret_key

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### 2.3 각 환경별 변수 설정

Development, Preview, Production 환경에 따라 다른 값을 설정할 수 있습니다:

- **Production**: 실 서비스 데이터베이스 연동
- **Preview**: 스테이징 환경 (PR별 자동 생성)
- **Development**: 로컬 개발 환경

## 3단계: 배포

### 3.1 자동 배포 설정

Vercel은 기본적으로 Git 푸시 시 자동 배포됩니다:

```bash
# 로컬에서
git push origin main

# Vercel이 자동으로 감지하고 빌드/배포 시작
```

### 3.2 수동 배포 (선택사항)

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

### 3.3 배포 상태 확인

1. Vercel 대시보드에서 "Deployments" 탭
2. 실시간 빌드 로그 확인
3. 배포 완료 후 URL 확인

## 4단계: 도메인 설정

### 4.1 커스텀 도메인 연결

1. Vercel 대시보드 > Settings > Domains
2. "Add Domain" 클릭
3. 도메인 입력 (예: vibeshop.com)
4. DNS 설정 지시사항 따르기

### 4.2 DNS 레코드 설정

도메인 제공자(GoDaddy, Namecheap 등)에서:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

또는 루트 도메인의 경우:

```
Type: A
Value: 76.76.19.131
```

## 5단계: 프리뷰 배포

### 5.1 PR 미리보기

GitHub에서 Pull Request를 생성하면:

1. Vercel이 자동으로 Preview 배포 생성
2. PR에 배포 URL 댓글 작성
3. 다른 팀원이 배포 전 검토 가능

### 5.2 Preview URL 구조

```
https://vibe-store-{branch-name}-{username}.vercel.app
```

## 6단계: 모니터링 및 로깅

### 6.1 실시간 로그 확인

```bash
# Vercel CLI를 통한 로그 확인
vercel logs

# Production 로그만
vercel logs --prod
```

### 6.2 성능 분석

Vercel 대시보드의 "Analytics" 탭에서:

- 페이지 로드 시간
- Core Web Vitals
- 지역별 성능

### 6.3 에러 모니터링

Vercel은 다음 통합을 지원합니다:

- **Sentry**: 에러 추적
- **New Relic**: 성능 모니터링
- **Datadog**: 통합 모니터링

## 7단계: 성능 최적화

### 7.1 이미지 최적화

Next.js 이미지 컴포넌트 사용:

```tsx
import Image from 'next/image';

export default function ProductImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={400}
      priority={false}
    />
  );
}
```

### 7.2 동적 임포트

대용량 컴포넌트는 동적 임포트 사용:

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/components/heavy-component'),
  { loading: () => <div>로딩 중...</div> }
);
```

### 7.3 환경 변수 최적화

클라이언트에서 접근 가능한 변수만 `NEXT_PUBLIC_` 접두사 사용:

```bash
# 클라이언트에서 접근 가능
NEXT_PUBLIC_APP_URL=...

# 서버에서만 접근 가능
SUPABASE_SERVICE_ROLE_KEY=...
```

## 문제 해결

### 빌드 실패

```bash
# 로컬에서 빌드 테스트
npm run build

# 타입 체크
npm run type-check

# 린트 확인
npm run lint
```

### 환경 변수 누락

1. 모든 필수 환경 변수 확인
2. 각 환경(Development, Preview, Production)에 설정되었는지 확인
3. 재배포

### 성능 문제

1. Vercel Analytics에서 병목 구간 확인
2. Next.js 성능 프로파일링
3. 이미지/번들 크기 최적화

## 프로덕션 체크리스트

배포 전 다음을 확인하세요:

- [ ] 모든 환경 변수 설정됨
- [ ] 로컬에서 `npm run build` 성공
- [ ] 타입 체크 통과 (`npm run type-check`)
- [ ] 린트 통과 (`npm run lint`)
- [ ] 테스트 통과 (`npm run test`)
- [ ] 보안 헤더 설정됨 (next.config.js)
- [ ] HTTPS 활성화됨
- [ ] 도메인 설정됨
- [ ] 에러 모니터링 통합됨

## 참고 자료

- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel 배포 상세 문서](https://vercel.com/docs/deployments/overview)
- [환경 변수 관리](https://vercel.com/docs/projects/environment-variables)
- [성능 최적화](https://vercel.com/docs/concepts/edge-network/performance)
