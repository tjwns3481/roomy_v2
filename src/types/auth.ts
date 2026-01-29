/**
 * Authentication Types
 *
 * Supabase Auth와 연동되는 사용자 인증 관련 타입 정의
 * Zod 스키마를 포함하여 런타임 검증 지원
 */

import { z } from 'zod';

/**
 * User Role Enum
 * - customer: 일반 사용자
 * - admin: 관리자
 */
export const UserRole = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Zod Schema: User Role
export const userRoleSchema = z.enum(['customer', 'admin']);

/**
 * AuthUser
 * Supabase Auth User 객체 (auth.users 테이블)
 */
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Zod Schema: AuthUser
export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * Profile
 * 사용자 프로필 (public.profiles 테이블)
 */
export interface Profile {
  id: string;
  email: string;
  nickname?: string | null; // 기존 호환성
  display_name?: string | null;
  avatar_url: string | null;
  plan?: 'free' | 'pro' | 'business'; // Roomy 전용
  role?: UserRole;
  grade?: 'bronze' | 'silver' | 'gold' | 'vip';
  points?: number;
  total_order_amount?: number;
  is_blocked?: boolean;
  blocked_reason?: string | null;
  blocked_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Zod Schema: Profile
export const profileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  plan: z.enum(['free', 'pro', 'business']).optional(),
  role: userRoleSchema.optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * AuthState
 * Zustand Store에서 사용할 인증 상태
 */
export interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Zod Schema: AuthState
export const authStateSchema = z.object({
  user: authUserSchema.nullable(),
  profile: profileSchema.nullable(),
  isLoading: z.boolean(),
  isAuthenticated: z.boolean(),
});

/**
 * Sign Up Payload
 * 회원가입 시 요청 데이터
 */
export interface SignUpPayload {
  email: string;
  password: string;
  nickname?: string;
}

// Zod Schema: Sign Up Payload
export const signUpPayloadSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      '비밀번호는 대소문자와 숫자를 포함해야 합니다'
    ),
  nickname: z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다').optional(),
});

/**
 * Sign In Payload
 * 로그인 시 요청 데이터
 */
export interface SignInPayload {
  email: string;
  password: string;
}

// Zod Schema: Sign In Payload
export const signInPayloadSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

/**
 * Update Profile Payload
 * 프로필 업데이트 시 요청 데이터
 */
export interface UpdateProfilePayload {
  nickname?: string; // 호환성
  display_name?: string;
  avatar_url?: string;
}

// Zod Schema: Update Profile Payload
export const updateProfilePayloadSchema = z.object({
  nickname: z.string().min(2, '이름은 최소 2자 이상이어야 합니다').optional(),
  display_name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다').optional(),
  avatar_url: z.string().url('유효한 URL을 입력해주세요').optional(),
});
