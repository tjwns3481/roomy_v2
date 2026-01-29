/**
 * @TASK Clerk-Auth - 회원가입 페이지 (Clerk SignUp)
 *
 * Clerk의 SignUp 컴포넌트를 사용한 회원가입 페이지
 * - 이메일/비밀번호 회원가입
 * - Google OAuth 회원가입
 * - 로그인 링크
 */

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/login"
        forceRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'shadow-lg border rounded-xl',
            headerTitle: 'text-2xl font-bold text-center',
            headerSubtitle: 'text-gray-600 text-center',
            socialButtonsBlockButton: 'border hover:bg-gray-50 transition-colors',
            socialButtonsBlockButtonText: 'font-medium',
            dividerLine: 'bg-gray-200',
            dividerText: 'text-gray-500',
            formFieldLabel: 'text-sm font-medium text-gray-700',
            formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg',
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors',
            footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
            identityPreviewText: 'text-gray-700',
            identityPreviewEditButton: 'text-blue-600',
          },
        }}
      />
    </div>
  );
}
