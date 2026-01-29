// @TASK P2-T2.6 - 테마 프리셋 (5종)
// @SPEC docs/planning/03-user-flow.md#게스트-뷰어

import { ThemeName, ThemePreset } from './types';

/**
 * 테마 프리셋 5종
 *
 * 각 테마는 숙소 스타일과 호스트 선호도에 맞춰 설계되었습니다.
 */
export const THEME_PRESETS: Record<ThemeName, ThemePreset> = {
  /**
   * 모던 테마 - 깔끔하고 전문적인 느낌
   * 도심형 숙소, 비즈니스 호텔에 적합
   */
  modern: {
    name: '모던',
    primary: '#3B82F6',    // blue-500
    background: '#FFFFFF',
    text: '#1F2937',       // gray-800
    accent: '#60A5FA',     // blue-400
    fontFamily: 'Pretendard, -apple-system, sans-serif',
  },

  /**
   * 따뜻한 테마 - 아늑하고 친근한 느낌
   * 펜션, 게스트하우스에 적합
   */
  cozy: {
    name: '따뜻한',
    primary: '#F59E0B',    // amber-500
    background: '#FFFBEB', // amber-50
    text: '#78350F',       // amber-900
    accent: '#FBBF24',     // amber-400
    fontFamily: 'Noto Sans KR, sans-serif',
  },

  /**
   * 미니멀 테마 - 심플하고 세련된 느낌
   * 디자이너 숙소, 갤러리 공간에 적합
   */
  minimal: {
    name: '미니멀',
    primary: '#6B7280',    // gray-500
    background: '#F9FAFB', // gray-50
    text: '#111827',       // gray-900
    accent: '#9CA3AF',     // gray-400
    fontFamily: 'Inter, -apple-system, sans-serif',
  },

  /**
   * 자연 테마 - 싱그럽고 편안한 느낌
   * 전원형 숙소, 캠핑장, 리조트에 적합
   */
  nature: {
    name: '자연',
    primary: '#10B981',    // emerald-500
    background: '#ECFDF5', // emerald-50
    text: '#064E3B',       // emerald-900
    accent: '#34D399',     // emerald-400
    fontFamily: 'Noto Sans KR, sans-serif',
  },

  /**
   * 럭셔리 테마 - 고급스럽고 우아한 느낌
   * 부티크 호텔, 프리미엄 숙소에 적합
   */
  luxury: {
    name: '럭셔리',
    primary: '#1F2937',    // gray-800
    background: '#FAFAF9', // stone-50
    text: '#1C1917',       // stone-900
    accent: '#D4AF37',     // gold
    fontFamily: 'Cormorant Garamond, serif',
  },
};

/**
 * 테마 이름으로 프리셋 가져오기
 */
export function getThemePreset(themeName: ThemeName): ThemePreset {
  return THEME_PRESETS[themeName];
}

/**
 * 기본 테마 (modern)
 */
export const DEFAULT_THEME: ThemeName = 'modern';
