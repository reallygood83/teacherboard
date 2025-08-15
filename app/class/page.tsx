'use client';

import { useState, useEffect } from "react"
import "../../styles/navigation.css"
import "../../styles/mobile-optimized.css"
import { PerformanceMonitor, usePerformanceMonitor } from '@/components/ui/performance-monitor'
import { mobileUtils } from '@/lib/mobile-utils'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  Clock,
  Calendar,
  Users,
  BookOpen,
  Link,
  Timer,
  Shuffle,
  UserCheck,
  ExternalLink,
  Heart,
  Play,
  SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Brain,
  FileText,
} from "lucide-react"

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DigitalClock } from '@/components/digital-clock';
import { Settings } from '@/components/settings';

interface SettingsData {
  title: string
  subtitle: string
  backgroundMode: string
  footerText: string
  footerSubtext: string
  footerPosition: string
  studentManagementSystem: string
}

interface SavedLink {
  id: string
  title: string
  url: string
  description?: string
  category: string
  addedDate: string
  isQuickLink?: boolean
}

export default function ClassHomepage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  
  const [currentDate, setCurrentDate] = useState("")
  const [isQuickLinksCollapsed, setIsQuickLinksCollapsed] = useState(false)
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([])
  const [activeTab, setActiveTab] = useState("tools")
  const [tabOrder, setTabOrder] = useState([
    "tools", "ai-tools", "schedule", "schedule-management", 
    "students", "youtube", "links", "time", "settings"
  ])
  const [isMobile, setIsMobile] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [countdownText, setCountdownText] = useState("")

  const [settings, setSettings] = useState<SettingsData>({
    title: "우리 반 홈페이지",
    subtitle: "함께 배우고 성장하는 공간",
    backgroundMode: "green",
    footerText: "모든 학생이 빛날 수 있도록",
    footerSubtext: "박달초등학교 - 김문정",
    footerPosition: "bottom",
    studentManagementSystem: "custom"
  })

  useEffect(() => {
    if (!currentUser && !loading) {
      router.push('/auth/login');
      return;
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const handleSettingsChange = (newSettings: SettingsData) => {
    setSettings(newSettings)
  }

  const removeQuickLink = (id: string) => {
    const updatedLinks = savedLinks.map((link) => {
      if (link.id === id) {
        return { ...link, isQuickLink: false }
      }
      return link
    })
    setSavedLinks(updatedLinks)
    localStorage.setItem("classHomepageLinks", JSON.stringify(updatedLinks))
  }

  const openLink = (url: string) => {
    window.open(url, "_blank")
  }

  const getBackgroundClass = () => {
    switch (settings.backgroundMode) {
      case "blue":
        return "bg-blue-50"
      case "purple":
        return "bg-purple-50"
      case "orange":
        return "bg-orange-50"
      case "pink":
        return "bg-pink-50"
      case "gray":
        return "bg-gray-50"
      default:
        return "bg-green-50"
    }
  }

  const getGradientClass = () => {
    switch (settings.backgroundMode) {
      case "blue":
        return "bg-gradient-to-r from-blue-600 to-blue-700"
      case "purple":
        return "bg-gradient-to-r from-purple-600 to-purple-700"
      case "orange":
        return "bg-gradient-to-r from-orange-600 to-orange-700"
      case "pink":
        return "bg-gradient-to-r from-pink-600 to-pink-700"
      case "gray":
        return "bg-gradient-to-r from-gray-600 to-gray-700"
      default:
        return "educational-gradient"
    }
  }

  const getAccentColor = () => {
    switch (settings.backgroundMode) {
      case "blue":
        return "text-blue-600"
      case "purple":
        return "text-purple-600"
      case "orange":
        return "text-orange-600"
      case "pink":
        return "text-pink-600"
      case "gray":
        return "text-gray-600"
      default:
        return "text-green-600"
    }
  }

  const tabsInfo = {
    "tools": { icon: BookOpen, label: "수업 도구", shortLabel: "수업" },
    "ai-tools": { icon: Brain, label: "AI 도구", shortLabel: "AI" },
    "schedule": { icon: Calendar, label: "시간표", shortLabel: "시간표" },
    "schedule-management": { icon: Calendar, label: "일정 관리", shortLabel: "일정" },
    "students": { icon: Users, label: "학생 관리", shortLabel: "학생" },
    "youtube": { icon: Play, label: "YouTube", shortLabel: "동영상" },
    "links": { icon: Link, label: "외부 링크", shortLabel: "링크" },
    "time": { icon: Clock, label: "시간 관리", shortLabel: "시간" },
    "settings": { icon: SettingsIcon, label: "설정", shortLabel: "설정" }
  };

  return (
    <div className={`mobile-layout ${getBackgroundClass()}`}>
      <header className={`mobile-header ${getGradientClass()}`}>
        <div className="mobile-header-content">
          <div>
            <h1 className="mobile-header-title">{settings.title}</h1>
            <p className="mobile-header-subtitle hidden sm:block">{settings.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-white text-opacity-90 text-xs">오늘은</p>
              <p className="font-semibold text-sm">{currentDate.split(' ').slice(0, 2).join(' ')}</p>
              {countdownText && (
                <p className="text-yellow-200 text-xs mt-1 truncate max-w-[140px]">
                  {countdownText}
                </p>
              )}
            </div>
            <div className="text-white">사용자</div>
          </div>
        </div>
      </header>

      <div className="mobile-container">
        <div className="mb-4 text-center px-2">
          <p className="text-gray-600 text-sm sm:text-base">
            안녕하세요 {currentUser.displayName}님 ❤️
          </p>
          <p className="text-gray-500 text-xs sm:hidden mt-1">{currentDate}</p>
        </div>
      </div>

      <main className="mobile-main">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="time" className="mobile-grid">
            <div className="card-mobile">
              <div className="card-mobile-header">
                <h3 className="card-mobile-title">
                  <Clock className="mobile-icon text-green-600" />
                  시간 관리
                </h3>
              </div>
              <div className="card-mobile-content">
                <DigitalClock />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mobile-grid">
            <div className="card-mobile">
              <div className="card-mobile-header">
                <h3 className="card-mobile-title">
                  <SettingsIcon className="mobile-icon text-green-600" />
                  설정
                </h3>
              </div>
              <div className="card-mobile-content">
                <Settings onSettingsChange={handleSettingsChange} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {isMobile && (
        <nav className="mobile-bottom-nav">
          <div className="mobile-bottom-nav-container">
            {tabOrder.slice(0, 4).map((tabKey) => {
              const tabInfo = tabsInfo[tabKey as keyof typeof tabsInfo]
              const IconComponent = tabInfo.icon
              return (
                <div
                  key={tabKey}
                  className={`mobile-bottom-nav-item ${activeTab === tabKey ? 'active' : ''} haptic-light`}
                  onClick={() => setActiveTab(tabKey)}
                >
                  <IconComponent className="mobile-bottom-nav-icon" />
                  <span className="mobile-bottom-nav-label">{tabInfo.shortLabel}</span>
                </div>
              )
            })}
          </div>
        </nav>
      )}

      {settings.footerPosition === "bottom" && (
        <footer className="mobile-footer">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              <Heart className="w-4 h-4 inline text-red-500 mr-1" />
              {settings.footerText}
            </p>
            <p className="text-sm text-gray-500">{settings.footerSubtext}</p>
          </div>
        </footer>
      )}
      
      <PerformanceMonitor />
    </div>
  )
}

function ClassPageContent() {
  usePerformanceMonitor('ClassPage');
  
  return null;
}