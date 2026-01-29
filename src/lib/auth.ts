/**
 * Authentication Utilities
 *
 * Clerk 기반 인증 유틸리티
 * 기존 NextAuth 코드와의 호환성을 위해 같은 인터페이스 유지
 *
 * @TASK Clerk-Auth - NextAuth에서 Clerk로 전환
 */

import { auth as clerkAuth, currentUser } from '@clerk/nextjs/server';

/**
 * 현재 세션 정보 가져오기 (NextAuth 호환)
 *
 * 기존 코드에서 auth()를 사용하는 부분과 호환
 * @returns session object with user info or null
 */
export async function auth() {
  const { userId } = await clerkAuth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  if (!user) {
    return null;
  }

  return {
    user: {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User',
      image: user.imageUrl,
      role: 'customer' as const, // 기본 역할, 필요시 Clerk 메타데이터에서 가져오기
    },
  };
}

/**
 * 현재 인증된 사용자 ID만 가져오기
 */
export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await clerkAuth();
  return userId;
}

/**
 * 인증 필수 체크
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

// Clerk의 auth 함수 직접 export (고급 사용)
export { clerkAuth as clerkServerAuth };
