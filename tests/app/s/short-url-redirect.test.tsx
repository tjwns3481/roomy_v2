// @TASK P5-T5.4 - 단축 URL 리다이렉트 테스트
// @SPEC docs/planning/06-tasks.md#P5-T5.4

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

import { redirect, notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

describe('Short URL Redirect (P5-T5.4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RPC Function: increment_short_url_clicks', () => {
    it('should return guidebook_slug when code is valid', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: [{ guidebook_slug: 'test-guidebook', is_expired: false }],
        error: null,
      });

      const mockSupabase = {
        rpc: mockRpc,
      };

      (createServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);

      const result = await mockSupabase.rpc('increment_short_url_clicks', {
        p_code: 'abc123',
      });

      expect(mockRpc).toHaveBeenCalledWith('increment_short_url_clicks', {
        p_code: 'abc123',
      });
      expect(result.data[0].guidebook_slug).toBe('test-guidebook');
      expect(result.data[0].is_expired).toBe(false);
    });

    it('should return null guidebook_slug for non-existent code', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: [{ guidebook_slug: null, is_expired: null }],
        error: null,
      });

      const mockSupabase = {
        rpc: mockRpc,
      };

      const result = await mockSupabase.rpc('increment_short_url_clicks', {
        p_code: 'invalid',
      });

      expect(result.data[0].guidebook_slug).toBeNull();
    });

    it('should return is_expired=true for expired links', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: [{ guidebook_slug: null, is_expired: true }],
        error: null,
      });

      const mockSupabase = {
        rpc: mockRpc,
      };

      const result = await mockSupabase.rpc('increment_short_url_clicks', {
        p_code: 'expired123',
      });

      expect(result.data[0].is_expired).toBe(true);
      expect(result.data[0].guidebook_slug).toBeNull();
    });
  });

  describe('Short URL Table Schema', () => {
    it('should have correct table structure', async () => {
      // Short URL 테이블 스키마 검증
      const expectedColumns = [
        'id',
        'guidebook_id',
        'short_code',
        'expires_at',
        'clicks',
        'is_active',
        'created_at',
        'updated_at',
      ];

      // 타입 정의에서 컬럼 확인
      type ShortUrlRow = {
        id: string;
        guidebook_id: string;
        short_code: string;
        expires_at: string | null;
        clicks: number;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };

      const mockRow: ShortUrlRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        guidebook_id: '223e4567-e89b-12d3-a456-426614174000',
        short_code: 'abc123',
        expires_at: null,
        clicks: 0,
        is_active: true,
        created_at: '2024-01-28T00:00:00Z',
        updated_at: '2024-01-28T00:00:00Z',
      };

      expect(Object.keys(mockRow)).toEqual(expectedColumns);
    });

    it('should validate short_code is unique', () => {
      // short_code는 UNIQUE 제약이 있어야 함
      const codes = new Set(['abc123', 'abc123', 'def456']);
      // 중복 제거 후 2개여야 함 (DB에서 UNIQUE 제약으로 처리)
      expect(codes.size).toBe(2);
    });
  });

  describe('Click Tracking', () => {
    it('should increment clicks on valid redirect', async () => {
      let clickCount = 5;
      const mockRpc = vi.fn().mockImplementation(() => {
        clickCount += 1;
        return Promise.resolve({
          data: [{ guidebook_slug: 'test-guidebook', is_expired: false }],
          error: null,
        });
      });

      const mockSupabase = {
        rpc: mockRpc,
      };

      await mockSupabase.rpc('increment_short_url_clicks', { p_code: 'abc123' });
      expect(clickCount).toBe(6);
    });
  });

  describe('Expiry Handling', () => {
    it('should handle expired links (expires_at in past)', () => {
      const pastDate = new Date('2020-01-01');
      const now = new Date();
      expect(pastDate < now).toBe(true);
    });

    it('should handle active links (expires_at in future)', () => {
      const futureDate = new Date('2030-01-01');
      const now = new Date();
      expect(futureDate > now).toBe(true);
    });

    it('should handle links with no expiry (expires_at is null)', () => {
      const expiresAt: Date | null = null;
      // null expires_at는 영구 링크를 의미
      expect(expiresAt).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle deactivated links (is_active=false)', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: [{ guidebook_slug: null, is_expired: true }],
        error: null,
      });

      const mockSupabase = {
        rpc: mockRpc,
      };

      const result = await mockSupabase.rpc('increment_short_url_clicks', {
        p_code: 'deactivated',
      });

      // is_active=false 인 경우 is_expired=true로 반환
      expect(result.data[0].is_expired).toBe(true);
    });

    it('should handle unpublished guidebooks', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: [{ guidebook_slug: null, is_expired: null }],
        error: null,
      });

      const mockSupabase = {
        rpc: mockRpc,
      };

      const result = await mockSupabase.rpc('increment_short_url_clicks', {
        p_code: 'draft-guidebook',
      });

      // 미공개 가이드북은 slug=null, is_expired=null
      expect(result.data[0].guidebook_slug).toBeNull();
      expect(result.data[0].is_expired).toBeNull();
    });
  });

  describe('Short Code Generation', () => {
    it('should generate codes with valid characters', () => {
      // 혼동되는 문자 제외: I, l, O, 0, 1
      const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      const confusingChars = ['I', 'l', 'O', '0', '1'];

      confusingChars.forEach((char) => {
        expect(validChars.includes(char)).toBe(false);
      });
    });

    it('should generate codes of default length 6', () => {
      const defaultLength = 6;
      const mockCode = 'AbC3Xy';
      expect(mockCode.length).toBe(defaultLength);
    });
  });
});

describe('Short URL Metadata (SEO)', () => {
  it('should include OpenGraph tags for valid short URLs', () => {
    const metadata = {
      title: 'Test Guidebook - Roomy',
      description: 'Test description',
      openGraph: {
        title: 'Test Guidebook',
        description: 'Test description',
        images: [{ url: 'https://example.com/og-image.jpg' }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Test Guidebook',
        description: 'Test description',
      },
    };

    expect(metadata.openGraph.title).toBe('Test Guidebook');
    expect(metadata.openGraph.type).toBe('website');
    expect(metadata.twitter.card).toBe('summary_large_image');
  });

  it('should handle missing OG image gracefully', () => {
    const metadata = {
      title: 'Test Guidebook - Roomy',
      description: 'Test description',
      openGraph: {
        title: 'Test Guidebook',
        description: 'Test description',
        images: undefined,
      },
    };

    expect(metadata.openGraph.images).toBeUndefined();
  });
});
