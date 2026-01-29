/**
 * @TASK P7-T7.2 - 미들웨어 유틸리티
 * @SPEC docs/planning/02-trd.md#미들웨어-유틸리티
 *
 * 라우트 매칭 및 리다이렉트 유틸리티 함수
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  PROTECTED_ROUTES,
  AUTH_ROUTES,
  PUBLIC_ROUTES,
  ADMIN_ROUTES,
  PROTECTED_API_ROUTES,
  PUBLIC_API_ROUTES,
  REDIRECT_URLS,
  type UserRole,
} from './constants';

/**
 * 경로가 패턴과 일치하는지 확인
 *
 * @param pathname - 현재 경로
 * @param patterns - 패턴 배열
 * @returns 일치 여부
 */
export function matchesPattern(
  pathname: string,
  patterns: readonly string[]
): boolean {
  return patterns.some((pattern) => {
    // 정확히 일치
    if (pathname === pattern) return true;
    // 패턴으로 시작 (예: /dashboard/settings)
    if (pathname.startsWith(pattern + '/')) return true;
    // 동적 라우트 매칭 (예: /editor/[id])
    if (pattern.includes('[') && matchesDynamicRoute(pathname, pattern)) {
      return true;
    }
    return false;
  });
}

/**
 * 동적 라우트 매칭 (예: /editor/[id])
 */
function matchesDynamicRoute(pathname: string, pattern: string): boolean {
  const patternParts = pattern.split('/');
  const pathnameParts = pathname.split('/');

  if (patternParts.length !== pathnameParts.length) return false;

  return patternParts.every((part, i) => {
    if (part.startsWith('[') && part.endsWith(']')) return true;
    return part === pathnameParts[i];
  });
}

/**
 * 보호된 라우트인지 확인
 */
export function isProtectedRoute(pathname: string): boolean {
  return matchesPattern(pathname, PROTECTED_ROUTES);
}

/**
 * 인증 라우트인지 확인 (로그인/회원가입)
 */
export function isAuthRoute(pathname: string): boolean {
  return matchesPattern(pathname, AUTH_ROUTES);
}

/**
 * 공개 라우트인지 확인
 */
export function isPublicRoute(pathname: string): boolean {
  // 루트 경로 정확히 일치
  if (pathname === '/') return true;

  // 게스트 페이지 (/g/*)
  if (pathname.startsWith('/g/') || pathname === '/g') return true;

  // 단축 URL (/s/*)
  if (pathname.startsWith('/s/') || pathname === '/s') return true;

  // 기타 공개 라우트
  return matchesPattern(pathname, PUBLIC_ROUTES);
}

/**
 * 관리자 라우트인지 확인
 */
export function isAdminRoute(pathname: string): boolean {
  return matchesPattern(pathname, ADMIN_ROUTES);
}

/**
 * API 라우트인지 확인
 */
export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

/**
 * 보호된 API 라우트인지 확인
 */
export function isProtectedApiRoute(pathname: string): boolean {
  return matchesPattern(pathname, PROTECTED_API_ROUTES);
}

/**
 * 공개 API 라우트인지 확인
 */
export function isPublicApiRoute(pathname: string): boolean {
  return matchesPattern(pathname, PUBLIC_API_ROUTES);
}

/**
 * 정적 파일인지 확인
 */
export function isStaticFile(pathname: string): boolean {
  // Next.js 내부 파일
  if (pathname.startsWith('/_next/')) return true;

  // 정적 파일 확장자
  const staticExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.css', '.js', '.map', '.woff', '.woff2', '.ttf',
    '.mp4', '.webm', '.mp3', '.wav',
  ];

  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

/**
 * 로그인 페이지로 리다이렉트
 *
 * @param request - Next.js Request
 * @param redirectPath - 로그인 후 리다이렉트할 경로 (optional)
 * @returns 리다이렉트 응답
 */
export function redirectToLogin(
  request: NextRequest,
  redirectPath?: string
): NextResponse {
  const url = new URL(REDIRECT_URLS.LOGIN, request.url);

  // 원래 가려던 경로를 쿼리에 저장 (로그인 후 리다이렉트용)
  const callbackUrl = redirectPath || request.nextUrl.pathname;
  if (callbackUrl && callbackUrl !== REDIRECT_URLS.LOGIN) {
    url.searchParams.set('callbackUrl', callbackUrl);
  }

  return NextResponse.redirect(url);
}

/**
 * 대시보드로 리다이렉트
 *
 * @param request - Next.js Request
 * @returns 리다이렉트 응답
 */
export function redirectToDashboard(request: NextRequest): NextResponse {
  const url = new URL(REDIRECT_URLS.DASHBOARD, request.url);
  return NextResponse.redirect(url);
}

/**
 * 홈으로 리다이렉트
 *
 * @param request - Next.js Request
 * @returns 리다이렉트 응답
 */
export function redirectToHome(request: NextRequest): NextResponse {
  const url = new URL(REDIRECT_URLS.HOME, request.url);
  return NextResponse.redirect(url);
}

/**
 * 401 Unauthorized 응답 생성 (API용)
 */
export function createUnauthorizedResponse(message?: string): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: 'UNAUTHORIZED',
        message: message || '인증이 필요합니다.',
      },
    },
    { status: 401 }
  );
}

/**
 * 403 Forbidden 응답 생성 (API용)
 */
export function createForbiddenResponse(message?: string): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: 'FORBIDDEN',
        message: message || '접근 권한이 없습니다.',
      },
    },
    { status: 403 }
  );
}

/**
 * 역할 기반 접근 확인
 *
 * @param userRole - 사용자 역할
 * @param requiredRole - 필요한 역할
 * @returns 접근 가능 여부
 */
export function hasRequiredRole(
  userRole: UserRole | null | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;

  // admin은 모든 접근 가능
  if (userRole === 'admin') return true;

  return userRole === requiredRole;
}

/**
 * 쿠키에서 세션 토큰 추출
 */
export function getSessionToken(request: NextRequest): string | undefined {
  // 개발 환경과 프로덕션 환경의 쿠키 이름이 다름
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  return sessionToken;
}

/**
 * 응답에 쿠키 설정 복사 (세션 갱신용)
 */
export function copyResponseCookies(
  fromResponse: NextResponse,
  toResponse: NextResponse
): void {
  fromResponse.cookies.getAll().forEach((cookie) => {
    toResponse.cookies.set(cookie.name, cookie.value, {
      ...cookie,
    });
  });
}
