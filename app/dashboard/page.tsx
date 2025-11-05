'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  BarChart3,
  Video,
  FileText,
  ClipboardCheck,
  Presentation,
  Coins,
  LogOut,
  User,
  ArrowUpRight
} from 'lucide-react'

// 7가지 서비스 구성 (Neo-Brutalism 스타일)
const services = [
  {
    id: 1,
    title: '학급 홈페이지',
    description: '학급 운영을 위한 종합 관리 시스템',
    icon: BookOpen,
    url: 'https://teaboard.link/class',
    color: '#00E5FF', // Cyan
    bgColor: '#E0F7FF'
  },
  {
    id: 2,
    title: '누가바',
    description: '학생별 누가기록 관리 도구',
    icon: BarChart3,
    url: 'https://nugabar.teaboard.link',
    color: '#00E676', // Green
    bgColor: '#E8F5E9'
  },
  {
    id: 3,
    title: 'YouTube Bank',
    description: '교육용 영상 큐레이션 플랫폼',
    icon: Video,
    url: 'https://youtube.teaboard.link',
    color: '#FF6B9D', // Pink
    bgColor: '#FCE4EC'
  },
  {
    id: 4,
    title: 'TeaBoard DOCs',
    description: 'AI 기반 문서 생성 도구',
    icon: FileText,
    url: 'https://docs.teaboard.link',
    color: '#9C27B0', // Purple
    bgColor: '#F3E5F5'
  },
  {
    id: 5,
    title: 'TeaBoard Forms',
    description: 'AI 퀴즈 및 설문 생성기',
    icon: ClipboardCheck,
    url: 'https://quiz.teaboard.link',
    color: '#FF6F00', // Orange
    bgColor: '#FFF3E0'
  },
  {
    id: 6,
    title: 'MarkSlide',
    description: '마크다운 기반 슬라이드 제작',
    icon: Presentation,
    url: 'https://markslide.teaboard.link',
    color: '#FFEB3B', // Yellow
    bgColor: '#FFFDE7'
  },
  {
    id: 7,
    title: '리치스튜던트',
    description: '학생 금융 교육 플랫폼',
    icon: Coins,
    url: 'https://richstudent.dev',
    color: '#C6FF00', // Lime
    bgColor: '#F9FBE7'
  }
]

export default function DashboardPage() {
  const { currentUser, loading, signOut } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !currentUser && mounted) {
      router.push('/login')
    }
  }, [currentUser, loading, router, mounted])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[var(--brutal-black)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[var(--brutal-black)] font-bold tracking-widest">LOADING...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Neo-Brutalism Header */}
      <header className="brutal-border border-b-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-[var(--brutal-yellow)] brutal-border rounded-lg flex items-center justify-center brutal-shadow-sm">
                <span className="text-2xl font-black text-[var(--brutal-black)]">T</span>
              </div>
              <div>
                <h1 className="text-3xl font-black text-[var(--brutal-black)] tracking-tight">
                  TeaBoard
                </h1>
                <p className="text-sm font-bold text-gray-600">서비스 허브</p>
              </div>
            </motion.div>

            {/* User Info & Logout */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 brutal-border rounded-lg">
                <User className="w-4 h-4 text-[var(--brutal-black)]" />
                <span className="text-sm font-bold text-[var(--brutal-black)]">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--brutal-pink)] brutal-border rounded-lg brutal-shadow hover:brutal-shadow-hover hover:translate-x-1 hover:translate-y-1 transition-all duration-200 active:translate-x-0 active:translate-y-0"
              >
                <LogOut className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">로그아웃</span>
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Badge className="mb-4 bg-[var(--brutal-cyan)] text-[var(--brutal-black)] brutal-border px-4 py-1 text-sm font-black">
            7 SERVICES
          </Badge>
          <h2 className="text-5xl sm:text-6xl font-black text-[var(--brutal-black)] mb-4 tracking-tight">
            환영합니다! 👋
          </h2>
          <p className="text-xl font-bold text-gray-600">
            TeaBoard의 모든 서비스를 한곳에서 이용하세요
          </p>
        </motion.div>

        {/* Services Grid - 2 rows × 4 columns */}
        <div className="space-y-8">
          {/* First Row - 4 items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.slice(0, 4).map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full group"
                >
                  <Card
                    className="h-full brutal-border brutal-shadow hover:brutal-shadow-hover hover:translate-x-2 hover:translate-y-2 transition-all duration-200 active:translate-x-0 active:translate-y-0"
                    style={{ backgroundColor: service.bgColor }}
                  >
                    <CardHeader className="space-y-4">
                      <div
                        className="w-16 h-16 brutal-border rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: service.color }}
                      >
                        <service.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl font-black text-[var(--brutal-black)] tracking-tight leading-tight">
                          {service.title}
                        </CardTitle>
                        <ArrowUpRight className="w-5 h-5 text-[var(--brutal-black)] flex-shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm font-bold text-gray-700">
                        {service.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>

          {/* Second Row - 3 items centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {services.slice(4, 7).map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: (index + 4) * 0.1 }}
              >
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full group"
                >
                  <Card
                    className="h-full brutal-border brutal-shadow hover:brutal-shadow-hover hover:translate-x-2 hover:translate-y-2 transition-all duration-200 active:translate-x-0 active:translate-y-0"
                    style={{ backgroundColor: service.bgColor }}
                  >
                    <CardHeader className="space-y-4">
                      <div
                        className="w-16 h-16 brutal-border rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: service.color }}
                      >
                        <service.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl font-black text-[var(--brutal-black)] tracking-tight leading-tight">
                          {service.title}
                        </CardTitle>
                        <ArrowUpRight className="w-5 h-5 text-[var(--brutal-black)] flex-shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm font-bold text-gray-700">
                        {service.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 p-8 bg-[var(--brutal-lime)] brutal-border brutal-shadow rounded-2xl"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-3xl font-black text-[var(--brutal-black)] mb-2">
                새로운 서비스 제안이 있으신가요?
              </h3>
              <p className="text-lg font-bold text-gray-800">
                언제든지 피드백을 보내주세요!
              </p>
            </div>
            <a
              href="https://open.kakao.com/me/vesa"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[var(--brutal-black)] text-white font-black text-lg brutal-border rounded-lg brutal-shadow hover:brutal-shadow-hover hover:translate-x-2 hover:translate-y-2 transition-all duration-200 active:translate-x-0 active:translate-y-0 whitespace-nowrap"
            >
              피드백 보내기 →
            </a>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-24 py-8 px-4 sm:px-6 lg:px-8 border-t-4 brutal-border bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-bold text-gray-600">
            © 2025 TeaBoard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
