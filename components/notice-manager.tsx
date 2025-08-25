"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Edit, Megaphone, AlertCircle, Info, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore"

interface Notice {
  id: string
  title: string
  content: string
  priority: "low" | "medium" | "high"
  category: "general" | "homework" | "event" | "announcement"
  createdAt?: any
  updatedAt?: any
  isActive: boolean
}

interface NoticeManagerProps {
  accentColor?: string
}

const noticeCategories = [
  { value: "general", label: "일반", icon: Info },
  { value: "homework", label: "과제", icon: CheckCircle },
  { value: "event", label: "행사", icon: Megaphone },
  { value: "announcement", label: "공지", icon: AlertCircle }
]

const priorityLevels = [
  { value: "low", label: "낮음", color: "bg-gray-100 text-gray-800" },
  { value: "medium", label: "보통", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "높음", color: "bg-red-100 text-red-800" }
]

export default function NoticeManager({ accentColor = "blue" }: NoticeManagerProps) {
  const { currentUser } = useAuth()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [priority, setPriority] = useState<Notice["priority"]>("medium")
  const [category, setCategory] = useState<Notice["category"]>("general")

  // Load notices from Firebase
  useEffect(() => {
    if (currentUser && db) {
      const noticesRef = collection(db, `users/${currentUser.uid}/notices`)
      const q = query(noticesRef, orderBy('createdAt', 'desc'))
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const noticesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Notice[]
        
        setNotices(noticesData)
      })
      
      return () => unsubscribe()
    }
  }, [currentUser])

  const resetForm = () => {
    setTitle("")
    setContent("")
    setPriority("medium")
    setCategory("general")
    setEditingId(null)
  }

  const addNotice = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.")
      return
    }

    const noticeData = {
      title: title.trim(),
      content: content.trim(),
      priority,
      category,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    setLoading(true)
    try {
      if (currentUser && db) {
        if (editingId) {
          // Update existing notice
          await updateDoc(doc(db, `users/${currentUser.uid}/notices`, editingId), {
            ...noticeData,
            updatedAt: serverTimestamp()
          })
        } else {
          // Add new notice
          await addDoc(collection(db, `users/${currentUser.uid}/notices`), noticeData)
        }
        resetForm()
      }
    } catch (error) {
      console.error('Error saving notice:', error)
      alert("공지사항 저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const editNotice = (notice: Notice) => {
    setTitle(notice.title)
    setContent(notice.content)
    setPriority(notice.priority)
    setCategory(notice.category)
    setEditingId(notice.id)
  }

  const deleteNotice = async (id: string) => {
    if (!confirm("정말 이 공지사항을 삭제하시겠습니까?")) {
      return
    }

    setLoading(true)
    try {
      if (currentUser && db) {
        await deleteDoc(doc(db, `users/${currentUser.uid}/notices`, id))
      }
    } catch (error) {
      console.error('Error deleting notice:', error)
      alert("공지사항 삭제 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    setLoading(true)
    try {
      if (currentUser && db) {
        await updateDoc(doc(db, `users/${currentUser.uid}/notices`, id), {
          isActive: !currentActive,
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error toggling notice status:', error)
      alert("공지사항 상태 변경 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (categoryValue: string) => {
    const category = noticeCategories.find(c => c.value === categoryValue)
    if (category) {
      const IconComponent = category.icon
      return <IconComponent className="w-4 h-4" />
    }
    return <Info className="w-4 h-4" />
  }

  const getCategoryLabel = (categoryValue: string) => {
    const category = noticeCategories.find(c => c.value === categoryValue)
    return category?.label || "일반"
  }

  const getPriorityBadgeClass = (priorityValue: string) => {
    const priority = priorityLevels.find(p => p.value === priorityValue)
    return priority?.color || "bg-gray-100 text-gray-800"
  }

  const getPriorityLabel = (priorityValue: string) => {
    const priority = priorityLevels.find(p => p.value === priorityValue)
    return priority?.label || "보통"
  }

  return (
    <div className="space-y-6">
      {/* 공지사항 추가/편집 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            {editingId ? "공지사항 편집" : "새 공지사항 작성"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">제목</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
                maxLength={100}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">카테고리</label>
                <Select value={category} onValueChange={(value) => setCategory(value as Notice["category"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {noticeCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">우선순위</label>
                <Select value={priority} onValueChange={(value) => setPriority(value as Notice["priority"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">내용</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지사항 내용을 입력하세요"
              rows={4}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {content.length}/1000자
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={addNotice} 
              disabled={loading || !title.trim() || !content.trim()}
              className={`flex-1 bg-${accentColor}-600 hover:bg-${accentColor}-700`}
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "저장 중..." : editingId ? "수정 완료" : "공지사항 추가"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                취소
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 공지사항 목록 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">공지사항 목록 ({notices.length}개)</h3>
        
        {notices.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              아직 작성된 공지사항이 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <Card key={notice.id} className={`border-l-4 ${notice.isActive ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(notice.category)}
                        <h4 className={`font-semibold ${notice.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                          {notice.title}
                        </h4>
                        <Badge className={getPriorityBadgeClass(notice.priority)}>
                          {getPriorityLabel(notice.priority)}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryLabel(notice.category)}
                        </Badge>
                        {!notice.isActive && (
                          <Badge variant="secondary">비활성</Badge>
                        )}
                      </div>
                      <p className={`text-sm mb-2 ${notice.isActive ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notice.content}
                      </p>
                      <div className="text-xs text-gray-500">
                        {notice.createdAt && new Date(notice.createdAt.toDate()).toLocaleDateString("ko-KR")}
                        {notice.updatedAt && notice.createdAt && notice.updatedAt.toDate().getTime() !== notice.createdAt.toDate().getTime() && (
                          <span> (수정됨)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(notice.id, notice.isActive)}
                        className={notice.isActive ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}
                      >
                        {notice.isActive ? "비활성화" : "활성화"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editNotice(notice)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteNotice(notice.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}