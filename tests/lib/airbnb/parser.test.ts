/**
 * @TASK P3-T3.1 - 에어비앤비 URL 파서 테스트
 * @TEST src/lib/airbnb/parser.ts
 */

import { describe, it, expect } from 'vitest';
import {
  parseAirbnbUrl,
  isAirbnbUrl,
  buildAirbnbUrl,
  cleanAirbnbUrl,
  isValidListingId,
} from '@/lib/airbnb/parser';

describe('isAirbnbUrl', () => {
  it('should return true for valid airbnb.com URL', () => {
    expect(isAirbnbUrl('https://www.airbnb.com/rooms/12345678')).toBe(true);
  });

  it('should return true for valid airbnb.co.kr URL', () => {
    expect(isAirbnbUrl('https://www.airbnb.co.kr/rooms/12345678')).toBe(true);
  });

  it('should return true for airbnb URL without www', () => {
    expect(isAirbnbUrl('https://airbnb.co.kr/rooms/12345678')).toBe(true);
  });

  it('should return true for abnb.me short URL', () => {
    expect(isAirbnbUrl('https://abnb.me/abc123')).toBe(true);
  });

  it('should return false for non-airbnb URL', () => {
    expect(isAirbnbUrl('https://www.google.com')).toBe(false);
    expect(isAirbnbUrl('https://www.booking.com/rooms/123')).toBe(false);
  });

  it('should return false for invalid URL', () => {
    expect(isAirbnbUrl('')).toBe(false);
    expect(isAirbnbUrl('not-a-url')).toBe(false);
    expect(isAirbnbUrl(null as unknown as string)).toBe(false);
  });
});

describe('parseAirbnbUrl', () => {
  describe('valid URLs', () => {
    it('should parse standard airbnb.com URL', () => {
      const result = parseAirbnbUrl('https://www.airbnb.com/rooms/12345678');
      expect(result).toEqual({
        listingId: '12345678',
        originalUrl: 'https://www.airbnb.com/rooms/12345678',
        isValid: true,
      });
    });

    it('should parse airbnb.co.kr URL', () => {
      const result = parseAirbnbUrl('https://www.airbnb.co.kr/rooms/87654321');
      expect(result).toEqual({
        listingId: '87654321',
        originalUrl: 'https://www.airbnb.co.kr/rooms/87654321',
        isValid: true,
      });
    });

    it('should parse URL with query parameters', () => {
      const url =
        'https://www.airbnb.co.kr/rooms/12345678?check_in=2024-01-01&check_out=2024-01-02';
      const result = parseAirbnbUrl(url);
      expect(result).toHaveProperty('listingId', '12345678');
      expect(result).toHaveProperty('isValid', true);
    });

    it('should parse URL without www', () => {
      const result = parseAirbnbUrl('https://airbnb.com/rooms/99999999');
      expect(result).toHaveProperty('listingId', '99999999');
    });

    it('should handle URL with trailing slash', () => {
      const result = parseAirbnbUrl('https://www.airbnb.com/rooms/12345678/');
      // URL 패턴이 /rooms/(\d+) 이므로 trailing slash 이전까지만 매칭
      expect(result).toHaveProperty('listingId', '12345678');
    });

    it('should trim whitespace from URL', () => {
      const result = parseAirbnbUrl('  https://www.airbnb.com/rooms/12345678  ');
      expect(result).toHaveProperty('listingId', '12345678');
    });
  });

  describe('invalid URLs', () => {
    it('should return INVALID_URL for empty string', () => {
      const result = parseAirbnbUrl('');
      expect(result).toEqual({
        code: 'INVALID_URL',
        message: 'URL이 제공되지 않았습니다.',
      });
    });

    it('should return INVALID_URL for malformed URL', () => {
      const result = parseAirbnbUrl('not-a-valid-url');
      expect(result).toEqual({
        code: 'INVALID_URL',
        message: '유효한 URL 형식이 아닙니다.',
      });
    });

    it('should return NOT_AIRBNB_URL for non-airbnb domain', () => {
      const result = parseAirbnbUrl('https://www.booking.com/hotel/123');
      expect(result).toHaveProperty('code', 'NOT_AIRBNB_URL');
    });

    it('should return NO_LISTING_ID when no listing ID found', () => {
      const result = parseAirbnbUrl('https://www.airbnb.com/experiences/123');
      expect(result).toHaveProperty('code', 'NO_LISTING_ID');
    });

    it('should return NO_LISTING_ID for airbnb homepage', () => {
      const result = parseAirbnbUrl('https://www.airbnb.com');
      expect(result).toHaveProperty('code', 'NO_LISTING_ID');
    });
  });
});

describe('buildAirbnbUrl', () => {
  it('should build airbnb.co.kr URL for ko-KR locale', () => {
    expect(buildAirbnbUrl('12345678', 'ko-KR')).toBe(
      'https://www.airbnb.co.kr/rooms/12345678'
    );
  });

  it('should build airbnb.com URL for en-US locale', () => {
    expect(buildAirbnbUrl('12345678', 'en-US')).toBe(
      'https://www.airbnb.com/rooms/12345678'
    );
  });

  it('should build airbnb.co.jp URL for ja-JP locale', () => {
    expect(buildAirbnbUrl('12345678', 'ja-JP')).toBe(
      'https://www.airbnb.co.jp/rooms/12345678'
    );
  });

  it('should default to airbnb.co.kr for ko-KR when no locale provided', () => {
    expect(buildAirbnbUrl('12345678')).toBe(
      'https://www.airbnb.co.kr/rooms/12345678'
    );
  });

  it('should fallback to airbnb.com for unknown locale', () => {
    expect(buildAirbnbUrl('12345678', 'xx-XX')).toBe(
      'https://www.airbnb.com/rooms/12345678'
    );
  });
});

describe('cleanAirbnbUrl', () => {
  it('should remove query parameters', () => {
    const url =
      'https://www.airbnb.co.kr/rooms/12345678?check_in=2024-01-01&guests=2';
    expect(cleanAirbnbUrl(url)).toBe(
      'https://www.airbnb.co.kr/rooms/12345678'
    );
  });

  it('should remove hash fragment', () => {
    const url = 'https://www.airbnb.co.kr/rooms/12345678#reviews';
    expect(cleanAirbnbUrl(url)).toBe(
      'https://www.airbnb.co.kr/rooms/12345678'
    );
  });

  it('should return original URL if invalid', () => {
    expect(cleanAirbnbUrl('not-a-url')).toBe('not-a-url');
  });
});

describe('isValidListingId', () => {
  it('should return true for valid 8-digit listing ID', () => {
    expect(isValidListingId('12345678')).toBe(true);
  });

  it('should return true for valid 10-digit listing ID', () => {
    expect(isValidListingId('1234567890')).toBe(true);
  });

  it('should return false for listing ID with letters', () => {
    expect(isValidListingId('abc123')).toBe(false);
  });

  it('should return false for listing ID with special characters', () => {
    expect(isValidListingId('123-456')).toBe(false);
  });

  it('should return false for too short listing ID', () => {
    expect(isValidListingId('12345')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidListingId('')).toBe(false);
  });
});
