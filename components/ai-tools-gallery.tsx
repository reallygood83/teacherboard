"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Brain, Clock, Users, ExternalLink, ChevronDown, ChevronUp, Star } from "lucide-react"
import { DocumentGenerator } from "@/components/document-generator"

interface AITool {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  thumbnail: string
  category: "document" | "planning" | "assessment" | "analysis"
  status: "available" | "coming-soon"
  component?: React.ComponentType<any>
  props?: any
}

interface AIToolsGalleryProps {
  geminiApiKey: string
  geminiModel: string
  accentColor?: string
}

export function AIToolsGallery({ geminiApiKey, geminiModel, accentColor = "text-green-600" }: AIToolsGalleryProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [expandedTool, setExpandedTool] = useState<string | null>(null)

  const aiTools: AITool[] = [
    {
      id: "document-generator",
      title: "공문 생성기",
      description: "AI가 한국 공문서 표준 형식에 맞는 공문을 자동으로 작성해드립니다",
      icon: FileText,
      thumbnail: "/thumbnails/document-generator-thumbnail.svg",
      category: "document",
      status: "available",
      component: DocumentGenerator,
      props: { geminiApiKey, geminiModel }
    },
    {
      id: "lesson-planner",
      title: "수업 계획서 생성기",
      description: "교육과정에 맞는 수업 계획서를 AI가 자동으로 작성합니다",
      icon: Brain,
      thumbnail: "/thumbnails/lesson-planner-thumbnail.svg",
      category: "planning", 
      status: "coming-soon"
    },
    {
      id: "student-assessment",
      title: "학생 평가서 생성기",
      description: "학생별 맞춤형 평가서 및 생활기록부 작성을 지원합니다",
      icon: Users,
      thumbnail: "/thumbnails/student-assessment-thumbnail.svg",
      category: "assessment",
      status: "coming-soon"
    },
    {
      id: "schedule-optimizer",
      title: "시간표 최적화기",
      description: "AI가 학급 상황을 분석하여 최적의 시간표를 제안합니다",
      icon: Clock,
      thumbnail: "/thumbnails/schedule-optimizer-thumbnail.svg",
      category: "planning",
      status: "coming-soon"
    }
  ]

  const handleToolClick = (toolId: string) => {
    if (selectedTool === toolId) {
      setSelectedTool(null)
      setExpandedTool(null)
    } else {
      setSelectedTool(toolId)
      setExpandedTool(toolId)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "document": return "bg-blue-100 text-blue-800 border-blue-200"
      case "planning": return "bg-purple-100 text-purple-800 border-purple-200"
      case "assessment": return "bg-green-100 text-green-800 border-green-200"
      case "analysis": return "bg-orange-100 text-orange-800 border-orange-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case "document": return "문서작성"
      case "planning": return "수업기획"
      case "assessment": return "평가관리"
      case "analysis": return "데이터분석"
      default: return "기타"
    }
  }

  const renderExpandedTool = () => {
    if (!expandedTool) return null
    
    const tool = aiTools.find(t => t.id === expandedTool)
    if (!tool || tool.status === "coming-soon" || !tool.component) return null

    const ToolComponent = tool.component
    return (
      <div className="mt-6 border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <tool.icon className={`w-6 h-6 ${accentColor}`} />
            <div>
              <h3 className="text-lg font-semibold">{tool.title}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTool(null)
              setExpandedTool(null)
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronUp className="w-4 h-4" />
            접기
          </Button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <ToolComponent {...tool.props} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI 도구 썸네일 갤러리 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {aiTools.map((tool) => {
          const IconComponent = tool.icon
          const isSelected = selectedTool === tool.id
          const isComingSoon = tool.status === "coming-soon"
          
          return (
            <Card 
              key={tool.id} 
              className={`group cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
              } ${isComingSoon ? 'opacity-60' : ''}`}
              onClick={() => !isComingSoon && handleToolClick(tool.id)}
            >
              <div className="relative">
                {/* 썸네일 이미지 */}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={tool.thumbnail} 
                    alt={tool.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 이미지 로딩 실패 시 기본 아이콘 표시
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 opacity-90 items-center justify-center hidden">
                    <IconComponent className={`w-12 h-12 ${accentColor}`} />
                  </div>
                  
                  {/* 사용 가능 표시 */}
                  {!isComingSoon && (
                    <div className="absolute top-2 right-2 z-20">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        사용가능
                      </Badge>
                    </div>
                  )}
                  
                  {/* Coming Soon 배지 */}
                  {isComingSoon && (
                    <div className="absolute top-2 right-2 z-20">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                        개발중
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* 도구 정보 */}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm line-clamp-1 flex-1">{tool.title}</h3>
                    {!isComingSoon && (
                      <ChevronDown className={`w-4 h-4 text-gray-400 ml-2 flex-shrink-0 transition-transform duration-200 ${
                        isSelected ? 'rotate-180' : ''
                      }`} />
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryColor(tool.category)}`}
                    >
                      {getCategoryName(tool.category)}
                    </Badge>
                    
                    {!isComingSoon && (
                      <Button size="sm" variant="ghost" className="text-xs h-6 px-2">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        열기
                      </Button>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          )
        })}
      </div>

      {/* AI 도구 사용 안내 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">AI 도구 사용 안내</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 설정 탭에서 Gemini API 키를 먼저 입력해주세요</li>
                <li>• 썸네일을 클릭하면 도구가 아래에서 펼쳐집니다</li>
                <li>• 생성된 문서는 반드시 검토 후 사용하시기 바랍니다</li>
                <li>• 개인정보가 포함된 내용은 신중히 처리해주세요</li>
                <li>• 더 많은 AI 도구가 지속적으로 추가될 예정입니다</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 확장된 도구 영역 */}
      {renderExpandedTool()}
    </div>
  )
}