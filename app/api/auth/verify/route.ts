import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Firebase Admin SDK 동적 임포트로 빌드 오류 방지
    const { adminAuth } = await import('@/lib/firebase-admin');
    
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Firebase Admin SDK를 사용하여 토큰 검증
    const decodedToken = await adminAuth.verifyIdToken(token);
    const user = await adminAuth.getUser(decodedToken.uid);

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token or Firebase Admin SDK not configured' },
      { status: 401 }
    );
  }
}