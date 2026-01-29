// @TASK P8-S12-T1 - 리뷰 설정 타입 정의
// @SPEC P8 Screen 12 - Review Settings

/**
 * 리뷰 팝업 표시 타이밍
 */
export type ReviewShowTiming =
  | 'checkout_before' // 체크아웃 전날
  | 'checkout_day' // 체크아웃 당일
  | 'checkout_after_1d' // 체크아웃 후 1일
  | 'checkout_after_2d'; // 체크아웃 후 2일

/**
 * 리뷰 플랫폼
 */
export type ReviewPlatform = 'airbnb' | 'naver' | 'google';

/**
 * 리뷰 설정
 */
export interface ReviewSettings {
  id: string;
  guidebook_id: string;

  // 활성화 여부
  is_enabled: boolean;

  // 리뷰 플랫폼 링크
  airbnb_review_url: string | null;
  naver_place_url: string | null;
  google_maps_url: string | null;

  // 팝업 타이밍 설정
  show_timing: ReviewShowTiming;

  // 커스텀 메시지
  popup_title: string;
  popup_message: string;

  // 통계
  total_shown: number;
  total_clicked: number;

  created_at: string;
  updated_at: string;
}

/**
 * 리뷰 클릭 로그
 */
export interface ReviewClickLog {
  id: string;
  guidebook_id: string;
  platform: ReviewPlatform;
  clicked_at: string;
  user_agent: string | null;
  ip_hash: string | null;
}

/**
 * 리뷰 설정 업데이트 요청
 */
export interface UpdateReviewSettingsRequest {
  is_enabled?: boolean;
  airbnb_review_url?: string | null;
  naver_place_url?: string | null;
  google_maps_url?: string | null;
  show_timing?: ReviewShowTiming;
  popup_title?: string;
  popup_message?: string;
}

/**
 * 리뷰 통계
 */
export interface ReviewStats {
  total_shown: number;
  total_clicked: number;
  click_rate: number; // 클릭률 (%)
}
