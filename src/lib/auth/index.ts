/**
 * @TASK P7-T7.2 - 인증 모듈 엔트리포인트
 * @SPEC docs/planning/02-trd.md#인증-모듈
 *
 * 인증 관련 유틸리티 통합 내보내기
 */

// 상수
export {
  PROTECTED_ROUTES,
  AUTH_ROUTES,
  PUBLIC_ROUTES,
  ADMIN_ROUTES,
  PROTECTED_API_ROUTES,
  PUBLIC_API_ROUTES,
  REDIRECT_URLS,
  COOKIE_CONFIG,
  ROLE_PERMISSIONS,
  type UserRole,
} from './constants';

// 세션 관리
export {
  getSession,
  getCurrentUser,
  getUserId,
  getUserRole,
  isAuthenticated,
  isAdmin,
  hasRole,
  validateSession,
  extractUser,
  extractRole,
  type SessionValidation,
} from './session';

// 미들웨어 유틸리티
export {
  matchesPattern,
  isProtectedRoute,
  isAuthRoute,
  isPublicRoute,
  isAdminRoute,
  isApiRoute,
  isProtectedApiRoute,
  isPublicApiRoute,
  isStaticFile,
  redirectToLogin,
  redirectToDashboard,
  redirectToHome,
  createUnauthorizedResponse,
  createForbiddenResponse,
  hasRequiredRole,
  getSessionToken,
  copyResponseCookies,
} from './middleware';

// API 보호 유틸리티
export {
  withAuth,
  withRole,
  withAdmin,
  getUserIdFromSession,
  getRoleFromSession,
  ApiError,
  extractAuthToken,
  isOwnerOrAdmin,
  type AuthenticatedHandler,
} from './api';
