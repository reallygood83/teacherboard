"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, Loader2, AlertCircle } from "lucide-react"

interface AIDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (content: string) => void
  apiKey: string
  model: string
}

export function AIDialog({ isOpen, onClose, onSubmit, apiKey, model }: AIDialogProps) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!prompt.trim()) return
    if (!apiKey) {
      setError("설정에서 Gemini API Key를 먼저 등록해주세요.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `교사를 위한 수업 도구 요청: ${prompt}`,
          apiKey,
          model
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '알 수 없는 오류가 발생했습니다.')
      }

      if (data.success) {
        onSubmit(data.response)
        setPrompt("")
        onClose()
      }
    } catch (error: any) {
      console.error('AI 요청 오류:', error)
      setError(error.message || '요청 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  const clearError = () => setError("")

  // 예시 프롬프트들
  const examplePrompts = [
    "오늘 배운 내용을 정리해주세요",
    "학생들에게 숙제를 내주는 공지를 작성해주세요", 
    "내일 수업 계획을 세워주세요",
    "학부모 상담 내용을 정리해주세요",
    "교실 규칙을 만들어주세요"
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            AI 수업 도우미
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Gemini AI를 활용하여 수업 관련 내용을 생성하고 칠판에 추가하세요
            <Badge variant="outline" className="text-xs">
              {model}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* API 키 상태 표시 */}
          {!apiKey && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-amber-800">
                설정 탭에서 Gemini API Key를 먼저 등록해주세요.
              </p>
            </div>
          )}

          {/* 예시 프롬프트 */}
          <div>
            <p className="text-sm font-medium mb-2 text-gray-700">빠른 요청:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setPrompt(example)}
                  disabled={loading}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          {/* 프롬프트 입력 */}
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              AI에게 요청할 내용을 입력하세요:
            </label>
            <Textarea
              id="prompt"
              placeholder="예: '오늘 배운 과학 내용을 정리해주세요' 또는 '숙제 공지를 작성해주세요'"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value)
                if (error) clearError()
              }}
              onKeyDown={handleKeyPress}
              className="min-h-[100px] resize-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Ctrl/Cmd + Enter로 전송할 수 있습니다
            </p>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* 버튼들 */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || !apiKey || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  칠판에 추가
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}