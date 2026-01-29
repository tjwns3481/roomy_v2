/**
 * @TASK P3-T3.1 - 에어비앤비 URL 파서 타입 정의
 * @SPEC docs/planning/06-tasks.md#P3-T3.1
 *
 * 법적/윤리적 고려:
 * - 실제 크롤링 대신 OG 태그 수준의 공개 정보만 추출
 * - 에어비앤비 robots.txt 및 이용약관 준수
 */

// ============================================
// URL 파싱 관련 타입
// ============================================

/**
 * 에어비앤비 URL 파싱 결과
 */
export interface AirbnbUrlParseResult {
  /** 숙소 고유 ID */
  listingId: string;
  /** 원본 URL */
  originalUrl: string;
  /** URL 유효성 */
  isValid: boolean;
}

/**
 * 에어비앤비 URL 파싱 에러
 */
export interface AirbnbUrlParseError {
  code: 'INVALID_URL' | 'NOT_AIRBNB_URL' | 'NO_LISTING_ID';
  message: string;
}

// ============================================
// 메타데이터 관련 타입
// ============================================

/**
 * OG 태그에서 추출한 숙소 메타데이터
 */
export interface AirbnbListingMetadata {
  /** 숙소 제목 (og:title) */
  title: string | null;
  /** 숙소 설명 (og:description) */
  description: string | null;
  /** 대표 이미지 URL (og:image) */
  imageUrl: string | null;
  /** 숙소 URL (og:url) */
  url: string | null;
  /** 사이트명 (og:site_name) */
  siteName: string | null;
}

/**
 * 메타데이터 추출 결과
 */
export interface AirbnbMetadataResult {
  success: boolean;
  listingId: string;
  metadata: AirbnbListingMetadata | null;
  error?: AirbnbMetadataError;
}

/**
 * 메타데이터 추출 에러
 */
export interface AirbnbMetadataError {
  code: 'FETCH_FAILED' | 'PARSE_FAILED' | 'BLOCKED' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
  statusCode?: number;
}

// ============================================
// API 요청/응답 타입
// ============================================

/**
 * /api/airbnb/parse 요청 바디
 */
export interface AirbnbParseRequest {
  url: string;
}

/**
 * /api/airbnb/parse 성공 응답
 */
export interface AirbnbParseSuccessResponse {
  success: true;
  data: {
    listingId: string;
    title: string | null;
    description: string | null;
    imageUrl: string | null;
    url: string | null;
  };
}

/**
 * /api/airbnb/parse 에러 응답
 */
export interface AirbnbParseErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * /api/airbnb/parse 응답 타입 유니온
 */
export type AirbnbParseResponse = AirbnbParseSuccessResponse | AirbnbParseErrorResponse;

// ============================================
// 수동 입력 폼 타입 (권장 방식)
// ============================================

/**
 * 사용자가 직접 입력하는 숙소 정보
 * 에어비앤비 페이지에서 복사-붙여넣기 용도
 */
export interface ManualListingInput {
  /** 숙소 제목 */
  title: string;
  /** 숙소 설명 */
  description: string;
  /** 주소 */
  address: string;
  /** 편의시설 목록 */
  amenities: string[];
  /** 체크인 시간 */
  checkIn: string;
  /** 체크아웃 시간 */
  checkOut: string;
  /** 숙소 규칙 */
  houseRules: string[];
  /** 사진 URL 목록 */
  photos: string[];
  /** 호스트 이름 (선택) */
  hostName?: string;
  /** Wi-Fi 정보 (선택) */
  wifiInfo?: {
    networkName: string;
    password: string;
  };
}

/**
 * 수동 입력 검증 결과
 */
export interface ManualInputValidation {
  isValid: boolean;
  errors: {
    field: keyof ManualListingInput;
    message: string;
  }[];
}
