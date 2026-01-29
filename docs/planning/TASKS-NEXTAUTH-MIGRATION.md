# NextAuth.js 마이그레이션 태스크

> Supabase Auth → NextAuth.js (Auth.js v5) 전환
> 총 64개 파일 영향, 5개 Phase로 진행

---

## Phase 0: 준비 (Infrastructure)

### P0-T0.1: NextAuth.js 설치 및 기본 설정
- **담당**: backend-specialist
- **의존성**: 없음
- **작업**:
  - [ ] `next-auth@beta` 설치 (Auth.js v5)
  - [ ] `@auth/prisma-adapter` 또는 Supabase adapter 설치
  - [ ] `src/lib/auth.ts` - NextAuth 설정 파일 생성
  - [ ] `src/app/api/auth/[...nextauth]/route.ts` - API 라우트 생성
  - [ ] `.env.local`에 `AUTH_SECRET` 추가
- **완료 기준**: `/api/auth/providers` 접속 시 JSON 응답

### P0-T0.2: Credentials Provider 설정 (이메일/비밀번호)
- **담당**: backend-specialist
- **의존성**: P0-T0.1
- **작업**:
  - [ ] Credentials Provider 구성
  - [ ] Supabase DB에서 사용자 조회 로직
  - [ ] 비밀번호 해시 검증 (bcrypt)
  - [ ] 세션 콜백에서 사용자 정보 추가 (role, nickname)
- **완료 기준**: Credentials로 로그인 성공

### P0-T0.3: 세션 및 미들웨어 설정
- **담당**: backend-specialist
- **의존성**: P0-T0.2
- **작업**:
  - [ ] `middleware.ts` 수정 - NextAuth 미들웨어 사용
  - [ ] 보호된 라우트 설정 (`/my/*`, `/admin/*`)
  - [ ] 세션 전략 설정 (JWT)
  - [ ] 세션 타입 확장 (role 포함)
- **완료 기준**: 로그인 안 한 상태로 `/my` 접근 시 `/login`으로 리다이렉트

---

## Phase 1: 핵심 인증 컴포넌트 교체

### P1-T1.1: Auth 유틸리티 함수 생성
- **담당**: backend-specialist
- **의존성**: P0-T0.3
- **작업**:
  - [ ] `src/lib/auth/index.ts` - 메인 NextAuth 설정
  - [ ] `src/lib/auth/utils.ts` - 유틸리티 (getCurrentUser, isAdmin 등)
  - [ ] `src/lib/auth/types.ts` - 타입 정의
- **완료 기준**: `getCurrentUser()` 호출 시 세션 사용자 반환

### P1-T1.2: AuthButton 컴포넌트 교체
- **담당**: frontend-specialist
- **의존성**: P1-T1.1
- **작업**:
  - [ ] `src/components/layout/auth-button.tsx` 수정
  - [ ] `useSession()` 훅 사용
  - [ ] `signIn()`, `signOut()` 함수 사용
  - [ ] 관리자 여부 세션에서 확인
- **완료 기준**: 로그인/로그아웃 버튼 작동, 관리자 메뉴 표시

### P1-T1.3: 로그인 페이지 교체
- **담당**: frontend-specialist
- **의존성**: P1-T1.1
- **작업**:
  - [ ] `src/app/(shop)/login/page.tsx` 수정
  - [ ] `signIn('credentials', {...})` 사용
  - [ ] 에러 처리 (잘못된 자격 증명)
  - [ ] 리다이렉트 처리 (callbackUrl)
- **완료 기준**: 이메일/비밀번호 로그인 작동

### P1-T1.4: 회원가입 페이지 수정
- **담당**: frontend-specialist
- **의존성**: P1-T1.1
- **작업**:
  - [ ] `src/app/(shop)/signup/page.tsx` 수정
  - [ ] 회원가입 API 호출 (Supabase DB 직접 삽입)
  - [ ] 비밀번호 해시 (bcrypt)
  - [ ] 가입 후 자동 로그인
- **완료 기준**: 회원가입 후 로그인 상태로 홈 이동

### P1-T1.5: SessionProvider 설정
- **담당**: frontend-specialist
- **의존성**: P1-T1.1
- **작업**:
  - [ ] `src/app/providers.tsx` 생성 또는 수정
  - [ ] `SessionProvider` 래핑
  - [ ] `src/app/layout.tsx`에 적용
- **완료 기준**: 모든 클라이언트 컴포넌트에서 `useSession()` 사용 가능

---

## Phase 2: 마이페이지 및 설정

### P2-T2.1: 마이페이지 교체
- **담당**: frontend-specialist
- **의존성**: P1-T1.5
- **작업**:
  - [ ] `src/app/(shop)/my/page.tsx` 수정
  - [ ] `useSession()` 사용
  - [ ] 프로필 정보 표시 (DB에서 추가 조회)
  - [ ] 닉네임 수정 기능
- **완료 기준**: 로그인 후 마이페이지 접근 및 정보 표시

