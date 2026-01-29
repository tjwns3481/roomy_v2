/**
 * @TASK P0-T0.3 - Supabase Client Exports
 *
 * Supabase 클라이언트 및 타입을 re-export합니다.
 *
 * 사용 예시:
 * ```tsx
 * // 클라이언트 컴포넌트
 * import { createClient } from '@/lib/supabase';
 *
 * // 서버 컴포넌트/API 라우트
 * import { createServerClient, createAdminClient } from '@/lib/supabase';
 *
 * // 타입
 * import { Tables, TablesInsert, Database } from '@/lib/supabase';
 * ```
 */

// 브라우저 클라이언트
export { createClient } from './client';

// 서버 클라이언트
export { createServerClient, createAdminClient } from './server';

// 미들웨어 클라이언트 (DEPRECATED - NextAuth 사용 권장)
export { createMiddlewareClient } from './middleware';

// 인증 함수
export {
  signInWithPassword,
  signUp,
  signInWithGoogle,
  signOut,
  getCurrentUser,
} from './auth';

// 타입
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from './types';
