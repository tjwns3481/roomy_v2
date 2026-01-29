// @TASK P2-T2.6 - 테마 선택 컴포넌트 (에디터용)
// @SPEC docs/planning/03-user-flow.md#에디터

'use client';

import { THEME_PRESETS } from '@/lib/theme/presets';
import { ThemeName } from '@/lib/theme/types';

interface ThemeSelectorProps {
  /** 현재 선택된 테마 */
  selectedTheme: ThemeName;
  /** 테마 변경 핸들러 */
  onThemeChange: (theme: ThemeName) => void;
}

/**
 * ThemeSelector - 에디터에서 테마를 선택하는 컴포넌트
 *
 * @example
 * ```tsx
 * function EditorSettings() {
 *   const [theme, setTheme] = useState<ThemeName>('modern');
 *
 *   return (
 *     <ThemeSelector
 *       selectedTheme={theme}
 *       onThemeChange={setTheme}
 *     />
 *   );
 * }
 * ```
 */
export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        테마 선택
      </label>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(THEME_PRESETS) as ThemeName[]).map((themeKey) => {
          const theme = THEME_PRESETS[themeKey];
          const isSelected = selectedTheme === themeKey;

          return (
            <button
              key={themeKey}
              type="button"
              onClick={() => onThemeChange(themeKey)}
              className={`
                relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {/* 테마 색상 미리보기 */}
              <div className="flex gap-1.5">
                <div
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: theme.primary }}
                  title="Primary"
                />
                <div
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: theme.background }}
                  title="Background"
                />
                <div
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: theme.accent }}
                  title="Accent"
                />
              </div>

              {/* 테마 이름 */}
              <span
                className={`text-sm font-medium ${
                  isSelected ? 'text-primary' : 'text-gray-700'
                }`}
              >
                {theme.name}
              </span>

              {/* 선택 체크 표시 */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 테마 상세 정보 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-xs font-medium text-gray-500 mb-2">테마 정보</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>이름:</span>
            <span className="font-medium">{THEME_PRESETS[selectedTheme].name}</span>
          </div>
          <div className="flex justify-between">
            <span>폰트:</span>
            <span className="font-medium">{THEME_PRESETS[selectedTheme].fontFamily.split(',')[0]}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>주요 색상:</span>
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded border border-gray-200"
                style={{ backgroundColor: THEME_PRESETS[selectedTheme].primary }}
              />
              <span className="font-mono">{THEME_PRESETS[selectedTheme].primary}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
