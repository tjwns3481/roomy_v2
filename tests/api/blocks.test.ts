// @TASK P1-T1.8 - 블록 API 테스트
// @SPEC docs/planning/06-tasks.md#P1-T1.8

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlockService, BlockServiceError, validateBlockContent } from '@/lib/blocks/service';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

describe('BlockService', () => {
  describe('validateBlockContent', () => {
    it('유효한 hero 콘텐츠를 통과시켜야 함', () => {
      const content = {
        title: '테스트 제목',
        subtitle: '부제목',
        backgroundImage: 'https://example.com/image.jpg',
      };

      const result = validateBlockContent('hero', content);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('테스트 제목');
      }
    });

    it('필수 필드 누락 시 실패해야 함', () => {
      const content = {
        subtitle: '부제목만 있음',
      };

      const result = validateBlockContent('hero', content);

      expect(result.success).toBe(false);
    });

    it('유효한 quickInfo 콘텐츠를 통과시켜야 함', () => {
      const content = {
        checkIn: '15:00',
        checkOut: '11:00',
        address: '서울특별시 강남구',
        wifi: {
          ssid: 'TestWifi',
          password: '1234',
        },
      };

      const result = validateBlockContent('quickInfo', content);

      expect(result.success).toBe(true);
    });

    it('잘못된 시간 형식 시 실패해야 함', () => {
      const content = {
        checkIn: '3pm', // 잘못된 형식
        checkOut: '11:00',
        address: '서울특별시',
      };

      const result = validateBlockContent('quickInfo', content);

      expect(result.success).toBe(false);
    });

    it('유효한 amenities 콘텐츠를 통과시켜야 함', () => {
      const content = {
        items: [
          { id: '1', name: 'WiFi', icon: 'wifi', available: true },
          { id: '2', name: 'TV', icon: 'tv', available: false },
        ],
      };

      const result = validateBlockContent('amenities', content);

      expect(result.success).toBe(true);
    });

    it('유효한 map 콘텐츠를 통과시켜야 함', () => {
      const content = {
        center: { lat: 37.5665, lng: 126.978 },
        zoom: 15,
        markers: [
          {
            id: '1',
            lat: 37.5665,
            lng: 126.978,
            title: '숙소',
            category: 'accommodation',
          },
        ],
        provider: 'naver',
      };

      const result = validateBlockContent('map', content);

      expect(result.success).toBe(true);
    });

    it('잘못된 좌표 범위 시 실패해야 함', () => {
      const content = {
        center: { lat: 200, lng: 126.978 }, // lat은 -90~90
        zoom: 15,
        markers: [],
        provider: 'naver',
      };

      const result = validateBlockContent('map', content);

      expect(result.success).toBe(false);
    });

    it('유효한 notice 콘텐츠를 통과시켜야 함', () => {
      const content = {
        title: '공지사항',
        content: '중요한 안내입니다.',
        type: 'info',
        dismissible: true,
      };

      const result = validateBlockContent('notice', content);

      expect(result.success).toBe(true);
    });

    it('잘못된 notice type 시 실패해야 함', () => {
      const content = {
        title: '공지',
        content: '내용',
        type: 'invalid', // info, warning, danger만 허용
      };

      const result = validateBlockContent('notice', content);

      expect(result.success).toBe(false);
    });

    it('유효한 gallery 콘텐츠를 통과시켜야 함', () => {
      const content = {
        images: [
          { id: '1', url: 'https://example.com/1.jpg', alt: '이미지 1' },
          { id: '2', url: 'https://example.com/2.jpg' },
        ],
        layout: 'grid',
      };

      const result = validateBlockContent('gallery', content);

      expect(result.success).toBe(true);
    });

    it('잘못된 URL 형식 시 실패해야 함', () => {
      const content = {
        images: [{ id: '1', url: 'not-a-url' }],
        layout: 'grid',
      };

      const result = validateBlockContent('gallery', content);

      expect(result.success).toBe(false);
    });
  });

  describe('BlockServiceError', () => {
    it('올바른 에러 속성을 가져야 함', () => {
      const error = new BlockServiceError(
        '블록을 찾을 수 없습니다',
        'NOT_FOUND',
        404
      );

      expect(error.message).toBe('블록을 찾을 수 없습니다');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('BlockServiceError');
    });

    it('기본 statusCode는 400이어야 함', () => {
      const error = new BlockServiceError('검증 오류', 'VALIDATION_ERROR');

      expect(error.statusCode).toBe(400);
    });
  });
});

describe('Block API Integration', () => {
  // Note: 실제 API 테스트는 Supabase 연결이 필요하므로
  // E2E 테스트 또는 MSW를 사용한 통합 테스트로 진행

  it('BlockService가 정의되어야 함', () => {
    // 서비스 레이어 확인
    expect(BlockService).toBeDefined();
    expect(BlockService.getBlocksByGuidebookId).toBeDefined();
    expect(BlockService.getBlockById).toBeDefined();
    expect(BlockService.createBlock).toBeDefined();
    expect(BlockService.updateBlock).toBeDefined();
    expect(BlockService.deleteBlock).toBeDefined();
    expect(BlockService.reorderBlocks).toBeDefined();
  });
});
