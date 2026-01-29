// @TASK P5-T5.5 - 공유 통계 타입 정의
// @SPEC docs/planning/06-tasks.md#P5-T5.5

/**
 * 공유 이벤트 타입
 */
export type ShareEventType =
  | 'link_copy'
  | 'qr_download'
  | 'social_share'
  | 'short_url_click';

/**
 * 소셜 공유 플랫폼
 */
export type SocialPlatform = 'kakao' | 'twitter' | 'facebook';

/**
 * 공유 이벤트 데이터
 */
export interface ShareEventData {
  platform?: SocialPlatform;
  [key: string]: unknown;
}

/**
 * 공유 이벤트 기록 요청
 */
export interface TrackShareEventRequest {
  guidebookId: string;
  eventType: ShareEventType;
  eventData?: ShareEventData;
}

/**
 * 공유 이벤트
 */
export interface ShareEvent {
  id: string;
  guidebook_id: string;
  event_type: ShareEventType;
  event_data: ShareEventData;
  visitor_id: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * 소셜 공유 통계
 */
export interface SocialShareStats {
  kakao: number;
  twitter: number;
  facebook: number;
}

/**
 * 공유 통계 요약
 */
export interface ShareStatsSummary {
  totalShares: number;
  shortUrlClicks: number;
  linkCopies: number;
  qrDownloads: number;
  socialShares: SocialShareStats;
}

/**
 * 일별 공유 통계
 */
export interface DailyShareStat {
  date: string;
  count: number;
  linkCopies: number;
  qrDownloads: number;
  socialShares: number;
}

/**
 * 공유 통계 응답
 */
export interface ShareStatsResponse {
  success: boolean;
  data: {
    guidebookId: string;
    period: '7d' | '30d' | 'all';
    summary: ShareStatsSummary;
    dailyStats: DailyShareStat[];
  };
}

/**
 * 공유 통계 조회 기간
 */
export type ShareStatsPeriod = '7d' | '30d' | 'all';
