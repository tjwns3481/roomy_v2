/**
 * @TASK P3-T3.2 - 콘텐츠 생성 함수 테스트
 * @TEST src/lib/openai/generator.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseBlocksFromResponse, AIGenerationError } from '@/lib/openai/generator';

// ============================================
// parseBlocksFromResponse 테스트
// ============================================

describe('parseBlocksFromResponse', () => {
  describe('유효한 응답 파싱', () => {
    it('hero 블록을 파싱해야 함', () => {
      const response = JSON.stringify({
        blocks: [
          {
            type: 'hero',
            content: {
              type: 'hero',
              title: '환영합니다',
              subtitle: '편안한 숙소',
            },
          },
        ],
      });

      const blocks = parseBlocksFromResponse(response);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('hero');
      expect(blocks[0].content).toHaveProperty('title', '환영합니다');
    });

    it('여러 블록을 파싱해야 함', () => {
      const response = JSON.stringify({
        blocks: [
          { type: 'hero', content: { type: 'hero', title: 'Test' } },
          { type: 'quickInfo', content: { type: 'quickInfo', items: [] } },
          { type: 'amenities', content: { type: 'amenities', categories: [] } },
          { type: 'rules', content: { type: 'rules', items: [] } },
          { type: 'notice', content: { type: 'notice', noticeType: 'info', content: 'Test' } },
        ],
      });

      const blocks = parseBlocksFromResponse(response);
      expect(blocks).toHaveLength(5);
    });

    it('모든 유효한 블록 타입을 파싱해야 함', () => {
      const validTypes = ['hero', 'quickInfo', 'amenities', 'rules', 'map', 'gallery', 'notice', 'custom'];

      validTypes.forEach((type) => {
        const response = JSON.stringify({
          blocks: [{ type, content: { type } }],
        });

        const blocks = parseBlocksFromResponse(response);
        expect(blocks).toHaveLength(1);
        expect(blocks[0].type).toBe(type);
      });
    });
  });

  describe('에러 처리', () => {
    it('유효하지 않은 JSON은 에러를 던져야 함', () => {
      const invalidJson = '{ invalid json }';

      expect(() => parseBlocksFromResponse(invalidJson)).toThrow(AIGenerationError);
      expect(() => parseBlocksFromResponse(invalidJson)).toThrow('JSON');
    });

    it('blocks 배열이 없으면 에러를 던져야 함', () => {
      const response = JSON.stringify({ data: [] });

      expect(() => parseBlocksFromResponse(response)).toThrow(AIGenerationError);
      expect(() => parseBlocksFromResponse(response)).toThrow('blocks');
    });

    it('blocks가 배열이 아니면 에러를 던져야 함', () => {
      const response = JSON.stringify({ blocks: 'not an array' });

      expect(() => parseBlocksFromResponse(response)).toThrow(AIGenerationError);
    });

    it('유효한 블록이 없으면 에러를 던져야 함', () => {
      const response = JSON.stringify({
        blocks: [
          { type: 'invalid', content: {} },
        ],
      });

      expect(() => parseBlocksFromResponse(response)).toThrow('유효한 블록이 없습니다');
    });

    it('빈 배열이면 에러를 던져야 함', () => {
      const response = JSON.stringify({ blocks: [] });

      expect(() => parseBlocksFromResponse(response)).toThrow('유효한 블록이 없습니다');
    });
  });

  describe('블록 필터링', () => {
    it('유효하지 않은 블록 타입은 무시해야 함', () => {
      const response = JSON.stringify({
        blocks: [
          { type: 'hero', content: { type: 'hero', title: 'Valid' } },
          { type: 'invalidType', content: {} },
          { type: 'notice', content: { type: 'notice', content: 'Valid' } },
        ],
      });

      const blocks = parseBlocksFromResponse(response);
      expect(blocks).toHaveLength(2);
      expect(blocks.map((b) => b.type)).toEqual(['hero', 'notice']);
    });

    it('content가 없는 블록은 무시해야 함', () => {
      const response = JSON.stringify({
        blocks: [
          { type: 'hero', content: { type: 'hero', title: 'Valid' } },
          { type: 'notice' }, // content 없음
        ],
      });

      const blocks = parseBlocksFromResponse(response);
      expect(blocks).toHaveLength(1);
    });

    it('content가 객체가 아닌 블록은 무시해야 함', () => {
      const response = JSON.stringify({
        blocks: [
          { type: 'hero', content: { type: 'hero', title: 'Valid' } },
          { type: 'notice', content: 'string content' },
        ],
      });

      const blocks = parseBlocksFromResponse(response);
      expect(blocks).toHaveLength(1);
    });
  });

  describe('실제 응답 형식', () => {
    it('실제 GPT 응답 형식을 파싱해야 함', () => {
      const realResponse = JSON.stringify({
        blocks: [
          {
            type: 'hero',
            content: {
              type: 'hero',
              imageUrl: 'https://example.com/image.jpg',
              title: '강남 모던 아파트에 오신 것을 환영합니다',
              subtitle: '강남역 도보 5분, 깨끗하고 모던한 공간',
              gradient: 'from-black/60 via-transparent to-transparent',
            },
          },
          {
            type: 'quickInfo',
            content: {
              type: 'quickInfo',
              items: [
                { icon: 'clock', label: '체크인', value: '15:00', subtext: '셀프 체크인' },
                { icon: 'clock', label: '체크아웃', value: '11:00' },
                { icon: 'address', label: '주소', value: '서울시 강남구 역삼동 123-45' },
              ],
            },
          },
          {
            type: 'amenities',
            content: {
              type: 'amenities',
              categories: [
                {
                  name: '기본 시설',
                  items: [
                    { icon: 'wifi', name: '무선 인터넷', description: '고속 와이파이 제공' },
                    { icon: 'tv', name: 'TV', description: '넷플릭스 가능' },
                  ],
                },
              ],
            },
          },
          {
            type: 'rules',
            content: {
              type: 'rules',
              items: [
                { icon: 'smoking', title: '금연', description: '실내 전 구역 금연입니다', isImportant: true },
                { icon: 'volume', title: '정숙', description: '22시 이후 정숙 부탁드립니다' },
              ],
            },
          },
          {
            type: 'notice',
            content: {
              type: 'notice',
              noticeType: 'info',
              content: '편안한 시간 되세요! 문의사항은 언제든 연락 주세요.',
            },
          },
        ],
      });

      const blocks = parseBlocksFromResponse(realResponse);
      expect(blocks).toHaveLength(5);
      expect(blocks[0].type).toBe('hero');
      expect(blocks[1].type).toBe('quickInfo');
      expect(blocks[2].type).toBe('amenities');
      expect(blocks[3].type).toBe('rules');
      expect(blocks[4].type).toBe('notice');
    });
  });
});

// ============================================
// AIGenerationError 테스트
// ============================================

describe('AIGenerationError', () => {
  it('에러 코드와 메시지를 포함해야 함', () => {
    const error = new AIGenerationError('MISSING_API_KEY', 'API 키가 없습니다');

    expect(error.code).toBe('MISSING_API_KEY');
    expect(error.message).toBe('API 키가 없습니다');
    expect(error.name).toBe('AIGenerationError');
  });

  it('상세 정보를 포함할 수 있어야 함', () => {
    const error = new AIGenerationError('PARSE_ERROR', '파싱 실패', '상세 정보');

    expect(error.details).toBe('상세 정보');
  });

  it('Error 클래스를 상속해야 함', () => {
    const error = new AIGenerationError('UNKNOWN', '알 수 없는 오류');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AIGenerationError);
  });
});
