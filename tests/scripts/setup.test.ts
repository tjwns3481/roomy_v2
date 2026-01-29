/**
 * Setup Wizard - Unit Tests
 *
 * 설정 마법사의 핵심 기능을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  createEnvFile,
  createSiteConfig,
  isValidUrl,
  isValidEmail,
  isSetupComplete,
  type EnvConfig,
  type SiteConfig,
} from '../../scripts/setup/index';

const TEST_DIR = path.join(__dirname, '__test_output__');

describe('Setup Wizard - Core Functions', () => {
  beforeEach(() => {
    // 테스트 디렉토리 생성
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // 테스트 디렉토리 정리
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('createEnvFile', () => {
    it('should create .env.local file with all fields', () => {
      const config: EnvConfig = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
        TOSS_CLIENT_KEY: 'test-toss-client',
        TOSS_SECRET_KEY: 'test-toss-secret',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      };

      createEnvFile(config, TEST_DIR);

      const envPath = path.join(TEST_DIR, '.env.local');
      expect(fs.existsSync(envPath)).toBe(true);

      const content = fs.readFileSync(envPath, 'utf-8');
      expect(content).toContain('NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co');
      expect(content).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key');
      expect(content).toContain('SUPABASE_SERVICE_ROLE_KEY=test-service-key');
      expect(content).toContain('TOSS_CLIENT_KEY=test-toss-client');
      expect(content).toContain('TOSS_SECRET_KEY=test-toss-secret');
      expect(content).toContain('NEXT_PUBLIC_APP_URL=http://localhost:3000');
    });

    it('should create .env.local file with optional fields commented', () => {
      const config: EnvConfig = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      };

      createEnvFile(config, TEST_DIR);

      const envPath = path.join(TEST_DIR, '.env.local');
      const content = fs.readFileSync(envPath, 'utf-8');

      expect(content).toContain('# SUPABASE_SERVICE_ROLE_KEY=');
      expect(content).toContain('# TOSS_CLIENT_KEY=');
      expect(content).toContain('# TOSS_SECRET_KEY=');
    });
  });

  describe('createSiteConfig', () => {
    it('should create site.config.ts file', () => {
      const config: SiteConfig = {
        name: 'Test Store',
        url: 'http://localhost:3000',
        adminEmail: 'admin@test.com',
        description: 'Test description',
      };

      createSiteConfig(config, TEST_DIR);

      const configPath = path.join(TEST_DIR, 'config', 'site.config.ts');
      expect(fs.existsSync(configPath)).toBe(true);

      const content = fs.readFileSync(configPath, 'utf-8');
      expect(content).toContain('name: "Test Store"');
      expect(content).toContain('url: "http://localhost:3000"');
      expect(content).toContain('adminEmail: "admin@test.com"');
      expect(content).toContain('description: "Test description"');
    });

    it('should use default description if not provided', () => {
      const config: SiteConfig = {
        name: 'Test Store',
        url: 'http://localhost:3000',
        adminEmail: 'admin@test.com',
      };

      createSiteConfig(config, TEST_DIR);

      const configPath = path.join(TEST_DIR, 'config', 'site.config.ts');
      const content = fs.readFileSync(configPath, 'utf-8');

      expect(content).toContain('description: "Test Store - 디지털 상품 쇼핑몰"');
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://example.supabase.co')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.co.kr')).toBe(true);
      expect(isValidEmail('admin+test@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('isSetupComplete', () => {
    it('should return false when setup is not complete', () => {
      expect(isSetupComplete(TEST_DIR)).toBe(false);
    });

    it('should return true when both files exist', () => {
      const envConfig: EnvConfig = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      };

      const siteConfig: SiteConfig = {
        name: 'Test Store',
        url: 'http://localhost:3000',
        adminEmail: 'admin@test.com',
      };

      createEnvFile(envConfig, TEST_DIR);
      createSiteConfig(siteConfig, TEST_DIR);

      expect(isSetupComplete(TEST_DIR)).toBe(true);
    });

    it('should return false when only .env.local exists', () => {
      const envConfig: EnvConfig = {
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      };

      createEnvFile(envConfig, TEST_DIR);

      expect(isSetupComplete(TEST_DIR)).toBe(false);
    });
  });
});
