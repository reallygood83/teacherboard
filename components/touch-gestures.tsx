"use client"

import { useEffect, useCallback } from 'react'

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
  let startX = 0
  let startY = 0
  let endX = 0
  let endY = 0

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!e.changedTouches.length) return
    
    const touch = e.changedTouches[0]
    endX = touch.clientX
    endY = touch.clientY
    
    const deltaX = endX - startX
    const deltaY = endY - startY
    
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
    const element = document.querySelector(`.${className}`) as HTMLElement
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchEnd, className])

  return (
    <div className={className}>
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