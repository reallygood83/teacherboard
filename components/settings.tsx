"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Settings as SettingsIcon, Palette, Type, FileText, Bot, AlertTriangle, CheckCircle, WifiOff, Cloud, HardDrive, Info, Save, Check } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface SettingsData {
  title: string
  subtitle: string
  footerText: string
  footerSubtext: string
  backgroundMode: string
  geminiApiKey: string
  geminiModel: string
  lastUpdated?: string
}

interface SettingsProps {
  onSettingsChange: (settings: SettingsData) => void
}

// 🔐 Storage 유틸리티 함수들
class StorageManager {
  private static STORAGE_KEY = "classHomepageSettings"

  // localStorage 사용 가능 여부 체크
  static isLocalStorageAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  // sessionStorage 사용 가능 여부 체크
  static isSessionStorageAvailable(): boolean {
    try {
      const test = '__storage_test__'
      sessionStorage.setItem(test, test)
      sessionStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  // 저장소에서 데이터 읽기 (우선순위: localStorage > sessionStorage)
  static loadFromBrowserStorage(): SettingsData | null {
    try {
      // 1순위: localStorage
      if (this.isLocalStorageAvailable()) {
        const data = localStorage.getItem(this.STORAGE_KEY)
        if (data) {
          console.log('✅ localStorage에서 설정 로드 성공')
          return JSON.parse(data)
        }
      }

      // 2순위: sessionStorage (시크릿 모드 대체)
      if (this.isSessionStorageAvailable()) {
        const data = sessionStorage.getItem(this.STORAGE_KEY)
        if (data) {
          console.log('⚠️ sessionStorage에서 설정 로드 (시크릿 모드)')
          return JSON.parse(data)
        }
      }

      return null
    } catch (error) {
      console.error('❌ 브라우저 저장소 로드 실패:', error)
      return null
    }
  }

  // 저장소에 데이터 저장 (우선순위: localStorage > sessionStorage)
  static saveToBrowserStorage(settings: SettingsData): boolean {
    try {
      const data = JSON.stringify(settings)

      // 1순위: localStorage 시도
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(this.STORAGE_KEY, data)
        console.log('✅ localStorage 저장 성공')
        return true
      }

      // 2순위: sessionStorage (시크릿 모드 대체)
      if (this.isSessionStorageAvailable()) {
        sessionStorage.setItem(this.STORAGE_KEY, data)
        console.log('⚠️ sessionStorage 저장 (시크릿 모드)')
        return true
      }

      console.error('❌ 사용 가능한 저장소 없음')
      return false
    } catch (error) {
      console.error('❌ 브라우저 저장소 저장 실패:', error)
      return false
    }
  }

  // 저장소 상태 확인
  static getStorageStatus(): {
    type: 'localStorage' | 'sessionStorage' | 'none'
    isPrivateMode: boolean
  } {
    if (this.isLocalStorageAvailable()) {
      return { type: 'localStorage', isPrivateMode: false }
    }
    if (this.isSessionStorageAvailable()) {
      return { type: 'sessionStorage', isPrivateMode: true }
    }
    return { type: 'none', isPrivateMode: true }
  }
}

export function Settings({ onSettingsChange }: SettingsProps) {
  const { currentUser, loading, firebaseAvailable, error } = useAuth()
  const [settings, setSettings] = useState<SettingsData>({
    title: "우리 학급 홈페이지",
    subtitle: "함께 배우고 성장하는 공간입니다 ❤️",
    footerText: "교육을 위한 따뜻한 기술",
    footerSubtext: "© 2025 우리 학급 홈페이지. 모든 권리 보유.",
    backgroundMode: "green",
    geminiApiKey: "",
    geminiModel: "gemini-2.5-flash",
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [storageStatus, setStorageStatus] = useState<{
    type: 'localStorage' | 'sessionStorage' | 'none'
    isPrivateMode: boolean
  }>({ type: 'localStorage', isPrivateMode: false })
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'local-only' | 'error'>('local-only')

  // Gemini API Key 저장 관련 state
  const [tempGeminiApiKey, setTempGeminiApiKey] = useState("")
  const [hasUnsavedApiKey, setHasUnsavedApiKey] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)

  // 🚀 초기 데이터 로드 (Hybrid Strategy)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('🔄 설정 로드 시작...')

        // 저장소 상태 확인
        const status = StorageManager.getStorageStatus()
        setStorageStatus(status)
        console.log('📦 저장소 상태:', status)

        // 1단계: 브라우저 저장소에서 로드 (빠름)
        const browserSettings = StorageManager.loadFromBrowserStorage()

        // 2단계: Firebase에서 로드 (로그인 시)
        if (currentUser && db && firebaseAvailable) {
          try {
            console.log('☁️ Firebase에서 설정 로드 시도...')
            const docRef = doc(db, `users/${currentUser.uid}/settings`, 'preferences')
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
              const firebaseSettings = docSnap.data() as SettingsData
              console.log('✅ Firebase 설정 로드 성공')

              // 🔥 최신 데이터 판단 (타임스탬프 비교)
              if (browserSettings && browserSettings.lastUpdated && firebaseSettings.lastUpdated) {
                const browserTime = new Date(browserSettings.lastUpdated).getTime()
                const firebaseTime = new Date(firebaseSettings.lastUpdated).getTime()

                if (firebaseTime > browserTime) {
                  console.log('☁️ Firebase 데이터가 최신 → 사용')
                  setSettings(firebaseSettings)
                  StorageManager.saveToBrowserStorage(firebaseSettings)
                  setSyncStatus('synced')
                } else {
                  console.log('💾 로컬 데이터가 최신 → 사용')
                  setSettings(browserSettings)
                  // Firebase에 로컬 데이터 업로드
                  await setDoc(docRef, {
                    ...browserSettings,
                    lastUpdated: new Date().toISOString()
                  })
                  setSyncStatus('synced')
                }
              } else {
                // 타임스탬프 없으면 Firebase 우선
                setSettings(firebaseSettings)
                StorageManager.saveToBrowserStorage(firebaseSettings)
                setSyncStatus('synced')
              }
            } else {
              // Firebase에 데이터 없음
              if (browserSettings) {
                console.log('💾 로컬 데이터만 존재 → Firebase에 업로드')
                setSettings(browserSettings)
                // Firebase에 마이그레이션
                await setDoc(docRef, {
                  ...browserSettings,
                  lastUpdated: new Date().toISOString()
                })
                setSyncStatus('synced')
              } else {
                console.log('📝 기본 설정 사용')
                setSyncStatus('local-only')
              }
            }
          } catch (fbError) {
            console.error('⚠️ Firebase 로드 실패, 로컬 데이터 사용:', fbError)
            if (browserSettings) {
              setSettings(browserSettings)
            }
            setSyncStatus('local-only')
          }
        } else {
          // 비로그인 또는 Firebase 불가
          if (browserSettings) {
            console.log('💾 로컬 저장소 데이터 사용 (비로그인)')
            setSettings(browserSettings)
            setSyncStatus('local-only')
          } else {
            console.log('📝 기본 설정 사용')
            setSyncStatus('local-only')
          }
        }

        // 초기화된 설정을 부모에 전달
        if (browserSettings) {
          onSettingsChange(browserSettings)
        }

      } catch (error) {
        console.error('❌ 설정 로드 실패:', error)
        setSyncStatus('error')
      } finally {
        setIsInitialized(true)
        console.log('✅ 설정 초기화 완료')
      }
    }

    loadSettings()
  }, [currentUser, firebaseAvailable]) // currentUser와 firebaseAvailable 변경 시 재실행

  // API Key 초기값 및 변경 감지
  useEffect(() => {
    setTempGeminiApiKey(settings.geminiApiKey)
  }, [settings.geminiApiKey])

  useEffect(() => {
    setHasUnsavedApiKey(tempGeminiApiKey !== settings.geminiApiKey)
    if (apiKeySaved) {
      const timer = setTimeout(() => setApiKeySaved(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [tempGeminiApiKey, settings.geminiApiKey, apiKeySaved])

  // API Key 저장 핸들러
  const handleSaveApiKey = async () => {
    try {
      await handleSettingChange("geminiApiKey", tempGeminiApiKey)
      setApiKeySaved(true)
      setHasUnsavedApiKey(false)
    } catch (error) {
      console.error("API Key 저장 실패:", error)
    }
  }

  // 📝 설정 변경 핸들러 (Hybrid Save)
  const handleSettingChange = async (key: keyof SettingsData, value: string) => {
    try {
      const newSettings = {
        ...settings,
        [key]: value,
        lastUpdated: new Date().toISOString()
      }

      // UI 즉시 업데이트
      setSettings(newSettings)
      onSettingsChange(newSettings)

      // 1단계: 브라우저 저장소 즉시 저장 (빠른 응답)
      const browserSaved = StorageManager.saveToBrowserStorage(newSettings)

      if (!browserSaved) {
        console.error('⚠️ 브라우저 저장 실패 - 저장소 사용 불가')
        setSyncStatus('error')
        return
      }

      // 2단계: Firebase 비동기 저장 (로그인 시)
      if (currentUser && db && firebaseAvailable) {
        try {
          setSyncStatus('syncing')
          const docRef = doc(db, `users/${currentUser.uid}/settings`, 'preferences')
          await setDoc(docRef, {
            ...newSettings,
            lastUpdated: new Date().toISOString()
          })
          console.log('✅ Firebase 동기화 완료')
          setSyncStatus('synced')
        } catch (fbError) {
          console.error('⚠️ Firebase 저장 실패, 로컬만 저장됨:', fbError)
          setSyncStatus('local-only')
          // 로컬은 저장되었으므로 계속 사용 가능
        }
      } else {
        setSyncStatus('local-only')
      }

    } catch (error) {
      console.error('❌ 설정 저장 실패:', error)
      setSyncStatus('error')
    }
  }

  // 🔄 설정 초기화
  const resetSettings = async () => {
    try {
      const defaultSettings: SettingsData = {
        title: "우리 학급 홈페이지",
        subtitle: "함께 배우고 성장하는 공간입니다 ❤️",
        footerText: "교육을 위한 따뜻한 기술",
        footerSubtext: "© 2025 우리 학급 홈페이지. 모든 권리 보유.",
        backgroundMode: "green",
        geminiApiKey: "",
        geminiModel: "gemini-2.5-flash",
        lastUpdated: new Date().toISOString()
      }

      setSettings(defaultSettings)
      StorageManager.saveToBrowserStorage(defaultSettings)
      onSettingsChange(defaultSettings)

      // Firebase도 초기화 (로그인 시)
      if (currentUser && db && firebaseAvailable) {
        const docRef = doc(db, `users/${currentUser.uid}/settings`, 'preferences')
        await setDoc(docRef, defaultSettings)
        setSyncStatus('synced')
      } else {
        setSyncStatus('local-only')
      }

      console.log('✅ 설정 초기화 완료')
    } catch (error) {
      console.error('❌ 설정 초기화 실패:', error)
      setSyncStatus('error')
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
      {/* 🔐 저장소 상태 알림 */}
      {storageStatus.isPrivateMode && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>시크릿 모드 감지</AlertTitle>
          <AlertDescription>
            현재 시크릿/사생활 보호 모드로 접속하셨습니다.
            <br />
            <strong>설정은 브라우저를 닫으면 사라집니다.</strong>
            <br />
            일반 브라우저 모드를 사용하거나 로그인하시면 설정이 영구 보존됩니다.
          </AlertDescription>
        </Alert>
      )}

      {/* ☁️ Firebase 동기화 상태 */}
      {currentUser && firebaseAvailable && (
        <Alert className="border-green-200 bg-green-50">
          <Cloud className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">클라우드 동기화 활성</AlertTitle>
          <AlertDescription className="text-green-700">
            {syncStatus === 'synced' && '✅ 설정이 클라우드에 안전하게 저장되었습니다. 다른 기기에서도 동일한 설정을 사용할 수 있습니다.'}
            {syncStatus === 'syncing' && '⏳ 클라우드에 동기화 중...'}
            {syncStatus === 'local-only' && '💾 로컬에만 저장되었습니다. 잠시 후 자동으로 동기화됩니다.'}
          </AlertDescription>
        </Alert>
      )}

      {!currentUser && !storageStatus.isPrivateMode && (
        <Alert>
          <HardDrive className="h-4 w-4" />
          <AlertTitle>로컬 저장소 사용 중</AlertTitle>
          <AlertDescription>
            설정이 이 브라우저에만 저장됩니다.
            <br />
            로그인하시면 여러 기기에서 설정을 공유할 수 있습니다.
          </AlertDescription>
        </Alert>
      )}

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

      {!firebaseAvailable && !error && !currentUser && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertTitle>오프라인 모드</AlertTitle>
          <AlertDescription>
            현재 오프라인 모드에서 실행 중입니다. 기본 설정은 사용 가능하지만, 로그인 및 클라우드 동기화 기능은 제한됩니다.
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
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="geminiApiKey"
                  type="password"
                  value={tempGeminiApiKey}
                  onChange={(e) => setTempGeminiApiKey(e.target.value)}
                  placeholder="AI Studio에서 발급받은 API Key를 입력하세요"
                  className={hasUnsavedApiKey ? "border-orange-400" : ""}
                />
              </div>
              <Button
                onClick={handleSaveApiKey}
                disabled={!hasUnsavedApiKey}
                className={`min-w-[100px] transition-all ${
                  apiKeySaved
                    ? "bg-green-600 hover:bg-green-700"
                    : hasUnsavedApiKey
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-300"
                }`}
              >
                {apiKeySaved ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    저장됨
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    저장
                  </>
                )}
              </Button>
            </div>
            {hasUnsavedApiKey && (
              <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                변경된 내용이 있습니다. 저장 버튼을 눌러주세요.
              </p>
            )}
            {apiKeySaved && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                API Key가 성공적으로 저장되었습니다.
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              API Key는 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>에서 발급받을 수 있습니다
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
                <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
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
