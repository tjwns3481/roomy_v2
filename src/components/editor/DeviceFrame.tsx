// @TASK P8-S9-T1 - 디바이스 프레임 컴포넌트
// @SPEC specs/screens/S-09-editor.yaml

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BatteryFullIcon, WifiIcon } from 'lucide-react';

export type DeviceType = 'iphone-se' | 'iphone-14' | 'ipad';

interface DeviceFrameProps {
  device: DeviceType;
  isDarkMode?: boolean;
  children: React.ReactNode;
}

// 디바이스별 스펙
const DEVICE_SPECS = {
  'iphone-se': {
    width: 375,
    height: 667,
    hasNotch: false,
    borderRadius: 40,
  },
  'iphone-14': {
    width: 390,
    height: 844,
    hasNotch: true,
    borderRadius: 48,
  },
  ipad: {
    width: 768,
    height: 1024,
    hasNotch: false,
    borderRadius: 24,
  },
} as const;

/**
 * 디바이스 프레임 컴포넌트
 * - iPhone/iPad 스타일 프레임
 * - 노치, 상태바, 홈 인디케이터
 */
export function DeviceFrame({ device, isDarkMode = false, children }: DeviceFrameProps) {
  const spec = DEVICE_SPECS[device];
  const now = new Date();
  const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div
      data-testid="device-frame"
      data-device={device}
      className={cn(
        'relative bg-black shadow-2xl overflow-hidden transition-all duration-300',
        isDarkMode && 'dark'
      )}
      style={{
        width: `${spec.width}px`,
        maxWidth: `${spec.width}px`,
        height: `${spec.height}px`,
        borderRadius: `${spec.borderRadius}px`,
        border: '12px solid #1a1a1a',
      }}
    >
      {/* 노치 (iPhone 14만) */}
      {spec.hasNotch && (
        <div
          data-testid="device-notch"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50"
        />
      )}

      {/* 상태바 */}
      <div
        data-testid="device-statusbar"
        className={cn(
          'absolute top-0 left-0 right-0 h-11 px-6 flex items-center justify-between text-xs font-medium z-40',
          isDarkMode ? 'text-white' : 'text-gray-900',
          spec.hasNotch && 'pt-2'
        )}
      >
        {/* 시간 */}
        <div className="font-semibold">{timeString}</div>

        {/* 우측 아이콘 */}
        <div className="flex items-center gap-1">
          <WifiIcon className="w-4 h-4" />
          <BatteryFullIcon className="w-5 h-4" />
        </div>
      </div>

      {/* 스크린 콘텐츠 */}
      <div
        className={cn(
          'absolute inset-0 overflow-y-auto',
          spec.hasNotch ? 'pt-11' : 'pt-11',
          'pb-8',
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        )}
      >
        {children}
      </div>

      {/* 홈 인디케이터 */}
      <div
        data-testid="home-indicator"
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-40"
      />
    </div>
  );
}
