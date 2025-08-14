"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bold, Italic, Underline, Eraser, Copy, Bot, AlertCircle } from "lucide-react"
import { AIDialog } from "@/components/ai-dialog"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

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
      // AI 응답을 HTML로 변환하여 칠판에 추가
      const aiResponseElement = document.createElement('div')
      aiResponseElement.className = 'ai-response-block'
      aiResponseElement.style.cssText = `
        border-left: 4px solid #60a5fa;
        padding: 16px;
        margin: 16px 0;
        background-color: rgba(96, 165, 250, 0.15);
        border-radius: 8px;
        font-family: inherit;
      `
      
      // AI 헤더 추가
      const aiHeader = document.createElement('div')
      aiHeader.innerHTML = '🤖 <strong>AI 도우미 응답:</strong>'
      aiHeader.style.cssText = `
        color: #60a5fa;
        font-weight: bold;
        margin-bottom: 8px;
        font-size: 0.9em;
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