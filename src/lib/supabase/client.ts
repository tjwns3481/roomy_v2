/**
 * Supabase Browser Client
 *
 * 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트
 */

'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

/**
 * 브라우저용 Supabase 클라이언트 생성
 * 매번 새 인스턴스 생성 (세션 동기화 보장)
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
