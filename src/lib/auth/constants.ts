/**
 * @TASK P7-T7.2 - 인증 미들웨어 상수 정의
 * @SPEC docs/planning/02-trd.md#인증-미들웨어
 *
 * 라우트 보호 규칙 및 상수 정의
 */

/**
 * 인증이 필요한 보호된 라우트
 * - 로그인하지 않으면 /login으로 리다이렉트
 */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/editor',
  '/settings',
  '/checkout',
  '/pricing',
  '/my',
] as const;

/**
 * 인증 관련 라우트 (로그인/회원가입)
 * - 이미 로그인된 사용자는 /dashboard로 리다이렉트
 */
export const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/auth/login',
  '/auth/signup',
  '/auth/register',
  '/reset-password',
  '/auth/reset-password',
  '/auth/callback',
] as const;

/**
 * 공개 라우트 (인증 불필요)
 * - 누구나 접근 가능
 */
export const PUBLIC_ROUTES = [
  '/',
  '/g',
  '/s',
  '/api/health',
  '/api/auth',
] as const;

/**
 * 관리자 전용 라우트
 * - role=admin 필요
 */
export const ADMIN_ROUTES = [
  '/admin',
] as const;

/**
 * 인증이 필요한 API 라우트 패턴
 */
export const PROTECTED_API_ROUTES = [
  '/api/guidebooks',
  '/api/blocks',
  '/api/ai/generate',
  '/api/upload',
  '/api/settings',
  '/api/subscription',
] as const;

/**
 * 인증 불필요한 API 라우트 패턴
 */
export const PUBLIC_API_ROUTES = [
  '/api/health',
  '/api/auth',
  '/api/public',
  '/api/guest',
] as const;

/**
 * 리다이렉트 URL
 */
export const REDIRECT_URLS = {
  LOGIN: '/auth/login',
  DASHBOARD: '/dashboard',
  HOME: '/',
  UNAUTHORIZED: '/unauthorized',
  ERROR: '/auth/error',
} as const;

/**
 * 쿠키 설정
 */
export const COOKIE_CONFIG = {
  SESSION_NAME: 'next-auth.session-token',
  SECURE_SESSION_NAME: '__Secure-next-auth.session-token',
  MAX_AGE: 60 * 60 * 24 * 30, // 30 days
} as const;

/**
 * 사용자 역할 타입
 */
export type UserRole = 'customer' | 'admin';

/**
 * 역할별 접근 가능 라우트 맵
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
  customer: [...PROTECTED_ROUTES],
  admin: [...PROTECTED_ROUTES, ...ADMIN_ROUTES],
} as const;
