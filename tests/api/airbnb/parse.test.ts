/**
 * @TASK P3-T3.1 - 에어비앤비 URL 파싱 API 테스트
 * @TEST src/app/api/airbnb/parse/route.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST, OPTIONS } from '@/app/api/airbnb/parse/route';
import { NextRequest } from 'next/server';

// fetch 모킹
const mockFetch = vi.fn();
global.fetch = mockFetch;

/**
 * NextRequest 모킹 헬퍼
 */
function createMockRequest(body: object, ip: string = '127.0.0.1'): NextRequest {
  const request = new NextRequest('http://localhost:3000/api/airbnb/parse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
  return request;
}

describe('POST /api/airbnb/parse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('URL Validation', () => {
    it('should return error for missing url field', async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });

    it('should return error for invalid URL format', async () => {
      const request = createMockRequest({ url: 'not-a-url' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_URL');
    });

    it('should return error for non-airbnb URL', async () => {
      const request = createMockRequest({ url: 'https://www.booking.com/hotel/123' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_AIRBNB_URL');
    });

    it('should return error for airbnb URL without listing ID', async () => {
      const request = createMockRequest({ url: 'https://www.airbnb.com/experiences/123' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NO_LISTING_ID');
    });

    it('should return error for too long URL', async () => {
      const longUrl = 'https://www.airbnb.com/rooms/' + '1'.repeat(3000);
      const request = createMockRequest({ url: longUrl });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_URL');
    });
  });

  describe('Successful Parsing', () => {
    const mockHtmlWithOgTags = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta property="og:title" content="Beautiful Seoul Apartment">
        <meta property="og:description" content="A cozy place in Gangnam">
        <meta property="og:image" content="https://a0.muscache.com/im/pictures/abc.jpg">
        <meta property="og:url" content="https://www.airbnb.co.kr/rooms/12345678">
      </head>
      <body></body>
      </html>
    `;

    it('should parse valid airbnb URL and return metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtmlWithOgTags),
      });

      const request = createMockRequest({ url: 'https://www.airbnb.co.kr/rooms/12345678' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.listingId).toBe('12345678');
      expect(data.data.title).toBe('Beautiful Seoul Apartment');
      expect(data.data.description).toBe('A cozy place in Gangnam');
      expect(data.data.imageUrl).toBe('https://a0.muscache.com/im/pictures/abc.jpg');
    });

    it('should return listingId even if metadata fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = createMockRequest({ url: 'https://www.airbnb.com/rooms/87654321' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.listingId).toBe('87654321');
      expect(data.data.title).toBe(null);
    });

    it('should handle URL with query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtmlWithOgTags),
      });

      const request = createMockRequest({
        url: 'https://www.airbnb.co.kr/rooms/12345678?check_in=2024-01-01',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.listingId).toBe('12345678');
    });
  });

  describe('Error Handling', () => {
    it('should handle 403 Forbidden response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      const request = createMockRequest({ url: 'https://www.airbnb.com/rooms/12345678' });
      const response = await POST(request);
      const data = await response.json();

      // 403이어도 listingId는 반환
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.listingId).toBe('12345678');
      expect(data.data.title).toBe(null);
    });

    it('should handle 404 Not Found response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const request = createMockRequest({ url: 'https://www.airbnb.com/rooms/99999999' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.listingId).toBe('99999999');
    });

    it('should detect blocked page (CAPTCHA)', async () => {
      const blockedHtml = `
        <html>
        <head><title>Please verify you are human</title></head>
        <body>Please complete the CAPTCHA</body>
        </html>
      `;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(blockedHtml),
      });

      const request = createMockRequest({ url: 'https://www.airbnb.com/rooms/12345678' });
      const response = await POST(request);
      const data = await response.json();

      // 차단되어도 listingId는 반환
      expect(response.status).toBe(200);
      expect(data.data.listingId).toBe('12345678');
    });

    it('should handle timeout error', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      const request = createMockRequest({ url: 'https://www.airbnb.com/rooms/12345678' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.listingId).toBe('12345678');
      expect(data.data.title).toBe(null);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<html><head><title>Test</title></head></html>'),
      });

      // 같은 IP에서 여러 요청
      const ip = '192.168.1.100';
      for (let i = 0; i < 5; i++) {
        const request = createMockRequest(
          { url: 'https://www.airbnb.com/rooms/12345678' },
          ip
        );
        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });

    it('should block requests exceeding rate limit', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<html><head><title>Test</title></head></html>'),
      });

      const ip = '10.0.0.1'; // 새로운 IP

      // 분당 11회 요청 (제한: 10회)
      for (let i = 0; i < 10; i++) {
        const request = createMockRequest(
          { url: 'https://www.airbnb.com/rooms/12345678' },
          ip
        );
        await POST(request);
      }

      // 11번째 요청은 차단
      const request = createMockRequest(
        { url: 'https://www.airbnb.com/rooms/12345678' },
        ip
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });
});

describe('OPTIONS /api/airbnb/parse', () => {
  it('should return CORS headers', async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
  });
});
