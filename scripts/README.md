# Setup Scripts

이 디렉토리는 Vibe Store 프로젝트의 초기 설정을 돕는 스크립트들을 포함합니다.

## Setup Wizard

### 사용법

```bash
npm run setup
```

### 기능

인터랙티브 CLI 위저드를 통해 다음을 설정합니다:

1. **Supabase 설정**
   - Project URL 입력
   - Anon Key 입력
   - Service Role Key 입력 (선택사항)
   - 연결 테스트 자동 실행

2. **Toss Payments 설정** (선택사항)
   - Client Key 입력
   - Secret Key 입력

3. **사이트 기본 정보**
   - 상점명
   - 사이트 URL
   - 관리자 이메일
   - 사이트 설명 (선택사항)

### 생성되는 파일

- `.env.local` - 환경 변수 (민감 정보, gitignore됨)
- `config/site.config.ts` - 사이트 설정 (공개 설정)

### 재설정

이미 설정이 완료된 경우, 다시 `npm run setup`을 실행하면 덮어쓰기 여부를 확인합니다.

## 구조

```
scripts/
├── setup-wizard.ts       # 메인 위저드 스크립트
├── setup/
│   └── index.ts          # 핵심 기능 모듈
└── README.md             # 이 파일
```

## 개발자 정보

### 테스트

```bash
npm run test tests/scripts/setup.test.ts
```

### 모듈 구조

- `setup/index.ts` - 재사용 가능한 핵심 함수들
  - `testSupabaseConnection()` - Supabase 연결 테스트
  - `createEnvFile()` - .env.local 생성
  - `createSiteConfig()` - site.config.ts 생성
  - `updateGitignore()` - .gitignore 업데이트
  - `isValidUrl()` - URL 유효성 검증
  - `isValidEmail()` - 이메일 유효성 검증
  - `isSetupComplete()` - 설정 완료 여부 확인
