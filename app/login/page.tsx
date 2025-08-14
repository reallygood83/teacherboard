'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 이미 로그인된 사용자는 대시보드로 리다이렉트
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  if (currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>로그인 중...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Teacher Board</CardTitle>
          <CardDescription>
            시간표와 교육 관리를 위한 플랫폼
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleLoginButton />
          <div className="text-center text-sm text-gray-500">
            Google 계정으로 간편하게 로그인하세요
          </div>
        </CardContent>
      </Card>
    </div>
  );
}