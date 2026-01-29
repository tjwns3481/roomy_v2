// @TASK P8-R3: Upsell 아이템 타입 정의

/**
 * Upsell 아이템 (DB 스키마)
 */
export interface UpsellItem {
  id: string;
  guidebook_id: string;
  name: string;
  description: string | null;
  price: number; // 원 단위
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Upsell 아이템 생성 요청
 */
export interface CreateUpsellItemRequest {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active?: boolean;
  sort_order?: number;
}

/**
 * Upsell 아이템 수정 요청
 */
export interface UpdateUpsellItemRequest {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  is_active?: boolean;
  sort_order?: number;
}

/**
 * Upsell 아이템 목록 응답
 */
export interface UpsellItemsResponse {
  items: UpsellItem[];
  total: number;
}

/**
 * Upsell 아이템 생성/수정 응답
 */
export interface UpsellItemResponse {
  item: UpsellItem;
}

/**
 * Upsell 요청 상태
 */
export type UpsellRequestStatus = 'pending' | 'confirmed' | 'cancelled';

/**
 * Upsell 요청 (DB 스키마)
 */
export interface UpsellRequest {
  id: string;
  upsell_item_id: string;
  guidebook_id: string;
  guest_name: string | null;
  guest_contact: string | null;
  message: string | null;
  status: UpsellRequestStatus;
  created_at: string;
}

/**
 * Upsell 요청 생성 요청 (게스트)
 */
export interface CreateUpsellRequestRequest {
  upsell_item_id: string;
  guest_name?: string;
  guest_contact?: string;
  message?: string;
}

/**
 * Upsell 요청 상태 변경 요청 (호스트)
 */
export interface UpdateUpsellRequestRequest {
  status: UpsellRequestStatus;
}

/**
 * Upsell 요청 목록 응답
 */
export interface UpsellRequestsResponse {
  requests: (UpsellRequest & {
    item_name: string;
    item_price: number;
  })[];
  total: number;
  stats: {
    pending: number;
    confirmed: number;
    cancelled: number;
  };
}

/**
 * Upsell 요청 생성/수정 응답
 */
export interface UpsellRequestResponse {
  request: UpsellRequest;
}
