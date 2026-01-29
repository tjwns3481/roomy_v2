# Middleware Utilities

## Admin Middleware (P4-T4.1)

관리자 권한을 체크하는 미들웨어 유틸리티입니다.

### 주요 기능

- **role=admin 체크**: `user_metadata.role` 또는 `app_metadata.role`이 `admin`인지 확인
- **/admin/* 접근 제어**: 관리자 전용 라우트 보호
- **비관리자 접근 시 403**: API 요청은 403 JSON 응답, 페이지 요청은 리다이렉트

### 사용법

#### middleware.ts에서 사용

```typescript
import { checkAdminRole } from '@/lib/middleware/admin';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);
  const { data: { session } } = await supabase.auth.getSession();

  // 관리자 라우트 체크
  if (pathname.startsWith('/admin')) {
    const adminCheck = await checkAdminRole(request, session?.user);
    if (adminCheck) return adminCheck; // 403 또는 redirect
  }

  return response;
}
```

#### isAdminUser 헬퍼 함수

```typescript
import { isAdminUser } from '@/lib/middleware/admin';

// 컴포넌트나 API Route에서 사용
if (isAdminUser(session?.user)) {
  // 관리자 전용 작업
}
```

### 응답 동작

| 요청 유형 | 비인증 | 일반 사용자 | 관리자 |
|----------|--------|------------|--------|
| 페이지 (/admin/*) | 로그인 페이지로 리다이렉트 | 홈으로 리다이렉트 | 통과 |
| API (/api/admin/*) | 403 JSON | 403 JSON | 통과 |

### forceJson 옵션

페이지 요청에서도 JSON 응답을 강제하려면:

```typescript
const response = await checkAdminRole(request, user, { forceJson: true });
```

### 테스트

```bash
npm test -- tests/middleware/admin.test.ts
```
