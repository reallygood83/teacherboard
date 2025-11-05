"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Settings as SettingsIcon, Palette, Type, FileText, Bot, AlertTriangle, CheckCircle, WifiOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface SettingsData {
  title: string
  subtitle: string
  footerText: string
  footerSubtext: string
  backgroundMode: string
  geminiApiKey: string
  geminiModel: string
}

interface SettingsProps {
  onSettingsChange: (settings: SettingsData) => void
}

export function Settings({ onSettingsChange }: SettingsProps) {
  const { loading, firebaseAvailable, error } = useAuth()
  const [settings, setSettings] = useState<SettingsData>({
    title: "우리 학급 홈페이지",
    subtitle: "함께 배우고 성장하는 공간입니다 ❤️",
    footerText: "교육을 위한 따뜻한 기술",
    footerSubtext: "© 2025 우리 학급 홈페이지. 모든 권리 보유.",
    backgroundMode: "green",
    geminiApiKey: "",
    geminiModel: "gemini-1.5-flash",
  })
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // localStorage에서 설정 불러오기 - 안전하게 처리
    try {
      const savedSettings = localStorage.getItem("classHomepageSettings")
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        onSettingsChange(parsed)
      }
    } catch (error) {
      console.error('설정 로드 실패:', error)
      // 기본 설정 유지
    } finally {
      setIsInitialized(true)
    }
  }, []) // 🔧 무한 루프 수정: 빈 의존성 배열

  const handleSettingChange = (key: keyof SettingsData, value: string) => {
    try {
      const newSettings = { ...settings, [key]: value }
      setSettings(newSettings)
      localStorage.setItem("classHomepageSettings", JSON.stringify(newSettings))
      onSettingsChange(newSettings)
    } catch (error) {
      console.error('설정 저장 실패:', error)
    }
  }

  const resetSettings = () => {
    try {
      const defaultSettings: SettingsData = {
        title: "우리 학급 홈페이지",
        subtitle: "함께 배우고 성장하는 공간입니다 ❤️",
        footerText: "교육을 위한 따뜻한 기술",
        footerSubtext: "© 2025 우리 학급 홈페이지. 모든 권리 보유.",
        backgroundMode: "green",
        geminiApiKey: "",
        geminiModel: "gemini-1.5-flash",
      }
      setSettings(defaultSettings)
      localStorage.setItem("classHomepageSettings", JSON.stringify(defaultSettings))
      onSettingsChange(defaultSettings)
    } catch (error) {
      console.error('설정 초기화 실패:', error)
    }
  }

  // 로딩 중일 때 스켈레톤 UI 표시
  if (!isInitialized) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="mb-6">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-100 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Firebase 상태 알림 */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>연결 문제</AlertTitle>
          <AlertDescription>
            {error} 기본 설정은 정상적으로 작동하지만, 일부 고급 기능(로그인, 데이터 동기화)은 사용할 수 없습니다.
          </AlertDescription>
        </Alert>
      )}
      
      {!firebaseAvailable && !error && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertTitle>오프라인 모드</AlertTitle>
          <AlertDescription>
            현재 오프라인 모드에서 실행 중입니다. 기본 설정은 사용 가능하지만, 로그인 및 클라우드 동기화 기능은 제한됩니다.
          </AlertDescription>
        </Alert>
      )}
      
      {firebaseAvailable && !loading && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">연결 성공</AlertTitle>
          <AlertDescription className="text-green-700">
            모든 시스템이 정상적으로 작동하고 있습니다. 전체 기능을 사용할 수 있습니다.
          </AlertDescription>
        </Alert>
      )}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Type className="w-5 h-5 text-green-600" />
            헤더 설정
          </CardTitle>
          <CardDescription>홈페이지 상단의 제목과 부제목을 설정하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">홈페이지 제목</Label>
            <Input
              id="title"
              value={settings.title}
              onChange={(e) => handleSettingChange("title", e.target.value)}
              placeholder="예: 3학년 2반 홈페이지"
            />
          </div>
          <div>
            <Label htmlFor="subtitle">부제목</Label>
            <Input
              id="subtitle"
              value={settings.subtitle}
              onChange={(e) => handleSettingChange("subtitle", e.target.value)}
              placeholder="예: 함께 배우고 성장하는 공간입니다"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Palette className="w-5 h-5 text-green-600" />
            테마 설정
          </CardTitle>
          <CardDescription>홈페이지의 배경색과 테마를 선택하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="backgroundMode">배경 테마</Label>
            <Select
              value={settings.backgroundMode}
              onValueChange={(value) => handleSettingChange("backgroundMode", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="green">초록색 (기본)</SelectItem>
                <SelectItem value="blue">파란색</SelectItem>
                <SelectItem value="purple">보라색</SelectItem>
                <SelectItem value="orange">주황색</SelectItem>
                <SelectItem value="pink">분홍색</SelectItem>
                <SelectItem value="gray">회색</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <FileText className="w-5 h-5 text-green-600" />
            푸터 설정
          </CardTitle>
          <CardDescription>홈페이지 하단의 내용을 설정하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="footerText">푸터 메인 텍스트</Label>
            <Input
              id="footerText"
              value={settings.footerText}
              onChange={(e) => handleSettingChange("footerText", e.target.value)}
              placeholder="예: 교육을 위한 따뜻한 기술"
            />
          </div>
          <div>
            <Label htmlFor="footerSubtext">푸터 서브 텍스트</Label>
            <Textarea
              id="footerSubtext"
              value={settings.footerSubtext}
              onChange={(e) => handleSettingChange("footerSubtext", e.target.value)}
              placeholder="예: © 2025 우리 학급 홈페이지. 모든 권리 보유."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Bot className="w-5 h-5 text-green-600" />
            AI 설정 (Gemini)
          </CardTitle>
          <CardDescription>Gemini AI 기능을 사용하기 위한 API 설정을 구성하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="geminiApiKey">Gemini API Key</Label>
            <Input
              id="geminiApiKey"
              type="password"
              value={settings.geminiApiKey}
              onChange={(e) => handleSettingChange("geminiApiKey", e.target.value)}
              placeholder="AI Studio에서 발급받은 API Key를 입력하세요"
            />
            <p className="text-sm text-gray-500 mt-1">
              API Key는 <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-600 hover:underline">Google AI Studio</a>에서 발급받을 수 있습니다
            </p>
          </div>
          <div>
            <Label htmlFor="geminiModel">Gemini 모델</Label>
            <Select
              value={settings.geminiModel}
              onValueChange={(value) => handleSettingChange("geminiModel", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (빠른 응답)</SelectItem>
                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (고품질 응답)</SelectItem>
                <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash (실험적)</SelectItem>
                <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro (안정적)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <SettingsIcon className="w-5 h-5 text-green-600" />
            설정 관리
          </CardTitle>
          <CardDescription>설정을 초기화하거나 백업할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={resetSettings} variant="outline" className="w-full bg-transparent">
            기본 설정으로 초기화
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
