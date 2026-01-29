/**
 * 관리자 권한 체크 유틸리티 - NextAuth.js 기반
 *
 * P4-T4.1: Admin Middleware (Updated for NextAuth)
 *
 * 역할:
 * - NextAuth 세션의 role=admin 체크
 * - API 라우트에서 관리자 권한 검증
 * - 비관리자 접근 시 403 반환
 *
 * 참고: middleware.ts는 NextAuth의 auth() 함수로 처리
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';

/**
 * 관리자 역할 체크 (NextAuth Session 기반)
 *
 * @param session - NextAuth Session 객체
 * @returns 관리자 여부
 *
 * @example
 * ```ts
 * const session = await auth();
 * if (isAdminSession(session)) {
 *   // 관리자 전용 작업
 * }
 * ```
 */
export function isAdminSession(session: Session | null | undefined): boolean {
  if (!session?.user) return false;
  return session.user.role === 'admin';
}

/**
 * 관리자 역할 체크 (하위 호환성 유지)
 *
 * ⚠️ DEPRECATED: supabase 파라미터는 무시됩니다. NextAuth 세션을 사용합니다.
 *
 * @param _supabase - (사용 안 함) 하위 호환성을 위해 유지
 * @returns 관리자 여부와 사용자 정보
 *
 * @example
 * ```ts
 * const session = await auth();
 * if (isAdminUser(session)) {
 *   // 관리자 전용 작업
 * }
 * ```
 */
export async function isAdminUser(
  sessionOrNull?: Session | null
): Promise<boolean> {
  // 파라미터로 세션이 전달되면 사용, 아니면 auth() 호출
  const session = sessionOrNull !== undefined ? sessionOrNull : await auth();
  return isAdminSession(session);
}

/**
 * API 라우트용 관리자 권한 체크
 *
 * @param _supabase - (선택, 사용 안 함) 하위 호환성을 위해 유지
 * @returns 관리자 여부와 세션/사용자 정보
 *
 * @example
 * ```ts
 * // API 라우트에서 사용 (기존 방식)
 * export async function GET() {
 *   const supabase = await createServerClient();
 *   const adminCheck = await checkAdminRole(supabase);
 *   if (!adminCheck.isAdmin) {
 *     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 *   }
 *
 *   // 관리자 전용 작업
 *   const userId = adminCheck.user.id;
 * }
 *
 * // 또는 새로운 방식
 * export async function GET() {
 *   const adminCheck = await checkAdminRole();
 *   if (!adminCheck.isAdmin) {
 *     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 *   }
 * }
 * ```
 */
export async function checkAdminRole(_supabase?: any): Promise<{
  isAdmin: boolean;
  user: Session['user'] | null;
  session: Session | null;
}> {
  const session = await auth();

  if (!session?.user) {
    return { isAdmin: false, user: null, session: null };
  }

  const isAdmin = session.user.role === 'admin';

  return { isAdmin, user: session.user, session };
}

/**
 * API 라우트용 403 Forbidden 응답 생성
 *
 * @param request - Next.js Request 객체 (선택)
 * @param message - 에러 메시지
 * @returns 403 응답
 *
 * @example
 * ```ts
 * if (!isAdmin) {
 *   return createForbiddenResponse(request, '관리자 권한이 필요합니다.');
 * }
 * ```
 */
export function createForbiddenResponse(
  request?: NextRequest,
  message: string = '이 리소스에 접근할 권한이 없습니다.'
): NextResponse {
  const pathname = request?.nextUrl.pathname || 'unknown';

  return NextResponse.json(
    {
      error: {
        code: 'FORBIDDEN',
        message,
        path: pathname,
      },
    },
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}
