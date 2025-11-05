"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface MobileCardProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
  className?: string
  variant?: 'default' | 'compact' | 'full'
}

export function MobileCard({
  title,
  description,
  icon,
  children,
  collapsible = false,
  defaultExpanded = true,
  className = "",
  variant = 'default'
}: MobileCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const getCardStyles = () => {
    switch (variant) {
      case 'compact':
        return "md:p-6 p-4 rounded-xl"
      case 'full':
        return "md:p-8 p-4 rounded-2xl shadow-lg"
      default:
        return "md:p-6 p-4 rounded-xl"
    }
  }

  return (
    <Card className={`card-hover ${getCardStyles()} ${className}`}>
      <CardHeader 
        className={`${collapsible ? 'cursor-pointer select-none' : ''} md:pb-6 pb-4`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <CardTitle className="flex items-center justify-between gap-2 font-serif">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-lg md:text-xl">{title}</span>
          </div>
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 md:h-8 md:w-8"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm md:text-base leading-relaxed">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      
      <AnimatePresence initial={false}>
        {(!collapsible || isExpanded) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <CardContent className="md:pt-0 pt-0">
              {children}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// Mobile-optimized grid layout component
interface MobileGridProps {
  children: ReactNode
  columns?: {
    mobile: number
    tablet: number
    desktop: number
  }
  gap?: string
  className?: string
}

export function MobileGrid({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "gap-4 md:gap-6",
  className = ""
}: MobileGridProps) {
  const gridCols = `grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`
  
  return (
    <div className={`grid ${gridCols} ${gap} ${className}`}>
      {children}
    </div>
  )
}

// Mobile-friendly button group
interface MobileButtonGroupProps {
  children: ReactNode
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function MobileButtonGroup({ 
  children, 
  orientation = 'horizontal',
  className = ""
}: MobileButtonGroupProps) {
  const orientationClass = orientation === 'horizontal' 
    ? 'flex flex-wrap gap-2 md:gap-3' 
    : 'flex flex-col space-y-2 md:space-y-3'
    
  return (
    <div className={`${orientationClass} ${className}`}>
      {children}
    </div>
  )
}

// Mobile-optimized section divider
export function MobileSectionDivider({ 
  title, 
  className = "" 
}: { 
  title?: string
  className?: string 
}) {
  return (
    <div className={`my-6 md:my-8 ${className}`}>
      {title && (
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 md:mb-4">
          {title}
        </h3>
      )}
      <div className="border-t border-gray-200" />
    </div>
  )
}

export default MobileCard