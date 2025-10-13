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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Send, Bot, Loader2, AlertCircle } from "lucide-react"
import { PromptManager } from "@/components/prompt-manager"

interface AIDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (content: string) => void
  apiKey: string
  model: string
}

// 프롬프트 템플릿 정의
const PROMPT_TEMPLATES = [
  { id: "none", label: "템플릿 없음 (직접 입력)", prefix: "" },
  { id: "lesson-summary", label: "수업 내용 정리", prefix: "교사를 위한 수업 도구 요청: 오늘 수업 내용을" },
  { id: "homework", label: "숙제 공지문 작성", prefix: "교사를 위한 수업 도구 요청: 숙제 공지문을" },
  { id: "newsletter", label: "학급 소식지 작성", prefix: "교사를 위한 수업 도구 요청: 학급 소식지를" },
  { id: "feedback", label: "학생 피드백 작성", prefix: "교사를 위한 수업 도구 요청: 학생 피드백을" },
  { id: "activity-plan", label: "활동 계획 작성", prefix: "교사를 위한 수업 도구 요청: 활동 계획을" },
] as const

export function AIDialog({ isOpen, onClose, onSubmit, apiKey, model }: AIDialogProps) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none")

  const handleSubmit = async () => {
    if (!prompt.trim()) return
    if (!apiKey) {
      setError("설정에서 Gemini API Key를 먼저 등록해주세요.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // 선택된 템플릿에 따라 프롬프트 구성
      const template = PROMPT_TEMPLATES.find(t => t.id === selectedTemplate)
      const finalPrompt = template?.prefix
        ? `${template.prefix} ${prompt}`
        : prompt  // 템플릿 없음 선택 시 원본 프롬프트 그대로 사용

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: finalPrompt,
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

  // 프롬프트 매니저에서 프롬프트를 선택했을 때
  const handlePromptSelect = (promptContent: string) => {
    setPrompt(promptContent)
    if (error) clearError()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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

          {/* 프롬프트 매니저 */}
          <PromptManager
            onSelectPrompt={handlePromptSelect}
            className="border rounded-lg p-3 bg-gray-50"
          />

          {/* 템플릿 선택 */}
          <div className="space-y-2">
            <Label htmlFor="template" className="text-sm font-medium">
              프롬프트 템플릿 선택 (선택사항)
            </Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger id="template">
                <SelectValue placeholder="템플릿을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {PROMPT_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate !== "none" && (
              <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                💡 선택한 템플릿: <strong>{PROMPT_TEMPLATES.find(t => t.id === selectedTemplate)?.label}</strong>
                <br />
                프롬프트 앞에 "{PROMPT_TEMPLATES.find(t => t.id === selectedTemplate)?.prefix}"가 자동으로 추가됩니다.
              </p>
            )}
            {selectedTemplate === "none" && (
              <p className="text-xs text-gray-600 bg-green-50 p-2 rounded">
                ✨ 직접 입력 모드: 입력하신 프롬프트가 그대로 AI에게 전달됩니다.
              </p>
            )}
          </div>

          {/* 프롬프트 입력 */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              AI에게 요청할 내용을 입력하세요:
            </Label>
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