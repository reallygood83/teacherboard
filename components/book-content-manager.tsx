"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Edit, BookOpen, Star, BookMarked, FileText } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore"

interface BookContent {
  id: string
  title: string
  author?: string
  content: string
  pageRange?: string
  category: "reading" | "textbook" | "reference" | "activity"
  subject?: string
  createdAt?: any
  updatedAt?: any
  isActive: boolean
}

interface BookContentManagerProps {
  accentColor?: string
}

const bookCategories = [
  { value: "reading", label: "독서", icon: BookOpen },
  { value: "textbook", label: "교과서", icon: BookMarked },
  { value: "reference", label: "참고서", icon: FileText },
  { value: "activity", label: "활동지", icon: Star }
]

const subjects = [
  { value: "korean", label: "국어" },
  { value: "math", label: "수학" },
  { value: "science", label: "과학" },
  { value: "social", label: "사회" },
  { value: "english", label: "영어" },
  { value: "art", label: "미술" },
  { value: "music", label: "음악" },
  { value: "pe", label: "체육" },
  { value: "other", label: "기타" }
]

export default function BookContentManager({ accentColor = "blue" }: BookContentManagerProps) {
  const { currentUser } = useAuth()
  const [bookContents, setBookContents] = useState<BookContent[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [content, setContent] = useState("")
  const [pageRange, setPageRange] = useState("")
  const [category, setCategory] = useState<BookContent["category"]>("reading")
  const [subject, setSubject] = useState("")

  // Load book contents from Firebase
  useEffect(() => {
    if (currentUser && db) {
      const bookContentsRef = collection(db, `users/${currentUser.uid}/bookContents`)
      const q = query(bookContentsRef, orderBy('createdAt', 'desc'))
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookContentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as BookContent[]
        
        setBookContents(bookContentsData)
      })
      
      return () => unsubscribe()
    }
  }, [currentUser])

  const resetForm = () => {
    setTitle("")
    setAuthor("")
    setContent("")
    setPageRange("")
    setCategory("reading")
    setSubject("")
    setEditingId(null)
  }

  const addBookContent = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.")
      return
    }

    const bookContentData = {
      title: title.trim(),
      author: author.trim() || undefined,
      content: content.trim(),
      pageRange: pageRange.trim() || undefined,
      category,
      subject: subject || undefined,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    setLoading(true)
    try {
      if (currentUser && db) {
        if (editingId) {
          // Update existing book content
          await updateDoc(doc(db, `users/${currentUser.uid}/bookContents`, editingId), {
            ...bookContentData,
            updatedAt: serverTimestamp()
          })
        } else {
          // Add new book content
          await addDoc(collection(db, `users/${currentUser.uid}/bookContents`), bookContentData)
        }
        resetForm()
      }
    } catch (error) {
      console.error('Error saving book content:', error)
      alert("도서 내용 저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const editBookContent = (bookContent: BookContent) => {
    setTitle(bookContent.title)
    setAuthor(bookContent.author || "")
    setContent(bookContent.content)
    setPageRange(bookContent.pageRange || "")
    setCategory(bookContent.category)
    setSubject(bookContent.subject || "")
    setEditingId(bookContent.id)
  }

  const deleteBookContent = async (id: string) => {
    if (!confirm("정말 이 도서 내용을 삭제하시겠습니까?")) {
      return
    }

    setLoading(true)
    try {
      if (currentUser && db) {
        await deleteDoc(doc(db, `users/${currentUser.uid}/bookContents`, id))
      }
    } catch (error) {
      console.error('Error deleting book content:', error)
      alert("도서 내용 삭제 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    setLoading(true)
    try {
      if (currentUser && db) {
        await updateDoc(doc(db, `users/${currentUser.uid}/bookContents`, id), {
          isActive: !currentActive,
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error toggling book content status:', error)
      alert("도서 내용 상태 변경 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (categoryValue: string) => {
    const category = bookCategories.find(c => c.value === categoryValue)
    if (category) {
      const IconComponent = category.icon
      return <IconComponent className="w-4 h-4" />
    }
    return <BookOpen className="w-4 h-4" />
  }

  const getCategoryLabel = (categoryValue: string) => {
    const category = bookCategories.find(c => c.value === categoryValue)
    return category?.label || "독서"
  }

  const getSubjectLabel = (subjectValue: string) => {
    const subj = subjects.find(s => s.value === subjectValue)
    return subj?.label || ""
  }

  return (
    <div className="space-y-6">
      {/* 도서 내용 추가/편집 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {editingId ? "도서 내용 편집" : "새 도서 내용 추가"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">책 제목</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="책 제목을 입력하세요"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">저자 (선택사항)</label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="저자명을 입력하세요"
                maxLength={50}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">카테고리</label>
              <Select value={category} onValueChange={(value) => setCategory(value as BookContent["category"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bookCategories.map((cat) => (
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
              <label className="block text-sm font-medium mb-1">과목 (선택사항)</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="과목 선택" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subj) => (
                    <SelectItem key={subj.value} value={subj.value}>
                      {subj.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">페이지 (선택사항)</label>
              <Input
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="예: 12-25쪽"
                maxLength={20}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">내용</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="도서 내용이나 활동 내용을 입력하세요"
              rows={5}
              maxLength={2000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {content.length}/2000자
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={addBookContent} 
              disabled={loading || !title.trim() || !content.trim()}
              className={`flex-1 bg-${accentColor}-600 hover:bg-${accentColor}-700`}
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "저장 중..." : editingId ? "수정 완료" : "도서 내용 추가"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                취소
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 도서 내용 목록 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">도서 내용 목록 ({bookContents.length}개)</h3>
        
        {bookContents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              아직 추가된 도서 내용이 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookContents.map((bookContent) => (
              <Card key={bookContent.id} className={`border-l-4 ${bookContent.isActive ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getCategoryIcon(bookContent.category)}
                        <h4 className={`font-semibold ${bookContent.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                          {bookContent.title}
                        </h4>
                        {bookContent.author && (
                          <span className="text-sm text-gray-600">- {bookContent.author}</span>
                        )}
                        <Badge variant="outline">
                          {getCategoryLabel(bookContent.category)}
                        </Badge>
                        {bookContent.subject && (
                          <Badge variant="secondary">
                            {getSubjectLabel(bookContent.subject)}
                          </Badge>
                        )}
                        {bookContent.pageRange && (
                          <Badge variant="outline" className="text-xs">
                            {bookContent.pageRange}
                          </Badge>
                        )}
                        {!bookContent.isActive && (
                          <Badge variant="secondary">비활성</Badge>
                        )}
                      </div>
                      <p className={`text-sm mb-2 ${bookContent.isActive ? 'text-gray-700' : 'text-gray-500'}`}>
                        {bookContent.content}
                      </p>
                      <div className="text-xs text-gray-500">
                        {bookContent.createdAt && new Date(bookContent.createdAt.toDate()).toLocaleDateString("ko-KR")}
                        {bookContent.updatedAt && bookContent.createdAt && bookContent.updatedAt.toDate().getTime() !== bookContent.createdAt.toDate().getTime() && (
                          <span> (수정됨)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(bookContent.id, bookContent.isActive)}
                        className={bookContent.isActive ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}
                      >
                        {bookContent.isActive ? "비활성화" : "활성화"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editBookContent(bookContent)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBookContent(bookContent.id)}
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