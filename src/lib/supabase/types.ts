/**
 * @TASK P0-T0.3 - Supabase Database Types Re-export
 *
 * 이 파일은 @/types/database.types.ts의 타입을 re-export합니다.
 *
 * [NOTE] database.types.ts는 향후 P0-T0.4 (DB 마이그레이션) 완료 후
 * `npx supabase gen types typescript` 명령으로 자동 생성될 예정입니다.
 * 현재는 수동으로 정의된 타입을 사용합니다.
 *
 * @see https://supabase.com/docs/reference/cli/supabase-gen-types-typescript
 */

import { Database } from '@/types/database.types';

/**
 * 테이블 Row 타입 헬퍼
 * @example
 * type Product = Tables<'products'>;
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/**
 * 테이블 Insert 타입 헬퍼
 * @example
 * type NewProduct = TablesInsert<'products'>;
 */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/**
 * 테이블 Update 타입 헬퍼
 * @example
 * type ProductUpdate = TablesUpdate<'products'>;
 */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

/**
 * Enum 타입 헬퍼
 * @example
 * type OrderStatus = Enums<'order_status'>;
 */
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

export type { Database };
