'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { useAuth } from '@/contexts/AuthContext'

export default function HeroVideoSection() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await signInWithGoogle()
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || '로그인에 실패했습니다')
      console.error('Google login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative w-full h-screen overflow-hidden chanel-theme">
      {/* Full-screen video background */}
      <div className="absolute inset-0 w-full h-full">
        {isClient && (
          <video
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
          >
            <source src="/videos/brand-teacher-dance.mp4" type="video/mp4" />
          </video>
        )}

        {/* Video overlay gradient */}
        <div className="video-gradient-overlay absolute inset-0" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 lg:px-8">
        <AnimatePresence>
          {videoLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="max-w-4xl space-y-8"
            >
              {/* Logo/Brand mark */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex items-center justify-center gap-3"
              >
                <Sparkles className="w-8 h-8 text-[var(--chanel-gold)]" />
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight">
                  TeaBoard
                </h1>
                <Sparkles className="w-8 h-8 text-[var(--chanel-gold)]" />
              </motion.div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="text-xl sm:text-2xl lg:text-3xl text-white/90 font-light tracking-wide"
              >
                교육의 혁신을 선도하는
                <br />
                <span className="text-[var(--chanel-gold)] font-semibold">AI 기반 교사 플랫폼</span>
              </motion.p>

              {/* CTA Button - Google Login */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="pt-8"
              >
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--chanel-gold)] hover:bg-[#C19A2E] text-white font-semibold text-lg rounded-sm transition-all duration-300 luxury-shadow hover:luxury-shadow-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                      <span>로그인 중...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Google로 시작하기</span>
                    </>
                  )}
                </button>
                {error && (
                  <p className="mt-4 text-sm text-red-500 bg-white/90 px-4 py-2 rounded-sm">
                    {error}
                  </p>
                )}
              </motion.div>

              {/* Service count badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="pt-12"
              >
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <span className="text-[var(--chanel-gold)] text-lg font-bold">혁신적인 서비스</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: videoLoaded ? 1 : 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <p className="text-white/60 text-sm tracking-widest uppercase">Scroll</p>
            <ChevronDown className="w-6 h-6 text-white/60" />
          </motion.div>
        </motion.div>
      </div>

      {/* Loading fallback */}
      {!videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--chanel-black)]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[var(--chanel-gold)] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 text-sm">Loading Experience...</p>
          </div>
        </div>
      )}
    </section>
  )
}
