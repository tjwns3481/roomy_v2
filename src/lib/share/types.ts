// @TASK P5-T5.1 - 공유 링크 타입 정의
// @SPEC docs/planning/02-trd.md#공유-시스템

/**
 * 단축 URL 정보
 */
export interface ShortUrl {
  id: string;
  guidebookId: string;
  shortCode: string;
  expiresAt: string | null;
  clicks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 공유 링크 응답
 */
export interface ShareLinkResponse {
  /** 전체 URL (roomy.app/g/{slug}) */
  fullUrl: string;
  /** 단축 URL (roomy.app/s/{code}) */
  shortUrl: string;
  /** 단축 코드 */
  shortCode: string;
  /** QR 코드 URL (선택, T5.2에서 추가) */
  qrCodeUrl?: string;
  /** 클릭 수 */
  clicks: number;
  /** 만료일 (null이면 무기한) */
  expiresAt: string | null;
  /** 활성화 여부 */
  isActive: boolean;
  /** 생성 일시 */
  createdAt: string;
}

/**
 * 공유 링크 생성 요청
 */
export interface CreateShareLinkRequest {
  guidebookId: string;
  /** 만료 기간 (일) - null이면 무기한 */
  expiresInDays?: number | null;
}

/**
 * 공유 링크 통계
 */
export interface ShareLinkStats {
  shortCode: string;
  clicks: number;
  createdAt: string;
  lastClickedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

/**
 * 단축 URL 테이블 Row 타입 (Supabase)
 */
export interface ShortUrlRow {
  id: string;
  guidebook_id: string;
  short_code: string;
  expires_at: string | null;
  clicks: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * RPC 함수 반환 타입: create_short_url
 */
export interface CreateShortUrlResult {
  id: string;
  short_code: string;
  expires_at: string | null;
}

/**
 * RPC 함수 반환 타입: increment_short_url_clicks
 */
export interface IncrementClicksResult {
  guidebook_slug: string | null;
  is_expired: boolean | null;
}
