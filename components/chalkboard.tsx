"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bold, Italic, Underline, Eraser, Copy, Bot } from "lucide-react"
import { AIDialog } from "@/components/ai-dialog"

interface ChalkboardProps {
  geminiApiKey?: string
  geminiModel?: string
}

export function Chalkboard({ geminiApiKey = "", geminiModel = "gemini-1.5-flash" }: ChalkboardProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState("18px")
  const [textColor, setTextColor] = useState("white")
  const [showAIDialog, setShowAIDialog] = useState(false)

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

  const handleAISubmit = (content: string) => {
    if (editorRef.current) {
      // AI 응답을 칠판에 추가
      const currentContent = editorRef.current.innerHTML
      const newContent = currentContent ? currentContent + '<br><br>' + content : content
      editorRef.current.innerHTML = newContent
      
      // 칠판 하단으로 스크롤
      editorRef.current.scrollTop = editorRef.current.scrollHeight
    }
  }

  return (
    <div className="space-y-4">
      {/* 도구 모음 */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-100 rounded-lg">
        <Button size="sm" variant="outline" onClick={() => execCommand("bold")}>
          <Bold className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => execCommand("italic")}>
          <Italic className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => execCommand("underline")}>
          <Underline className="w-4 h-4" />
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <Select value={fontSize} onValueChange={handleFontSizeChange}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="16px">작게</SelectItem>
            <SelectItem value="18px">보통</SelectItem>
            <SelectItem value="24px">크게</SelectItem>
            <SelectItem value="32px">매우 크게</SelectItem>
          </SelectContent>
        </Select>

        <Select value={textColor} onValueChange={handleColorChange}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="white">흰색</SelectItem>
            <SelectItem value="black">검정색</SelectItem>
            <SelectItem value="yellow">노란색</SelectItem>
            <SelectItem value="lightblue">하늘색</SelectItem>
            <SelectItem value="pink">분홍색</SelectItem>
            <SelectItem value="#ffcc00">주황색</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        {/* AI 버튼 */}
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setShowAIDialog(true)}
          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <Bot className="w-4 h-4 mr-1" />
          AI
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <Button size="sm" variant="outline" onClick={clearBoard}>
          <Eraser className="w-4 h-4 mr-1" />
          지우기
        </Button>
        <Button size="sm" variant="outline" onClick={copyContent}>
          <Copy className="w-4 h-4 mr-1" />
          복사
        </Button>
      </div>

      {/* 칠판 */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-64 p-4 bg-green-800 text-white rounded-lg border-4 border-green-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        style={{ fontSize }}
        placeholder="여기에 수업 내용을 작성하세요..."
      />

      {/* AI 대화창 */}
      <AIDialog
        isOpen={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        onSubmit={handleAISubmit}
        apiKey={geminiApiKey}
        model={geminiModel}
      />
    </div>
  )
}