### P2-T2.2: 설정 페이지 교체
- **담당**: frontend-specialist
- **의존성**: P2-T2.1
- **작업**:
  - [ ] `src/app/(shop)/my/settings/page.tsx` 수정
  - [ ] 비밀번호 변경 기능 (Supabase DB 직접)
- **완료 기준**: 비밀번호 변경 작동

### P2-T2.3: 다운로드 페이지 교체
- **담당**: frontend-specialist
- **의존성**: P2-T2.1
- **작업**:
  - [ ] `src/app/(shop)/my/downloads/page.tsx` 수정
  - [ ] 세션 기반 사용자 ID로 조회
- **완료 기준**: 구매한 파일 다운로드 목록 표시

---

## Phase 3: 관리자 영역 교체

### P3-T3.1: 관리자 레이아웃 교체
- **담당**: backend-specialist
- **의존성**: P1-T1.1
- **작업**:
  - [ ] `src/app/admin/layout.tsx` 수정
  - [ ] NextAuth 세션에서 admin role 확인
  - [ ] 권한 없으면 403 또는 리다이렉트
- **완료 기준**: 관리자만 `/admin` 접근 가능

### P3-T3.2: 관리자 API 라우트 교체
- **담당**: backend-specialist
- **의존성**: P3-T3.1
- **작업**:
  - [ ] `src/app/api/admin/*` 모든 라우트 수정
  - [ ] `getServerSession()` 사용
  - [ ] admin role 검증
- **완료 기준**: 관리자 API 인증 작동

### P3-T3.3: 관리자 페이지 교체
- **담당**: frontend-specialist
- **의존성**: P3-T3.1
- **작업**:
  - [ ] `src/app/admin/products/*` 수정
  - [ ] `src/app/admin/users/*` 수정
  - [ ] `src/app/admin/coupons/*` 수정
  - [ ] `src/app/admin/inventory/*` 수정
  - [ ] `src/app/admin/orders/*` 수정
- **완료 기준**: 모든 관리자 페이지 인증 작동

---

## Phase 4: API 및 기타 교체

### P4-T4.1: 일반 API 라우트 교체
- **담당**: backend-specialist
- **의존성**: P1-T1.1
- **작업**:
  - [ ] `src/app/api/inquiries/*` 수정
  - [ ] `src/app/api/comments/*` 수정
  - [ ] `src/app/api/reviews/*` 수정
  - [ ] `src/app/api/orders/*` 수정
  - [ ] `getServerSession()` 사용
- **완료 기준**: 모든 API 인증 작동

### P4-T4.2: 결제/체크아웃 영역 교체
- **담당**: backend-specialist
- **의존성**: P4-T4.1
- **작업**:
  - [ ] `src/app/(shop)/checkout/*` 수정
  - [ ] 주문 생성 시 세션 사용자 ID 사용
- **완료 기준**: 로그인 사용자 결제 프로세스 작동

### P4-T4.3: Supabase Auth 코드 제거
- **담당**: backend-specialist
- **의존성**: P4-T4.2
- **작업**:
  - [ ] `src/lib/supabase/auth.ts` 삭제
  - [ ] `src/lib/supabase/middleware.ts` 삭제 또는 수정
  - [ ] `src/stores/auth-store.ts` 삭제 또는 수정
  - [ ] `src/app/auth/callback/route.ts` 삭제
  - [ ] 미사용 import 제거
- **완료 기준**: Supabase Auth 관련 코드 완전 제거

### P4-T4.4: 최종 테스트 및 정리
- **담당**: test-specialist
- **의존성**: P4-T4.3
- **작업**:
  - [ ] 전체 인증 플로우 테스트
  - [ ] 로그인 → 마이페이지 → 로그아웃
  - [ ] 관리자 로그인 → 대시보드 → 상품 관리
  - [ ] 회원가입 → 로그인
  - [ ] 빌드 테스트 (`npm run build`)
- **완료 기준**: 모든 인증 기능 정상 작동, 빌드 성공

---

## 영향받는 파일 목록 (64개)

### 삭제 예정
- `src/lib/supabase/auth.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/auth/callback/route.ts`
- `src/stores/auth-store.ts`

### 수정 예정 (핵심)
- `middleware.ts`
- `src/components/layout/auth-button.tsx`
- `src/app/(shop)/login/page.tsx`
- `src/app/(shop)/signup/page.tsx`
- `src/app/(shop)/my/page.tsx`
- `src/app/(shop)/my/settings/page.tsx`
- `src/app/admin/layout.tsx`

### 수정 예정 (API)
- `src/app/api/admin/*` (10+ 파일)
- `src/app/api/inquiries/*`
- `src/app/api/comments/*`
- `src/app/api/reviews/*`
- `src/app/api/orders/*`

---

## 참고: NextAuth.js (Auth.js v5) 기본 구조

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        // DB에서 사용자 조회 및 비밀번호 검증
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
        role: token.role,
      },
    }),
  },
})

// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

---

## 실행 명령

```bash
# 마이그레이션 시작
/auto-orchestrate --tasks docs/planning/TASKS-NEXTAUTH-MIGRATION.md
```
