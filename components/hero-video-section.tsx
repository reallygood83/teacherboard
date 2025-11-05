'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import { AspectRatio } from '@/components/ui/aspect-ratio'

export default function HeroVideoSection() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="pt-8"
              >
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--chanel-gold)] hover:bg-[var(--chanel-champagne)] text-[var(--chanel-black)] font-semibold text-lg rounded-sm transition-all duration-300 luxury-shadow hover:luxury-shadow-hover"
                >
                  시작하기
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  >
                    →
                  </motion.div>
                </a>
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
