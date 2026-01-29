/**
 * Auth Types Test
 *
 * Zod 스키마 검증 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  authUserSchema,
  profileSchema,
  authStateSchema,
  signUpPayloadSchema,
  signInPayloadSchema,
  updateProfilePayloadSchema,
  UserRole,
} from '@/types/auth';

describe('Auth Types - Zod Schema Validation', () => {
  describe('authUserSchema', () => {
    it('유효한 AuthUser 객체를 통과시킨다', () => {
      const validUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = authUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('잘못된 UUID를 거부한다', () => {
      const invalidUser = {
        id: 'invalid-uuid',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = authUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('잘못된 이메일을 거부한다', () => {
      const invalidUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'invalid-email',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = authUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe('profileSchema', () => {
    it('유효한 Profile 객체를 통과시킨다', () => {
      const validProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        nickname: '테스터',
        avatar_url: 'https://example.com/avatar.jpg',
        role: 'customer' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = profileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('nickname과 avatar_url이 null일 때 통과시킨다', () => {
      const validProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        nickname: null,
        avatar_url: null,
        role: 'customer' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = profileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('잘못된 role을 거부한다', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        nickname: '테스터',
        avatar_url: 'https://example.com/avatar.jpg',
        role: 'invalid-role',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = profileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('잘못된 avatar_url을 거부한다', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        nickname: '테스터',
        avatar_url: 'not-a-url',
        role: 'customer' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = profileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });
  });

  describe('authStateSchema', () => {
    it('유효한 AuthState 객체를 통과시킨다', () => {
      const validState = {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        profile: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          nickname: '테스터',
          avatar_url: 'https://example.com/avatar.jpg',
          role: 'customer' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        isLoading: false,
        isAuthenticated: true,
      };

      const result = authStateSchema.safeParse(validState);
      expect(result.success).toBe(true);
    });

    it('user와 profile이 null일 때 통과시킨다', () => {
      const validState = {
        user: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,
      };

      const result = authStateSchema.safeParse(validState);
      expect(result.success).toBe(true);
    });
  });

  describe('signUpPayloadSchema', () => {
    it('유효한 회원가입 데이터를 통과시킨다', () => {
      const validPayload = {
        email: 'test@example.com',
        password: 'Password123',
        nickname: '테스터',
      };

      const result = signUpPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('nickname이 없어도 통과시킨다', () => {
      const validPayload = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = signUpPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('8자 미만 비밀번호를 거부한다', () => {
      const invalidPayload = {
        email: 'test@example.com',
        password: 'Pass1',
        nickname: '테스터',
      };

      const result = signUpPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.message || result.error.toString();
        expect(errorMessage).toContain('8자');
      }
    });

    it('대소문자와 숫자를 포함하지 않은 비밀번호를 거부한다', () => {
      const invalidPayload = {
        email: 'test@example.com',
        password: 'password',
        nickname: '테스터',
      };

      const result = signUpPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.message || result.error.toString();
        expect(errorMessage).toContain('대소문자');
      }
    });

    it('잘못된 이메일을 거부한다', () => {
      const invalidPayload = {
        email: 'invalid-email',
        password: 'Password123',
        nickname: '테스터',
      };

      const result = signUpPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('2자 미만 닉네임을 거부한다', () => {
      const invalidPayload = {
        email: 'test@example.com',
        password: 'Password123',
        nickname: '테',
      };

      const result = signUpPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.message || result.error.toString();
        expect(errorMessage).toContain('2자');
      }
    });
  });

  describe('signInPayloadSchema', () => {
    it('유효한 로그인 데이터를 통과시킨다', () => {
      const validPayload = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = signInPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('빈 비밀번호를 거부한다', () => {
      const invalidPayload = {
        email: 'test@example.com',
        password: '',
      };

      const result = signInPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('잘못된 이메일을 거부한다', () => {
      const invalidPayload = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = signInPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfilePayloadSchema', () => {
    it('유효한 프로필 업데이트 데이터를 통과시킨다', () => {
      const validPayload = {
        nickname: '새로운닉네임',
        avatar_url: 'https://example.com/new-avatar.jpg',
      };

      const result = updateProfilePayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('nickname만 있어도 통과시킨다', () => {
      const validPayload = {
        nickname: '새로운닉네임',
      };

      const result = updateProfilePayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('avatar_url만 있어도 통과시킨다', () => {
      const validPayload = {
        avatar_url: 'https://example.com/new-avatar.jpg',
      };

      const result = updateProfilePayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('2자 미만 닉네임을 거부한다', () => {
      const invalidPayload = {
        nickname: '테',
      };

      const result = updateProfilePayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('잘못된 URL을 거부한다', () => {
      const invalidPayload = {
        avatar_url: 'not-a-url',
      };

      const result = updateProfilePayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('UserRole', () => {
    it('올바른 role 값을 가진다', () => {
      expect(UserRole.CUSTOMER).toBe('customer');
      expect(UserRole.ADMIN).toBe('admin');
    });
  });
});
