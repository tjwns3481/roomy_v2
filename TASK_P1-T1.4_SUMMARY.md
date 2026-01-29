# Task P1-T1.4: 회원가입 페이지 NextAuth.js 호환 수정

## 완료 사항

### 1. 회원가입 API 라우트 생성 ✅
**파일**: `src/app/api/auth/signup/route.ts`

- **기능**:
  - Supabase Auth Admin API를 사용하여 사용자 생성
  - `auth.users` 테이블에 사용자 생성
  - 트리거를 통해 `profiles` 테이블에 자동 생성
  - 이메일 인증 자동 완료 (개발 환경)

- **유효성 검사**:
  - 이메일 및 비밀번호 필수 입력
  - 비밀번호 최소 6자 이상
  - 이메일 중복 확인 및 에러 처리

- **응답**:
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
  ```

### 2. 회원가입 페이지 수정 ✅
**파일**: `src/app/(shop)/signup/page.tsx`

- **변경 사항**:
  - ❌ 제거: `import { signUp } from '@/lib/supabase/auth'`
  - ✅ 추가: `import { signIn } from 'next-auth/react'`
  - Supabase Auth 직접 호출 제거
  - `/api/auth/signup` API 호출로 변경

- **회원가입 플로우**:
  1. 클라이언트 측 유효성 검사 (이메일, 비밀번호, 비밀번호 확인)
  2. `/api/auth/signup` API 호출하여 사용자 생성
  3. 회원가입 성공 시 NextAuth `signIn()` 호출하여 자동 로그인
  4. 로그인 성공 시 홈(`/`)으로 리다이렉트
  5. 로그인 실패 시 성공 페이지 표시 (수동 로그인 유도)

### 3. 테스트 파일 생성 ✅
**파일**: `tests/api/auth/signup.test.ts`

- **테스트 케이스**:
  1. ✅ 정상적인 회원가입 (이메일, 비밀번호, 닉네임)
  2. ✅ 이메일 누락 시 400 에러
  3. ✅ 짧은 비밀번호 시 400 에러
  4. ✅ 중복 이메일 시 에러
  5. ✅ 닉네임 미입력 시 이메일에서 자동 생성

- **테스트 결과**: 5/5 통과

### 4. 테스트 설정 개선 ✅
**파일**: `tests/setup.ts`

- `.env.local` 파일을 자동으로 로드
- 실제 Supabase 연결 테스트 가능
- 환경 변수가 없을 경우 Mock 값 사용

## 완료 기준 달성

- [x] 회원가입 API 라우트 생성
- [x] 회원가입 페이지 NextAuth 호환
- [x] 가입 후 자동 로그인 구현
- [x] Supabase auth import 완전 제거 (signup 페이지)
- [x] 테스트 작성 및 통과

## 기술적 세부사항

### Supabase Auth 통합

현재 시스템은 **하이브리드 인증 방식**을 사용합니다:

1. **사용자 생성**: Supabase Auth Admin API (`auth.admin.createUser()`)
   - `auth.users` 테이블에 사용자 레코드 생성
   - 비밀번호 해시는 Supabase가 자동 관리

2. **프로필 생성**: Database Trigger (`handle_new_user()`)
   - `auth.users` INSERT 시 자동으로 `profiles` 테이블에 레코드 생성
   - 닉네임은 `user_metadata`에서 자동 추출

3. **로그인 검증**: NextAuth.js Credentials Provider
   - Supabase Auth의 `signInWithPassword()` 사용하여 비밀번호 검증
   - 검증 성공 시 JWT 세션 생성

### 장점

- ✅ Supabase의 강력한 비밀번호 해싱 및 보안 기능 활용
- ✅ NextAuth.js의 유연한 세션 관리
- ✅ Database Trigger로 프로필 자동 생성
- ✅ RLS 정책과 완전 호환

## 남은 작업

1. `src/app/(shop)/login/page.tsx` - 아직 `signInWithPassword` 사용 중
   - 이전 Task (P1-T1.2)에서 처리되었을 것으로 예상
   - NextAuth `signIn()` 사용으로 변경 필요 (별도 Task)

2. `src/lib/supabase/auth.ts` - 레거시 함수들
   - 다른 페이지에서 사용 중일 수 있음
   - 단계적으로 제거 필요

## 파일 목록

### 생성된 파일
- `src/app/api/auth/signup/route.ts` (새 파일)
- `tests/api/auth/signup.test.ts` (새 파일)

### 수정된 파일
- `src/app/(shop)/signup/page.tsx`
- `tests/setup.ts`

## 실행 방법

### 개발 서버
```bash
npm run dev
```

### 테스트
```bash
npm test tests/api/auth/signup.test.ts
```

### API 직접 테스트
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","nickname":"TestUser"}'
```

## 스크린샷 / 데모

회원가입 페이지는 다음 경로에서 확인 가능:
- URL: `http://localhost:3000/signup`
- 회원가입 성공 시 자동으로 홈(`/`)으로 리다이렉트
- 로그인 실패 시 성공 메시지와 함께 수동 로그인 유도

---

**Task Status**: ✅ 완료
**Date**: 2026-01-26
**Phase**: 1 (FEAT-0 인증 시스템)
