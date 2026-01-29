# Vercel 배포 빠른 시작

## 3분 안에 배포하기

### 1단계: Vercel CLI 설치 (1분)

```bash
npm install -g vercel
```

### 2단계: 환경변수 준비 (1분)

`.env.local` 파일이 있는지 확인:

```bash
cat .env.local
```

필수 변수:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

### 3단계: 배포 실행 (1분)

```bash
# 프리뷰 배포
npm run deploy:vercel

# 또는 프로덕션 배포
npm run deploy:vercel -- --prod
```

## 자동 안내

스크립트가 다음을 자동으로 처리합니다:

1. ✅ Vercel CLI 확인
2. ✅ 프로젝트 연결
3. ✅ 환경변수 검증
4. ✅ 배포 실행
5. ✅ 결과 안내

## 문제 발생 시

### Vercel CLI 미설치

```bash
npm install -g vercel
```

### 프로젝트 미연결

스크립트 실행 시 자동으로 연결 프롬프트 표시

또는 수동:
```bash
vercel link
```

### 환경변수 누락

Vercel 대시보드:
1. https://vercel.com/dashboard
2. 프로젝트 > Settings > Environment Variables
3. 변수 추가

또는 CLI:
```bash
vercel env add VARIABLE_NAME
```

## 상세 가이드

- 전체 가이드: `docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md`
- 스크립트 가이드: `scripts/DEPLOYMENT_README.md`

## 지원

문제가 계속되면:
- [Vercel 문서](https://vercel.com/docs)
- [GitHub Issues](https://github.com/vercel/vercel/issues)
