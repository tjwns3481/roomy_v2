// @TASK P5-T5.2 - QR 코드 데모 페이지
// @SPEC docs/planning/06-tasks.md#P5-T5.2

'use client';

import { useState } from 'react';
import { QRCodeDisplay } from '@/components/share/qr-code-display';
import { QRCodeDownload } from '@/components/share/qr-code-download';
import type { QRCodeSize } from '@/lib/qrcode';

const DEMO_STATES = {
  default: {
    url: 'https://roomy.app/g/cozy-studio',
    title: 'Cozy Studio Seoul',
    slug: 'cozy-studio',
  },
  long_url: {
    url: 'https://roomy.app/g/beautiful-apartment-with-amazing-view-in-gangnam',
    title: 'Beautiful Apartment',
    slug: 'beautiful-apartment',
  },
  custom_colors: {
    url: 'https://roomy.app/g/modern-loft',
    title: 'Modern Loft',
    slug: 'modern-loft',
    fgColor: '#1E40AF',
    bgColor: '#DBEAFE',
  },
} as const;

export default function QRCodeDemoPage() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('default');
  const [size, setSize] = useState<QRCodeSize>('medium');

  const currentState = DEMO_STATES[state];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            QR Code Demo - P5-T5.2
          </h1>
          <p className="mt-2 text-gray-600">
            QR 코드 생성 및 다운로드 기능 테스트
          </p>
        </div>

        {/* 상태 선택기 */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <p className="mb-2 font-semibold text-gray-700">데모 상태 선택</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(DEMO_STATES).map((s) => (
              <button
                key={s}
                onClick={() =>
                  setState(s as keyof typeof DEMO_STATES)
                }
                className={
                  state === s
                    ? 'rounded bg-blue-600 px-4 py-2 text-sm text-white'
                    : 'rounded bg-gray-200 px-4 py-2 text-sm text-gray-700'
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 크기 선택기 */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <p className="mb-2 font-semibold text-gray-700">QR 코드 크기</p>
          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as QRCodeSize[]).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={
                  size === s
                    ? 'rounded bg-blue-600 px-4 py-2 text-sm text-white'
                    : 'rounded bg-gray-200 px-4 py-2 text-sm text-gray-700'
                }
              >
                {s} ({s === 'small' ? '150px' : s === 'medium' ? '200px' : '300px'})
              </button>
            ))}
          </div>
        </div>

        {/* 컴포넌트 렌더링 */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* QRCodeDisplay */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              QRCodeDisplay
            </h2>
            <QRCodeDisplay
              url={currentState.url}
              title={currentState.title}
              size={size}
              showDownload
              fgColor={'fgColor' in currentState ? currentState.fgColor : undefined}
              bgColor={'bgColor' in currentState ? currentState.bgColor : undefined}
            />
          </div>

          {/* QRCodeDownload */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              QRCodeDownload
            </h2>
            <QRCodeDownload
              url={currentState.url}
              title={currentState.title}
              slug={currentState.slug}
            />
          </div>
        </div>

        {/* API 테스트 */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            API 엔드포인트 테스트
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>PNG:</strong>{' '}
              <a
                href={`/api/qrcode?url=${encodeURIComponent(currentState.url)}&size=200&format=png`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                /api/qrcode?url={currentState.url}&size=200&format=png
              </a>
            </p>
            <p className="text-sm text-gray-600">
              <strong>SVG:</strong>{' '}
              <a
                href={`/api/qrcode?url=${encodeURIComponent(currentState.url)}&size=200&format=svg`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                /api/qrcode?url={currentState.url}&size=200&format=svg
              </a>
            </p>
          </div>
        </div>

        {/* 현재 상태 정보 */}
        <div className="mt-6 rounded-lg bg-gray-100 p-4">
          <p className="mb-2 font-semibold text-gray-700">현재 상태</p>
          <pre className="overflow-x-auto text-sm text-gray-600">
            {JSON.stringify(
              { state, size, ...currentState },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
