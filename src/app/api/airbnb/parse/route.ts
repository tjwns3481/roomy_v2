/**
 * @TASK P3-T3.1 - 에어비앤비 URL 파싱 API
 * @SPEC docs/planning/06-tasks.md#P3-T3.1
 *
 * POST /api/airbnb/parse
 * 에어비앤비 URL에서 숙소 정보를 추출합니다.
 *
 * 법적/윤리적 고려:
 * - OG 태그 수준의 공개 정보만 추출
 * - 요청 빈도 제한 적용
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  parseAirbnbUrl,
  fetchListingMetadata,
  isValidMetadata,
} from '@/lib/airbnb';
import type {
  AirbnbParseRequest,
  AirbnbParseSuccessResponse,
  AirbnbParseErrorResponse,
} from '@/types/airbnb';

/**
 * 요청 빈도 제한 (간단한 메모리 기반 구현)
 * 프로덕션에서는 Redis 등 사용 권장
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1분
const RATE_LIMIT_MAX = 10; // 분당 최대 10회

/**
 * 요청 빈도 확인
 *
 * @param ip - 클라이언트 IP
 * @returns 허용 여부
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * 에러 응답 생성
 */
function errorResponse(
  code: string,
  message: string,
  status: number = 400
): NextResponse<AirbnbParseErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error: { code, message },
    },
    { status }
  );
}

/**
 * POST /api/airbnb/parse
 *
 * 요청 바디:
 * ```json
 * {
 *   "url": "https://www.airbnb.co.kr/rooms/12345678"
 * }
 * ```
 *
 * 성공 응답:
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "listingId": "12345678",
 *     "title": "숙소 제목",
 *     "description": "숙소 설명",
 *     "imageUrl": "https://...",
 *     "url": "https://..."
 *   }
 * }
 * ```
 *
 * 에러 응답:
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "code": "INVALID_URL",
 *     "message": "에러 메시지"
 *   }
 * }
 * ```
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<AirbnbParseSuccessResponse | AirbnbParseErrorResponse>> {
  // 클라이언트 IP 추출 (프록시 환경 고려)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // 요청 빈도 확인
  if (!checkRateLimit(ip)) {
    return errorResponse(
      'RATE_LIMIT_EXCEEDED',
      '요청이 너무 많습니다. 1분 후 다시 시도해주세요.',
      429
    );
  }

  // 요청 바디 파싱
  let body: AirbnbParseRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse('INVALID_REQUEST', '요청 본문을 파싱할 수 없습니다.');
  }

  // URL 필드 검증
  const { url } = body;
  if (!url || typeof url !== 'string') {
    return errorResponse('INVALID_REQUEST', 'url 필드가 필요합니다.');
  }

  // URL 길이 제한 (보안)
  if (url.length > 2000) {
    return errorResponse('INVALID_URL', 'URL이 너무 깁니다.');
  }

  // 에어비앤비 URL 파싱
  const parseResult = parseAirbnbUrl(url);

  // 파싱 에러 처리
  if ('code' in parseResult) {
    return errorResponse(parseResult.code, parseResult.message);
  }

  // 메타데이터 가져오기
  const metadataResult = await fetchListingMetadata(
    parseResult.originalUrl,
    parseResult.listingId
  );

  // 메타데이터 추출 실패
  if (!metadataResult.success || !isValidMetadata(metadataResult.metadata)) {
    // 메타데이터 실패해도 listingId는 반환
    // (사용자가 수동으로 정보 입력 가능)
    if (metadataResult.error) {
      console.warn(
        `[Airbnb Parser] Metadata fetch failed for ${parseResult.listingId}:`,
        metadataResult.error
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        listingId: parseResult.listingId,
        title: metadataResult.metadata?.title || null,
        description: metadataResult.metadata?.description || null,
        imageUrl: metadataResult.metadata?.imageUrl || null,
        url: parseResult.originalUrl,
      },
    });
  }

  // 성공 응답
  return NextResponse.json({
    success: true,
    data: {
      listingId: parseResult.listingId,
      title: metadataResult.metadata!.title,
      description: metadataResult.metadata!.description,
      imageUrl: metadataResult.metadata!.imageUrl,
      url: metadataResult.metadata!.url || parseResult.originalUrl,
    },
  });
}

/**
 * OPTIONS /api/airbnb/parse
 * CORS preflight 요청 처리
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
