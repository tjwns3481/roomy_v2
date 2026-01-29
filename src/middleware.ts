// @TASK Clerk-Auth - Clerk 미들웨어 설정
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 공개 라우트 (인증 불필요)
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/g/(.*)',        // 게스트 가이드북 뷰
  '/s/(.*)',        // 단축 URL 리다이렉트
  '/demo(.*)',
  '/about',
  '/blog',
  '/support',
  '/terms',
  '/privacy',
  '/refund',
  '/docs',
  '/api/health',
  '/api/qrcode',
  '/api/share/track',
  '/api/ai/chat',   // 게스트 AI 챗봇 (비인증)
]);

export default clerkMiddleware(async (auth, req) => {
  // 공개 라우트가 아니면 인증 필요
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
