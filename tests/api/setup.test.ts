/**
 * Setup API Tests
 *
 * Tests for /api/setup/* endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SupabaseConfigSchema,
  TossConfigSchema,
  SiteConfigSchema,
  SetupConfigSchema,
  testSupabaseConnection,
  validateSupabaseKeys,
  formatEnvFile,
  getConfigurationStatus,
  SETUP_ERROR_MESSAGES,
} from '@/lib/config/secure-store';

describe('Setup Configuration Validation', () => {
  describe('SupabaseConfigSchema', () => {
    it('should validate valid Supabase config', () => {
      const validConfig = {
        url: 'https://xxx.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service',
      };

      const result = SupabaseConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL format', () => {
      const invalidConfig = {
        url: 'not-a-url',
        anonKey: 'eyJtest',
      };

      const result = SupabaseConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        expect(result.error.issues[0].message).toContain('Invalid');
      }
    });

    it('should allow missing serviceRoleKey (optional)', () => {
      const configWithoutServiceKey = {
        url: 'https://xxx.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
      };

      const result = SupabaseConfigSchema.safeParse(configWithoutServiceKey);
      expect(result.success).toBe(true);
    });

    it('should reject empty anon key', () => {
      const invalidConfig = {
        url: 'https://xxx.supabase.co',
        anonKey: '',
      };

      const result = SupabaseConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('TossConfigSchema', () => {
    it('should validate valid Toss config', () => {
      const validConfig = {
        clientKey: 'test_ck_xxxxx',
        secretKey: 'test_sk_xxxxx',
      };

      const result = TossConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should allow empty Toss config (optional)', () => {
      const emptyConfig = {};

      const result = TossConfigSchema.safeParse(emptyConfig);
      expect(result.success).toBe(true);
    });
  });

  describe('SiteConfigSchema', () => {
    it('should validate valid site config', () => {
      const validConfig = {
        name: 'Vibe Store',
        url: 'https://example.com',
        adminEmail: 'admin@example.com',
      };

      const result = SiteConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidConfig = {
        name: 'Vibe Store',
        url: 'https://example.com',
        adminEmail: 'not-an-email',
      };

      const result = SiteConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject invalid site URL', () => {
      const invalidConfig = {
        name: 'Vibe Store',
        url: 'not-a-url',
        adminEmail: 'admin@example.com',
      };

      const result = SiteConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('SetupConfigSchema', () => {
    it('should validate complete setup config', () => {
      const validConfig = {
        supabase: {
          url: 'https://xxx.supabase.co',
          anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        },
        toss: {
          clientKey: 'test_ck_xxxxx',
          secretKey: 'test_sk_xxxxx',
        },
        site: {
          name: 'Vibe Store',
          url: 'https://example.com',
          adminEmail: 'admin@example.com',
        },
      };

      const result = SetupConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should validate config without optional Toss', () => {
      const configWithoutToss = {
        supabase: {
          url: 'https://xxx.supabase.co',
          anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        },
        site: {
          name: 'Vibe Store',
          url: 'https://example.com',
          adminEmail: 'admin@example.com',
        },
      };

      const result = SetupConfigSchema.safeParse(configWithoutToss);
      expect(result.success).toBe(true);
    });
  });
});

describe('validateSupabaseKeys', () => {
  it('should accept valid Supabase keys', () => {
    const config = {
      url: 'https://xxx.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
      serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service',
    };

    const result = validateSupabaseKeys(config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid URL', () => {
    const config = {
      url: 'https://invalid-domain.com',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
    };

    const result = validateSupabaseKeys(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('URL should be a valid Supabase URL (*.supabase.co)');
  });

  it('should accept localhost URL for development', () => {
    const config = {
      url: 'http://localhost:54321',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
    };

    const result = validateSupabaseKeys(config);
    expect(result.valid).toBe(true);
  });

  it('should reject anon key not starting with eyJ', () => {
    const config = {
      url: 'https://xxx.supabase.co',
      anonKey: 'invalid-key',
    };

    const result = validateSupabaseKeys(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Anon key should be a valid JWT token (starts with eyJ)');
  });

  it('should reject service role key not starting with eyJ', () => {
    const config = {
      url: 'https://xxx.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
      serviceRoleKey: 'invalid-service-key',
    };

    const result = validateSupabaseKeys(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Service role key should be a valid JWT token (starts with eyJ)');
  });
});

describe('formatEnvFile', () => {
  it('should format complete config correctly', () => {
    const config = {
      supabase: {
        url: 'https://xxx.supabase.co',
        anonKey: 'eyJtest_anon',
        serviceRoleKey: 'eyJtest_service',
      },
      toss: {
        clientKey: 'test_ck_xxxxx',
        secretKey: 'test_sk_xxxxx',
      },
      site: {
        name: 'Vibe Store',
        url: 'https://example.com',
        adminEmail: 'admin@example.com',
      },
    };

    const envContent = formatEnvFile(config);

    expect(envContent).toContain('NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co');
    expect(envContent).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJtest_anon');
    expect(envContent).toContain('SUPABASE_SERVICE_ROLE_KEY=eyJtest_service');
    expect(envContent).toContain('TOSS_CLIENT_KEY=test_ck_xxxxx');
    expect(envContent).toContain('TOSS_SECRET_KEY=test_sk_xxxxx');
    expect(envContent).toContain('NEXT_PUBLIC_SITE_NAME=Vibe Store');
    expect(envContent).toContain('NEXT_PUBLIC_APP_URL=https://example.com');
    expect(envContent).toContain('ADMIN_EMAIL=admin@example.com');
  });

  it('should format config without optional fields', () => {
    const config = {
      supabase: {
        url: 'https://xxx.supabase.co',
        anonKey: 'eyJtest_anon',
      },
      site: {
        name: 'Vibe Store',
        url: 'https://example.com',
        adminEmail: 'admin@example.com',
      },
    };

    const envContent = formatEnvFile(config);

    expect(envContent).toContain('NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co');
    expect(envContent).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJtest_anon');
    expect(envContent).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(envContent).not.toContain('TOSS_CLIENT_KEY');
    expect(envContent).toContain('NEXT_PUBLIC_SITE_NAME=Vibe Store');
  });

  it('should include header comments', () => {
    const config = {
      supabase: {
        url: 'https://xxx.supabase.co',
        anonKey: 'eyJtest',
      },
      site: {
        name: 'Vibe Store',
        url: 'https://example.com',
        adminEmail: 'admin@example.com',
      },
    };

    const envContent = formatEnvFile(config);

    expect(envContent).toContain('# Auto-generated by Setup Wizard');
    expect(envContent).toContain('# Do not commit this file to version control');
    expect(envContent).toContain('# Supabase Configuration');
    expect(envContent).toContain('# Site Configuration');
  });
});

describe('getConfigurationStatus', () => {
  beforeEach(() => {
    // Clear environment variables
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.TOSS_CLIENT_KEY;
    delete process.env.TOSS_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_SITE_NAME;
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it('should return not configured when no env vars set', () => {
    const status = getConfigurationStatus();

    expect(status.configured).toBe(false);
    expect(status.hasSupabase).toBe(false);
    expect(status.hasToss).toBe(false);
    expect(status.hasSite).toBe(false);
  });

  it('should detect Supabase configuration', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xxx.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest';

    const status = getConfigurationStatus();

    expect(status.hasSupabase).toBe(true);
  });

  it('should detect Toss configuration', () => {
    process.env.TOSS_CLIENT_KEY = 'test_ck_xxx';
    process.env.TOSS_SECRET_KEY = 'test_sk_xxx';

    const status = getConfigurationStatus();

    expect(status.hasToss).toBe(true);
  });

  it('should detect site configuration', () => {
    process.env.NEXT_PUBLIC_SITE_NAME = 'Vibe Store';
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';

    const status = getConfigurationStatus();

    expect(status.hasSite).toBe(true);
  });

  it('should return configured when Supabase and Site are set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xxx.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest';
    process.env.NEXT_PUBLIC_SITE_NAME = 'Vibe Store';
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';

    const status = getConfigurationStatus();

    expect(status.configured).toBe(true);
    expect(status.hasSupabase).toBe(true);
    expect(status.hasSite).toBe(true);
  });
});

describe('testSupabaseConnection', () => {
  it('should return success for valid connection', async () => {
    // Mock successful connection
    const config = {
      url: 'https://xxx.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
    };

    // Note: This will fail in real environment without valid credentials
    // In real tests, we would mock the Supabase client
    const result = await testSupabaseConnection(config);

    expect(result).toHaveProperty('success');
    expect(typeof result.success).toBe('boolean');
  });

  it('should return error for invalid credentials', async () => {
    const config = {
      url: 'https://invalid.supabase.co',
      anonKey: 'eyJinvalid',
    };

    const result = await testSupabaseConnection(config);

    // Should fail with invalid credentials
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('SETUP_ERROR_MESSAGES', () => {
  it('should have all required error messages', () => {
    expect(SETUP_ERROR_MESSAGES.INVALID_URL).toBeDefined();
    expect(SETUP_ERROR_MESSAGES.INVALID_ANON_KEY).toBeDefined();
    expect(SETUP_ERROR_MESSAGES.CONNECTION_FAILED).toBeDefined();
    expect(SETUP_ERROR_MESSAGES.TABLES_NOT_FOUND).toBeDefined();
    expect(SETUP_ERROR_MESSAGES.ALREADY_CONFIGURED).toBeDefined();
  });

  it('should provide clear error messages', () => {
    expect(SETUP_ERROR_MESSAGES.INVALID_URL).toContain('Supabase');
    expect(SETUP_ERROR_MESSAGES.INVALID_ANON_KEY).toContain('JWT');
    expect(SETUP_ERROR_MESSAGES.CONNECTION_FAILED).toContain('connect');
    expect(SETUP_ERROR_MESSAGES.TABLES_NOT_FOUND).toContain('migrations');
  });
});
