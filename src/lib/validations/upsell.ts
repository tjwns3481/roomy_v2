// @TASK P8-R3: Upsell 아이템 검증 스키마

import { z } from 'zod';

/**
 * Upsell 아이템 생성 스키마
 */
export const createUpsellItemSchema = z.object({
  name: z.string()
    .min(1, '아이템 이름은 필수입니다')
    .max(100, '아이템 이름은 100자 이하여야 합니다'),
  description: z.string()
    .max(500, '설명은 500자 이하여야 합니다')
    .optional(),
  price: z.number()
    .int('가격은 정수여야 합니다')
    .min(0, '가격은 0 이상이어야 합니다')
    .max(10000000, '가격은 1,000만원 이하여야 합니다'),
  image_url: z.string()
    .url('올바른 URL 형식이어야 합니다')
    .optional(),
  is_active: z.boolean()
    .default(true),
  sort_order: z.number()
    .int('정렬 순서는 정수여야 합니다')
    .min(0, '정렬 순서는 0 이상이어야 합니다')
    .default(0),
});

/**
 * Upsell 아이템 수정 스키마
 */
export const updateUpsellItemSchema = z.object({
  name: z.string()
    .min(1, '아이템 이름은 필수입니다')
    .max(100, '아이템 이름은 100자 이하여야 합니다')
    .optional(),
  description: z.string()
    .max(500, '설명은 500자 이하여야 합니다')
    .nullable()
    .optional(),
  price: z.number()
    .int('가격은 정수여야 합니다')
    .min(0, '가격은 0 이상이어야 합니다')
    .max(10000000, '가격은 1,000만원 이하여야 합니다')
    .optional(),
  image_url: z.string()
    .url('올바른 URL 형식이어야 합니다')
    .nullable()
    .optional(),
  is_active: z.boolean()
    .optional(),
  sort_order: z.number()
    .int('정렬 순서는 정수여야 합니다')
    .min(0, '정렬 순서는 0 이상이어야 합니다')
    .optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: '최소 하나의 필드는 수정해야 합니다',
});

export type CreateUpsellItemInput = z.infer<typeof createUpsellItemSchema>;
export type UpdateUpsellItemInput = z.infer<typeof updateUpsellItemSchema>;

/**
 * Upsell 요청 생성 스키마 (게스트)
 */
export const createUpsellRequestSchema = z.object({
  upsell_item_id: z.string()
    .uuid('올바른 아이템 ID 형식이어야 합니다'),
  guest_name: z.string()
    .max(50, '이름은 50자 이하여야 합니다')
    .optional(),
  guest_contact: z.string()
    .max(50, '연락처는 50자 이하여야 합니다')
    .optional(),
  message: z.string()
    .max(500, '메시지는 500자 이하여야 합니다')
    .optional(),
});

/**
 * Upsell 요청 상태 변경 스키마 (호스트)
 */
export const updateUpsellRequestSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled'], {
    errorMap: () => ({ message: '상태는 pending, confirmed, cancelled 중 하나여야 합니다' }),
  }),
});

export type CreateUpsellRequestInput = z.infer<typeof createUpsellRequestSchema>;
export type UpdateUpsellRequestInput = z.infer<typeof updateUpsellRequestSchema>;
