'use client';

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { DigitalClock } from "@/components/digital-clock"
import { Chalkboard } from "@/components/chalkboard"
import { StudentPicker } from "@/components/student-picker"
import { GroupMaker } from "@/components/group-maker"
import { LinkEmbedder } from "@/components/link-embedder"
import { Timetable } from "@/components/timetable"
import { YoutubeSearch } from "@/components/youtube-search"
import { Settings } from "@/components/settings"
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
}

export default function ClassHomepage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  
  const [currentDate, setCurrentDate] = useState("")
  const [isQuickLinksCollapsed, setIsQuickLinksCollapsed] = useState(false)
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([])
  const [settings, setSettings] = useState<SettingsData>({
    title: "우리 학급 홈페이지",
    subtitle: "함께 배우고 성장하는 공간입니다 ❤️",
    footerText: "교육을 위한 따뜻한 기술",
    footerSubtext: "© 2025 우리 학급 홈페이지. 모든 권리 보유.",
    backgroundMode: "green",
    geminiApiKey: "",
    geminiModel: "gemini-1.5-flash",
  })

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

  // 빠른링크에서 링크 제거
  const removeQuickLink = (id: string) => {
    const updatedLinks = savedLinks.filter((link) => link.id !== id)
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
      <header className={`${getGradientClass()} text-white py-8 px-4`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif font-black text-4xl mb-2">{settings.title}</h1>
              <p className="text-green-100 text-lg">{settings.subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-green-100 text-sm">오늘은</p>
                <p className="font-semibold text-xl">{currentDate}</p>
              </div>
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <p className="text-gray-600 text-lg">안녕하세요 {currentUser.displayName}님, 오늘 하루도 평안하세요 ❤️</p>
        </div>

        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              수업 도구
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              시간표
            </TabsTrigger>
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
            <div className="flex gap-4">
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
                          const linksTab = document.querySelector('[value="links"]') as HTMLElement
                          if (linksTab) {
                            linksTab.click()
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        새 링크 추가
                      </Button>
                      {/* 링크 추가 안내 */}
                      {savedLinks.length === 0 && (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          <p className="mb-2">저장된 링크가 없습니다</p>
                          <p>외부 링크 탭에서 사이트를 추가해보세요</p>
                        </div>
                      )}

                      {/* 저장된 링크들 표시 */}
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {savedLinks.slice(0, 8).map((link) => (
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

                      {/* 링크가 8개 이상일 때 안내 */}
                      {savedLinks.length > 8 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          {savedLinks.length}개 중 8개 표시 중 (외부 링크 탭에서 전체 보기)
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

          {/* 학생 관리 탭 */}
          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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