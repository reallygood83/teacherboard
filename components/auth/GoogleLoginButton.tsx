'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function GoogleLoginButton() {
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      console.log('🚀 Google 로그인 시도 중...');
      const result = await signInWithGoogle();
      console.log('✅ Google 로그인 성공:', result.user.email);
      
      toast({
        title: "로그인 성공! 🎉",
        description: `환영합니다, ${result.user.displayName}님!`,
      });
      
      // 즉시 대시보드로 이동
      setTimeout(() => {
        console.log('📍 대시보드로 리디렉션 중...');
        window.location.href = '/dashboard';
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Google 로그인 실패:', error);
      toast({
        title: "로그인 실패",
        description: error.message || "로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 border border-white/20"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-500"></div>
          <span>로그인 처리 중...</span>
        </>
      ) : (
        <>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-lg">Google로 시작하기</span>
        </>
      )}
    </button>
  );
}