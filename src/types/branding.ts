// @TASK P8-R2: Branding Types
// @SPEC specs/domain/resources.yaml - branding resource

export type FontPreset =
  | 'pretendard'
  | 'noto_sans'
  | 'nanum_gothic'
  | 'gmarket_sans'
  | 'spoqa_han_sans';

/**
 * DB 브랜딩 타입
 */
export interface Branding {
  id: string;
  guidebook_id: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  font_preset: FontPreset;
  custom_css: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 브랜딩 생성/수정 요청
 */
export interface BrandingUpdateInput {
  logo_url?: string | null;
  favicon_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  font_preset?: FontPreset;
  custom_css?: string | null;
}

/**
 * API 응답
 */
export interface BrandingResponse {
  data: Branding;
}

export interface BrandingErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
