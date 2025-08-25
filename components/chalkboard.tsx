"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bold, Italic, Underline, Eraser, Copy, Bot, AlertCircle, Save, History, Loader2, Cloud, Share2, Users } from "lucide-react"
import { AIDialog } from "@/components/ai-dialog"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { db, isFirebaseReady, retryFirebaseInit, logFirebaseStatus } from "@/lib/firebase"
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, limit } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface ChalkboardProps {
  geminiApiKey?: string
  geminiModel?: string
}

export function Chalkboard({ geminiApiKey = "", geminiModel = "gemini-1.5-flash" }: ChalkboardProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState("18px")
  const [textColor, setTextColor] = useState("white")
  const [showAIDialog, setShowAIDialog] = useState(false)
  // 추가: 저장 관련 상태와 히스토리 상태
  const [saving, setSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [notes, setNotes] = useState<any[]>([])
  // 추가: 학생 공유 관련 상태
  const [sharing, setSharing] = useState(false)
  const [lastSharedAt, setLastSharedAt] = useState<Date | null>(null)
  // 추가: 제목 입력 상태
  const [customTitle, setCustomTitle] = useState("")
  // 추가: 인증/토스트 훅
  const { currentUser } = useAuth()
  const { toast } = useToast()
  // 추가: 변경 감지 상태
  const [dirty, setDirty] = useState(false)
  // 추가: 연결 상태 추적
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

  // 페이지 이탈 시 경고 및 Ctrl/Cmd+S 단축키 저장
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault()
        e.returnValue = "변경사항이 저장되지 않았습니다."
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener("beforeunload", beforeUnload)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("beforeunload", beforeUnload)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [dirty])
  // localStorage에서 설정 불러오기
  useEffect(() => {
    const savedSettings = localStorage.getItem("classHomepageSettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      // Props로 전달받지 못한 경우 localStorage에서 가져오기
      if (!geminiApiKey && settings.geminiApiKey) {
        geminiApiKey = settings.geminiApiKey
      }
      if (!geminiModel && settings.geminiModel) {
        geminiModel = settings.geminiModel
      }
    }
  }, [])

  // Firebase 연결 상태 모니터링
  useEffect(() => {
    const checkConnection = () => {
      if (isFirebaseReady()) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('connecting')
        // 5초 후 재연결 시도 (무한 루프 방지)
        setTimeout(() => {
          const retrySuccess = retryFirebaseInit()
          if (retrySuccess && isFirebaseReady()) {
            setConnectionStatus('connected')
            toast({ title: "Firebase 연결 복구", description: "칠판 저장이 다시 가능합니다." })
          } else {
            setConnectionStatus('error')
            if (!retrySuccess) {
              toast({ 
                title: "연결 재시도 제한", 
                description: "Firebase 보안 규칙을 확인해주세요.", 
                variant: "destructive" 
              })
            }
          }
        }, 5000)
      }
    }

    // 초기 연결 상태 확인
    checkConnection()
    
    // 주기적 연결 상태 확인 (30초마다)
    const interval = setInterval(checkConnection, 30000)
    
    return () => clearInterval(interval)
  }, [currentUser])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleFontSizeChange = (size: string) => {
    setFontSize(size)
    if (editorRef.current) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        if (!range.collapsed) {
          const span = document.createElement("span")
          span.style.fontSize = size
          try {
            range.surroundContents(span)
          } catch (e) {
            span.appendChild(range.extractContents())
            range.insertNode(span)
          }
        }
      }
    }
  }

  const handleColorChange = (color: string) => {
    setTextColor(color)
    execCommand("foreColor", color)
  }

  const clearBoard = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = ""
    }
  }

  const copyContent = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText
      navigator.clipboard.writeText(text).then(() => {
        alert("내용이 복사되었습니다!")
      })
    }
  }

  // 저장 관련 유틸
  const extractTitleFromText = (text: string) => {
    // 사용자가 입력한 제목이 있으면 우선 사용
    if (customTitle.trim()) {
      return customTitle.trim()
    }
    
    // 자동 제목 생성
    const firstLine = text.split('\n').map((t) => t.trim()).find(Boolean)
    if (!firstLine) return "무제 노트"
    // 너무 길면 자르기
    return firstLine.length > 40 ? firstLine.slice(0, 40) + "…" : firstLine
  }

  // 학생들과 공유하는 함수
  const handleShareWithStudents = async (retryCount = 0) => {
    if (!currentUser) {
      toast({ title: "로그인이 필요합니다", description: "공유하려면 로그인해주세요.", variant: "destructive" })
      return
    }
    
    // Firebase 연결 상태 확인 및 재시도
    if (!isFirebaseReady()) {
      if (retryCount === 0) {
        console.log("🔄 Firebase 연결 재시도 중...")
        logFirebaseStatus()
        const retrySuccess = retryFirebaseInit()
        
        if (retrySuccess) {
          // 연결 재시도 후 잠시 대기
          setTimeout(() => handleShareWithStudents(1), 1000)
        } else {
          toast({ 
            title: "재시도 제한 초과", 
            description: "Firebase 보안 규칙을 확인하고 페이지를 새로고침해주세요.", 
            variant: "destructive" 
          })
        }
        return
      } else {
        toast({ 
          title: "Firebase 연결 실패", 
          description: "환경 변수를 확인하고 페이지를 새로고침해주세요. (Vercel 대시보드)", 
          variant: "destructive" 
        })
        return
      }
    }
    
    const html = editorRef.current?.innerHTML?.trim() || ""
    const text = editorRef.current?.innerText?.trim() || ""
    if (!html && !text) {
      toast({ title: "공유할 내용이 없습니다", description: "내용을 입력한 후 공유해주세요." })
      return
    }
    
    setSharing(true)
    
    try {
      const title = extractTitleFromText(text)
      // 학생용 컬렉션에 저장 (교사의 개인 노트와 별도)
      const sharedRef = collection(db!, "users", currentUser.uid, "sharedClassContent")
      
      console.log("📤 학생 공유 저장 시도:", {
        userId: currentUser.uid,
        title,
        contentLength: text.length,
        timestamp: new Date().toISOString()
      })
      
      await addDoc(sharedRef, {
        title,
        contentHtml: html,
        contentText: text,
        type: "chalkboard", // 공유 컨텐츠 타입
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      const now = new Date()
      setLastSharedAt(now)
      
      console.log("✅ 학생 공유 저장 성공")
      toast({ 
        title: "학생들과 공유 완료", 
        description: `"${title}"이(가) 학생들에게 공유되었습니다!`,
        className: "bg-blue-50 border-blue-200"
      })
      
    } catch (e: any) {
      console.error("❌ 학생 공유 실패:", e)
      
      // 네트워크 오류 시 재시도 옵션 제공
      if (e?.code === 'unavailable' || e?.message?.includes('network') || retryCount < 2) {
        toast({ 
          title: "일시적 공유 실패", 
          description: "네트워크 문제입니다. 잠시 후 다시 시도해주세요.", 
          variant: "destructive"
        })
      } else {
        toast({ 
          title: "공유 실패", 
          description: `오류: ${e?.message || "알 수 없는 문제가 발생했습니다."}`, 
          variant: "destructive" 
        })
      }
    } finally {
      setSharing(false)
    }
  }

  const handleSave = async (retryCount = 0) => {
    if (!currentUser) {
      toast({ title: "로그인이 필요합니다", description: "노트를 저장하려면 로그인해주세요.", variant: "destructive" })
      return
    }
    
    // Firebase 연결 상태 확인 및 재시도
    if (!isFirebaseReady()) {
      if (retryCount === 0) {
        console.log("🔄 Firebase 연결 재시도 중...")
        logFirebaseStatus()
        const retrySuccess = retryFirebaseInit()
        
        if (retrySuccess) {
          // 연결 재시도 후 잠시 대기
          setTimeout(() => handleSave(1), 1000)
        } else {
          toast({ 
            title: "재시도 제한 초과", 
            description: "Firebase 보안 규칙을 확인하고 페이지를 새로고침해주세요.", 
            variant: "destructive" 
          })
        }
        return
      } else {
        toast({ 
          title: "Firebase 연결 실패", 
          description: "환경 변수를 확인하고 페이지를 새로고침해주세요. (Vercel 대시보드)", 
          variant: "destructive" 
        })
        return
      }
    }
    
    const html = editorRef.current?.innerHTML?.trim() || ""
    const text = editorRef.current?.innerText?.trim() || ""
    if (!html && !text) {
      toast({ title: "저장할 내용이 없습니다", description: "내용을 입력한 후 저장해주세요." })
      return
    }
    
    setSaving(true)
    
    try {
      const title = extractTitleFromText(text)
      const ref = collection(db!, "users", currentUser.uid, "chalkboardNotes")
      
      console.log("💾 Firestore 저장 시도:", {
        userId: currentUser.uid,
        title,
        contentLength: text.length,
        timestamp: new Date().toISOString()
      })
      
      await addDoc(ref, {
        title,
        contentHtml: html,
        contentText: text,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      const now = new Date()
      setLastSavedAt(now)
      setDirty(false)
      
      console.log("✅ Firestore 저장 성공")
      toast({ title: "저장 완료", description: `${title} (자동 제목)` })
      
    } catch (e: any) {
      console.error("❌ 노트 저장 실패:", e)
      
      // 네트워크 오류 시 재시도 옵션 제공
      if (e?.code === 'unavailable' || e?.message?.includes('network') || retryCount < 2) {
        toast({ 
          title: "일시적 저장 실패", 
          description: "네트워크 문제입니다. 잠시 후 다시 시도해주세요.", 
          variant: "destructive",
          action: {
            label: "재시도",
            onClick: () => handleSave(retryCount + 1)
          }
        })
      } else {
        toast({ 
          title: "저장 실패", 
          description: `오류: ${e?.message || "알 수 없는 문제가 발생했습니다."}`, 
          variant: "destructive" 
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const onEditorInput = () => {
    if (!dirty) setDirty(true)
  }

  const openHistory = async () => {
    setShowHistory(true)
    if (!currentUser) return
    
    if (!isFirebaseReady()) {
      toast({ 
        title: "Firebase 연결 필요", 
        description: "환경 변수를 확인하고 페이지를 새로고침해주세요.", 
        variant: "destructive" 
      })
      return
    }
    
    setHistoryLoading(true)
    try {
      const ref = collection(db!, "users", currentUser.uid, "chalkboardNotes")
      const q = query(ref, orderBy("createdAt", "desc"), limit(10))
      
      console.log("📚 히스토리 로딩 시도:", { userId: currentUser.uid })
      
      const snap = await getDocs(q)
      const list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
      
      console.log("✅ 히스토리 로딩 성공:", { count: list.length })
      setNotes(list)
      
    } catch (e: any) {
      console.error("❌ 히스토리 로딩 실패:", e)
      toast({ 
        title: "불러오기 실패", 
        description: `히스토리를 불러오지 못했습니다: ${e?.message || "네트워크 오류"}`, 
        variant: "destructive" 
      })
    } finally {
      setHistoryLoading(false)
    }
  }

  const loadNote = (note: any) => {
    if (!editorRef.current) return
    editorRef.current.innerHTML = note?.contentHtml || ""
    toast({ title: "노트 불러오기", description: note?.title || "제목 없음" })
    setShowHistory(false)
  }

  const formatDate = (ts: any) => {
    try {
      if (ts?.toDate) return ts.toDate().toLocaleString()
      if (ts instanceof Date) return ts.toLocaleString()
      if (typeof ts === 'string') return new Date(ts).toLocaleString()
      return ""
    } catch {
      return ""
    }
  }

  const handleAISubmit = (content: string) => {
    if (editorRef.current) {
      // AI 응답을 HTML로 변환하여 칠판에 추가 (자연스러운 필기 스타일)
      const aiResponseElement = document.createElement('div')
      aiResponseElement.className = 'ai-response-block'
      aiResponseElement.style.cssText = `
        padding: 12px 0;
        margin: 12px 0;
        font-family: inherit;
        line-height: 1.6;
      `
      
      // AI 헤더 추가 (더 자연스럽게)
      const aiHeader = document.createElement('div')
      aiHeader.innerHTML = '🤖 <em>AI 도우미:</em>'
      aiHeader.style.cssText = `
        color: #93c5fd;
        font-style: italic;
        margin-bottom: 8px;
        font-size: 0.9em;
        opacity: 0.8;
      `
      
      // 마크다운 스타일의 텍스트를 HTML로 간단 변환
      const formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code style="background-color: rgba(255,255,255,0.2); padding: 2px 4px; border-radius: 3px;">$1</code>')
        .replace(/^### (.*$)/gm, '<h3 style="font-size: 1.1em; font-weight: bold; margin: 12px 0 6px 0; color: #e2e8f0;">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.2em; font-weight: bold; margin: 16px 0 8px 0; color: #f1f5f9;">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 style="font-size: 1.3em; font-weight: bold; margin: 20px 0 10px 0; color: #f8fafc;">$1</h1>')
        .replace(/^- (.*$)/gm, '<li style="margin-left: 20px; list-style-type: disc;">$1</li>')
        .replace(/^\d+\. (.*$)/gm, '<li style="margin-left: 20px; list-style-type: decimal;">$1</li>')
        .replace(/\n/g, '<br>')

      const contentDiv = document.createElement('div')
      contentDiv.innerHTML = formattedContent
      contentDiv.style.cssText = `
        color: white;
        line-height: 1.6;
        font-size: inherit;
      `
      
      aiResponseElement.appendChild(aiHeader)
      aiResponseElement.appendChild(contentDiv)
      
      // 현재 내용에 AI 응답 추가
      if (editorRef.current.innerHTML.trim()) {
        editorRef.current.appendChild(document.createElement('br'))
      }
      editorRef.current.appendChild(aiResponseElement)
      
      // 칠판 하단으로 스크롤
      editorRef.current.scrollTop = editorRef.current.scrollHeight

      // AI 추가 후 자동 저장 시도
      if (currentUser && isFirebaseReady()) {
        handleSave()
      } else {
        setDirty(true)
        toast({ 
          title: "AI 응답이 추가되었습니다", 
          description: currentUser ? 
            "Firestore 연결 후 저장됩니다." : 
            "로그인하면 저장할 수 있어요." 
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* 제목 입력 영역 */}
      <div className="mb-4">
        <Input
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          placeholder="수업 제목을 입력하세요 (비어있으면 자동 생성)"
          className="w-full text-lg font-medium bg-white/90 border-2 border-green-200 focus:border-green-400 rounded-lg p-3"
        />
      </div>

      {/* 툴바 */}
      <div className="flex items-center gap-2">
        <Select onValueChange={handleFontSizeChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="글자 크기" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="14px">작게</SelectItem>
            <SelectItem value="18px">보통</SelectItem>
            <SelectItem value="22px">크게</SelectItem>
            <SelectItem value="28px">아주 크게</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={handleColorChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="글자 색상" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="white">흰색</SelectItem>
            <SelectItem value="yellow">노란색</SelectItem>
            <SelectItem value="lightgreen">연두색</SelectItem>
            <SelectItem value="lightblue">하늘색</SelectItem>
            <SelectItem value="pink">분홍색</SelectItem>
            <SelectItem value="#ffcc00">주황색</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        {/* AI 버튼 */}
        <div className="relative group">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              if (!geminiApiKey) {
                alert('설정 탭에서 Gemini API Key를 먼저 등록해주세요!')
                return
              }
              setShowAIDialog(true)
            }}
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Bot className="w-4 h-4 mr-1" />
            AI
            {!geminiApiKey && (
              <AlertCircle className="w-3 h-3 ml-1 text-amber-500" />
            )}
          </Button>
          
          {/* API 키 없을 때 툴팁 */}
          {!geminiApiKey && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              설정에서 API Key 등록 필요
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <Button size="sm" variant="outline" onClick={clearBoard}>
          <Eraser className="w-4 h-4 mr-1" />
          지우기
        </Button>
        <Button size="sm" variant="outline" onClick={copyContent}>
          <Copy className="w-4 h-4 mr-1" />
          복사
        </Button>

        {/* 저장/히스토리 */}
        <div className="ml-auto flex items-center gap-2">
          <div className="text-xs text-white/70 flex items-center gap-2">
            {/* Firebase 연결 상태 표시 */}
            {connectionStatus === 'connected' ? (
              <span className="flex items-center gap-1 text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                연결됨
              </span>
            ) : connectionStatus === 'error' ? (
              <span className="flex items-center gap-1 text-red-300">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                연결 실패
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-300">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-spin"></div>
                연결 중
              </span>
            )}
            <span className="mx-2">|</span>
            {lastSavedAt ? (
              <span className="flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                {lastSavedAt.toLocaleTimeString()} 저장됨
              </span>
            ) : (
              <span className="opacity-70">저장되지 않음</span>
            )}
            {lastSharedAt && (
              <>
                <span className="mx-2">|</span>
                <span className="flex items-center gap-1 text-blue-300">
                  <Users className="w-3 h-3" />
                  {lastSharedAt.toLocaleTimeString()} 공유됨
                </span>
              </>
            )}
          </div>
          <Button 
            size="sm" 
            variant="default" 
            onClick={() => handleSave()} 
            disabled={saving || connectionStatus !== 'connected'} 
            className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-500"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            저장
          </Button>
          <Button 
            size="sm" 
            variant="default" 
            onClick={() => handleShareWithStudents()} 
            disabled={sharing || connectionStatus !== 'connected'} 
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-500"
          >
            {sharing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Share2 className="w-4 h-4 mr-1" />}
            학생 공유
          </Button>
          <Button size="sm" variant="outline" onClick={openHistory} disabled={connectionStatus !== 'connected'}>
            <History className="w-4 h-4 mr-1" />
            히스토리
          </Button>
        </div>
      </div>

      {/* 칠판 */}
      <div
        ref={editorRef}
        contentEditable
        onInput={onEditorInput}
        className="min-h-64 p-4 bg-green-800 text-white rounded-lg border-4 border-green-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        style={{ fontSize }}
      />

      {/* AI 대화창 */}
      <AIDialog
        isOpen={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        onSubmit={handleAISubmit}
        apiKey={geminiApiKey}
        model={geminiModel}
      />

      {/* 히스토리 다이얼로그 */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>최근 저장한 노트</DialogTitle>
            <DialogDescription>최대 10개까지 최근 저장본을 불러올 수 있어요.</DialogDescription>
          </DialogHeader>

          {!currentUser || !db ? (
            <div className="p-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded">
              Firebase 설정이 되어 있지 않거나 로그인하지 않았습니다. 환경 변수를 설정하고 로그인해주세요.
            </div>
          ) : (
            <div className="space-y-3">
              {historyLoading ? (
                <div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" /> 불러오는 중...</div>
              ) : notes.length === 0 ? (
                <div className="text-sm text-gray-500">저장된 노트가 없습니다. 먼저 저장을 해보세요.</div>
              ) : (
                <ul className="divide-y divide-gray-200 rounded border">
                  {notes.map((n) => (
                    <li key={n.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{n.title || '제목 없음'}</div>
                        <div className="text-xs text-gray-500">{formatDate(n.createdAt)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => loadNote(n)}>불러오기</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}