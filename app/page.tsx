'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import HeroVideoSection from '@/components/hero-video-section'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen,
  BarChart3,
  Video,
  FileText,
  ClipboardCheck,
  Presentation,
  Coins,
  Sparkles,
  Zap,
  Shield
} from 'lucide-react'

// 7가지 서비스 구성
const services = [
  {
    id: 1,
    title: '학급 홈페이지',
    description: '학급 운영을 위한 종합 관리 시스템',
    icon: BookOpen,
    url: 'https://teaboard.link/class',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    title: '누가바',
    description: '학생별 누가기록 관리 도구',
    icon: BarChart3,
    url: 'https://nugabar.teaboard.link',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 3,
    title: 'YouTube Bank',
    description: '교육용 영상 큐레이션 플랫폼',
    icon: Video,
    url: 'https://youtube.teaboard.link',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 4,
    title: 'TeaBoard DOCs',
    description: 'AI 기반 문서 생성 도구',
    icon: FileText,
    url: 'https://docs.teaboard.link',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 5,
    title: 'TeaBoard Forms',
    description: 'AI 퀴즈 및 설문 생성기',
    icon: ClipboardCheck,
    url: 'https://quiz.teaboard.link',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 6,
    title: 'MarkSlide',
    description: '마크다운 기반 슬라이드 제작',
    icon: Presentation,
    url: 'https://markslide.teaboard.link',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 7,
    title: '리치스튜던트',
    description: '학생 금융 교육 플랫폼',
    icon: Coins,
    url: 'https://richstudent.dev',
    color: 'from-yellow-500 to-yellow-600'
  }
]

// Features section data
const features = [
  {
    icon: Sparkles,
    title: 'AI 기반 자동화',
    description: '반복 작업을 AI가 자동으로 처리하여 교사의 시간을 절약합니다'
  },
  {
    icon: Zap,
    title: '실시간 동기화',
    description: '모든 서비스가 실시간으로 연동되어 효율적인 업무 환경을 제공합니다'
  },
  {
    icon: Shield,
    title: '안전한 데이터 관리',
    description: 'Firebase 기반의 안전한 클라우드 스토리지로 데이터를 보호합니다'
  }
]

export default function LandingPage() {
  const { currentUser, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && currentUser && mounted) {
      // 로그인된 사용자는 대시보드로 자동 리다이렉트
      router.push('/dashboard')
    }
  }, [currentUser, loading, router, mounted])

  // 로딩 중
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--chanel-black)]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[var(--chanel-gold)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/60 text-sm tracking-widest">LOADING...</p>
        </div>
      </div>
    )
  }

  // 로그인된 사용자는 리다이렉트 중
  if (currentUser) {
    return null
  }

  // 로그인 안 된 사용자에게 Chanel 스타일 랜딩 페이지 표시
  return (
    <main className="min-h-screen bg-[var(--chanel-white)] chanel-theme">
      {/* Hero Video Section */}
      <HeroVideoSection />

      {/* Services Grid Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--chanel-white)]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 space-y-4"
          >
            <Badge variant="outline" className="text-[var(--chanel-gold)] border-[var(--chanel-gold)] mb-4">
              SERVICES
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-[var(--chanel-black)] tracking-tight">
              혁신적인 교육 도구
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              TeaBoard가 제공하는 전문 서비스로 교육 현장의 모든 니즈를 해결하세요
            </p>
          </motion.div>

          {/* Services Grid - 2 rows × 4 columns (last row centered) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {services.slice(0, 4).map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  <Card className="h-full hover:luxury-shadow transition-all duration-300 border-gray-200 hover:border-[var(--chanel-gold)] group">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <service.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-[var(--chanel-black)] group-hover:text-[var(--chanel-gold)] transition-colors">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600">
                        {service.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>

          {/* Second Row - Centered 3 items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {services.slice(4, 7).map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (index + 4) * 0.1 }}
              >
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  <Card className="h-full hover:luxury-shadow transition-all duration-300 border-gray-200 hover:border-[var(--chanel-gold)] group">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <service.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-[var(--chanel-black)] group-hover:text-[var(--chanel-gold)] transition-colors">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600">
                        {service.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="my-0" />

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-[var(--chanel-black)] mb-4">
              왜 TeaBoard인가?
            </h2>
            <p className="text-lg text-gray-600">
              교육 현장의 실제 니즈를 반영한 혁신적인 기능들
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center space-y-4"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--chanel-gold)] to-[var(--chanel-champagne)] flex items-center justify-center">
                  <feature.icon className="w-10 h-10 text-[var(--chanel-black)]" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--chanel-black)]">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--chanel-black)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-white/80">
            TeaBoard와 함께 교육의 새로운 패러다임을 경험하세요
          </p>
          <div className="pt-8">
            <a
              href="/login"
              className="inline-flex items-center gap-3 px-12 py-6 bg-[var(--chanel-gold)] hover:bg-[var(--chanel-champagne)] text-[var(--chanel-black)] font-bold text-xl rounded-sm transition-all duration-300 luxury-shadow hover:luxury-shadow-hover"
            >
              로그인하고 시작하기
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                →
              </motion.div>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[var(--chanel-gray)] text-white/60">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <p className="text-sm">
            © 2025 TeaBoard. All rights reserved.
          </p>
          <p className="text-xs">
            교육 혁신을 선도하는 AI 기반 교사 플랫폼
          </p>
        </div>
      </footer>
    </main>
  )
}
