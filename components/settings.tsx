"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsIcon, Palette, Type, FileText } from "lucide-react"

interface SettingsData {
  title: string
  subtitle: string
  footerText: string
  footerSubtext: string
  backgroundMode: string
}

interface SettingsProps {
  onSettingsChange: (settings: SettingsData) => void
}

export function Settings({ onSettingsChange }: SettingsProps) {
  const [settings, setSettings] = useState<SettingsData>({
    title: "우리 학급 홈페이지",
    subtitle: "함께 배우고 성장하는 공간입니다 ❤️",
    footerText: "교육을 위한 따뜻한 기술",
    footerSubtext: "© 2025 우리 학급 홈페이지. 모든 권리 보유.",
    backgroundMode: "green",
  })

  useEffect(() => {
    // localStorage에서 설정 불러오기
    const savedSettings = localStorage.getItem("classHomepageSettings")
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
      onSettingsChange(parsed)
    }
  }, [onSettingsChange])

  const handleSettingChange = (key: keyof SettingsData, value: string) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem("classHomepageSettings", JSON.stringify(newSettings))
    onSettingsChange(newSettings)
  }

  const resetSettings = () => {
    const defaultSettings = {
      title: "우리 학급 홈페이지",
      subtitle: "함께 배우고 성장하는 공간입니다 ❤️",
      footerText: "교육을 위한 따뜻한 기술",
      footerSubtext: "© 2025 우리 학급 홈페이지. 모든 권리 보유.",
      backgroundMode: "green",
    }
    setSettings(defaultSettings)
    localStorage.setItem("classHomepageSettings", JSON.stringify(defaultSettings))
    onSettingsChange(defaultSettings)
  }

  return (
    <div className="space-y-6">
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
