import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 인증이 필요한 경로들
  const protectedPaths = ['/dashboard', '/admin', '/profile'];
  
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // 여기서는 클라이언트에서 인증 상태를 확인하도록 함
    // 실제 토큰 검증은 클라이언트 컴포넌트에서 수행
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      // 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};