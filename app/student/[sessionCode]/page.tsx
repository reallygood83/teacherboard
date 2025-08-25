"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Link,
  BookOpen,
  Library,
  Heart,
  Users,
  Globe,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { db, isFirebaseReady } from "@/lib/firebase"
import { collection, query, orderBy, limit, getDocs, doc, getDoc, where } from "firebase/firestore"

interface SessionData {
  id: string
  title: string
  description: string
  teacherId: string
  sessionCode: string
  createdAt: any
  isActive: boolean
}

interface ChalkboardNote {
  id: string
  title: string
  content: string
  category: string
  createdAt: any
  updatedAt: any
}

interface Notice {
  id: string
  title: string
  content: string
  category: string
  priority: "low" | "medium" | "high"
  createdAt: any
  updatedAt: any
  isActive: boolean
}

interface SharedLink {
  id: string
  title: string
  url: string
  description?: string
  category: string
  addedDate: string
  createdAt: any
  updatedAt: any
}

interface BookContent {
  id: string
  title: string
  author?: string
  category: "textbook" | "workbook" | "reference" | "activity"
  subject?: string
  pageRange?: string
  content: string
  createdAt: any
  updatedAt: any
  isActive: boolean
}

export default function StudentPage() {
  const { toast } = useToast()
  const [sessionCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.split('/').pop() || ''
    }
    return ''
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [notices, setNotices] = useState<Notice[]>([])
  const [chalkboardNotes, setChalkboardNotes] = useState<ChalkboardNote[]>([])
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([])
  const [bookContents, setBookContents] = useState<BookContent[]>([])
  const [currentDate, setCurrentDate] = useState("")
  
  // 섹션 열림/닫힘 상태 (기본적으로 모두 열림)
  const [sectionsOpen, setSectionsOpen] = useState({
    announcements: true,
    links: true,
    classContent: true,
    bookContent: true
  })
  
  // 새로고침 상태
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  // 현재 날짜 설정
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
      setError("Firebase가 초기화되지 않았습니다.")
      setLoading(false)
      return
    }

    try {
      // 세션 코드로 세션 데이터 찾기
      const sessionsRef = collection(db!, "studentSessions")
      const sessionQuery = query(sessionsRef, where("sessionCode", "==", sessionCode), limit(1))
      const sessionSnap = await getDocs(sessionQuery)
      
      if (sessionSnap.empty) {
        setError("유효하지 않은 세션 코드입니다.")
        setLoading(false)
        return
      }

      const session = { id: sessionSnap.docs[0].id, ...sessionSnap.docs[0].data() } as SessionData
      setSessionData(session)

      // 교사 데이터 로드
      await loadTeacherData(session.teacherId)
      
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
      // 공지사항 로드
      const noticesRef = collection(db!, `users/${teacherId}/notices`)
      const noticesQuery = query(
        noticesRef, 
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'), 
        limit(10)
      )
      const noticesSnap = await getDocs(noticesQuery)
      const noticesData = noticesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notice[]
      setNotices(noticesData)

      // 수업 내용 로드
      const chalkboardRef = collection(db!, `users/${teacherId}/chalkboardNotes`)
      const chalkboardQuery = query(chalkboardRef, orderBy('createdAt', 'desc'), limit(10))
      const chalkboardSnap = await getDocs(chalkboardQuery)
      const chalkboardData = chalkboardSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChalkboardNote[]
      setChalkboardNotes(chalkboardData)

      // 링크 공유 로드 (savedLinks로 수정)
      const linksRef = collection(db!, `users/${teacherId}/savedLinks`)
      const linksQuery = query(linksRef, orderBy('createdAt', 'desc'), limit(10))
      const linksSnap = await getDocs(linksQuery)
      const linksData = linksSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SharedLink[]
      setSharedLinks(linksData)

      // 도서 내용 로드
      const bookRef = collection(db!, `users/${teacherId}/bookContents`)
      const bookQuery = query(
        bookRef, 
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'), 
        limit(10)
      )
      const bookSnap = await getDocs(bookQuery)
      const bookData = bookSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BookContent[]
      setBookContents(bookData)

    } catch (err: any) {
      console.error("교사 데이터 로드 실패:", err)
      toast({
        title: "데이터 로드 오류",
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
    setRefreshing(true)
    try {
      if (sessionData) {
        await loadTeacherData(sessionData.teacherId)
      }
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
  const formatDate = (timestamp: any): string => {
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
      e.preventDefault()
      setIsPulling(true)
      setPullDistance(Math.min(diff * 0.5, 100))
      
      if (diff > 120) {
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
    )
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
    )
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
                <div className="flex items-center gap-2">
                  <Users className="w-8 h-8 text-white drop-shadow-lg" />
                  <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                    {sessionData?.title || '우리 학급'}
                  </h1>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                  세션코드: {sessionCode}
                </Badge>
              </div>
              <p className="text-lg text-white/90 leading-relaxed drop-shadow">
                {sessionData?.description || '함께 배우고 성장하는 우리 학급 ✨'}
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3 text-center lg:text-right">
              <div className="flex items-center gap-2 text-white/90">
                <Globe className="w-5 h-5" />
                <span className="text-base font-medium">{currentDate}</span>
              </div>
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 4개의 접이식 섹션 */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div className="grid gap-6">

          {/* 1. 공지사항 섹션 */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <Collapsible 
              open={sectionsOpen.announcements} 
              onOpenChange={() => toggleSection('announcements')}
            >
              <CollapsibleTrigger className="w-full">
                <CardTitle className="flex items-center justify-between p-6 text-left group cursor-pointer hover:bg-orange-50/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-md">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        공지사항 📢
                      </span>
                      <p className="text-sm text-gray-500 mt-1">선생님의 중요한 소식들</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {notices.length}개
                    </Badge>
                    <div className="p-2 rounded-full group-hover:bg-orange-100 transition-colors">
                      {sectionsOpen.announcements ? 
                        <ChevronUp className="w-6 h-6 text-orange-600 group-hover:animate-bounce" /> : 
                        <ChevronDown className="w-6 h-6 text-orange-600 group-hover:animate-bounce" />
                      }
                    </div>
                  </CardTitle>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-6 px-6">
                  {notices.length > 0 ? (
                    <div className="space-y-4">
                      {notices.map((notice) => (
                        <div key={notice.id} className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-semibold text-orange-900 text-lg leading-tight flex-1">{notice.title}</h4>
                            <div className="flex gap-2 flex-shrink-0">
                              <Badge 
                                variant="outline"
                                className={`text-xs ${
                                  notice.priority === "high" ? "border-red-300 text-red-700 bg-red-50" :
                                  notice.priority === "medium" ? "border-yellow-300 text-yellow-700 bg-yellow-50" :
                                  "border-green-300 text-green-700 bg-green-50"
                                }`}
                              >
                                {notice.priority === "high" ? "중요" : notice.priority === "medium" ? "보통" : "일반"}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                                {notice.category}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed mb-3">{notice.content}</p>
                          <p className="text-xs text-gray-500">{formatDate(notice.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>아직 등록된 공지사항이 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 2. 링크 공유 섹션 */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <Collapsible 
              open={sectionsOpen.links} 
              onOpenChange={() => toggleSection('links')}
            >
              <CollapsibleTrigger className="w-full">
                <CardTitle className="flex items-center justify-between p-6 text-left group cursor-pointer hover:bg-green-50/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-md">
                      <Link className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                        링크 공유 🔗
                      </span>
                      <p className="text-sm text-gray-500 mt-1">유용한 웹사이트와 자료들</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {sharedLinks.length}개
                    </Badge>
                    <div className="p-2 rounded-full group-hover:bg-green-100 transition-colors">
                      {sectionsOpen.links ? 
                        <ChevronUp className="w-6 h-6 text-green-600 group-hover:animate-bounce" /> : 
                        <ChevronDown className="w-6 h-6 text-green-600 group-hover:animate-bounce" />
                      }
                    </div>
                  </CardTitle>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-6 px-6">
                  {sharedLinks.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {sharedLinks.map((link) => (
                        <div 
                          key={link.id} 
                          onClick={() => openLink(link.url)}
                          className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md cursor-pointer transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <ExternalLink className="w-5 h-5 text-green-600 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-green-900 text-base leading-tight group-hover:text-green-700">{link.title}</h4>
                              {link.description && (
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{link.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                                  {link.category}
                                </Badge>
                                <span className="text-xs text-gray-500">{link.addedDate}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Link className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>아직 공유된 링크가 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 3. 수업 내용 섹션 */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <Collapsible 
              open={sectionsOpen.classContent} 
              onOpenChange={() => toggleSection('classContent')}
            >
              <CollapsibleTrigger className="w-full">
                <CardTitle className="flex items-center justify-between p-6 text-left group cursor-pointer hover:bg-blue-50/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full shadow-md">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        수업 내용 📝
                      </span>
                      <p className="text-sm text-gray-500 mt-1">오늘 배운 내용과 수업 자료</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {chalkboardNotes.length}개
                    </Badge>
                    <div className="p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                      {sectionsOpen.classContent ? 
                        <ChevronUp className="w-6 h-6 text-blue-600 group-hover:animate-bounce" /> : 
                        <ChevronDown className="w-6 h-6 text-blue-600 group-hover:animate-bounce" />
                      }
                    </div>
                  </CardTitle>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-6 px-6">
                  {chalkboardNotes.length > 0 ? (
                    <div className="space-y-4">
                      {chalkboardNotes.map((note) => (
                        <div key={note.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-semibold text-blue-900 text-lg leading-tight flex-1">{note.title}</h4>
                            <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 flex-shrink-0">
                              {note.category}
                            </Badge>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{note.content}</p>
                          <p className="text-xs text-gray-500">{formatDate(note.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>아직 수업 내용이 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 4. 도서 내용 섹션 */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <Collapsible 
              open={sectionsOpen.bookContent} 
              onOpenChange={() => toggleSection('bookContent')}
            >
              <CollapsibleTrigger className="w-full">
                <CardTitle className="flex items-center justify-between p-6 text-left group cursor-pointer hover:bg-purple-50/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full shadow-md">
                      <Library className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                        도서 내용 📚
                      </span>
                      <p className="text-sm text-gray-500 mt-1">교과서와 참고서 주요 내용</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {bookContents.length}개
                    </Badge>
                    <div className="p-2 rounded-full group-hover:bg-purple-100 transition-colors">
                      {sectionsOpen.bookContent ? 
                        <ChevronUp className="w-6 h-6 text-purple-600 group-hover:animate-bounce" /> : 
                        <ChevronDown className="w-6 h-6 text-purple-600 group-hover:animate-bounce" />
                      }
                    </div>
                  </CardTitle>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-6 px-6">
                  {bookContents.length > 0 ? (
                    <div className="space-y-4">
                      {bookContents.map((book) => (
                        <div key={book.id} className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-semibold text-purple-900 text-lg leading-tight flex-1">{book.title}</h4>
                            <div className="flex gap-2 flex-wrap flex-shrink-0">
                              <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                                {book.category === "textbook" ? "교과서" :
                                 book.category === "workbook" ? "문제집" :
                                 book.category === "reference" ? "참고서" : "활동지"}
                              </Badge>
                              {book.subject && (
                                <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                                  {book.subject}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {book.author && (
                            <p className="text-sm text-purple-700 mb-1">저자: {book.author}</p>
                          )}
                          {book.pageRange && (
                            <p className="text-sm text-purple-700 mb-2">페이지: {book.pageRange}</p>
                          )}
                          <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{book.content}</p>
                          <p className="text-xs text-gray-500">{formatDate(book.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Library className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>아직 도서 내용이 없습니다.</p>
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
  )
}