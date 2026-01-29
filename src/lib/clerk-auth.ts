/**
 * Clerk Auth Utilities
 *
 * Clerk 인증을 위한 서버 사이드 유틸리티
 * @TASK Clerk-Auth
 */

import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * 현재 인증된 사용자 ID 가져오기
 * API Route 및 Server Component에서 사용
 */
export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * 현재 인증된 사용자 정보 가져오기
 * 사용자 세부 정보가 필요할 때 사용
 */
export async function getAuthUser() {
  const user = await currentUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    name: user.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User',
    image: user.imageUrl,
  };
}

/**
 * 인증 필수 체크
 * 인증되지 않은 경우 에러 throw
 */
export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

/**
 * 인증 상태 확인 (boolean)
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

// Re-export Clerk's auth for direct use
export { auth, currentUser } from '@clerk/nextjs/server';
