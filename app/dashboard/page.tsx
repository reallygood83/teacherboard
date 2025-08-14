'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/auth/UserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🏠 대시보드 - 상태 확인:', { currentUser: !!currentUser, loading });
    
    if (!loading && !currentUser) {
      console.log('❌ 인증되지 않은 사용자 - 로그인 페이지로 이동');
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-gray-600">대시보드 로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <div className="text-gray-700 text-lg mb-4">로그인이 필요합니다</div>
          <div className="text-gray-500">잠시 후 로그인 페이지로 이동합니다...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Teacher Board</h1>
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>환영합니다, {currentUser.displayName}님!</CardTitle>
              <CardDescription>
                Teacher Board 대시보드에 오신 것을 환영합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 바로가기 CTA */}
              <div className="mb-6">
                <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={() => router.push('/class')}>
                  <GraduationCap className="w-4 h-4 mr-2" /> 학급 홈페이지로 바로 가기
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">시간표 관리</CardTitle>
                      <span className="text-[11px] font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">개발중</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      해당 기능은 현재 개발 중입니다.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">학생 관리</CardTitle>
                      <span className="text-[11px] font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">개발중</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      해당 기능은 현재 개발 중입니다.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">과제 관리</CardTitle>
                      <span className="text-[11px] font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">개발중</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      해당 기능은 현재 개발 중입니다.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900">계정 정보</h3>
                <div className="mt-2 space-y-1 text-sm text-blue-700">
                  <p>이메일: {currentUser.email}</p>
                  <p>이름: {currentUser.displayName}</p>
                  <p>계정 ID: {currentUser.uid}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}