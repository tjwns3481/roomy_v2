/**
 * @TASK P3-T3.1 - 에어비앤비 URL 파서
 * @SPEC docs/planning/06-tasks.md#P3-T3.1
 *
 * 에어비앤비 URL에서 숙소 ID를 추출하는 유틸리티
 */

import type { AirbnbUrlParseResult, AirbnbUrlParseError } from '@/types/airbnb';

/**
 * 지원하는 에어비앤비 URL 패턴
 *
 * 1. 표준 룸 URL: https://www.airbnb.co.kr/rooms/12345678
 * 2. 짧은 URL: https://airbnb.com/rooms/12345678
 * 3. 쿼리 파라미터 포함: https://www.airbnb.co.kr/rooms/12345678?check_in=...
 * 4. 다양한 도메인: airbnb.com, airbnb.co.kr, airbnb.co.jp 등
 */
const AIRBNB_URL_PATTERNS = [
  // 표준 /rooms/ 패턴 (모든 에어비앤비 도메인)
  /^https?:\/\/(?:www\.)?airbnb\.[a-z.]+\/rooms\/(\d+)/i,
  // /h/homes/ 패턴 (일부 지역에서 사용)
  /^https?:\/\/(?:www\.)?airbnb\.[a-z.]+\/h\/homes\/(\d+)/i,
  // 단축 URL 패턴 (abnb.me)
  /^https?:\/\/(?:www\.)?abnb\.me\/([a-zA-Z0-9]+)/i,
];

/**
 * 에어비앤비 URL 유효성 검사
 *
 * @param url - 검사할 URL
 * @returns 에어비앤비 URL 여부
 */
export function isAirbnbUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url.trim());
    const hostname = urlObj.hostname.toLowerCase();

    // 에어비앤비 도메인 확인
    return (
      hostname.includes('airbnb.') ||
      hostname === 'abnb.me' ||
      hostname === 'www.abnb.me'
    );
  } catch {
    return false;
  }
}

/**
 * 에어비앤비 URL에서 숙소 ID 추출
 *
 * @param url - 에어비앤비 숙소 URL
 * @returns 파싱 결과 또는 에러
 *
 * @example
 * ```typescript
 * const result = parseAirbnbUrl('https://www.airbnb.co.kr/rooms/12345678');
 * if ('listingId' in result) {
 *   console.log(result.listingId); // '12345678'
 * }
 * ```
 */
export function parseAirbnbUrl(
  url: string
): AirbnbUrlParseResult | AirbnbUrlParseError {
  // 입력 검증
  if (!url || typeof url !== 'string') {
    return {
      code: 'INVALID_URL',
      message: 'URL이 제공되지 않았습니다.',
    };
  }

  const trimmedUrl = url.trim();

  // URL 형식 검증
  try {
    new URL(trimmedUrl);
  } catch {
    return {
      code: 'INVALID_URL',
      message: '유효한 URL 형식이 아닙니다.',
    };
  }

  // 에어비앤비 URL 확인
  if (!isAirbnbUrl(trimmedUrl)) {
    return {
      code: 'NOT_AIRBNB_URL',
      message: '에어비앤비 URL이 아닙니다. airbnb.com 또는 airbnb.co.kr 형식의 URL을 입력해주세요.',
    };
  }

  // 패턴 매칭으로 숙소 ID 추출
  for (const pattern of AIRBNB_URL_PATTERNS) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return {
        listingId: match[1],
        originalUrl: trimmedUrl,
        isValid: true,
      };
    }
  }

  // 숙소 ID를 찾지 못한 경우
  return {
    code: 'NO_LISTING_ID',
    message: 'URL에서 숙소 ID를 찾을 수 없습니다. /rooms/숫자 형식의 URL을 입력해주세요.',
  };
}

/**
 * 에어비앤비 숙소 URL 생성
 *
 * @param listingId - 숙소 ID
 * @param locale - 로케일 (기본값: 'ko-KR')
 * @returns 에어비앤비 숙소 URL
 *
 * @example
 * ```typescript
 * const url = buildAirbnbUrl('12345678');
 * // 'https://www.airbnb.co.kr/rooms/12345678'
 * ```
 */
export function buildAirbnbUrl(
  listingId: string,
  locale: string = 'ko-KR'
): string {
  // 로케일에 따른 도메인 매핑
  const domainMap: Record<string, string> = {
    'ko-KR': 'airbnb.co.kr',
    'ja-JP': 'airbnb.co.jp',
    'zh-CN': 'airbnb.cn',
    'en-US': 'airbnb.com',
    'en-GB': 'airbnb.co.uk',
  };

  const domain = domainMap[locale] || 'airbnb.com';
  return `https://www.${domain}/rooms/${listingId}`;
}

/**
 * URL에서 쿼리 파라미터 제거
 *
 * @param url - 원본 URL
 * @returns 쿼리 파라미터가 제거된 URL
 */
export function cleanAirbnbUrl(url: string): string {
  try {
    const urlObj = new URL(url.trim());
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

/**
 * 숙소 ID 유효성 검사
 *
 * @param listingId - 검사할 숙소 ID
 * @returns 유효한 숙소 ID 여부
 */
export function isValidListingId(listingId: string): boolean {
  // 숙소 ID는 숫자로만 구성되어야 함 (일반적으로 6-10자리)
  return /^\d{6,15}$/.test(listingId);
}
