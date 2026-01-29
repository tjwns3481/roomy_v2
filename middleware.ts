/**
 * @TASK P7-T7.2 - Next.js 미들웨어 (인증 보호)
 * @SPEC docs/planning/02-trd.md#인증-미들웨어
 *
 * 역할:
 * - NextAuth 세션 기반 인증 체크
 * - 보호된 라우트 인증 체크 (/dashboard, /editor, /settings 등)
 * - 관리자 라우트 권한 체크 (/admin/*)
 * - 인증 라우트 리다이렉트 (/login, /signup → 로그인 시 /dashboard)
 * - 쿠키 자동 갱신
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 보호된 라우트 패턴
 * - 이 경로들은 인증이 필요함
 */
const PROTECTED_PATTERNS = [
  '/dashboard',
  '/editor',
  '/settings',
  '/checkout',
  '/pricing',
  '/my',
];

/**
 * 인증 라우트 패턴
 * - 이미 로그인한 사용자는 /dashboard로 리다이렉트
 */
const AUTH_PATTERNS = [
  '/login',
  '/signup',
  '/auth/login',
  '/auth/signup',
  '/auth/register',
  '/reset-password',
  '/auth/reset-password',
];

/**
 * 관리자 라우트 패턴
 * - role=admin 필요
 */
const ADMIN_PATTERNS = [
  '/admin',
];

/**
 * 공개 라우트 패턴
 * - 인증 없이 접근 가능
 */
const PUBLIC_PATTERNS = [
  '/',       // 홈
  '/g/',     // 게스트 페이지
  '/s/',     // 단축 URL
  '/api/health',
  '/api/auth',
  '/api/public',
  '/api/guest',
];

/**
 * 경로가 패턴과 일치하는지 확인
 */
function matchesAnyPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pathname === pattern) return true;
    if (pathname.startsWith(pattern)) return true;
    return false;
  });
}

/**
 * 정적 파일인지 확인
 */
function isStaticFile(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.includes('.') // .png, .jpg, .css, .js 등
  );
}

/**
 * NextAuth.js 미들웨어
 *
 * auth() 함수는 현재 세션을 반환하며, req 객체에 세션 정보가 포함됨
 */
export default auth(async (req) => {
  const { nextUrl, auth: session } = req;
  const { pathname } = nextUrl;

  // 1. 정적 파일 및 Next.js 내부 파일 스킵
  if (isStaticFile(pathname)) {
    return NextResponse.next();
  }

  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === 'admin';

  // 2. 공개 라우트 - 인증 없이 통과
  if (
    pathname === '/' ||
    pathname.startsWith('/g/') ||
    pathname.startsWith('/s/') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/api/guest')
  ) {
    return NextResponse.next();
  }

  // 3. 인증 라우트 (로그인/회원가입) - 이미 로그인된 사용자는 대시보드로
  if (matchesAnyPattern(pathname, AUTH_PATTERNS)) {
    if (isLoggedIn) {
      // callbackUrl이 있으면 해당 경로로, 없으면 대시보드로
      const callbackUrl = nextUrl.searchParams.get('callbackUrl');
      const redirectUrl = new URL(callbackUrl || '/dashboard', nextUrl);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // 4. 관리자 라우트 - admin 역할 필요
  if (matchesAnyPattern(pathname, ADMIN_PATTERNS)) {
    // 로그인하지 않은 경우 로그인 페이지로
    if (!isLoggedIn) {
      const redirectUrl = new URL('/auth/login', nextUrl);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // 관리자가 아닌 경우 홈으로 리다이렉트
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', nextUrl));
    }

    return NextResponse.next();
  }

  // 5. 보호된 라우트 - 인증 필요
  if (matchesAnyPattern(pathname, PROTECTED_PATTERNS)) {
    if (!isLoggedIn) {
      const redirectUrl = new URL('/auth/login', nextUrl);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // 6. API 라우트 - 별도 처리 (각 API에서 withAuth 사용)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 7. 기타 라우트 - 통과
  return NextResponse.next();
});

/**
 * 미들웨어 적용 대상 설정
 *
 * - API 라우트는 개별적으로 withAuth 사용
 * - 정적 파일 제외
 * - Next.js 내부 파일 제외
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$).*)',
  ],
};
