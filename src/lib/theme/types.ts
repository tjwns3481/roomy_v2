// @TASK P2-T2.6 - 테마 시스템 타입 정의
// @SPEC docs/planning/03-user-flow.md#게스트-뷰어

/**
 * 테마 이름 타입
 */
export type ThemeName = 'modern' | 'cozy' | 'minimal' | 'nature' | 'luxury';

/**
 * 테마 프리셋 인터페이스
 */
export interface ThemePreset {
  /** 테마 표시명 */
  name: string;
  /** 주요 색상 (Primary) */
  primary: string;
  /** 배경 색상 */
  background: string;
  /** 텍스트 색상 */
  text: string;
  /** 강조 색상 (Accent) */
  accent: string;
  /** 폰트 패밀리 */
  fontFamily: string;
}

/**
 * CSS 변수 타입
 */
export interface ThemeCSSVariables {
  '--theme-primary': string;
  '--theme-background': string;
  '--theme-text': string;
  '--theme-accent': string;
  '--theme-font-family': string;
}
