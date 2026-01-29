// @TASK P8-R2: Branding Validation Schema
// @SPEC specs/domain/resources.yaml - branding resource

import { z } from 'zod';

/**
 * 폰트 프리셋 Enum
 */
export const FontPresetEnum = z.enum([
  'pretendard',
  'noto_sans',
  'nanum_gothic',
  'gmarket_sans',
  'spoqa_han_sans',
]);

export type FontPreset = z.infer<typeof FontPresetEnum>;

/**
 * HEX 색상 검증 (예: #1E40AF)
 */
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, {
    message: 'HEX 색상 형식이 올바르지 않습니다 (예: #1E40AF)',
  })
  .optional()
  .nullable();

/**
 * 브랜딩 생성/수정 요청 스키마
 */
export const BrandingUpdateSchema = z.object({
  logo_url: z.string().url().optional().nullable(),
  favicon_url: z.string().url().optional().nullable(),
  primary_color: hexColorSchema,
  secondary_color: hexColorSchema,
  font_preset: FontPresetEnum.optional(),
  custom_css: z.string().max(10000).optional().nullable(), // 10KB 제한
});

export type BrandingUpdateInput = z.infer<typeof BrandingUpdateSchema>;

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
