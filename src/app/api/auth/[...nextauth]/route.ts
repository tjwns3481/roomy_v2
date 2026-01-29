/**
 * NextAuth.js API Route Handler
 *
 * /api/auth/* 경로의 모든 요청을 처리합니다.
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/session
 * - /api/auth/providers
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
