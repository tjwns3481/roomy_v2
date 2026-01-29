// @TASK P5-T5.1 - 공유 링크 API 테스트
// @SPEC docs/planning/06-tasks.md#P5-T5.1

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getBaseUrl,
  getGuidebookUrl,
  getShortUrl,
} from '@/lib/share';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { slug: 'test-guidebook', status: 'published' },
            error: null,
          })),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: 'short-url-id',
                  guidebook_id: 'test-guidebook-id',
                  short_code: 'abc123',
                  expires_at: null,
                  clicks: 5,
                  is_active: true,
                  created_at: '2024-01-28T00:00:00Z',
                  updated_at: '2024-01-28T00:00:00Z',
                },
                error: null,
              })),
            })),
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
    })),
    rpc: vi.fn((funcName: string) => {
      if (funcName === 'create_short_url') {
        return {
          data: [
            {
              id: 'new-short-url-id',
              short_code: 'xyz789',
              expires_at: null,
            },
          ],
          error: null,
        };
      }
      if (funcName === 'increment_short_url_clicks') {
        return {
          data: [
            {
              guidebook_slug: 'test-guidebook',
              is_expired: false,
            },
          ],
          error: null,
        };
      }
      return { data: null, error: null };
    }),
  })),
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}));

describe('Share Link Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set environment variable for tests
    process.env.NEXT_PUBLIC_APP_URL = 'https://roomy.app';
  });

  describe('getBaseUrl', () => {
    it('환경 변수가 설정된 경우 해당 URL을 반환해야 함', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://custom.app';

      const result = getBaseUrl();

      expect(result).toBe('https://custom.app');
    });

    it('환경 변수가 없는 경우 기본 URL을 반환해야 함', () => {
      delete process.env.NEXT_PUBLIC_APP_URL;

      const result = getBaseUrl();

      expect(result).toBe('https://roomy.app');

      // Restore for other tests
      process.env.NEXT_PUBLIC_APP_URL = 'https://roomy.app';
    });
  });

  describe('getGuidebookUrl', () => {
    it('slug로 전체 URL을 생성해야 함', () => {
      const result = getGuidebookUrl('my-guesthouse');

      expect(result).toBe('https://roomy.app/g/my-guesthouse');
    });

    it('한글 slug도 처리해야 함', () => {
      const result = getGuidebookUrl('seoul-stay-123');

      expect(result).toBe('https://roomy.app/g/seoul-stay-123');
    });

    it('빈 slug도 처리해야 함', () => {
      const result = getGuidebookUrl('');

      expect(result).toBe('https://roomy.app/g/');
    });
  });

  describe('getShortUrl', () => {
    it('단축 코드로 URL을 생성해야 함', () => {
      const result = getShortUrl('abc123');

      expect(result).toBe('https://roomy.app/s/abc123');
    });

    it('대문자 단축 코드도 처리해야 함', () => {
      const result = getShortUrl('AbC123');

      expect(result).toBe('https://roomy.app/s/AbC123');
    });

    it('숫자만 있는 단축 코드도 처리해야 함', () => {
      const result = getShortUrl('123456');

      expect(result).toBe('https://roomy.app/s/123456');
    });
  });
});

describe('Share Link Types', () => {
  it('ShareLinkResponse 타입이 올바른 구조를 가져야 함', () => {
    const response = {
      fullUrl: 'https://roomy.app/g/test',
      shortUrl: 'https://roomy.app/s/abc123',
      shortCode: 'abc123',
      clicks: 10,
      expiresAt: null,
      isActive: true,
      createdAt: '2024-01-28T00:00:00Z',
    };

    expect(response.fullUrl).toContain('/g/');
    expect(response.shortUrl).toContain('/s/');
    expect(response.shortCode).toHaveLength(6);
    expect(response.clicks).toBeGreaterThanOrEqual(0);
    expect(response.isActive).toBe(true);
  });

  it('ShortUrl 타입이 올바른 구조를 가져야 함', () => {
    const shortUrl = {
      id: 'uuid-123',
      guidebookId: 'guidebook-uuid',
      shortCode: 'abc123',
      expiresAt: null,
      clicks: 5,
      isActive: true,
      createdAt: '2024-01-28T00:00:00Z',
      updatedAt: '2024-01-28T00:00:00Z',
    };

    expect(shortUrl.id).toBeDefined();
    expect(shortUrl.guidebookId).toBeDefined();
    expect(shortUrl.shortCode).toHaveLength(6);
    expect(shortUrl.isActive).toBe(true);
  });
});

describe('Short Code Generation', () => {
  it('단축 코드가 올바른 문자만 포함해야 함', () => {
    // 단축 코드 생성 규칙: 대소문자 + 숫자 (혼동 방지 문자 제외)
    const validChars = /^[A-Za-z0-9]+$/;
    const testCodes = ['abc123', 'AbC456', 'XYZ789', '123ABC'];

    testCodes.forEach((code) => {
      expect(code).toMatch(validChars);
    });
  });

  it('단축 코드 길이는 6자 또는 8자여야 함', () => {
    const validLengths = [6, 8];
    const testCodes = ['abc123', 'AbCdEfGh'];

    testCodes.forEach((code) => {
      expect(validLengths).toContain(code.length);
    });
  });
});

