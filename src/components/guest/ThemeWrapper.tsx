// @TASK P2-T2.6 - 게스트 뷰 테마 래퍼 컴포넌트
// @SPEC docs/planning/03-user-flow.md#게스트-뷰어

'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/lib/theme';
import { getThemePreset, DEFAULT_THEME } from '@/lib/theme/presets';
import { ThemeName } from '@/lib/theme/types';

interface ThemeWrapperProps {
  /** 테마 이름 (guidebook.theme 필드) */
  themeName?: ThemeName;
  /** 자식 컴포넌트 */
  children: ReactNode;
}

/**
 * ThemeWrapper - 가이드북 테마를 적용하는 래퍼 컴포넌트
 *
 * 게스트 뷰에서 사용하며, guidebook.theme 값에 따라 테마를 동적으로 적용합니다.
 *
 * @example
 * ```tsx
 * // app/(guest)/g/[slug]/page.tsx
 * export default async function GuestPage({ params }) {
 *   const guidebook = await getGuidebook(params.slug);
 *
 *   return (
 *     <ThemeWrapper themeName={guidebook.theme}>
 *       <GuestContent guidebook={guidebook} />
 *     </ThemeWrapper>
 *   );
 * }
 * ```
 */
export function ThemeWrapper({ themeName = DEFAULT_THEME, children }: ThemeWrapperProps) {
  const theme = getThemePreset(themeName);

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}
