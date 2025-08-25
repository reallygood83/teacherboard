"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink, Plus, Trash2, BookOpen, Globe, Video, Calculator, Star, StarOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore"

interface SavedLink {
  id: string
  title: string
  url: string
  description?: string
  category: string
  addedDate: string
  isQuickLink?: boolean
  createdAt?: any
}

const educationalSites = [
  {
    title: "하이러닝",
    url: "https://hi.goe.go.kr",
    description: "경기도교육청 온라인 학습 플랫폼",
    category: "교육청",
  },
  { title: "Hiclass", url: "https://www.hiclass.net/", description: "스마트 교실 수업 도구", category: "수업도구" },
  { title: "에듀넷", url: "https://www.edunet.net/", description: "교육부 교육자료 포털", category: "교육청" },
  { title: "아이스크림", url: "https://www.i-scream.co.kr/", description: "초등 교육 콘텐츠", category: "교육콘텐츠" },
  { title: "EBS 초등", url: "https://primary.ebs.co.kr/", description: "EBS 초등 교육방송", category: "교육방송" },
  { title: "국립중앙과학관", url: "https://www.science.go.kr/", description: "과학 교육 자료", category: "과학" },
  { title: "한국사 편찬위원회", url: "https://www.history.go.kr/", description: "역사 교육 자료", category: "사회" },
  { title: "세종학당", url: "https://www.ksif.or.kr/", description: "한국어 교육 자료", category: "국어" },
]

interface LinkEmbedderProps {
  onLinksUpdate?: (links: SavedLink[]) => void
}

