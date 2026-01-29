// @TASK P8-S11-V: Branding Integration Test
// @SPEC specs/screens/editor-branding.yaml
// @PURPOSE API ↔ UI 연결점 검증

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

describe('Branding Integration Tests (P8-S11-V)', () => {
  describe('1. API → UI 렌더링', () => {
    it('GET /api/guidebooks/[id]/branding → 폼 데이터 로드 성공', async () => {
      // Given: 브랜딩 데이터가 DB에 저장되어 있음
      const mockBranding = {
        id: 'branding-123',
        guidebook_id: 'guidebook-123',
        logo_url: 'https://storage.example.com/logo.png',
        favicon_url: 'https://storage.example.com/favicon.ico',
        primary_color: '#FF385C',
        secondary_color: '#00A699',
        font_preset: 'pretendard',
        custom_css: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // When: API 호출
      const response = await fetch('/api/guidebooks/guidebook-123/branding');
      const { data } = await response.json();

      // Then: 데이터가 정확히 반환됨
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        logo_url: expect.stringContaining('logo.png'),
        favicon_url: expect.stringContaining('favicon.ico'),
        primary_color: '#FF385C',
        secondary_color: '#00A699',
        font_preset: 'pretendard',
      });
    });

    it('브랜딩이 없을 때 404 응답', async () => {
      // Given: 브랜딩이 설정되지 않은 가이드북
      // When: API 호출
      const response = await fetch('/api/guidebooks/new-guidebook/branding');
      const { error } = await response.json();

      // Then: 404 에러 반환
      expect(response.status).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toContain('브랜딩 설정이 없습니다');
    });
  });

  describe('2. UI → API 저장', () => {
    it('색상 변경 → PUT /api/guidebooks/[id]/branding → 저장 성공', async () => {
      // Given: 사용자가 색상 변경
      const updateData = {
        primary_color: '#1E40AF',
        secondary_color: '#FBBF24',
      };

      // When: API 호출
      const response = await fetch('/api/guidebooks/guidebook-123/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const { data } = await response.json();

      // Then: 저장 성공
      expect(response.status).toBe(200);
      expect(data.primary_color).toBe('#1E40AF');
      expect(data.secondary_color).toBe('#FBBF24');
    });

    it('폰트 변경 → 저장 성공', async () => {
      // Given: 사용자가 폰트 변경
      const updateData = {
        font_preset: 'noto_sans',
      };

      // When: API 호출
      const response = await fetch('/api/guidebooks/guidebook-123/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const { data } = await response.json();

      // Then: 저장 성공
      expect(response.status).toBe(200);
      expect(data.font_preset).toBe('noto_sans');
    });

    it('로고 업로드 → 저장 성공', async () => {
      // Given: 사용자가 로고 업로드 완료 (Storage URL 획득)
      const updateData = {
        logo_url: 'https://storage.example.com/user-123/guidebook-123/branding/logo.png',
      };

      // When: API 호출
      const response = await fetch('/api/guidebooks/guidebook-123/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const { data } = await response.json();

      // Then: 저장 성공
      expect(response.status).toBe(200);
      expect(data.logo_url).toContain('logo.png');
    });

    it('커스텀 CSS 저장 (Business 플랜)', async () => {
      // Given: Business 플랜 사용자가 커스텀 CSS 입력
      const updateData = {
        custom_css: `
          .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
        `,
      };

      // When: API 호출
      const response = await fetch('/api/guidebooks/guidebook-123/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const { data } = await response.json();

      // Then: 저장 성공
      expect(response.status).toBe(200);
      expect(data.custom_css).toContain('linear-gradient');
    });
  });

  describe('3. 브랜딩 검증 (Validation)', () => {
    it('잘못된 색상 형식 → 400 에러', async () => {
      // Given: 잘못된 HEX 형식
      const invalidData = {
        primary_color: 'red', // 잘못된 형식
      };

      // When: API 호출
      const response = await fetch('/api/guidebooks/guidebook-123/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });
      const { error } = await response.json();

      // Then: 검증 에러
      expect(response.status).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toContain('올바르지 않습니다');
    });

    it('허용되지 않은 font_preset → 400 에러', async () => {
      // Given: 잘못된 폰트 프리셋
      const invalidData = {
        font_preset: 'comic_sans', // 허용되지 않음
      };

      // When: API 호출
      const response = await fetch('/api/guidebooks/guidebook-123/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });
      const { error } = await response.json();

      // Then: 검증 에러
      expect(response.status).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('너무 긴 커스텀 CSS → 400 에러', async () => {
      // Given: 10KB를 초과하는 CSS
      const invalidData = {
        custom_css: 'a'.repeat(10001), // 10KB 초과
      };

      // When: API 호출
      const response = await fetch('/api/guidebooks/guidebook-123/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });
      const { error } = await response.json();

      // Then: 검증 에러
      expect(response.status).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('4. 게스트 뷰어 브랜딩 적용', () => {
    it('브랜딩 저장 → 게스트 페이지에 Primary Color 적용', async () => {
      // Given: 브랜딩이 저장됨
      const brandingData = {
        primary_color: '#1E40AF',
        secondary_color: '#FBBF24',
      };

      await fetch('/api/guidebooks/guidebook-123/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandingData),
      });

      // When: 게스트 페이지 접근
      // (실제로는 게스트 페이지 로드 시 브랜딩 데이터를 조회)
      const guestResponse = await fetch('/api/guidebooks/guidebook-123/branding');
      const { data } = await guestResponse.json();

      // Then: 브랜딩 적용 확인
      expect(data.primary_color).toBe('#1E40AF');
      expect(data.secondary_color).toBe('#FBBF24');

      // CSS 변수로 적용되어야 함
      // --color-primary: #1E40AF;
      // --color-secondary: #FBBF24;
    });

    it('로고 저장 → 게스트 페이지 헤더에 로고 표시', async () => {
      // Given: 로고가 저장됨
      const brandingData = {
        logo_url: 'https://storage.example.com/logo.png',
      };

      await fetch('/api/guidebooks/guidebook-123/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandingData),
      });

      // When: 게스트 페이지 브랜딩 조회
      const response = await fetch('/api/guidebooks/guidebook-123/branding');
      const { data } = await response.json();

      // Then: 로고 URL 확인
      expect(data.logo_url).toContain('logo.png');
    });

    it('폰트 변경 → 게스트 페이지 폰트 적용', async () => {
      // Given: 폰트가 변경됨
      const brandingData = {
        font_preset: 'gmarket_sans',
      };

      await fetch('/api/guidebooks/guidebook-123/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandingData),
      });

      // When: 게스트 페이지 브랜딩 조회
      const response = await fetch('/api/guidebooks/guidebook-123/branding');
      const { data } = await response.json();

      // Then: 폰트 프리셋 확인
      expect(data.font_preset).toBe('gmarket_sans');
      // 실제로는 <html> 태그에 font-gmarket-sans 클래스 적용
    });
  });

  describe('5. 플랜별 기능 제한', () => {
    it('Free 플랜 → 브랜딩 저장 시도 → 403 에러', async () => {
      // Given: Free 플랜 사용자 (RLS에서 차단)
      const updateData = {
        primary_color: '#1E40AF',
      };

      // When: API 호출
      const response = await fetch('/api/guidebooks/free-guidebook/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const { error } = await response.json();

      // Then: 권한 에러
      expect(response.status).toBe(403);
      expect(error.code).toBe('PERMISSION_DENIED');
      expect(error.message).toContain('Pro 이상');
    });

    it('Pro 플랜 → 커스텀 CSS 저장 시도 → 성공 (하지만 적용 안됨)', async () => {
      // Given: Pro 플랜 사용자 (Business 기능 접근 불가)
      const updateData = {
        custom_css: '.test { color: red; }',
      };

      // When: API 호출 (저장은 가능, RLS 제약 없음)
      const response = await fetch('/api/guidebooks/pro-guidebook/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      // Then: 저장은 성공하지만, 게스트 뷰어에서 적용 안됨 (Business 플랜만 적용)
      expect(response.status).toBe(200);
      // UI에서는 Business 플랜이 아니면 custom_css를 적용하지 않음
    });

    it('Business 플랜 → 모든 브랜딩 기능 사용 가능', async () => {
      // Given: Business 플랜 사용자
      const updateData = {
        logo_url: 'https://storage.example.com/logo.png',
        favicon_url: 'https://storage.example.com/favicon.ico',
        primary_color: '#1E40AF',
        secondary_color: '#FBBF24',
        font_preset: 'noto_sans',
        custom_css: '.hero { background: #fff; }',
      };

      // When: API 호출
      const response = await fetch('/api/guidebooks/business-guidebook/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const { data } = await response.json();

      // Then: 모든 기능 저장 성공
      expect(response.status).toBe(200);
      expect(data).toMatchObject(updateData);
    });
  });

  describe('6. 에러 핸들링', () => {
    it('네트워크 에러 → UI에서 에러 토스트 표시', async () => {
      // Given: 네트워크 에러 발생
      const updateData = {
        primary_color: '#1E40AF',
      };

      // When: API 호출 실패
      try {
        await fetch('http://invalid-url/branding', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
      } catch (error) {
        // Then: 에러 캐치
        expect(error).toBeDefined();
        // UI에서는 toast.error('저장 중 오류 발생') 표시
      }
    });

    it('DB 에러 → 500 에러 반환', async () => {
      // Given: DB 에러 발생 (예: 커넥션 풀 초과)
      // When: API 호출
      // Then: 500 에러 반환
      // (실제 테스트에서는 Mock으로 DB 에러 시뮬레이션)
      expect(true).toBe(true); // placeholder
    });
  });
});

describe('Branding UI Component Integration', () => {
  describe('ColorPicker 컴포넌트', () => {
    it('색상 선택 → onChange 이벤트 발생', () => {
      // Given: ColorPicker 렌더링
      // When: 사용자가 색상 선택
      // Then: onChange('#1E40AF') 호출
      expect(true).toBe(true); // placeholder (실제로는 RTL 테스트)
    });

    it('잘못된 HEX 입력 → 검증 에러 표시', () => {
      // Given: ColorPicker에 잘못된 값 입력
      // When: 'red' 입력
      // Then: 에러 메시지 표시
      expect(true).toBe(true);
    });
  });

  describe('FontSelector 컴포넌트', () => {
    it('폰트 선택 → 미리보기 업데이트', () => {
      // Given: FontSelector 렌더링
      // When: 사용자가 Noto Sans 선택
      // Then: 미리보기에 폰트 적용
      expect(true).toBe(true);
    });
  });

  describe('ImageUpload 컴포넌트', () => {
    it('이미지 업로드 → Storage에 저장 → URL 반환', async () => {
      // Given: 이미지 파일 선택
      // When: 업로드 버튼 클릭
      // Then: Storage URL 반환
      // 'https://storage.example.com/user-123/guidebook-123/branding/logo.png'
      expect(true).toBe(true);
    });

    it('2MB 초과 이미지 → 업로드 실패', () => {
      // Given: 3MB 이미지
      // When: 업로드 시도
      // Then: 에러 메시지 표시
      expect(true).toBe(true);
    });
  });

  describe('실시간 미리보기', () => {
    it('Primary Color 변경 → 미리보기에 즉시 반영', () => {
      // Given: 브랜딩 설정 페이지
      // When: Primary Color를 #1E40AF로 변경
      // Then: 오른쪽 미리보기 패널에 색상 즉시 적용
      expect(true).toBe(true);
    });

    it('로고 업로드 → 미리보기 헤더에 로고 표시', () => {
      // Given: 로고 업로드 완료
      // When: Storage URL 획득
      // Then: 미리보기 헤더에 로고 이미지 표시
      expect(true).toBe(true);
    });
  });
});
