/**
 * @TASK P3-T3.2 - 프롬프트 함수 테스트
 * @TEST src/lib/openai/prompts.ts
 */

import { describe, it, expect } from 'vitest';
import {
  buildUserPrompt,
  estimateTokenCount,
  validateListingInput,
  GUIDEBOOK_SYSTEM_PROMPT,
} from '@/lib/openai/prompts';
import type { ListingInput } from '@/types/ai';

// ============================================
// 테스트 데이터
// ============================================

const validInput: ListingInput = {
  title: '강남 모던 아파트',
  description: '강남역 도보 5분 거리의 깨끗하고 모던한 아파트입니다.',
  address: '서울시 강남구 역삼동 123-45',
  amenities: ['무선 인터넷', 'TV', '에어컨', '세탁기'],
  checkIn: '15:00',
  checkOut: '11:00',
  hostName: '김호스트',
  houseRules: ['금연', '파티 금지', '22시 이후 정숙'],
};

const minimalInput: ListingInput = {
  title: '테스트 숙소',
  description: '테스트용 숙소입니다.',
  address: '서울시 테스트구',
  amenities: [],
};

// ============================================
// GUIDEBOOK_SYSTEM_PROMPT 테스트
// ============================================

describe('GUIDEBOOK_SYSTEM_PROMPT', () => {
  it('시스템 프롬프트가 정의되어 있어야 함', () => {
    expect(GUIDEBOOK_SYSTEM_PROMPT).toBeDefined();
    expect(typeof GUIDEBOOK_SYSTEM_PROMPT).toBe('string');
  });

  it('시스템 프롬프트에 필수 지침이 포함되어야 함', () => {
    expect(GUIDEBOOK_SYSTEM_PROMPT).toContain('한국');
    expect(GUIDEBOOK_SYSTEM_PROMPT).toContain('JSON');
    expect(GUIDEBOOK_SYSTEM_PROMPT).toContain('blocks');
  });

  it('시스템 프롬프트에 블록 타입 가이드가 포함되어야 함', () => {
    expect(GUIDEBOOK_SYSTEM_PROMPT).toContain('hero');
    expect(GUIDEBOOK_SYSTEM_PROMPT).toContain('quickInfo');
    expect(GUIDEBOOK_SYSTEM_PROMPT).toContain('amenities');
    expect(GUIDEBOOK_SYSTEM_PROMPT).toContain('rules');
    expect(GUIDEBOOK_SYSTEM_PROMPT).toContain('notice');
  });
});

// ============================================
// buildUserPrompt 테스트
// ============================================

describe('buildUserPrompt', () => {
  it('필수 정보가 포함된 프롬프트를 생성해야 함', () => {
    const prompt = buildUserPrompt(validInput);

    expect(prompt).toContain(validInput.title);
    expect(prompt).toContain(validInput.description);
    expect(prompt).toContain(validInput.address);
  });

  it('체크인/체크아웃 시간이 포함되어야 함', () => {
    const prompt = buildUserPrompt(validInput);

    expect(prompt).toContain('15:00');
    expect(prompt).toContain('11:00');
  });

  it('편의시설 목록이 포함되어야 함', () => {
    const prompt = buildUserPrompt(validInput);

    validInput.amenities.forEach((amenity) => {
      expect(prompt).toContain(amenity);
    });
  });

  it('숙소 규칙이 포함되어야 함', () => {
    const prompt = buildUserPrompt(validInput);

    validInput.houseRules?.forEach((rule) => {
      expect(prompt).toContain(rule);
    });
  });

  it('호스트 이름이 포함되어야 함', () => {
    const prompt = buildUserPrompt(validInput);

    expect(prompt).toContain(validInput.hostName);
  });

  it('최소 입력으로도 프롬프트를 생성해야 함', () => {
    const prompt = buildUserPrompt(minimalInput);

    expect(prompt).toContain(minimalInput.title);
    expect(prompt).toContain(minimalInput.description);
    expect(prompt).toContain(minimalInput.address);
  });

  it('선택 필드가 없으면 해당 섹션이 없어야 함', () => {
    const prompt = buildUserPrompt(minimalInput);

    // 편의시설이 비어있으면 섹션이 없음
    expect(prompt).not.toContain('## 숙소 규칙');
  });

  it('이미지 URL이 있으면 포함되어야 함', () => {
    const inputWithImage: ListingInput = {
      ...minimalInput,
      imageUrl: 'https://example.com/image.jpg',
    };
    const prompt = buildUserPrompt(inputWithImage);

    expect(prompt).toContain(inputWithImage.imageUrl);
  });

  it('숙소 유형이 있으면 포함되어야 함', () => {
    const inputWithType: ListingInput = {
      ...minimalInput,
      propertyType: '아파트',
    };
    const prompt = buildUserPrompt(inputWithType);

    expect(prompt).toContain('아파트');
  });
});

// ============================================
// estimateTokenCount 테스트
// ============================================

describe('estimateTokenCount', () => {
  it('빈 문자열은 0 토큰이어야 함', () => {
    expect(estimateTokenCount('')).toBe(0);
  });

  it('짧은 문자열의 토큰 수를 추정해야 함', () => {
    const text = 'Hello World'; // 11자 => 약 3 토큰
    const tokens = estimateTokenCount(text);
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThanOrEqual(5);
  });

  it('긴 문자열의 토큰 수를 추정해야 함', () => {
    const text = 'a'.repeat(400); // 400자 => 약 100 토큰
    const tokens = estimateTokenCount(text);
    expect(tokens).toBe(100);
  });

  it('한글 문자열의 토큰 수를 추정해야 함', () => {
    const text = '안녕하세요 반갑습니다'; // 11자 => 약 3 토큰
    const tokens = estimateTokenCount(text);
    expect(tokens).toBeGreaterThan(0);
  });
});

// ============================================
// validateListingInput 테스트
// ============================================

describe('validateListingInput', () => {
  it('유효한 입력은 valid: true를 반환해야 함', () => {
    const result = validateListingInput(validInput);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('최소 입력도 유효해야 함', () => {
    const result = validateListingInput(minimalInput);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('제목이 없으면 에러를 반환해야 함', () => {
    const input: ListingInput = { ...minimalInput, title: '' };
    const result = validateListingInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('숙소 제목은 필수입니다');
  });

  it('설명이 없으면 에러를 반환해야 함', () => {
    const input: ListingInput = { ...minimalInput, description: '' };
    const result = validateListingInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('숙소 설명은 필수입니다');
  });

  it('주소가 없으면 에러를 반환해야 함', () => {
    const input: ListingInput = { ...minimalInput, address: '' };
    const result = validateListingInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('주소는 필수입니다');
  });

  it('여러 필드가 없으면 여러 에러를 반환해야 함', () => {
    const input: ListingInput = {
      title: '',
      description: '',
      address: '',
      amenities: [],
    };
    const result = validateListingInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(3);
  });

  it('공백만 있는 필드도 에러를 반환해야 함', () => {
    const input: ListingInput = { ...minimalInput, title: '   ' };
    const result = validateListingInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('숙소 제목은 필수입니다');
  });

  it('amenities가 배열이 아니면 에러를 반환해야 함', () => {
    const input = {
      title: '테스트',
      description: '테스트',
      address: '테스트',
      amenities: 'not an array' as any,
    };
    const result = validateListingInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('편의시설은 배열이어야 합니다');
  });
});
