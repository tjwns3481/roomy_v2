/**
 * @TASK P7-T7.2 - 세션 관리 유틸리티
 * @SPEC docs/planning/02-trd.md#세션-관리
 *
 * NextAuth.js 세션 관리 및 검증 함수
 */

import { auth } from '@/lib/auth';
import type { UserRole } from './constants';

// Clerk 전환 후 자체 Session 타입 정의 (next-auth 대체)
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: 'customer' | 'admin';
  };
}

/**
 * 현재 세션 조회 (서버 컴포넌트/API Route용)
 *
 * @returns 현재 세션 또는 null
 *
 * @example
 * ```ts
 * // Server Component
 * const session = await getSession();
 * if (!session) {
 *   redirect('/login');
 * }
 * ```
 */
export async function getSession(): Promise<Session | null> {
  try {
    const session = await auth();
    return session;
  } catch (error) {
    console.error('[Session] Failed to get session:', error);
    return null;
  }
}

/**
 * 현재 사용자 조회 (서버 컴포넌트/API Route용)
 *
 * @returns 현재 사용자 또는 null
 *
 * @example
 * ```ts
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('Logged in as:', user.email);
 * }
 * ```
 */
export async function getCurrentUser(): Promise<Session['user'] | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * 사용자 ID 조회 (서버 컴포넌트/API Route용)
 *
 * @returns 현재 사용자 ID 또는 null
 *
 * @example
 * ```ts
 * const userId = await getUserId();
 * if (!userId) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 * ```
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/**
 * 사용자 역할 조회
 *
 * @returns 현재 사용자 역할 또는 null
 *
 * @example
 * ```ts
 * const role = await getUserRole();
 * if (role !== 'admin') {
 *   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 * }
 * ```
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  return (user?.role as UserRole) ?? null;
}

/**
 * 인증 상태 확인
 *
 * @returns 인증 여부
 *
 * @example
 * ```ts
 * if (!await isAuthenticated()) {
 *   redirect('/login');
 * }
 * ```
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

/**
 * 관리자 여부 확인
 *
 * @returns 관리자 여부
 *
 * @example
 * ```ts
 * if (!await isAdmin()) {
 *   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 * }
 * ```
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

/**
 * 역할 확인
 *
 * @param requiredRole - 필요한 역할
 * @returns 역할 보유 여부
 *
 * @example
 * ```ts
 * if (!await hasRole('admin')) {
 *   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 * }
 * ```
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const role = await getUserRole();

  if (!role) return false;

  // admin은 모든 역할 접근 가능
  if (role === 'admin') return true;

  return role === requiredRole;
}

/**
 * 세션 검증 결과 타입
 */
export interface SessionValidation {
  isValid: boolean;
  session: Session | null;
  user: Session['user'] | null;
  error?: string;
}

/**
 * 세션 검증 (상세 정보 포함)
 *
 * @returns 세션 검증 결과
 *
 * @example
 * ```ts
 * const validation = await validateSession();
 * if (!validation.isValid) {
 *   console.error('Session invalid:', validation.error);
 *   return;
 * }
 * const userId = validation.user!.id;
 * ```
 */
export async function validateSession(): Promise<SessionValidation> {
  try {
    const session = await getSession();

    if (!session) {
      return {
        isValid: false,
        session: null,
        user: null,
        error: 'No session found',
      };
    }

    if (!session.user) {
      return {
        isValid: false,
        session,
        user: null,
        error: 'Session has no user',
      };
    }

    return {
      isValid: true,
      session,
      user: session.user,
    };
  } catch (error) {
    return {
      isValid: false,
      session: null,
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 세션에서 사용자 정보 추출 (동기 함수)
 *
 * @param session - NextAuth Session
 * @returns 사용자 정보 또는 null
 */
export function extractUser(session: Session | null): Session['user'] | null {
  return session?.user ?? null;
}

/**
 * 세션에서 역할 추출 (동기 함수)
 *
 * @param session - NextAuth Session
 * @returns 역할 또는 null
 */
export function extractRole(session: Session | null): UserRole | null {
  return (session?.user?.role as UserRole) ?? null;
}
