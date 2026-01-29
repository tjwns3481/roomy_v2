// @TASK Clerk-Auth - Clerk 미들웨어 설정
// 보호된 라우트와 공개 라우트 구분
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

// clerkMiddleware with route protection
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 공개 라우트는 인증 없이 통과
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 비공개 라우트에서 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!userId) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
