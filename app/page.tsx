"use client"

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
} from "lucide-react"
import { DigitalClock } from "@/components/digital-clock"
import { Chalkboard } from "@/components/chalkboard"
import { StudentPicker } from "@/components/student-picker"
import { GroupMaker } from "@/components/group-maker"
import { LinkEmbedder } from "@/components/link-embedder"
import { Timetable } from "@/components/timetable"
import { YoutubeSearch } from "@/components/youtube-search"
import { Settings } from "@/components/settings"

interface SettingsData {
  title: string
  subtitle: string
  footerText: string
  footerSubtext: string
  backgroundMode: string
}

export default function ClassHomepage() {
  const [currentDate, setCurrentDate] = useState("")
  const [settings, setSettings] = useState<SettingsData>({
    title: "우리 학급 홈페이지",
    subtitle: "함께 배우고 성장하는 공간입니다 ❤️",
    footerText: "교육을 위한 따뜻한 기술",
    footerSubtext: "© 2025 우리 학급 홈페이지. 모든 권리 보유.",
    backgroundMode: "green",
  })

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
  }, [])

  const handleSettingsChange = (newSettings: SettingsData) => {
    setSettings(newSettings)
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
            <div className="text-right">
              <p className="text-green-100 text-sm">오늘은</p>
              <p className="font-semibold text-xl">{currentDate}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <p className="text-gray-600 text-lg">선생님, 오늘 하루도 평안하세요 ❤️</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 font-serif`}>
                    <BookOpen className={`w-5 h-5 ${getAccentColor()}`} />
                    수업 칠판
                  </CardTitle>
                  <CardDescription>수업 중 필요한 내용을 자유롭게 작성하고 편집하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chalkboard />
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 font-serif`}>
                    <ExternalLink className={`w-5 h-5 ${getAccentColor()}`} />
                    빠른 링크
                  </CardTitle>
                  <CardDescription>자주 사용하는 교육 사이트에 빠르게 접속하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent"
                      onClick={() => window.open("https://hi.goe.go.kr", "_blank")}
                    >
                      하이러닝
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent"
                      onClick={() => window.open("https://www.hiclass.net/", "_blank")}
                    >
                      Hiclass
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent"
                      onClick={() => window.open("https://www.edunet.net/", "_blank")}
                    >
                      에듀넷
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent"
                      onClick={() => window.open("https://www.i-scream.co.kr/", "_blank")}
                    >
                      아이스크림
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
                <LinkEmbedder />
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
