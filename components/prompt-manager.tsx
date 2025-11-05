"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Edit, 
  Star,
  Save,
  X
} from "lucide-react"
import {
  SavedPrompt,
  PROMPT_CATEGORIES,
  getSavedPrompts,
  savePrompt,
  deletePrompt,
  incrementPromptUsage,
  initializeDefaultPrompts
} from "@/lib/prompt-storage"

interface PromptManagerProps {
  onSelectPrompt: (content: string) => void
  className?: string
}

export function PromptManager({ onSelectPrompt, className = "" }: PromptManagerProps) {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | null>(null)
  const [loading, setLoading] = useState(false)

  // 새 프롬프트 입력 상태
  const [newPrompt, setNewPrompt] = useState({
    title: "",
    content: "",
    category: PROMPT_CATEGORIES.CLASS_PREP
  })

  // 프롬프트 목록 로드
  const loadPrompts = async () => {
    setLoading(true)
    try {
      const savedPrompts = await getSavedPrompts()
      setPrompts(savedPrompts)
      
      // 처음 사용하는 사용자라면 기본 프롬프트 초기화
      if (savedPrompts.length === 0) {
        await initializeDefaultPrompts()
        const defaultPrompts = await getSavedPrompts()
        setPrompts(defaultPrompts)
      }
    } catch (error) {
      console.error('프롬프트 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrompts()
  }, [])

  // 카테고리별 필터링
  const filteredPrompts = prompts.filter(prompt => 
    selectedCategory === "all" || prompt.category === selectedCategory
  )

  // 사용 빈도순 정렬
  const sortedPrompts = filteredPrompts.sort((a, b) => {
    if (b.usage !== a.usage) {
      return b.usage - a.usage // 사용 횟수 높은 순
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() // 최근 수정순
  })

  // 프롬프트 선택 처리
  const handleSelectPrompt = async (prompt: SavedPrompt) => {
    onSelectPrompt(prompt.content)
    await incrementPromptUsage(prompt.id)
    
    // UI 즉시 업데이트
    setPrompts(prev => prev.map(p => 
      p.id === prompt.id 
        ? { ...p, usage: p.usage + 1, updatedAt: new Date() }
        : p
    ))
  }

  // 새 프롬프트 저장
  const handleSavePrompt = async () => {
    if (!newPrompt.title.trim() || !newPrompt.content.trim()) return

    const savedPrompt = await savePrompt(
      newPrompt.title,
      newPrompt.content,
      newPrompt.category
    )

    if (savedPrompt) {
      setPrompts(prev => [savedPrompt, ...prev])
      setNewPrompt({ title: "", content: "", category: PROMPT_CATEGORIES.CLASS_PREP })
      setIsAddDialogOpen(false)
    }
  }

  // 프롬프트 삭제
  const handleDeletePrompt = async (promptId: string) => {
    const success = await deletePrompt(promptId)
    if (success) {
      setPrompts(prev => prev.filter(p => p.id !== promptId))
    }
  }

  // 프롬프트 수정
  const handleUpdatePrompt = async () => {
    if (!editingPrompt) return
    
    // 기존 프롬프트 삭제 후 새로 저장 (간단한 업데이트 로직)
    await handleDeletePrompt(editingPrompt.id)
    const updatedPrompt = await savePrompt(
      editingPrompt.title,
      editingPrompt.content,
      editingPrompt.category
    )
    
    if (updatedPrompt) {
      setPrompts(prev => [updatedPrompt, ...prev.filter(p => p.id !== editingPrompt.id)])
      setEditingPrompt(null)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 헤더 및 필터 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">저장된 프롬프트</span>
          <Badge variant="outline" className="text-xs">
            {prompts.length}개
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {Object.entries(PROMPT_CATEGORIES).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="h-8 px-2"
          >
            <Plus className="w-3 h-3 mr-1" />
            추가
          </Button>
        </div>
      </div>

      {/* 프롬프트 목록 */}
      {loading ? (
        <div className="text-center py-4 text-sm text-gray-500">
          로딩 중...
        </div>
      ) : sortedPrompts.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedPrompts.slice(0, 10).map((prompt) => (
            <div
              key={prompt.id}
              className="group flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => handleSelectPrompt(prompt)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {prompt.title}
                  </span>
                  {prompt.usage > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-gray-500">{prompt.usage}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed" 
                   style={{
                     display: '-webkit-box',
                     WebkitLineClamp: 2,
                     WebkitBoxOrient: 'vertical',
                     overflow: 'hidden'
                   }}>
                  {prompt.content}
                </p>
                <Badge variant="outline" className="text-xs mt-1">
                  {prompt.category}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingPrompt(prompt)
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeletePrompt(prompt.id)
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-sm text-gray-500">
          <Bookmark className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>저장된 프롬프트가 없습니다.</p>
          <p className="text-xs">자주 사용하는 프롬프트를 추가해보세요!</p>
        </div>
      )}

      {/* 프롬프트 추가 다이얼로그 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              새 프롬프트 저장
            </DialogTitle>
            <DialogDescription>
              자주 사용하는 프롬프트를 저장하여 쉽게 재사용하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">제목</label>
              <Input
                placeholder="예: 숙제 공지 작성"
                value={newPrompt.title}
                onChange={(e) => setNewPrompt(prev => ({...prev, title: e.target.value}))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">카테고리</label>
              <Select 
                value={newPrompt.category} 
                onValueChange={(value) => setNewPrompt(prev => ({...prev, category: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROMPT_CATEGORIES).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">프롬프트 내용</label>
              <Textarea
                placeholder="AI에게 요청할 내용을 입력하세요..."
                value={newPrompt.content}
                onChange={(e) => setNewPrompt(prev => ({...prev, content: e.target.value}))}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleSavePrompt}
              disabled={!newPrompt.title.trim() || !newPrompt.content.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 프롬프트 수정 다이얼로그 */}
      {editingPrompt && (
        <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-600" />
                프롬프트 수정
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">제목</label>
                <Input
                  value={editingPrompt.title}
                  onChange={(e) => setEditingPrompt(prev => 
                    prev ? {...prev, title: e.target.value} : null
                  )}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">카테고리</label>
                <Select 
                  value={editingPrompt.category} 
                  onValueChange={(value) => setEditingPrompt(prev => 
                    prev ? {...prev, category: value} : null
                  )}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROMPT_CATEGORIES).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">프롬프트 내용</label>
                <Textarea
                  value={editingPrompt.content}
                  onChange={(e) => setEditingPrompt(prev => 
                    prev ? {...prev, content: e.target.value} : null
                  )}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditingPrompt(null)}
              >
                <X className="w-4 h-4 mr-2" />
                취소
              </Button>
              <Button
                onClick={handleUpdatePrompt}
                disabled={!editingPrompt.title.trim() || !editingPrompt.content.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                수정 완료
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}