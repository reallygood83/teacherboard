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
import { Send, Image, Loader2, AlertCircle, Sparkles, Download } from "lucide-react"

interface ImageAIDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (imageUrl: string, prompt: string, enhancedPrompt: string) => void
  apiKey: string
  model: string
}

export function ImageAIDialog({ isOpen, onClose, onSubmit, apiKey, model }: ImageAIDialogProps) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [enhancedPrompt, setEnhancedPrompt] = useState("")

  const handleSubmit = async () => {
    if (!prompt.trim()) return
    if (!apiKey) {
      setError("설정에서 Gemini API Key를 먼저 등록해주세요.")
      return
    }

    setLoading(true)
    setError("")
    setPreviewImage(null)

    try {
      const response = await fetch('/api/gemini-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `교육용 이미지: ${prompt}`,
          apiKey,
          model
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '알 수 없는 오류가 발생했습니다.')
      }

      if (data.success) {
        setPreviewImage(data.imageUrl)
        setEnhancedPrompt(data.enhancedPrompt)
      }
    } catch (error: any) {
      console.error('이미지 생성 오류:', error)
      setError(error.message || '이미지 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToChalkboard = () => {
    if (previewImage && prompt) {
      onSubmit(previewImage, prompt, enhancedPrompt)
      setPrompt("")
      setPreviewImage(null)
      setEnhancedPrompt("")
      onClose()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  const clearError = () => setError("")

  const downloadImage = async () => {
    if (!previewImage || !prompt) return
    
    try {
      // 이미지를 Blob으로 가져오기
      const response = await fetch(previewImage)
      const blob = await response.blob()
      
      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 파일명 생성 (한글 프롬프트를 파일명으로 사용)
      const fileName = `교육용_이미지_${prompt.substring(0, 20).replace(/[^\w가-힣]/g, '_')}_${Date.now()}.jpg`
      link.download = fileName
      
      // 다운로드 실행
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // URL 해제
      window.URL.revokeObjectURL(url)
      
      console.log('이미지 다운로드 완료:', fileName)
    } catch (error) {
      console.error('이미지 다운로드 실패:', error)
      setError('이미지 다운로드 중 오류가 발생했습니다.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-purple-600" />
            AI 이미지 생성기
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            수업용 이미지를 생성하여 칠판에 추가하세요
            <Badge variant="outline" className="text-xs">
              {model}
            </Badge>
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
              교육용 검증
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
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">📝 예시 프롬프트:</p>
            <div className="space-y-1 text-xs text-blue-700">
              <p>• "태양계 행성들의 모습"</p>
              <p>• "공룡 시대 풍경"</p>
              <p>• "화산 폭발 과정"</p>
              <p>• "세포 구조 다이어그램"</p>
            </div>
          </div>

          {/* 프롬프트 입력 */}
          <div className="space-y-2">
            <label htmlFor="image-prompt" className="text-sm font-medium">
              생성하고 싶은 이미지를 설명해주세요:
            </label>
            <Textarea
              id="image-prompt"
              placeholder="예: '태양계의 행성들이 궤도를 따라 돌고 있는 모습'"
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
              Ctrl/Cmd + Enter로 생성할 수 있습니다
            </p>
          </div>

          {/* 생성된 이미지 미리보기 */}
          {previewImage && (
            <div className="space-y-3">
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium mb-2">🎨 생성된 이미지:</p>
                <img 
                  src={previewImage} 
                  alt={prompt}
                  className="w-full max-w-md mx-auto rounded-lg border shadow-sm"
                />
                {enhancedPrompt && (
                  <div className="mt-3 p-2 bg-white rounded text-xs text-gray-600">
                    <p className="font-medium">🤖 AI가 개선한 프롬프트:</p>
                    <p className="mt-1">{enhancedPrompt}</p>
                  </div>
                )}
              </div>
            </div>
          )}

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
            
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!prompt.trim() || !apiKey || loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    이미지 생성
                  </>
                )}
              </Button>
              
              {previewImage && (
                <>
                  <Button
                    onClick={downloadImage}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    이미지 저장
                  </Button>
                  <Button
                    onClick={handleAddToChalkboard}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    칠판에 추가
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}