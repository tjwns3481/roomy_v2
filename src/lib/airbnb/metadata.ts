/**
 * @TASK P3-T3.1 - 에어비앤비 OG 태그 메타데이터 추출
 * @SPEC docs/planning/06-tasks.md#P3-T3.1
 *
 * 법적/윤리적 고려:
 * - OG 태그는 소셜 미디어 공유를 위해 공개된 정보
 * - 실제 페이지 크롤링이 아닌 메타데이터만 추출
 * - 요청 빈도 제한 및 적절한 User-Agent 사용
 */

import type {
  AirbnbListingMetadata,
  AirbnbMetadataResult,
  AirbnbMetadataError,
} from '@/types/airbnb';

/**
 * 요청 타임아웃 (밀리초)
 */
const FETCH_TIMEOUT = 10000; // 10초

/**
 * User-Agent 헤더 (봇으로 인식되지 않도록)
 */
const USER_AGENT =
  'Mozilla/5.0 (compatible; RoomyBot/1.0; +https://roomy.app)';

/**
 * HTML에서 OG 태그 추출
 *
 * @param html - HTML 문자열
 * @returns OG 태그 메타데이터
 */
export function parseOgTags(html: string): AirbnbListingMetadata {
  const metadata: AirbnbListingMetadata = {
    title: null,
    description: null,
    imageUrl: null,
    url: null,
    siteName: null,
  };

  // OG 태그 패턴 매칭
  const ogPatterns: Record<keyof AirbnbListingMetadata, RegExp[]> = {
    title: [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
      /<title>([^<]+)<\/title>/i,
    ],
    description: [
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    ],
    imageUrl: [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    ],
    url: [
      /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i,
    ],
    siteName: [
      /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i,
    ],
  };

  // 각 메타데이터 필드에 대해 패턴 매칭
  for (const [key, patterns] of Object.entries(ogPatterns)) {
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        // HTML 엔티티 디코딩
        metadata[key as keyof AirbnbListingMetadata] = decodeHtmlEntities(
          match[1].trim()
        );
        break;
      }
    }
  }

  return metadata;
}

/**
 * HTML 엔티티 디코딩
 *
 * @param text - HTML 엔티티가 포함된 텍스트
 * @returns 디코딩된 텍스트
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#47;': '/',
    '&nbsp;': ' ',
  };

  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }

  // 숫자 엔티티 디코딩 (&#123; 형식)
  decoded = decoded.replace(/&#(\d+);/g, (_, num) =>
    String.fromCharCode(parseInt(num, 10))
  );

  // 16진수 엔티티 디코딩 (&#x1F; 형식)
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  return decoded;
}

/**
 * AbortController를 사용한 타임아웃 처리
 *
 * @param timeout - 타임아웃 (밀리초)
 * @returns AbortController
 */
function createTimeoutController(timeout: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
}

/**
 * 에어비앤비 URL에서 메타데이터 가져오기
 *
 * @param url - 에어비앤비 숙소 URL
 * @param listingId - 숙소 ID
 * @returns 메타데이터 추출 결과
 *
 * @example
 * ```typescript
 * const result = await fetchListingMetadata(
 *   'https://www.airbnb.co.kr/rooms/12345678',
 *   '12345678'
 * );
 *
 * if (result.success) {
 *   console.log(result.metadata?.title);
 * }
 * ```
 */
export async function fetchListingMetadata(
  url: string,
  listingId: string
): Promise<AirbnbMetadataResult> {
  const controller = createTimeoutController(FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
      // redirect: 'follow',  // 기본값
    });

    // HTTP 에러 처리
    if (!response.ok) {
      const error = createErrorFromStatus(response.status);
      return {
        success: false,
        listingId,
        metadata: null,
        error,
      };
    }

    // HTML 파싱
    const html = await response.text();

    // 접근 차단 확인 (CAPTCHA, 로그인 필요 등)
    if (isBlocked(html)) {
      return {
        success: false,
        listingId,
        metadata: null,
        error: {
          code: 'BLOCKED',
          message:
            '에어비앤비 페이지 접근이 차단되었습니다. 잠시 후 다시 시도해주세요.',
        },
      };
    }

    // OG 태그 추출
    const metadata = parseOgTags(html);

    return {
      success: true,
      listingId,
      metadata,
    };
  } catch (error) {
    // 타임아웃 에러
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        listingId,
        metadata: null,
        error: {
          code: 'TIMEOUT',
          message: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
        },
      };
    }

    // 네트워크 에러
    return {
      success: false,
      listingId,
      metadata: null,
      error: {
        code: 'FETCH_FAILED',
        message:
          error instanceof Error
            ? `네트워크 오류: ${error.message}`
            : '알 수 없는 네트워크 오류가 발생했습니다.',
      },
    };
  }
}

/**
 * HTTP 상태 코드로 에러 객체 생성
 *
 * @param status - HTTP 상태 코드
 * @returns 에러 객체
 */
function createErrorFromStatus(status: number): AirbnbMetadataError {
  switch (status) {
    case 403:
      return {
        code: 'BLOCKED',
        message: '접근이 거부되었습니다 (403 Forbidden).',
        statusCode: 403,
      };
    case 404:
      return {
        code: 'FETCH_FAILED',
        message: '숙소를 찾을 수 없습니다 (404 Not Found).',
        statusCode: 404,
      };
    case 429:
      return {
        code: 'BLOCKED',
        message:
          '요청이 너무 많습니다. 잠시 후 다시 시도해주세요 (429 Too Many Requests).',
        statusCode: 429,
      };
    case 500:
    case 502:
    case 503:
      return {
        code: 'FETCH_FAILED',
        message: '에어비앤비 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        statusCode: status,
      };
    default:
      return {
        code: 'FETCH_FAILED',
        message: `HTTP 오류가 발생했습니다 (${status}).`,
        statusCode: status,
      };
  }
}

/**
 * 페이지 차단 여부 확인
 *
 * @param html - HTML 문자열
 * @returns 차단 여부
 */
function isBlocked(html: string): boolean {
  const blockedPatterns = [
    /captcha/i,
    /robot/i,
    /blocked/i,
    /access denied/i,
    /please verify/i,
    /unusual traffic/i,
  ];

  // HTML 헤드 부분만 확인 (성능 최적화)
  const headSection = html.substring(0, 5000).toLowerCase();

  return blockedPatterns.some((pattern) => pattern.test(headSection));
}

/**
 * 메타데이터가 유효한지 확인
 *
 * @param metadata - 메타데이터 객체
 * @returns 유효 여부
 */
export function isValidMetadata(
  metadata: AirbnbListingMetadata | null
): boolean {
  if (!metadata) return false;

  // 최소한 제목이 있어야 유효
  return metadata.title !== null && metadata.title.trim().length > 0;
}
