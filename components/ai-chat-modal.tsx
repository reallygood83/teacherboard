"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Bot, Send, Loader2 } from "lucide-react"
import { PromptManager } from "@/components/prompt-manager"

interface AIChatModalProps {
  onResultSubmit: (result: string) => void
  apiKey: string
  model: string
}

export function AIChatModal({ onResultSubmit, apiKey, model }: AIChatModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError("질문을 입력해주세요.")
      return
    }

    if (!apiKey) {
      setError("설정에서 Gemini API Key를 먼저 등록해주세요.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          apiKey,
          model,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "AI 요청 중 오류가 발생했습니다.")
      }

      // 결과를 칠판에 전달
      onResultSubmit(data.response)
      
      // 모달 닫기 및 초기화
      setPrompt("")
      setIsOpen(false)
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  // 프롬프트 매니저에서 프롬프트를 선택했을 때
  const handlePromptSelect = (promptContent: string) => {
    setPrompt(promptContent)
    setError("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <Bot className="w-4 h-4 mr-2" />
          AI 도우미
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            AI 도우미 (Gemini)
          </DialogTitle>
          <DialogDescription>
            교육에 관련된 질문을 하면 AI가 도움을 드립니다. 결과는 칠판에 표시됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 저장된 프롬프트 */}
          <PromptManager 
            onSelectPrompt={handlePromptSelect}
            className="border rounded-lg p-3 bg-gray-50"
          />

          {/* 사용자 입력 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">질문 입력:</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="AI에게 질문하세요... (Ctrl/Cmd + Enter로 전송)"
              rows={4}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              현재 모델: {model} | API 상태: {apiKey ? "✅ 연결됨" : "❌ 설정 필요"}
            </p>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 버튼들 */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                setPrompt("")
                setError("")
              }}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI 응답 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  질문하기
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}