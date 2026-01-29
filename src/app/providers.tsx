/**
 * App Providers
 *
 * ClerkProvider를 포함한 모든 클라이언트 Provider를 관리합니다.
 * - ClerkProvider: Clerk 인증 컨텍스트
 * - Toaster: 전역 toast 알림 (sonner)
 *
 * @TASK Clerk-Auth - Clerk로 인증 시스템 전환
 */

'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={koKR}
      appearance={{
        variables: {
          colorPrimary: '#3B82F6',
          colorBackground: '#ffffff',
          colorText: '#1f2937',
          colorTextSecondary: '#6b7280',
          borderRadius: '0.5rem',
        },
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'shadow-lg border',
          headerTitle: 'text-xl font-bold',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 'border hover:bg-gray-50',
          formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
        },
      }}
    >
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </ClerkProvider>
  );
}
