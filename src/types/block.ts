// @TASK P1-T1.2 - 블록 타입 정의 완성 (8종)
// @SPEC docs/planning/06-tasks.md#P1-T1.2

import { z } from 'zod';

/**
 * 블록 타입 enum
 * - hero: 히어로 이미지 + 제목
 * - quickInfo: 체크인/아웃, 와이파이, 도어락
 * - amenities: 편의시설 목록
 * - rules: 하우스 규칙 + 체크아웃 체크리스트
 * - map: 지도 + 주변 추천 장소
 * - gallery: 이미지 갤러리
 * - notice: 공지사항
 * - custom: 커스텀 HTML/Markdown
 */
export type BlockType =
  | 'hero'
  | 'quickInfo'
  | 'amenities'
  | 'rules'
  | 'map'
  | 'gallery'
  | 'notice'
  | 'custom';

// ========================================
// HeroContent
// ========================================
export interface HeroContent {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number; // 0-100
}

export const heroContentSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요'),
  subtitle: z.string().optional(),
  backgroundImage: z.string().url('유효한 URL을 입력하세요').optional(),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(100).optional(),
});

// ========================================
// QuickInfoContent
// ========================================
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

export const quickInfoContentSchema = z.object({
  checkIn: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식: HH:mm'),
  checkOut: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식: HH:mm'),
  wifi: z
    .object({
      ssid: z.string().min(1, 'SSID를 입력하세요'),
      password: z.string().min(1, '비밀번호를 입력하세요'),
    })
    .optional(),
  doorLock: z
    .object({
      password: z.string().min(1, '비밀번호를 입력하세요'),
      instructions: z.string().optional(),
    })
    .optional(),
  address: z.string().min(1, '주소를 입력하세요'),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
});

// ========================================
// AmenitiesContent
// ========================================
export interface AmenitiesContent {
  items: Array<{
    id: string;
    name: string;
    icon: string;
    available: boolean;
  }>;
}

export const amenitiesContentSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, '편의시설 이름을 입력하세요'),
      icon: z.string().min(1, '아이콘을 선택하세요'),
      available: z.boolean(),
    })
  ),
});

/**
 * 기본 편의시설 프리셋
 */
export const DEFAULT_AMENITIES: AmenitiesContent['items'] = [
  { id: '1', name: '무선 인터넷', icon: 'wifi', available: true },
  { id: '2', name: '에어컨', icon: 'snowflake', available: true },
  { id: '3', name: '난방', icon: 'flame', available: true },
  { id: '4', name: 'TV', icon: 'tv', available: true },
  { id: '5', name: '세탁기', icon: 'washer', available: true },
  { id: '6', name: '냉장고', icon: 'refrigerator', available: true },
  { id: '7', name: '전자레인지', icon: 'microwave', available: true },
  { id: '8', name: '헤어드라이어', icon: 'hair-dryer', available: true },
  { id: '9', name: '다리미', icon: 'iron', available: true },
  { id: '10', name: '욕조', icon: 'bathtub', available: false },
  { id: '11', name: '주차', icon: 'parking', available: false },
  { id: '12', name: '엘리베이터', icon: 'elevator', available: false },
];

// ========================================
// RulesContent
// ========================================
export interface RulesContent {
  sections: Array<{
    id: string;
    title: string;
    items: string[];
    icon?: string;
  }>;
  checkoutChecklist?: string[];
}

export const rulesContentSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(1, '섹션 제목을 입력하세요'),
      items: z.array(z.string().min(1, '규칙을 입력하세요')),
      icon: z.string().optional(),
    })
  ),
  checkoutChecklist: z.array(z.string()).optional(),
});

// ========================================
// MapContent
// ========================================
export interface MapContent {
  center: { lat: number; lng: number };
  zoom: number; // 1-21
  markers: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    category: 'accommodation' | 'restaurant' | 'convenience' | 'attraction' | 'transport';
  }>;
  provider: 'naver' | 'kakao';
}

export const mapContentSchema = z.object({
  center: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  zoom: z.number().min(1).max(21),
  markers: z.array(
    z.object({
      id: z.string(),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      title: z.string().min(1, '장소 이름을 입력하세요'),
      category: z.enum(['accommodation', 'restaurant', 'convenience', 'attraction', 'transport']),
    })
  ),
  provider: z.enum(['naver', 'kakao']),
});

// ========================================
// GalleryContent
// ========================================
export interface GalleryContent {
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    caption?: string;
  }>;
  layout: 'grid' | 'slider';
}

export const galleryContentSchema = z.object({
  images: z.array(
    z.object({
      id: z.string(),
      url: z.string().url('유효한 URL을 입력하세요'),
      alt: z.string().optional(),
      caption: z.string().optional(),
    })
  ),
  layout: z.enum(['grid', 'slider']),
});

// ========================================
// NoticeContent
// ========================================
export interface NoticeContent {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'danger';
  dismissible?: boolean;
}

export const noticeContentSchema = z.object({
  title: z.string().min(1, '공지 제목을 입력하세요'),
  content: z.string().min(1, '공지 내용을 입력하세요'),
  type: z.enum(['info', 'warning', 'danger']),
  dismissible: z.boolean().optional(),
});

// ========================================
// CustomContent
// ========================================
export interface CustomContent {
  title?: string;
  content: string; // HTML or Markdown
}

export const customContentSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, '내용을 입력하세요'),
});

// ========================================
// Union Type: BlockContent
// ========================================
export type BlockContent =
  | HeroContent
  | QuickInfoContent
  | AmenitiesContent
  | RulesContent
  | MapContent
  | GalleryContent
  | NoticeContent
  | CustomContent;

/**
 * 블록 타입별 스키마 매핑
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blockContentSchemas: Record<BlockType, z.ZodSchema<any>> = {
  hero: heroContentSchema,
  quickInfo: quickInfoContentSchema,
  amenities: amenitiesContentSchema,
  rules: rulesContentSchema,
  map: mapContentSchema,
  gallery: galleryContentSchema,
  notice: noticeContentSchema,
  custom: customContentSchema,
};
