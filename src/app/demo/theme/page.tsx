// @TASK P2-T2.6 - 테마 시스템 데모 페이지
// @SPEC docs/planning/03-user-flow.md#게스트-뷰어

'use client';

import { useState } from 'react';
import { ThemeWrapper } from '@/components/guest/ThemeWrapper';
import { ThemeSelector } from '@/components/editor/ThemeSelector';
import { ThemeName } from '@/lib/theme/types';
import { THEME_PRESETS } from '@/lib/theme/presets';

/**
 * 테마 시스템 데모 페이지
 *
 * 5종 테마를 실시간으로 전환하며 스타일을 확인할 수 있습니다.
 */
export default function ThemeDemoPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('modern');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 페이지 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎨 테마 시스템 데모
          </h1>
          <p className="text-gray-600">
            P2-T2.6 - 5종 테마 프리셋을 선택하고 실시간으로 확인하세요
          </p>
        </div>

        {/* 테마 선택기 (호스트 에디터 뷰) */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            호스트 에디터 - 테마 선택
          </h2>
          <ThemeSelector
            selectedTheme={selectedTheme}
            onThemeChange={setSelectedTheme}
          />
        </div>

        {/* 게스트 뷰어 미리보기 (선택된 테마 적용) */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              게스트 뷰어 - 테마 미리보기
            </h2>
            <p className="text-sm text-gray-600">
              현재 테마: <span className="font-semibold">{THEME_PRESETS[selectedTheme].name}</span>
            </p>
          </div>

          {/* 테마 적용 영역 */}
          <ThemeWrapper themeName={selectedTheme}>
            <div className="rounded-lg overflow-hidden border-4 border-gray-200">
              {/* 히어로 섹션 */}
              <div className="theme-bg-primary p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">
                  🏡 아늑한 숙소에 오신 것을 환영합니다
                </h1>
                <p className="text-lg opacity-90">
                  편안한 휴식을 위한 모든 것이 준비되어 있습니다
                </p>
              </div>

              {/* 컨텐츠 영역 */}
              <div className="p-8 space-y-6">
                {/* 핵심 정보 카드 */}
                <div className="bg-white rounded-lg border-2 theme-border-primary p-6">
                  <h2 className="text-2xl font-semibold theme-primary mb-4">
                    ⚡ 핵심 정보
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-1">📶</div>
                      <div className="text-sm text-gray-600">WiFi</div>
                      <div className="font-semibold theme-text">roomy-guest</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-1">🚪</div>
                      <div className="text-sm text-gray-600">도어락</div>
                      <div className="font-semibold theme-text">1234#</div>
                    </div>
                  </div>
                </div>

                {/* 버튼 예시 */}
                <div className="flex gap-3">
                  <button className="theme-button-primary px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all">
                    Primary 버튼
                  </button>
                  <button className="px-6 py-3 rounded-lg font-semibold border-2 theme-border-primary theme-primary hover:bg-gray-50 transition-all">
                    Outline 버튼
                  </button>
                </div>

                {/* 텍스트 예시 */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold theme-primary">
                    📋 이용 규칙
                  </h3>
                  <ul className="space-y-2 theme-text">
                    <li className="flex items-start gap-2">
                      <span className="theme-accent">✓</span>
                      <span>체크인: 오후 3시 / 체크아웃: 오전 11시</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="theme-accent">✓</span>
                      <span>실내 금연 (흡연 구역 별도 마련)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="theme-accent">✓</span>
                      <span>반려동물 동반 불가</span>
                    </li>
                  </ul>
                </div>

                {/* 카드 그리드 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="theme-card p-4 rounded-lg border-2 text-center">
                    <div className="text-3xl mb-2">🛋️</div>
                    <div className="font-semibold theme-text">침실 2개</div>
                  </div>
                  <div className="theme-card p-4 rounded-lg border-2 text-center">
                    <div className="text-3xl mb-2">🚿</div>
                    <div className="font-semibold theme-text">욕실 1개</div>
                  </div>
                  <div className="theme-card p-4 rounded-lg border-2 text-center">
                    <div className="text-3xl mb-2">👥</div>
                    <div className="font-semibold theme-text">최대 4인</div>
                  </div>
                </div>
              </div>
            </div>
          </ThemeWrapper>
        </div>

        {/* 테마 정보 표 */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            테마 프리셋 상세 정보
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4">테마</th>
                  <th className="text-left py-3 px-4">Primary</th>
                  <th className="text-left py-3 px-4">Background</th>
                  <th className="text-left py-3 px-4">Text</th>
                  <th className="text-left py-3 px-4">Accent</th>
                  <th className="text-left py-3 px-4">폰트</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(THEME_PRESETS) as ThemeName[]).map((themeKey) => {
                  const theme = THEME_PRESETS[themeKey];
                  return (
                    <tr key={themeKey} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{theme.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-gray-200"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <code className="text-xs">{theme.primary}</code>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-gray-200"
                            style={{ backgroundColor: theme.background }}
                          />
                          <code className="text-xs">{theme.background}</code>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-gray-200"
                            style={{ backgroundColor: theme.text }}
                          />
                          <code className="text-xs">{theme.text}</code>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-gray-200"
                            style={{ backgroundColor: theme.accent }}
                          />
                          <code className="text-xs">{theme.accent}</code>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs">{theme.fontFamily.split(',')[0]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
