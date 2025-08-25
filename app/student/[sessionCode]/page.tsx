'use client';

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown, 
  ChevronUp, 
  Bell,
  Link,
  BookOpen,
  FileText,
  Clock,
  Users,
  Heart,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { db, isFirebaseReady } from "@/lib/firebase"
import { collection, query, orderBy, limit, getDocs, doc, getDoc, where } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SessionData {
  id: string;
  teacherName: string;
  className: string;
  createdAt: any;
  isActive: boolean;
}

interface ChalkboardNote {
  id: string;
  title: string;
  contentHtml: string;
  contentText: string;
  createdAt: any;
  updatedAt: any;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  category: 'general' | 'homework' | 'event' | 'announcement';
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
}

interface SharedLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  createdAt: any;
  updatedAt: any;
}

interface BookContent {
  id: string;
  title: string;
  author?: string;
  content: string;
  pageRange?: string;
  category: "reading" | "textbook" | "reference" | "activity";
  subject?: string;
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
}

export default function StudentPage() {
  const params = useParams()
  const sessionCode = params.sessionCode as string
  const { toast } = useToast()
  
  // 세션 및 데이터 상태
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState("")
  
  // 섹션별 데이터
  const [notices, setNotices] = useState<Notice[]>([])
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([])
  const [chalkboardNotes, setChalkboardNotes] = useState<ChalkboardNote[]>([])
  const [bookContents, setBookContents] = useState<BookContent[]>([])
  
  // 섹션 접기/펼치기 상태 (모두 기본적으로 열린 상태)
  const [sectionsOpen, setSectionsOpen] = useState({
    notices: true,
    links: true,
    classContent: true,
    bookContent: true
  })
  
  // 새로고침 상태
  const [refreshing, setRefreshing] = useState(false)
  
  // 모바일 터치 상태
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  // 날짜 설정
  useEffect(() => {
    const today = new Date()
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }
    setCurrentDate(today.toLocaleDateString("ko-KR", options))
  }, [])

  // 세션 유효성 확인 및 데이터 로드
  const loadSessionData = async () => {
    if (!sessionCode || !isFirebaseReady()) {
      setError("세션 정보를 확인할 수 없습니다.")
      setLoading(false)
      return
    }

    try {
      // 세션 코드로 교사 ID 찾기 (sessions 컬렉션에서)
      const sessionRef = doc(db!, 'sessions', sessionCode)
      const sessionSnap = await getDoc(sessionRef)
      
      if (!sessionSnap.exists()) {
        setError("유효하지 않은 세션 코드입니다.")
        setLoading(false)
        return
      }

      const session = { id: sessionSnap.id, ...sessionSnap.data() } as SessionData
      setSessionData(session)
      
      // 교사의 데이터 로드
      await loadTeacherData(session.id)
      
    } catch (err: any) {
      console.error("세션 데이터 로드 실패:", err)
      setError("데이터를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 교사 데이터 로드 (교사 ID를 통해)
  const loadTeacherData = async (teacherId: string) => {
    try {
      // 공지사항 로드 (활성 공지만)
      const noticesRef = collection(db!, `users/${teacherId}/notices`)
      const noticesQuery = query(
        noticesRef, 
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'), 
        limit(10)
      )
      const noticesSnap = await getDocs(noticesQuery)
      const noticesData = noticesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notice[]
      setNotices(noticesData)

      // 공유 링크 로드 (savedLinks로 수정)
      const linksRef = collection(db!, `users/${teacherId}/savedLinks`)
      const linksQuery = query(linksRef, orderBy('createdAt', 'desc'), limit(20))
      const linksSnap = await getDocs(linksQuery)
      const linksData = linksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SharedLink[]
      setSharedLinks(linksData)

      // 칠판 노트 로드 (수업 내용)
      const chalkboardRef = collection(db!, `users/${teacherId}/chalkboardNotes`)
      const chalkboardQuery = query(chalkboardRef, orderBy('updatedAt', 'desc'), limit(5))
      const chalkboardSnap = await getDocs(chalkboardQuery)
      const chalkboardData = chalkboardSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChalkboardNote[]
      setChalkboardNotes(chalkboardData)

      // 도서 내용 로드 (활성 도서만)
      const bookRef = collection(db!, `users/${teacherId}/bookContents`)
      const bookQuery = query(
        bookRef, 
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'), 
        limit(10)
      )
      const bookSnap = await getDocs(bookQuery)
      const bookData = bookSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BookContent[]
      setBookContents(bookData)

    } catch (err: any) {
      console.error("교사 데이터 로드 실패:", err)
      toast({
        title: "데이터 로드 실패",
        description: "일부 내용을 불러오지 못했습니다.",
        variant: "destructive"
      })
    }
  }

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    loadSessionData()
  }, [sessionCode])

  // 새로고침 기능
  const handleRefresh = async () => {
    if (!sessionData) return
    
    setRefreshing(true)
    try {
      await loadTeacherData(sessionData.id)
      toast({
        title: "새로고침 완료",
        description: "최신 내용을 불러왔습니다."
      })
    } catch (err) {
      toast({
        title: "새로고침 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      })
    } finally {
      setRefreshing(false)
    }
  }

  // 섹션 토글
  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // 날짜 포맷팅
  const formatDate = (timestamp: any) => {
    try {
      if (timestamp?.toDate) return timestamp.toDate().toLocaleString('ko-KR')
      if (timestamp instanceof Date) return timestamp.toLocaleString('ko-KR')
      if (typeof timestamp === 'string') return new Date(timestamp).toLocaleString('ko-KR')
      return ""
    } catch {
      return ""
    }
  }

  // 링크 열기
  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  // 모바일 터치 이벤트 핸들러 (Pull-to-refresh)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStart(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return
    
    const currentY = e.touches[0].clientY
    const diff = currentY - touchStart
    
    if (diff > 0 && window.scrollY === 0) {
      setIsPulling(true)
      setPullDistance(Math.min(diff * 0.5, 100)) // 최대 100px
      if (diff > 80) {
        // 부드러운 햅틱 피드백 (가능한 경우)
        if (navigator.vibrate) {
          navigator.vibrate(20)
        }
      }
    }
  }

  const handleTouchEnd = () => {
    if (isPulling && pullDistance > 60) {
      handleRefresh()
    }
    
    setTouchStart(null)
    setPullDistance(0)
    setIsPulling(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">학급 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 오류</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh 인디케이터 */}
      {isPulling && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm border-b transition-all duration-300 ease-out"
          style={{ 
            height: `${Math.max(pullDistance, 0)}px`,
            transform: `translateY(-${Math.max(100 - pullDistance, 0)}px)`
          }}
        >
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw 
              className={`w-5 h-5 ${pullDistance > 60 ? 'animate-spin' : ''}`}
              style={{ 
                transform: `rotate(${pullDistance * 3.6}deg)`
              }}
            />
            <span className="text-sm font-medium">
              {pullDistance > 60 ? '놓으면 새로고침!' : '아래로 당겨서 새로고침'}
            </span>
          </div>
        </div>
      )}
      {/* Header - 더욱 밝고 친근한 디자인 (모바일 최적화) */}
      <header className="bg-gradient-to-r from-pink-400 via-blue-500 to-purple-600 text-white py-6 px-4 md:py-8 shadow-xl relative overflow-hidden">
        {/* 장식적 배경 요소 */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 left-4 w-12 h-12 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-8 right-12 w-8 h-8 bg-white/15 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
          <div className="absolute top-12 left-1/3 w-6 h-6 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
          <div className="absolute bottom-8 right-1/4 w-10 h-10 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div className="text-center lg:text-left w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <Users className="w-7 h-7" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl mb-1 text-shadow-lg">
                    {sessionData?.className || "🌟 우리 학급 🌟"}
                  </h1>
                  <Badge variant="secondary" className="bg-white/30 text-white border-white/30 text-sm px-3 py-1 font-semibold">
                    📍 {sessionCode}
                  </Badge>
                </div>
              </div>
              <p className="text-white text-lg sm:text-xl font-medium drop-shadow-md px-2">
                ✨ {sessionData?.teacherName || "선생님"}과 함께하는 즐거운 학습 공간입니다! 📚✨
              </p>
            </div>
            <div className="text-center bg-white/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 w-full sm:w-auto min-w-[200px]">
              <p className="text-white text-sm mb-1 font-medium">🗓️ 오늘은</p>
              <p className="font-bold text-base sm:text-lg text-yellow-200 mb-3 drop-shadow leading-tight">{currentDate}</p>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="secondary"
                className="bg-white/30 border-white/30 text-white hover:bg-white/40 transition-all duration-200 hover:scale-105 font-medium w-full sm:w-auto min-h-[44px] touch-manipulation"
              >
                {refreshing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                🔄 새로고침
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 모바일 최적화된 레이아웃 */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* 환영 메시지 - 더욱 활기찬 디자인 (모바일 최적화) */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-3xl p-4 sm:p-6 border-4 border-yellow-200 shadow-lg relative overflow-hidden">
            <div className="absolute top-2 right-2 animate-spin" style={{ animationDuration: '4s' }}>
              ⭐
            </div>
            <div className="absolute bottom-2 left-2 animate-bounce" style={{ animationDelay: '1s' }}>
              🌈
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              🎉 안녕하세요, 친구들! 🎉
            </h2>
            <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed">
              오늘도 선생님이 준비한 <span className="text-pink-600 font-bold">새로운 학습 내용</span>들을 확인해보세요! ✨
            </p>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              각 섹션을 클릭하면 더 자세한 내용을 볼 수 있어요 📖
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* 📢 공지사항 섹션 */}
          <Card className="shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-l-8 border-l-orange-400 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden relative group">
            {/* 장식 요소 */}
            <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Bell className="w-16 h-16 text-orange-400" />
            </div>
            
            <Collapsible open={sectionsOpen.notices} onOpenChange={() => toggleSection('notices')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 transition-all duration-200 relative z-10 min-h-[64px] touch-manipulation active:scale-95">
                  <CardTitle className="flex items-center justify-between text-orange-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center group-hover:animate-pulse">
                        <Bell className="w-6 h-6 text-orange-700" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">📢 공지사항</span>
                        <Badge variant="outline" className="bg-orange-200 text-orange-800 border-orange-300 font-semibold animate-pulse">
                          {notices.length}개
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sectionsOpen.notices ? 
                        <ChevronUp className="w-6 h-6 text-orange-600 group-hover:animate-bounce" /> : 
                        <ChevronDown className="w-6 h-6 text-orange-600 group-hover:animate-bounce" />
                      }
                    </div>
                  </CardTitle>
                  <CardDescription className="text-orange-700 font-medium text-base">
                    🔔 선생님의 중요한 알림사항을 확인하세요!
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {notices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>아직 공지사항이 없어요</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notices.map((notice) => (
                        <div key={notice.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{notice.title}</h4>
                            <Badge 
                              variant={notice.priority === 'high' ? 'destructive' : notice.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {notice.priority === 'high' ? '긴급' : notice.priority === 'medium' ? '중요' : '일반'}
                            </Badge>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed mb-2">{notice.content}</p>
                          <p className="text-xs text-gray-500">{formatDate(notice.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 🔗 링크 공유 섹션 */}
          <Card className="shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-l-8 border-l-green-400 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden relative group">
            {/* 장식 요소 */}
            <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Link className="w-16 h-16 text-green-400" />
            </div>
            
            <Collapsible open={sectionsOpen.links} onOpenChange={() => toggleSection('links')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-all duration-200 relative z-10 min-h-[64px] touch-manipulation active:scale-95">
                  <CardTitle className="flex items-center justify-between text-green-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center group-hover:animate-pulse">
                        <Link className="w-6 h-6 text-green-700" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">🔗 링크 공유</span>
                        <Badge variant="outline" className="bg-green-200 text-green-800 border-green-300 font-semibold animate-pulse">
                          {sharedLinks.length}개
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sectionsOpen.links ? 
                        <ChevronUp className="w-6 h-6 text-green-600 group-hover:animate-bounce" /> : 
                        <ChevronDown className="w-6 h-6 text-green-600 group-hover:animate-bounce" />
                      }
                    </div>
                  </CardTitle>
                  <CardDescription className="text-green-700 font-medium text-base">
                    💻 재미있는 학습 사이트와 유용한 자료들!
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {sharedLinks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Link className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>공유된 링크가 없어요</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sharedLinks.map((link) => (
                        <div key={link.id} className="group">
                          <Button
                            variant="outline"
                            onClick={() => openLink(link.url)}
                            className="w-full justify-start bg-green-50 border-green-200 hover:bg-green-100 text-left h-auto p-4 min-h-[60px] touch-manipulation active:scale-95 transition-transform duration-150"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{link.title}</span>
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  {link.category}
                                </Badge>
                              </div>
                              {link.description && (
                                <p className="text-sm text-gray-600">{link.description}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">{formatDate(link.createdAt)}</p>
                            </div>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 📝 수업 내용 섹션 */}
          <Card className="shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-l-8 border-l-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden relative group lg:col-span-2">
            {/* 장식 요소 */}
            <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen className="w-16 h-16 text-blue-400" />
            </div>
            
            <Collapsible open={sectionsOpen.classContent} onOpenChange={() => toggleSection('classContent')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 relative z-10 min-h-[64px] touch-manipulation active:scale-95">
                  <CardTitle className="flex items-center justify-between text-blue-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center group-hover:animate-pulse">
                        <BookOpen className="w-6 h-6 text-blue-700" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">📝 수업 내용</span>
                        <Badge variant="outline" className="bg-blue-200 text-blue-800 border-blue-300 font-semibold animate-pulse">
                          {chalkboardNotes.length}개
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sectionsOpen.classContent ? 
                        <ChevronUp className="w-6 h-6 text-blue-600 group-hover:animate-bounce" /> : 
                        <ChevronDown className="w-6 h-6 text-blue-600 group-hover:animate-bounce" />
                      }
                    </div>
                  </CardTitle>
                  <CardDescription className="text-blue-700 font-medium text-base">
                    📚 선생님의 칠판 내용과 수업 자료를 확인해보세요!
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {chalkboardNotes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>아직 수업 내용이 없어요</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {chalkboardNotes.map((note) => (
                        <div key={note.id} className="border border-blue-200 rounded-lg overflow-hidden">
                          <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-blue-900">{note.title}</h4>
                              <div className="text-xs text-blue-600">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {formatDate(note.updatedAt)}
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-white">
                            {/* 칠판 스타일로 표시 */}
                            <div 
                              className="min-h-32 p-4 bg-green-800 text-white rounded-lg border-4 border-green-900 shadow-inner"
                              style={{ fontFamily: 'inherit', fontSize: '16px', lineHeight: '1.6' }}
                              dangerouslySetInnerHTML={{ __html: note.contentHtml }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 📚 도서 내용 섹션 */}
          <Card className="shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-l-8 border-l-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden relative group lg:col-span-2">
            {/* 장식 요소 */}
            <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="w-16 h-16 text-purple-400" />
            </div>
            
            <Collapsible open={sectionsOpen.bookContent} onOpenChange={() => toggleSection('bookContent')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-200 relative z-10 min-h-[64px] touch-manipulation active:scale-95">
                  <CardTitle className="flex items-center justify-between text-purple-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center group-hover:animate-pulse">
                        <FileText className="w-6 h-6 text-purple-700" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">📚 도서 내용</span>
                        <Badge variant="outline" className="bg-purple-200 text-purple-800 border-purple-300 font-semibold animate-pulse">
                          {bookContents.length}개
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sectionsOpen.bookContent ? 
                        <ChevronUp className="w-6 h-6 text-purple-600 group-hover:animate-bounce" /> : 
                        <ChevronDown className="w-6 h-6 text-purple-600 group-hover:animate-bounce" />
                      }
                    </div>
                  </CardTitle>
                  <CardDescription className="text-purple-700 font-medium text-base">
                    📖 교과서 내용과 재미있는 읽기 자료들!
                  </CardDescription>
                </CardHeader>
              </CollipsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {bookContents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>아직 도서 내용이 없어요</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {bookContents.map((book) => (
                        <div key={book.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-purple-900">{book.title}</h4>
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                {book.category === "reading" ? "독서" : 
                                 book.category === "textbook" ? "교과서" : 
                                 book.category === "reference" ? "참고서" : "활동지"}
                              </Badge>
                              {book.subject && (
                                <Badge variant="outline" className="text-xs">
                                  {book.subject}
                                </Badge>
                              )}
                            </div>
                            {book.author && (
                              <p className="text-sm text-purple-700">저자: {book.author}</p>
                            )}
                            {book.pageRange && (
                              <p className="text-sm text-purple-700">페이지: {book.pageRange}</p>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed mb-3">{book.content}</p>
                          <p className="text-xs text-gray-500">{formatDate(book.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </main>

      {/* Footer - 학생 친화적 (모바일 최적화) */}
      <footer className="bg-white border-t border-gray-200 py-6 sm:py-8 px-4 mt-12 sm:mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-base sm:text-lg text-gray-600 mb-2 leading-relaxed">
            <Heart className="w-4 h-4 inline text-pink-500 mr-1" />
            즐겁고 안전한 학습 환경 ✨
          </p>
          <p className="text-sm sm:text-base text-gray-500">
            궁금한 점이 있으면 선생님께 언제든지 물어보세요! 📝
          </p>
          <div className="mt-4 text-xs text-gray-400">
            {/* 모바일에서 아래로 스와이프하면 새로고침 안내 */}
            <span className="inline-block sm:hidden">📱 화면을 아래로 당기면 새로고침할 수 있어요</span>
          </div>
        </div>
      </footer>
    </div>
  );
}