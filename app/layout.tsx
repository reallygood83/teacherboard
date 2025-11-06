import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"
import ErrorBoundary from "@/components/error-boundary"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://teaboard.link'),
  title: "TeaBoard - 선생님을 위한 올인원 디지털 교실",
  description: "🎯 AI 도구, 수업 관리, 학생 관리, YouTube Bank까지! 7가지 교육 서비스를 한곳에서. 선생님의 일상을 더 스마트하게 만드는 TeaBoard 서비스 허브입니다.",
  generator: "TeaBoard",
  manifest: "/manifest.json",
  keywords: ["TeaBoard", "학급관리", "교육도구", "AI교육", "수업관리", "학생관리", "디지털교실", "스마트교육", "교사도구", "YouTube", "누가바", "MarkSlide", "리치스튜던트"],
  authors: [{ name: "Moon-Jung Kim" }],
  creator: "Moon-Jung Kim",
  publisher: "TeaBoard",
  category: "Education",

  // Open Graph 메타데이터
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://teaboard.link",
    siteName: "TeaBoard",
    title: "TeaBoard - 선생님을 위한 올인원 디지털 교실",
    description: "🤖 AI 도구 📚 수업 관리 👥 학생 관리 🎬 YouTube Bank - 7가지 교육 서비스를 한곳에서 이용하세요!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TeaBoard - 7가지 교육 서비스 허브 (AI 도구, 수업 관리, 학생 관리, YouTube Bank, 문서 생성, 퀴즈 생성, 슬라이드 제작)",
        type: "image/png"
      }
    ],
  },

  // Twitter 카드 메타데이터
  twitter: {
    card: "summary_large_image",
    site: "@teacherboard",
    creator: "@moonjungkim",
    title: "TeaBoard - 선생님을 위한 올인원 디지털 교실",
    description: "🤖 AI 도구 📚 수업 관리 👥 학생 관리 🎬 YouTube - 7가지 교육 서비스 허브",
    images: ["/og-image.png"],
  },
  
  // 기존 설정들
  themeColor: "#16a34a",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Teacher Board",
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${montserrat.variable} ${openSans.variable} antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Teacher Board" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* 파비콘 */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        
        {/* PWA 매니페스트 */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* 추가 SEO 메타태그 */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Teacher Board Team" />
        <meta name="language" content="Korean" />
        
        {/* Open Graph 추가 메타태그 */}
        <meta property="og:site_name" content="Teacher Board" />
        <meta property="og:locale" content="ko_KR" />
        
        {/* 구조화된 데이터 */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "TeaBoard",
            "description": "AI 도구, 수업 관리, 학생 관리, YouTube Bank까지! 선생님을 위한 7가지 교육 서비스 허브",
            "url": "https://teaboard.link",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "KRW"
            },
            "author": {
              "@type": "Person",
              "name": "Moon-Jung Kim"
            },
            "creator": {
              "@type": "Person",
              "name": "Moon-Jung Kim",
              "url": "https://www.youtube.com/@%EB%B0%B0%EC%9B%80%EC%9D%98%EB%8B%AC%EC%9D%B8-p5v"
            }
          })}
        </script>
      </head>
      <body className="font-sans">
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Register service worker for PWA functionality
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
              
              // Performance monitoring
              if (typeof PerformanceObserver !== 'undefined') {
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure') {
                      // Send performance data to service worker
                      navigator.serviceWorker.ready.then((registration) => {
                        registration.active.postMessage({
                          type: 'PERFORMANCE_MEASURE',
                          measure: {
                            name: entry.name,
                            duration: entry.duration,
                            startTime: entry.startTime
                          }
                        });
                      });
                    }
                  }
                });
                observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
              }
              
              // Mobile-specific optimizations
              if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                // Prevent zoom on input focus for iOS
                document.addEventListener('touchstart', function() {}, { passive: true });
                
                // Add mobile class to body
                document.body.classList.add('mobile-device');
                
                // Hide address bar on mobile
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    window.scrollTo(0, 1);
                  }, 0);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
