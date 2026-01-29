/**
 * Signup API Route Test
 *
 * 회원가입 API 동작 확인
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

describe('POST /api/auth/signup', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  const testNickname = 'TestUser';

  let createdUserId: string | null = null;

  afterAll(async () => {
    // 테스트 후 생성된 사용자 삭제
    if (createdUserId) {
      await supabaseAdmin.auth.admin.deleteUser(createdUserId);
    }
  });

  it('should create a new user with email and password', async () => {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        nickname: testNickname,
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testEmail);
    expect(data.user.id).toBeDefined();

    createdUserId = data.user.id;

    // 프로필이 자동으로 생성되었는지 확인
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', createdUserId!)
      .single();

    expect(profile).toBeDefined();
    expect(profile?.email).toBe(testEmail);
    expect(profile?.nickname).toBe(testNickname);
  });

  it('should return error for missing email', async () => {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: testPassword,
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return error for short password', async () => {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test-short-${Date.now()}@example.com`,
        password: '123',
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('6자');
  });

  it('should return error for duplicate email', async () => {
    // 먼저 사용자 생성
    const firstResponse = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test-duplicate-${Date.now()}@example.com`,
        password: testPassword,
      }),
    });

    const firstData = await firstResponse.json();
    const duplicateUserId = firstData.user.id;

    // 같은 이메일로 다시 가입 시도
    const secondResponse = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: firstData.user.email,
        password: testPassword,
      }),
    });

    const secondData = await secondResponse.json();

    // 중복 이메일은 400 또는 500 에러를 반환할 수 있음
    expect([400, 500]).toContain(secondResponse.status);
    expect(secondData.error).toBeDefined();

    // 정리
    if (duplicateUserId) {
      await supabaseAdmin.auth.admin.deleteUser(duplicateUserId);
    }
  });

  it('should auto-fill nickname from email if not provided', async () => {
    const email = `test-auto-${Date.now()}@example.com`;
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: testPassword,
      }),
    });

    const data = await response.json();
    const userId = data.user.id;

    expect(response.status).toBe(200);

    // 프로필 확인
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    expect(profile?.nickname).toBe(email.split('@')[0]);

    // 정리
    if (userId) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }
  });
});
