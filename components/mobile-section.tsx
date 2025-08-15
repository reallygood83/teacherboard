"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { MobileCard } from "@/components/mobile-card"

interface MobileSectionProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  isActive?: boolean
  className?: string
}

export function MobileSection({
  title,
  description,
  icon,
  children,
  isActive = true,
  className = ""
}: MobileSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`mobile-section ${className}`}
    >
      <MobileCard
        title={title}
        description={description}
        icon={icon}
        variant="default"
        className="w-full"
      >
        <div className="mobile-content">
          {children}
        </div>
      </MobileCard>
    </motion.div>
  )
}

// Mobile-optimized grid container for sections
interface MobileSectionGridProps {
  children: ReactNode
  className?: string
}

export function MobileSectionGrid({ children, className = "" }: MobileSectionGridProps) {
  return (
    <div className={`
      grid 
      grid-cols-1 
      md:grid-cols-2 
      lg:grid-cols-3 
      gap-4 
      md:gap-6 
      mobile-section-grid
      ${className}
    `}>
      {children}
    </div>
  )
}

// Mobile-friendly content wrapper with proper spacing
interface MobileContentWrapperProps {
  children: ReactNode
  spacing?: 'tight' | 'normal' | 'loose'
  className?: string
}

export function MobileContentWrapper({ 
  children, 
  spacing = 'normal',
  className = "" 
}: MobileContentWrapperProps) {
  const spacingClass = {
    tight: 'space-y-3',
    normal: 'space-y-4 md:space-y-6',
    loose: 'space-y-6 md:space-y-8'
  }[spacing]

  return (
    <div className={`mobile-content-wrapper ${spacingClass} ${className}`}>
      {children}
    </div>
  )
}

export default MobileSection