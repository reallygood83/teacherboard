'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

export default function LoginPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 이미 로그인된 사용자는 학급 홈페이지로 리다이렉트
    if (currentUser) {
      router.push('/class');
    }
  }, [currentUser, router]);

  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center">
        <div className="bg-white/25 backdrop-blur-lg rounded-2xl p-8 text-white text-center shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-lg font-medium">학급 홈페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center p-4 relative">
      {/* 교육적 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
        {/* 추가 장식 요소 - 학교 느낌 */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse animation-delay-1000"></div>
      </div>

      {/* 메인 로그인 카드 */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/25 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-6 transition-all duration-300 hover:shadow-3xl">
          {/* 헤더 */}
          <div className="text-center mb-6">
            {/* 교육 아이콘 개선 */}
            <div className="mx-auto w-20 h-20 bg-white/25 rounded-3xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Teacher Board</h1>
            <p className="text-white/85 text-lg font-medium mb-1">교사를 위한 스마트 교실</p>
            <p className="text-white/70 text-sm">AI와 함께하는 따뜻한 교육 혁신</p>
          </div>

          {/* 간단한 기능 소개 */}
          <div className="mb-6 text-center">
            <p className="text-white/80 text-sm">
              📝 AI 공문생성 • 👥 학급관리 • 📚 교육도구
            </p>
          </div>

          {/* 로그인 섹션 */}
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-white/90 text-base font-medium mb-3">
                🎓 선생님, 환영합니다!
              </h4>
            </div>
            
            <GoogleLoginButton />
            
            {/* 보안 안내 개선 */}
            <div className="text-center">
              <p className="text-white/70 text-xs flex items-center justify-center">
                🔒 Google OAuth 2.0으로 안전하게 보호됩니다
              </p>
            </div>
          </div>
        </div>

        {/* 하단 메시지 개선 */}
        <div className="text-center mt-4">
          <p className="text-white/70 text-sm mb-1">
            ✨ 교육의 미래를 함께 만들어갑니다
          </p>
        </div>

        {/* 푸터 개선 */}
        <div className="text-center mt-4 pt-4 border-t border-white/20">
          <p className="text-white/60 text-xs mb-2">
            © 2025 Moon-Jung Kim | 교육 혁신을 위한 여정
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <a 
              href="https://www.youtube.com/@%EB%B0%B0%EC%9B%80%EC%9D%98%EB%8B%AC%EC%9D%B8-p5v" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-all duration-300 flex items-center underline decoration-2 underline-offset-4 hover:decoration-amber-400"
            >
              📺 배움의 달인 유튜브
            </a>
            <span className="text-white/30">•</span>
            <a 
              href="mailto:jpmjkim23@gmail.com?subject=Teacher Board 문의&body=안녕하세요, Teacher Board에 대해 문의드립니다." 
              className="text-white/70 hover:text-white transition-all duration-300 flex items-center underline decoration-2 underline-offset-4 hover:decoration-emerald-400"
            >
              ✉️ 개발자 문의
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { 
            transform: translate(0px, 0px) scale(1); 
            opacity: 0.6;
          }
          33% { 
            transform: translate(30px, -50px) scale(1.1); 
            opacity: 0.7;
          }
          66% { 
            transform: translate(-20px, 20px) scale(0.9); 
            opacity: 0.5;
          }
          100% { 
            transform: translate(0px, 0px) scale(1); 
            opacity: 0.6;
          }
        }
        .animate-blob {
          animation: blob 8s infinite ease-in-out;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}