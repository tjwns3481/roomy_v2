/**
 * @TASK P3-T3.1 - 에어비앤비 URL 파서 및 메타데이터 추출
 * @SPEC docs/planning/06-tasks.md#P3-T3.1
 *
 * 법적/윤리적 고려:
 * - OG 태그는 소셜 미디어 공유를 위해 공개된 정보
 * - 실제 페이지 크롤링이 아닌 메타데이터만 추출
 */

// URL 파서
export {
  parseAirbnbUrl,
  isAirbnbUrl,
  buildAirbnbUrl,
  cleanAirbnbUrl,
  isValidListingId,
} from './parser';

// 메타데이터 추출
export {
  fetchListingMetadata,
  parseOgTags,
  isValidMetadata,
} from './metadata';

// 타입 재내보내기
export type {
  AirbnbUrlParseResult,
  AirbnbUrlParseError,
  AirbnbListingMetadata,
  AirbnbMetadataResult,
  AirbnbMetadataError,
  AirbnbParseRequest,
  AirbnbParseResponse,
  AirbnbParseSuccessResponse,
  AirbnbParseErrorResponse,
  ManualListingInput,
  ManualInputValidation,
} from '@/types/airbnb';
