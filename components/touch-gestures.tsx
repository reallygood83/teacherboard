"use client"

import { useEffect, useCallback, useRef } from 'react'

interface TouchGestureProps {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  children: React.ReactNode
  className?: string
}

export function TouchGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  children,
  className = ""
}: TouchGestureProps) {
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    startXRef.current = touch.clientX
    startYRef.current = touch.clientY
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!e.changedTouches.length) return
    
    const touch = e.changedTouches[0]
    const endX = touch.clientX
    const endY = touch.clientY
    
    const deltaX = endX - startXRef.current
    const deltaY = endY - startYRef.current
    
    // Determine if this is primarily a horizontal or vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchEnd])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Hook for tab navigation gestures
export function useTabSwipeGesture(
  tabs: string[],
  activeTab: string,
  onTabChange: (tab: string) => void
) {
  const currentIndex = tabs.indexOf(activeTab)
  
  const handleSwipeLeft = useCallback(() => {
    if (currentIndex < tabs.length - 1) {
      onTabChange(tabs[currentIndex + 1])
    }
  }, [currentIndex, tabs, onTabChange])
  
  const handleSwipeRight = useCallback(() => {
    if (currentIndex > 0) {
      onTabChange(tabs[currentIndex - 1])
    }
  }, [currentIndex, tabs, onTabChange])
  
  return { handleSwipeLeft, handleSwipeRight }
}

export default TouchGesture