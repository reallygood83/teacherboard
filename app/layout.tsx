import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
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
  title: "Teaboard - AI 기반 스마트 학급 관리",
  description: "🎯 출석체크부터 학급도구까지! 선생님을 위한 올인원 디지털 교실 플랫폼. 모바일 최적화로 언제 어디서나 편리하게!",
  generator: "Teaboard",
  manifest: "/manifest.json",
  keywords: ["학급관리", "교육도구", "AI교육", "출석체크", "디지털교실", "스마트교육", "모바일교육"],
  authors: [{ name: "Teaboard Team" }],
  creator: "Teaboard",
  publisher: "Teaboard",
  category: "Education",
  
  // Open Graph 메타데이터
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://teaboard.link/class",
    siteName: "Teaboard",
    title: "Teaboard - 선생님을 위한 스마트 학급 관리",
    description: "🎯 출석체크부터 학급도구까지! AI 기반 올인원 교실 플랫폼으로 수업을 더 스마트하게 관리하세요.",
    images: [
      {
        url: "/teaboard-og-image.svg",
        width: 1200,
        height: 630,
        alt: "Teaboard - AI 기반 스마트 학급 관리 플랫폼",
        type: "image/svg+xml"
      },
      {
        url: "/teaboard-logo.svg",
        width: 400,
        height: 120,
        alt: "Teaboard 로고",
        type: "image/svg+xml"
      }
    ],
  },
  
  // Twitter 카드 메타데이터
  twitter: {
    card: "summary_large_image",
    site: "@teaboard",
    creator: "@teaboard",
    title: "Teaboard - 선생님을 위한 스마트 학급 관리",
    description: "🎯 출석체크부터 학급도구까지! AI 기반 올인원 교실 플랫폼",
    images: ["/teaboard-og-image.svg"],
  },
  
  // 기존 설정들
  themeColor: "#3B82F6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Teaboard",
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
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Teaboard" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* 파비콘 */}
        <link rel="icon" href="/teaboard-logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        
        {/* PWA 매니페스트 */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* 추가 SEO 메타태그 */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Teaboard Team" />
        <meta name="language" content="Korean" />
        
        {/* Open Graph 추가 메타태그 */}
        <meta property="og:site_name" content="Teaboard" />
        <meta property="og:locale" content="ko_KR" />
        
        {/* 구조화된 데이터 */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Teaboard",
            "description": "AI 기반 스마트 학급 관리 플랫폼",
            "url": "https://teaboard.link/class",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "KRW"
            },
            "author": {
              "@type": "Organization",
              "name": "Teaboard Team"
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
