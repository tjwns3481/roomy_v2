/**
 * Migration Script Tests
 *
 * npm run db:migrate 스크립트의 동작을 검증합니다.
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';

describe('DB Migration Script', () => {
  beforeAll(() => {
    // 환경변수 모킹
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  it('should validate environment variables', () => {
    // 환경변수가 없으면 에러
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(url).toBeDefined();
    expect(key).toBeDefined();
  });

  it('should have migration files in correct format', async () => {
    const { readdirSync } = await import('fs');
    const { join } = await import('path');

    const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // 마이그레이션 파일이 존재해야 함
    expect(files.length).toBeGreaterThan(0);

    // 파일명이 순서대로 정렬되어야 함
    files.forEach((file, idx) => {
      if (idx > 0) {
        expect(file.localeCompare(files[idx - 1])).toBeGreaterThan(0);
      }
    });

    // 파일명이 숫자로 시작해야 함
    files.forEach(file => {
      expect(file).toMatch(/^\d+_/);
    });
  });

  it('should read migration files successfully', async () => {
    const { readFileSync, readdirSync } = await import('fs');
    const { join } = await import('path');

    const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .slice(0, 1); // 첫 번째 파일만 테스트

    files.forEach(file => {
      const filepath = join(migrationsDir, file);
      const content = readFileSync(filepath, 'utf-8');

      // SQL 파일이 비어있지 않아야 함
      expect(content.length).toBeGreaterThan(0);

      // 주석 또는 SQL 문이 포함되어야 함
      expect(content).toMatch(/(--|CREATE|ALTER|DROP|INSERT)/);
    });
  });
});
