/**
 * @TASK Clerk-Auth - 로그인 페이지 (Clerk SignIn)
 *
 * Clerk의 SignIn 컴포넌트를 사용한 로그인 페이지
 * - 이메일/비밀번호 로그인
 * - Google OAuth 로그인
 * - 회원가입 링크
 *
 * [[...sign-in]] catchall 라우트로 Clerk의 모든 인증 경로 처리
 */

import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <SignIn
      routing="path"
      path="/login"
      signUpUrl="/signup"
      forceRedirectUrl="/dashboard"
      appearance={{
        elements: {
          rootBox: 'w-full max-w-md mx-auto',
          card: 'shadow-xl border rounded-2xl bg-white',
          headerTitle: 'text-2xl font-bold text-center text-gray-900',
          headerSubtitle: 'text-gray-600 text-center',
          socialButtonsBlockButton: 'border-2 hover:bg-gray-50 transition-colors rounded-lg',
          socialButtonsBlockButtonText: 'font-medium',
          dividerLine: 'bg-gray-200',
          dividerText: 'text-gray-500 text-sm',
          formFieldLabel: 'text-sm font-medium text-gray-700',
          formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg',
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors',
          footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
          identityPreviewText: 'text-gray-700',
          identityPreviewEditButton: 'text-blue-600 hover:text-blue-700',
        },
      }}
    />
  );
}
