"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  BookOpen
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { type TabInfo } from "@/lib/tab-config"

interface MobileNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: TabInfo[]
}

export function MobileNavigation({ activeTab, onTabChange, tabs }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Close menu when tab changes
  useEffect(() => {
    setIsOpen(false)
    setIsExpanded(false)
  }, [activeTab])

  // Group tabs by category
  const groupedTabs = tabs.reduce((acc, tab) => {
    if (!acc[tab.category]) acc[tab.category] = []
    acc[tab.category].push(tab)
    return acc
  }, {} as Record<string, TabInfo[]>)

  const categoryLabels = {
    main: '📚 주요 기능',
    tools: '🛠️ 교육 도구', 
    management: '⚙️ 관리'
  }

  const currentTab = tabs.find(tab => tab.id === activeTab)
  const CurrentIcon = currentTab?.icon || BookOpen

  return (
    <>
      {/* Mobile Navigation Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CurrentIcon className="w-5 h-5 text-green-600" />
            <div>
              <h2 className="font-medium text-gray-900 text-sm">{currentTab?.label}</h2>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                {currentTab?.description}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2"
            aria-label="메뉴 열기"
          >
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Navigation Panel */}
            <motion.div
              className="md:hidden fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-white z-50 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900">메뉴</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-2"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Compact Grid View */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700 text-sm">빠른 선택</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="p-1 text-xs"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3 mr-1" />
                          접기
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 mr-1" />
                          전체보기
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Quick Grid (3 most used) */}
                  <div className="grid grid-cols-3 gap-2">
                    {tabs.slice(0, isExpanded ? tabs.length : 6).map((tab) => {
                      const Icon = tab.icon
                      const isActive = tab.id === activeTab
                      
                      return (
                        <motion.button
                          key={tab.id}
                          onClick={() => onTabChange(tab.id)}
                          className={`
                            p-3 rounded-xl border-2 text-center transition-all
                            ${isActive 
                              ? 'border-green-500 bg-green-50 text-green-700' 
                              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                            }
                          `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-1 ${
                            isActive ? 'text-green-600' : 'text-gray-600'
                          }`} />
                          <p className="text-xs font-medium truncate">
                            {tab.label}
                          </p>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Categorized List View */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 text-sm">전체 메뉴</h4>
                  
                  {Object.entries(groupedTabs).map(([category, categoryTabs]) => (
                    <div key={category} className="space-y-2">
                      <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {categoryLabels[category as keyof typeof categoryLabels]}
                      </h5>
                      
                      <div className="space-y-1">
                        {categoryTabs.map((tab) => {
                          const Icon = tab.icon
                          const isActive = tab.id === activeTab
                          
                          return (
                            <motion.button
                              key={tab.id}
                              onClick={() => onTabChange(tab.id)}
                              className={`
                                w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
                                ${isActive 
                                  ? 'bg-green-100 border border-green-300 text-green-800' 
                                  : 'hover:bg-gray-100'
                                }
                              `}
                              whileHover={{ x: 2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Icon className={`w-5 h-5 ${
                                isActive ? 'text-green-600' : 'text-gray-600'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm ${
                                  isActive ? 'text-green-800' : 'text-gray-900'
                                }`}>
                                  {tab.label}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {tab.description}
                                </p>
                              </div>
                              {isActive && (
                                <Badge variant="secondary" className="bg-green-200 text-green-800 text-xs">
                                  선택됨
                                </Badge>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Usage Tips */}
                <Card className="bg-blue-50 border-blue-200 p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-blue-800 mb-2">
                      💡 모바일 사용 팁
                    </p>
                    <ul className="text-xs text-blue-600 space-y-1 text-left">
                      <li>• 빠른 선택으로 자주 쓰는 기능에 빠르게 접근</li>
                      <li>• 세로 화면에서 더 편리하게 사용 가능</li>
                      <li>• 탭 제목을 탭하면 상세 설명 확인</li>
                    </ul>
                  </div>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default MobileNavigation