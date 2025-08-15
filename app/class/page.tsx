'use client';

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MobileNavigation from "@/components/mobile-navigation"
import { MobileCard, MobileGrid, MobileButtonGroup } from "@/components/mobile-card"
import TouchGesture, { useTabSwipeGesture } from "@/components/touch-gestures"
import { tabConfig, getTabIds, type TabInfo } from "@/lib/tab-config"
import {
  Clock,
  Timer,
  Shuffle,
  UserCheck,
  ExternalLink,
  Heart,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  FileText,
  Settings as SettingsIcon,
} from "lucide-react"
import { DigitalClock } from "@/components/digital-clock"
import { Chalkboard } from "@/components/chalkboard"
import { StudentPicker } from "@/components/student-picker"
import { GroupMaker } from "@/components/group-maker"
import { LinkEmbedder } from "@/components/link-embedder"
import { Timetable } from "@/components/timetable"
import { YoutubeSearch } from "@/components/youtube-search"
import { Settings } from "@/components/settings"
// import { OfficialDocGenerator } from "@/components/official-doc-generator"
import { DocumentGenerator } from "@/components/document-generator"
import { ScheduleManager } from "@/components/schedule-manager"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import UserProfile from "@/components/auth/UserProfile"

interface SettingsData {
  title: string
  subtitle: string
  footerText: string
  footerSubtext: string
  backgroundMode: string
  geminiApiKey: string
  geminiModel: string
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

  // Touch gesture setup for tab navigation
  const tabIds = getTabIds()
  const { handleSwipeLeft, handleSwipeRight } = useTabSwipeGesture(
    tabIds,
    activeTab,
    setActiveTab
  )
  const [settings, setSettings] = useState<SettingsData>({
    title: "우리 학급 홈페이지",
    subtitle: "함께 배우고 성장하는 공간입니다 ❤️",
    footerText: "교육을 위한 따뜻한 기술",
    footerSubtext: "© 2025 우리 학급 홈페이지. 모든 권리 보유.",
    backgroundMode: "green",
    geminiApiKey: "",
    geminiModel: "gemini-1.5-flash",
  })

