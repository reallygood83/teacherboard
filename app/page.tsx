'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        // 로그인된 사용자는 학급 홈페이지로 리다이렉트
        router.push('/class');
      } else {
        // 로그인되지 않은 사용자는 로그인 페이지로 리다이렉트
        router.push('/login');
      }
    }
  }, [currentUser, loading, router]);

  // 로딩 중에는 로딩 화면 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 실제로는 이 부분에 도달하지 않아야 함 (useEffect에서 리다이렉트)
  return null;
}