// @TASK P1-T1.4 - QuickInfoBlock 타입 정의
// @SPEC docs/planning/06-tasks.md#P1-T1.4
// @DEPRECATED - block.ts로 이동됨 (P1-T1.2)

/**
 * ⚠️ DEPRECATED: src/types/block.ts로 이동
 *
 * QuickInfo 블록 콘텐츠
 * - 체크인/체크아웃 시간, 와이파이, 도어락 정보 등
 */
export interface QuickInfoContent {
  checkIn: string; // HH:mm
  checkOut: string; // HH:mm
  wifi?: {
    ssid: string;
    password: string;
  };
  doorLock?: {
    password: string;
    instructions?: string;
  };
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * 기타 블록 타입들은 src/types/block.ts에 정의됨
 * - HeroContent
 * - QuickInfoContent
 * - AmenitiesContent
 * - RulesContent
 * - MapContent
 * - GalleryContent
 * - NoticeContent
 * - CustomContent
 */
