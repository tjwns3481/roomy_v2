// @TASK P2-T2.1 - 가이드북 및 블록 타입 정의
// @SPEC docs/planning/04-database-design.md

/**
 * 가이드북 상태
 */
export type GuidebookStatus = 'draft' | 'published' | 'archived';

/**
 * 테마 타입
 */
export type Theme = 'modern' | 'cozy' | 'minimal' | 'nature' | 'luxury';

/**
 * 가이드북 타입
 */
export interface Guidebook {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  airbnb_url: string | null;
  property_type: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: GuidebookStatus;
  is_password_protected: boolean;
  theme: Theme;
  primary_color: string;
  secondary_color: string;
  hero_image_url: string | null;
  og_image_url: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * 블록 타입
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

/**
 * 블록 타입
 */
export interface Block {
  id: string;
  guidebook_id: string;
  type: BlockType;
  order_index: number;
  content: BlockContent;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 블록 콘텐츠 (타입별 구조)
 */
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
 * Hero 블록 콘텐츠
 */
export interface HeroContent {
  type: 'hero';
  imageUrl: string;
  title: string;
  subtitle?: string;
  gradient?: string;
}

/**
 * QuickInfo 블록 콘텐츠
 */
export interface QuickInfoContent {
  type: 'quickInfo';
  items: {
    icon: 'wifi' | 'door' | 'clock' | 'phone' | 'address' | 'custom';
    label: string;
    value: string;
    subtext?: string;
    isSecret?: boolean;
  }[];
}

/**
 * Amenities 블록 콘텐츠
 */
export interface AmenitiesContent {
  type: 'amenities';
  categories: {
    name: string;
    items: {
      icon: string;
      name: string;
      description?: string;
    }[];
  }[];
}

/**
 * Rules 블록 콘텐츠
 */
export interface RulesContent {
  type: 'rules';
  items: {
    icon: 'time' | 'volume' | 'smoking' | 'pet' | 'trash' | 'custom';
    title: string;
    description: string;
    isImportant?: boolean;
  }[];
}

/**
 * Map 블록 콘텐츠
 */
export interface MapContent {
  type: 'map';
  lat: number;
  lng: number;
  address: string;
  naverMapUrl?: string;
  kakaoMapUrl?: string;
  parkingInfo?: string;
}

/**
 * Gallery 블록 콘텐츠
 */
export interface GalleryContent {
  type: 'gallery';
  layout: 'grid' | 'carousel' | 'masonry';
  images: {
    url: string;
    caption?: string;
  }[];
}

/**
 * Notice 블록 콘텐츠
 */
export interface NoticeContent {
  type: 'notice';
  noticeType: 'info' | 'warning' | 'success';
  content: string; // Markdown 지원
}

/**
 * Custom 블록 콘텐츠
 */
export interface CustomContent {
  type: 'custom';
  html: string; // Sanitized HTML
}

/**
 * 가이드북 + 블록 포함
 */
export interface GuidebookWithBlocks extends Guidebook {
  blocks: Block[];
}
