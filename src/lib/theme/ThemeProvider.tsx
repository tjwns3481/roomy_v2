// @TASK P2-T2.6 - ThemeProvider 컴포넌트
// @SPEC docs/planning/03-user-flow.md#게스트-뷰어

'use client';

import { ReactNode } from 'react';
import { ThemePreset, ThemeCSSVariables } from './types';

interface ThemeProviderProps {
  /** 적용할 테마 프리셋 */
  theme: ThemePreset;
  /** 자식 컴포넌트 */
  children: ReactNode;
}

/**
 * ThemeProvider - CSS 변수를 통해 테마를 적용하는 컴포넌트
 *
 * @example
 * ```tsx
 * import { ThemeProvider } from '@/lib/theme';
 * import { getThemePreset } from '@/lib/theme/presets';
 *
 * function GuestView({ guidebook }) {
 *   const theme = getThemePreset(guidebook.theme);
 *
 *   return (
 *     <ThemeProvider theme={theme}>
 *       <GuestContent />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  // CSS 변수로 테마 적용
  const style: React.CSSProperties & ThemeCSSVariables = {
    '--theme-primary': theme.primary,
    '--theme-background': theme.background,
    '--theme-text': theme.text,
    '--theme-accent': theme.accent,
    '--theme-font-family': theme.fontFamily,
  };

  return (
    <div
      style={style}
      className="theme-root"
      data-theme={theme.name}
    >
      {children}
    </div>
  );
}

/**
 * 테마 적용 예시 CSS 클래스 (사용 방법 참조용)
 *
 * ```css
 * .theme-root {
 *   background-color: var(--theme-background);
 *   color: var(--theme-text);
 *   font-family: var(--theme-font-family);
 * }
 *
 * .theme-primary {
 *   color: var(--theme-primary);
 * }
 *
 * .theme-accent {
 *   color: var(--theme-accent);
 * }
 *
 * .theme-bg-primary {
 *   background-color: var(--theme-primary);
 * }
 *
 * .theme-bg-accent {
 *   background-color: var(--theme-accent);
 * }
 *
 * .theme-border-primary {
 *   border-color: var(--theme-primary);
 * }
 * ```
 */