export function LinkEmbedder({ onLinksUpdate }: LinkEmbedderProps = {}) {
  const { currentUser } = useAuth()
  const [linkTitle, setLinkTitle] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkDescription, setLinkDescription] = useState("")
  const [linkCategory, setLinkCategory] = useState("기타")
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([])
  const [filterCategory, setFilterCategory] = useState("전체")
  const [loading, setLoading] = useState(false)

  // Load links from Firebase or localStorage
  useEffect(() => {
    if (currentUser && db) {
      const linksRef = collection(db, `users/${currentUser.uid}/savedLinks`)
      const q = query(linksRef, orderBy('createdAt', 'desc'))
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const linksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as SavedLink[]
        
        if (linksData.length === 0) {
          // Initialize with default educational sites
          initializeDefaultLinks()
        } else {
          setSavedLinks(linksData)
          localStorage.setItem("classHomepageLinks", JSON.stringify(linksData))
        }
      })
      
      return () => unsubscribe()
    } else {
      // Fallback to localStorage when Firebase is not available
      const savedLinksData = localStorage.getItem("classHomepageLinks")
      if (savedLinksData) {
        setSavedLinks(JSON.parse(savedLinksData))
      } else {
        initializeDefaultLinks()
      }
    }
  }, [currentUser])

  const initializeDefaultLinks = async () => {
    const defaultLinks = educationalSites.map((site, index) => ({
      id: `default-${index}`,
      ...site,
      addedDate: new Date().toLocaleDateString("ko-KR"),
      createdAt: new Date()
    }))
    
    setSavedLinks(defaultLinks)
    localStorage.setItem("classHomepageLinks", JSON.stringify(defaultLinks))
    
    // Save default links to Firebase if user is logged in
    if (currentUser && db) {
      try {
        for (const link of defaultLinks) {
          const { id, ...linkData } = link
          await addDoc(collection(db, `users/${currentUser.uid}/savedLinks`), {
            ...linkData,
            createdAt: serverTimestamp()
          })
        }
      } catch (error) {
        console.error('Error saving default links to Firebase:', error)
      }
    }
  }

  const saveLinksToStorage = (links: SavedLink[]) => {
    localStorage.setItem("classHomepageLinks", JSON.stringify(links))
    // 부모 컴포넌트에 변경 알림
    if (onLinksUpdate) {
      onLinksUpdate(links)
    }
  }

  const addLink = async () => {
    if (!linkTitle || !linkUrl) {
      alert("제목과 URL을 모두 입력해주세요.")
      return
    }

    const newLinkData = {
      title: linkTitle,
      url: linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`,
      description: linkDescription,
      category: linkCategory,
      addedDate: new Date().toLocaleDateString("ko-KR"),
      createdAt: serverTimestamp()
    }

    setLoading(true)
    try {
      if (currentUser && db) {
        await addDoc(collection(db, `users/${currentUser.uid}/savedLinks`), newLinkData)
      } else {
        // Fallback to localStorage
        const newLink: SavedLink = {
          id: Date.now().toString(),
          ...newLinkData,
          createdAt: new Date()
        }
        const updatedLinks = [...savedLinks, newLink]
        setSavedLinks(updatedLinks)
        saveLinksToStorage(updatedLinks)
      }

      setLinkTitle("")
      setLinkUrl("")
      setLinkDescription("")
      setLinkCategory("기타")
    } catch (error) {
      console.error('Error adding link:', error)
      alert("링크 추가 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const removeLink = async (id: string) => {
    setLoading(true)
    try {
      if (currentUser && db) {
        await deleteDoc(doc(db, `users/${currentUser.uid}/savedLinks`, id))
      } else {
        // Fallback to localStorage
        const updatedLinks = savedLinks.filter((link) => link.id !== id)
        setSavedLinks(updatedLinks)
        saveLinksToStorage(updatedLinks)
      }
    } catch (error) {
      console.error('Error removing link:', error)
      alert("링크 삭제 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const addQuickLink = async (site: (typeof educationalSites)[0]) => {
    const existingLink = savedLinks.find((link) => link.url === site.url)
    if (existingLink) {
      alert("이미 추가된 링크입니다.")
      return
    }

    const newLinkData = {
      ...site,
      addedDate: new Date().toLocaleDateString("ko-KR"),
      createdAt: serverTimestamp()
    }

    setLoading(true)
    try {
      if (currentUser && db) {
        await addDoc(collection(db, `users/${currentUser.uid}/savedLinks`), newLinkData)
      } else {
        // Fallback to localStorage
        const newLink: SavedLink = {
          id: Date.now().toString(),
          ...newLinkData,
          createdAt: new Date()
        }
        const updatedLinks = [...savedLinks, newLink]
        setSavedLinks(updatedLinks)
        saveLinksToStorage(updatedLinks)
      }
    } catch (error) {
      console.error('Error adding quick link:', error)
      alert("빠른 링크 추가 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const openLink = (url: string) => {
    window.open(url, "_blank")
  }

  const toggleQuickLink = async (id: string) => {
    const link = savedLinks.find(l => l.id === id)
    if (!link) return

    const updatedIsQuickLink = !link.isQuickLink

    setLoading(true)
    try {
      if (currentUser && db) {
        await updateDoc(doc(db, `users/${currentUser.uid}/savedLinks`, id), {
          isQuickLink: updatedIsQuickLink
        })
      } else {
        // Fallback to localStorage
        const updatedLinks = savedLinks.map((link) => {
          if (link.id === id) {
            return { ...link, isQuickLink: updatedIsQuickLink }
          }
          return link
        })
        setSavedLinks(updatedLinks)
        saveLinksToStorage(updatedLinks)
      }
    } catch (error) {
      console.error('Error toggling quick link:', error)
      alert("빠른 링크 설정 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "교육청":
      case "교육방송":
        return <BookOpen className="w-4 h-4" />
      case "과학":
        return <Calculator className="w-4 h-4" />
      case "교육콘텐츠":
        return <Video className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const filteredLinks =
    filterCategory === "전체" ? savedLinks : savedLinks.filter((link) => link.category === filterCategory)

  const categories = ["전체", ...Array.from(new Set(savedLinks.map((link) => link.category)))]

  return (
    <div className="space-y-6">
      {/* 빠른 추가 템플릿 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">추천 교육 사이트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {educationalSites.map((site, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => addQuickLink(site)}
                className="justify-start text-xs bg-transparent"
              >
                {getCategoryIcon(site.category)}
                <span className="ml-1 truncate">{site.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 링크 추가 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">새 링크 추가</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">제목</label>
              <Input
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="링크 제목을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">카테고리</label>
              <Select value={linkCategory} onValueChange={setLinkCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="교육청">교육청</SelectItem>
                  <SelectItem value="수업도구">수업도구</SelectItem>
                  <SelectItem value="교육콘텐츠">교육콘텐츠</SelectItem>
                  <SelectItem value="교육방송">교육방송</SelectItem>
                  <SelectItem value="과학">과학</SelectItem>
                  <SelectItem value="사회">사회</SelectItem>
                  <SelectItem value="국어">국어</SelectItem>
                  <SelectItem value="수학">수학</SelectItem>
                  <SelectItem value="영어">영어</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">설명 (선택사항)</label>
            <Input
              value={linkDescription}
              onChange={(e) => setLinkDescription(e.target.value)}
              placeholder="링크에 대한 간단한 설명"
            />
          </div>
          <Button onClick={addLink} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            {loading ? "추가 중..." : "링크 추가"}
          </Button>
        </CardContent>
      </Card>

      {/* 저장된 링크 목록 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">저장된 링크 ({filteredLinks.length}개)</h3>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredLinks.map((link) => (
            <Card key={link.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryIcon(link.category)}
                      <h4 className="font-semibold text-green-700">{link.title}</h4>
                    </div>
                    {link.description && <p className="text-sm text-gray-600 mb-2">{link.description}</p>}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {link.category}
                      </Badge>
                      <span className="text-xs text-gray-500">추가일: {link.addedDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant={link.isQuickLink ? "default" : "outline"}
                      onClick={() => toggleQuickLink(link.id)}
                      className={link.isQuickLink ? "bg-amber-500 hover:bg-amber-600" : "border-amber-300 text-amber-600 hover:bg-amber-50"}
                      title={link.isQuickLink ? "빠른 링크에서 제거" : "빠른 링크에 추가"}
                    >
                      {link.isQuickLink ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" onClick={() => openLink(link.url)} className="bg-green-600 hover:bg-green-700">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => removeLink(link.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLinks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {filterCategory === "전체"
              ? "저장된 링크가 없습니다."
              : `${filterCategory} 카테고리에 저장된 링크가 없습니다.`}
          </div>
        )}
      </div>
    </div>
  )
}