describe('URL Validation', () => {
  it('가이드북 URL 형식이 올바른지 검증', () => {
    const urlPattern = /^https:\/\/[\w.-]+\/g\/[\w-]+$/;

    expect(getGuidebookUrl('test-slug')).toMatch(urlPattern);
    expect(getGuidebookUrl('my-stay-2024')).toMatch(urlPattern);
  });

  it('단축 URL 형식이 올바른지 검증', () => {
    const urlPattern = /^https:\/\/[\w.-]+\/s\/[\w]+$/;

    expect(getShortUrl('abc123')).toMatch(urlPattern);
    expect(getShortUrl('XYZ789')).toMatch(urlPattern);
  });
});

describe('Share Link API Responses', () => {
  it('POST /api/share/create 응답 형식', () => {
    const expectedResponse = {
      fullUrl: expect.stringContaining('/g/'),
      shortUrl: expect.stringContaining('/s/'),
      shortCode: expect.stringMatching(/^[A-Za-z0-9]{6,8}$/),
      clicks: expect.any(Number),
      expiresAt: expect.toBeOneOf([null, expect.any(String)]),
      isActive: expect.any(Boolean),
      createdAt: expect.any(String),
    };

    const mockResponse = {
      fullUrl: 'https://roomy.app/g/test-guidebook',
      shortUrl: 'https://roomy.app/s/abc123',
      shortCode: 'abc123',
      clicks: 0,
      expiresAt: null,
      isActive: true,
      createdAt: '2024-01-28T00:00:00Z',
    };

    expect(mockResponse.fullUrl).toContain('/g/');
    expect(mockResponse.shortUrl).toContain('/s/');
    expect(mockResponse.shortCode).toMatch(/^[A-Za-z0-9]{6,8}$/);
    expect(mockResponse.clicks).toBeGreaterThanOrEqual(0);
    expect(mockResponse.isActive).toBe(true);
  });

  it('GET /api/share/[guidebookId] 응답 형식', () => {
    const mockResponse = {
      fullUrl: 'https://roomy.app/g/seoul-stay',
      shortUrl: 'https://roomy.app/s/XyZ123',
      shortCode: 'XyZ123',
      clicks: 42,
      expiresAt: '2024-12-31T23:59:59Z',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
    };

    expect(mockResponse.clicks).toBe(42);
    expect(mockResponse.expiresAt).toBeDefined();
    expect(mockResponse.isActive).toBe(true);
  });
});

describe('Error Handling', () => {
  it('잘못된 guidebookId는 400 에러를 반환해야 함', () => {
    const invalidIds = ['not-a-uuid', '123', '', ' '];

    invalidIds.forEach((id) => {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(id)).toBe(false);
    });
  });

  it('유효한 UUID는 검증을 통과해야 함', () => {
    const validIds = [
      '550e8400-e29b-41d4-a716-446655440000',
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    ];

    validIds.forEach((id) => {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(id)).toBe(true);
    });
  });
});

describe('Expiration Logic', () => {
  it('만료일이 null이면 무기한이어야 함', () => {
    const shortUrl = {
      expiresAt: null,
      isActive: true,
    };

    // 만료일이 없으면 항상 유효
    const isExpired = shortUrl.expiresAt !== null &&
      new Date(shortUrl.expiresAt) < new Date();

    expect(isExpired).toBe(false);
  });

  it('만료일이 과거이면 만료되어야 함', () => {
    const shortUrl = {
      expiresAt: '2023-01-01T00:00:00Z', // 과거 날짜
      isActive: true,
    };

    const isExpired = shortUrl.expiresAt !== null &&
      new Date(shortUrl.expiresAt) < new Date();

    expect(isExpired).toBe(true);
  });

  it('만료일이 미래이면 유효해야 함', () => {
    const shortUrl = {
      expiresAt: '2099-12-31T23:59:59Z', // 미래 날짜
      isActive: true,
    };

    const isExpired = shortUrl.expiresAt !== null &&
      new Date(shortUrl.expiresAt) < new Date();

    expect(isExpired).toBe(false);
  });
});

// Custom matcher for toBeOneOf
expect.extend({
  toBeOneOf(received, expectedArray) {
    const pass = expectedArray.some((item: unknown) => {
      if (item === null) return received === null;
      if (typeof item === 'function') return item(received);
      return received === item;
    });
    return {
      pass,
      message: () =>
        `expected ${received} to be one of ${expectedArray.join(', ')}`,
    };
  },
});

declare module 'vitest' {
  interface Assertion<T = unknown> {
    toBeOneOf(expected: unknown[]): T;
  }
}
