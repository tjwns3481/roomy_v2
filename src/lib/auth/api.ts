/**
 * @TASK P7-T7.2 - API 라우트 보호 유틸리티
 * @SPEC docs/planning/02-trd.md#API-보호
 *
 * API 라우트에서 인증/인가를 처리하는 유틸리티
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';
import type { UserRole } from './constants';

/**
 * 인증된 핸들러 타입
 */
export type AuthenticatedHandler<T = unknown> = (
  session: Session,
  request: NextRequest
) => Promise<NextResponse<T>>;

/**
 * 인증 검증 후 핸들러 실행
 *
 * @param handler - 인증된 요청을 처리할 핸들러
 * @returns NextResponse
 *
 * @example
 * ```ts
 * // API Route
 * export async function GET(request: NextRequest) {
 *   return withAuth(async (session, req) => {
 *     const userId = session.user.id;
 *     const data = await fetchUserData(userId);
 *     return NextResponse.json({ data });
 *   });
 * }
 * ```
 */
export async function withAuth<T>(
  handler: AuthenticatedHandler<T>,
  request?: NextRequest
): Promise<NextResponse<T | { error: { code: string; message: string } }>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다. 로그인해주세요.',
          },
        },
        { status: 401 }
      ) as NextResponse<{ error: { code: string; message: string } }>;
    }

    return handler(session, request as NextRequest);
  } catch (error) {
    console.error('[withAuth] Authentication error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'AUTH_ERROR',
          message: '인증 처리 중 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    ) as NextResponse<{ error: { code: string; message: string } }>;
  }
}

/**
 * 역할 기반 인증 검증 후 핸들러 실행
 *
 * @param role - 필요한 역할
 * @param handler - 인증된 요청을 처리할 핸들러
 * @returns NextResponse
 *
 * @example
 * ```ts
 * // Admin API Route
 * export async function GET(request: NextRequest) {
 *   return withRole('admin', async (session, req) => {
 *     const adminData = await fetchAdminData();
 *     return NextResponse.json({ data: adminData });
 *   });
 * }
 * ```
 */
export function withRole<T>(
  role: UserRole,
  handler: AuthenticatedHandler<T>
): (request?: NextRequest) => Promise<NextResponse<T | { error: { code: string; message: string } }>> {
  return async (request?: NextRequest) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json(
          {
            error: {
              code: 'UNAUTHORIZED',
              message: '인증이 필요합니다. 로그인해주세요.',
            },
          },
          { status: 401 }
        ) as NextResponse<{ error: { code: string; message: string } }>;
      }

      const userRole = session.user.role as UserRole | undefined;

      // admin은 모든 역할 접근 가능
      if (userRole !== 'admin' && userRole !== role) {
        return NextResponse.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: `이 기능은 ${role === 'admin' ? '관리자' : role} 권한이 필요합니다.`,
            },
          },
          { status: 403 }
        ) as NextResponse<{ error: { code: string; message: string } }>;
      }

      return handler(session, request as NextRequest);
    } catch (error) {
      console.error('[withRole] Authentication error:', error);
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_ERROR',
            message: '인증 처리 중 오류가 발생했습니다.',
          },
        },
        { status: 500 }
      ) as NextResponse<{ error: { code: string; message: string } }>;
    }
  };
}

/**
 * 관리자 전용 핸들러 (withRole('admin')의 편의 함수)
 *
 * @param handler - 관리자 요청을 처리할 핸들러
 * @returns NextResponse
 *
 * @example
 * ```ts
 * // Admin API Route
 * export async function DELETE(request: NextRequest) {
 *   return withAdmin(async (session, req) => {
 *     await deleteResource();
 *     return NextResponse.json({ success: true });
 *   });
 * }
 * ```
 */
export function withAdmin<T>(
  handler: AuthenticatedHandler<T>
): (request?: NextRequest) => Promise<NextResponse<T | { error: { code: string; message: string } }>> {
  return withRole('admin', handler);
}

/**
 * 세션에서 사용자 ID 추출
 *
 * @param session - NextAuth Session
 * @returns 사용자 ID 또는 null
 */
export function getUserIdFromSession(session: Session | null): string | null {
  return session?.user?.id ?? null;
}

/**
 * 세션에서 사용자 역할 추출
 *
 * @param session - NextAuth Session
 * @returns 사용자 역할 또는 null
 */
export function getRoleFromSession(session: Session | null): UserRole | null {
  return (session?.user?.role as UserRole) ?? null;
}

/**
 * API 오류 응답 생성 헬퍼
 */
export const ApiError = {
  unauthorized: (message = '인증이 필요합니다.') =>
    NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message } },
      { status: 401 }
    ),

  forbidden: (message = '접근 권한이 없습니다.') =>
    NextResponse.json(
      { error: { code: 'FORBIDDEN', message } },
      { status: 403 }
    ),

  notFound: (message = '리소스를 찾을 수 없습니다.') =>
    NextResponse.json(
      { error: { code: 'NOT_FOUND', message } },
      { status: 404 }
    ),

  badRequest: (message = '잘못된 요청입니다.') =>
    NextResponse.json(
      { error: { code: 'BAD_REQUEST', message } },
      { status: 400 }
    ),

  internal: (message = '서버 오류가 발생했습니다.') =>
    NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    ),

  paymentRequired: (message = '결제가 필요합니다.', upgradeUrl?: string) =>
    NextResponse.json(
      {
        error: {
          code: 'PAYMENT_REQUIRED',
          message,
          upgradeUrl: upgradeUrl || '/pricing',
        },
      },
      { status: 402 }
    ),
};

/**
 * 요청에서 인증 정보 추출 (헤더 또는 쿠키)
 *
 * @param request - NextRequest
 * @returns 인증 토큰 또는 null
 */
export function extractAuthToken(request: NextRequest): string | null {
  // Authorization 헤더에서 Bearer 토큰 추출
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 쿠키에서 세션 토큰 추출
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  return sessionToken || null;
}

/**
 * 소유권 확인 헬퍼
 *
 * @param session - NextAuth Session
 * @param resourceOwnerId - 리소스 소유자 ID
 * @returns 소유 여부 (admin은 항상 true)
 *
 * @example
 * ```ts
 * if (!isOwnerOrAdmin(session, guidebook.user_id)) {
 *   return ApiError.forbidden('이 가이드북을 수정할 권한이 없습니다.');
 * }
 * ```
 */
export function isOwnerOrAdmin(
  session: Session | null,
  resourceOwnerId: string
): boolean {
  if (!session?.user) return false;

  // admin은 모든 리소스 접근 가능
  if (session.user.role === 'admin') return true;

  // 소유자 확인
  return session.user.id === resourceOwnerId;
}