  // 헤더 카운트다운 관련 상태
  const [selectedImportantEvent, setSelectedImportantEvent] = useState<any | null>(null)
  const [countdownText, setCountdownText] = useState<string>("")
  useEffect(() => {
    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!loading && !currentUser) {
      router.push('/login');
      return;
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    const today = new Date()
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }
    setCurrentDate(today.toLocaleDateString("ko-KR", options))

    const savedSettings = localStorage.getItem("classHomepageSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // 저장된 링크 불러오기
    const savedLinksData = localStorage.getItem("classHomepageLinks")
    if (savedLinksData) {
      setSavedLinks(JSON.parse(savedLinksData))
    }
  }, [])

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
    return null; // useEffect에서 리다이렉트 처리
  }

  const handleSettingsChange = (newSettings: SettingsData) => {
    setSettings(newSettings)
  }

  // 빠른링크에서 링크 제거 (빠른 링크 상태만 해제)
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

  // 링크 열기
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

  return (
    <div className={`min-h-screen ${getBackgroundClass()}`}>
      {/* Header */}
      <header className={`${getGradientClass()} text-white md:py-8 py-6 px-4`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif font-black md:text-4xl text-2xl mb-2">{settings.title}</h1>
              <p className="text-green-100 md:text-lg text-base">{settings.subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-green-100 text-sm">오늘은</p>
                <p className="font-semibold md:text-xl text-lg">{currentDate}</p>
                {countdownText && (
                  <p className="text-yellow-200 text-sm mt-1 truncate max-w-[220px]">
                    {selectedImportantEvent?.title}: {countdownText}
                  </p>
                )}
              </div>
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:py-8 py-4">
        <div className="mb-6 md:mb-8 text-center">
          <p className="text-gray-600 md:text-lg text-base">안녕하세요 {currentUser.displayName}님, 오늘 하루도 평안하세요 ❤️</p>
        </div>

        <TouchGesture
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          className="mobile-swipe-container"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile Navigation */}
          <MobileNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabConfig}
          />
          
          {/* Desktop Navigation */}
          <TabsList className="hidden md:grid w-full grid-cols-9 mb-8">
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              수업 도구
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI 도구
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              시간표
            </TabsTrigger>
+           <TabsTrigger value="schedule-management" className="flex items-center gap-2">
+             <Calendar className="w-4 h-4" />
+             일정 관리
+           </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              학생 관리
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              YouTube
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              외부 링크
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              시간 관리
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              설정
            </TabsTrigger>
          </TabsList>

          {/* 수업 도구 탭 */}
          <TabsContent value="tools" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 수업 칠판 - 75% */}
              <div className={`transition-all duration-300 ${isQuickLinksCollapsed ? 'flex-1' : 'flex-[3]'}`}>
                <Card className="card-hover h-full">
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 font-serif`}>
                      <BookOpen className={`w-5 h-5 ${getAccentColor()}`} />
                      수업 칠판
                    </CardTitle>
                    <CardDescription>수업 중 필요한 내용을 자유롭게 작성하고 편집하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Chalkboard 
                      geminiApiKey={settings.geminiApiKey}
                      geminiModel={settings.geminiModel}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* 빠른 링크 - 25% 또는 접혀있을 때 숨김 */}
              {!isQuickLinksCollapsed && (
                <div className="flex-1">
                  <Card className="card-hover h-full">
                    <CardHeader>
                      <CardTitle className={`flex items-center justify-between gap-2 font-serif`}>
                        <div className="flex items-center gap-2">
                          <ExternalLink className={`w-5 h-5 ${getAccentColor()}`} />
                          빠른 링크
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setIsQuickLinksCollapsed(true)}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                      <CardDescription>자주 사용하는 교육 사이트에 빠르게 접속하세요</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* 새 링크 추가 버튼 */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        onClick={() => {
                          // 외부 링크 탭으로 이동
                          setActiveTab("links")
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        새 링크 추가
                      </Button>
                      {/* 링크 추가 안내 */}
                      {savedLinks.filter(link => link.isQuickLink).length === 0 && (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          <p className="mb-2">빠른 링크가 없습니다</p>
                          <p>외부 링크 탭에서 ⭐ 버튼을 눌러 빠른 링크로 추가하세요</p>
                        </div>
                      )}

                      {/* 빠른 링크들만 표시 */}
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {savedLinks.filter(link => link.isQuickLink).slice(0, 8).map((link: SavedLink) => (
                          <div key={link.id} className="group flex items-center justify-between bg-white/50 rounded-lg p-2 hover:bg-white/80 transition-colors">
                            <Button
                              variant="ghost"
                              className="flex-1 justify-start text-sm h-auto p-2 font-medium"
                              onClick={() => openLink(link.url)}
                              title={link.description || link.url}
                            >
                              <ExternalLink className="w-3 h-3 mr-2 text-gray-400" />
                              <span className="truncate">{link.title}</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeQuickLink(link.id)
                              }}
                              title="링크 제거"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* 빠른 링크가 8개 이상일 때 안내 */}
                      {savedLinks.filter(link => link.isQuickLink).length > 8 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          {savedLinks.filter(link => link.isQuickLink).length}개 중 8개 표시 중 (외부 링크 탭에서 전체 보기)
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 접힌 상태에서 펼치기 버튼 */}
              {isQuickLinksCollapsed && (
                <div className="flex items-start pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsQuickLinksCollapsed(false)}
                    className="h-8 w-8 p-0"
                    title="빠른 링크 펼치기"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* AI 도구 탭 */}
          <TabsContent value="ai-tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* 공문 생성기 */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 font-serif`}>
                    <FileText className={`w-5 h-5 ${getAccentColor()}`} />
                    공문 생성기
                  </CardTitle>
                  <CardDescription>
                    AI가 한국 공문서 표준 형식에 맞는 공문을 자동으로 작성해드립니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentGenerator 
                    geminiApiKey={settings.geminiApiKey}
                    geminiModel={settings.geminiModel}
                  />
                </CardContent>
              </Card>

              {/* 추가 AI 도구 썸네일 (향후 확장용) */}
              <Card className="card-hover opacity-60">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 font-serif text-gray-500`}>
                    <Brain className="w-5 h-5 text-gray-400" />
                    수업 계획서 생성기
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    곧 출시 예정 - AI가 교육과정에 맞는 수업 계획서를 자동 작성
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-400">
                    <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">개발중...</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover opacity-60">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 font-serif text-gray-500`}>
                    <Brain className="w-5 h-5 text-gray-400" />
                    학생 평가서 생성기
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    곧 출시 예정 - 학생별 맞춤형 평가서 및 생활기록부 작성 지원
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-400">
                    <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">개발중...</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI 도구 안내 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Brain className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">AI 도구 사용 안내</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• 설정 탭에서 Gemini API 키를 먼저 입력해주세요</li>
                      <li>• 생성된 문서는 반드시 검토 후 사용하시기 바랍니다</li>
                      <li>• 개인정보가 포함된 내용은 신중히 처리해주세요</li>
                      <li>• 더 많은 AI 도구가 지속적으로 추가될 예정입니다</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 시간표 탭 */}
          <TabsContent value="schedule">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 font-serif`}>
                  <Calendar className={`w-5 h-5 ${getAccentColor()}`} />
                  오늘의 시간표
                </CardTitle>
                <CardDescription>오늘의 수업 일정을 확인하고 관리하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Timetable />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 일정 관리 탭 */}
          <TabsContent value="schedule-management" className="space-y-6">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 font-serif`}>
                  <Calendar className={`w-5 h-5 ${getAccentColor()}`} />
                  일정 관리
                </CardTitle>
                <CardDescription>방학, 학교행사, 개인 일정 등을 하루/주간/월간/연간으로 관리하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduleManager onEventSelect={(event: any | null) => {
                  if (event && event.isImportant) {
                    setSelectedImportantEvent(event)
                  } else {
                    setSelectedImportantEvent(null)
                  }
                }} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 학생 관리 탭 */}
          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 font-serif`}>
                    <UserCheck className={`w-5 h-5 ${getAccentColor()}`} />
                    학생 뽑기
                  </CardTitle>
                  <CardDescription>랜덤으로 학생을 선택하여 발표나 활동에 참여시키세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <StudentPicker />
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 font-serif`}>
                    <Shuffle className={`w-5 h-5 ${getAccentColor()}`} />
                    모둠 편성
                  </CardTitle>
                  <CardDescription>학생들을 균등하게 모둠으로 나누어 협력 학습을 진행하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <GroupMaker />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="youtube">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Play className="w-5 h-5 text-red-600" />
                  YouTube 교육 동영상
                </CardTitle>
                <CardDescription>교육용 YouTube 동영상을 검색하고 수업에 활용하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <YoutubeSearch />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 외부 링크 탭 */}
          <TabsContent value="links">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 font-serif`}>
                  <Link className={`w-5 h-5 ${getAccentColor()}`} />
                  외부 사이트 임베딩
                </CardTitle>
                <CardDescription>유용한 외부 사이트를 쉽게 링크하고 임베드하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <LinkEmbedder onLinksUpdate={setSavedLinks} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 시간 관리 탭 */}
          <TabsContent value="time">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 font-serif`}>
                  <Timer className={`w-5 h-5 ${getAccentColor()}`} />
                  시간 관리
                </CardTitle>
                <CardDescription>현재 시간을 확인하고 수업 타이머를 활용하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <DigitalClock />
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="settings">
            <Settings onSettingsChange={handleSettingsChange} />
          </TabsContent>
          </Tabs>
        </TouchGesture>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-green-200 py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 mb-2">
            <Heart className="w-4 h-4 inline text-red-500 mr-1" />
            {settings.footerText}
          </p>
          <p className="text-sm text-gray-500">{settings.footerSubtext}</p>
        </div>
      </footer>
    </div>
  )
}