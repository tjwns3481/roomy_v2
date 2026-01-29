/**
 * Vitest Global Setup
 *
 * 모든 테스트 실행 전 초기화
 */

import { beforeAll, vi } from 'vitest';
import '@testing-library/jest-dom';
import { config } from 'dotenv';

// .env.local 로드 (실제 Supabase 연결용)
config({ path: '.env.local' });

// 환경 변수 모킹 (실제 값이 없을 경우에만)
beforeAll(() => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  }
});

// window.location 모킹 (브라우저 환경 시뮬레이션)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'location', {
    value: {
      origin: 'http://localhost:3000',
      href: 'http://localhost:3000',
    },
    writable: true,
  });
}
