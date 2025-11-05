"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Play, ExternalLink, Monitor } from "lucide-react"

export function YoutubeSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [embedUrl, setEmbedUrl] = useState("")

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    // YouTube 검색 페이지로 이동
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
    window.open(searchUrl, "_blank")
  }

  const handleVideoUrlSubmit = () => {
    if (!videoUrl.trim()) return

    // YouTube URL에서 비디오 ID 추출
    let videoId = ""

    // 다양한 YouTube URL 형식 지원
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = videoUrl.match(pattern)
      if (match) {
        videoId = match[1]
        break
      }
    }

    if (videoId) {
      const embed = `https://www.youtube.com/embed/${videoId}`
      setEmbedUrl(embed)
    } else {
      alert("올바른 YouTube URL을 입력해주세요.")
    }
  }

  const clearEmbed = () => {
    setEmbedUrl("")
    setVideoUrl("")
  }

  return (
    <div className="space-y-6">
      {/* YouTube 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-red-600" />
            YouTube 검색
          </CardTitle>
          <CardDescription>교육용 동영상을 검색하여 수업에 활용하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="검색할 키워드를 입력하세요 (예: 초등 과학 실험)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="bg-red-600 hover:bg-red-700">
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("초등 과학 실험")
                handleSearch()
              }}
            >
              과학 실험
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("초등 수학 개념")
                handleSearch()
              }}
            >
              수학 개념
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("초등 영어 노래")
                handleSearch()
              }}
            >
              영어 노래
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("교육용 애니메이션")
                handleSearch()
              }}
            >
              교육 애니메이션
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* YouTube 동영상 임베드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-red-600" />
            YouTube 동영상 재생
          </CardTitle>
          <CardDescription>YouTube URL을 입력하여 동영상을 바로 재생하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="YouTube URL을 입력하세요 (예: https://www.youtube.com/watch?v=...)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleVideoUrlSubmit()}
              className="flex-1"
            />
            <Button onClick={handleVideoUrlSubmit} className="bg-red-600 hover:bg-red-700">
              <Play className="w-4 h-4 mr-2" />
              재생
            </Button>
          </div>

          {embedUrl && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">동영상 재생</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(embedUrl.replace("/embed/", "/watch?v="), "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    YouTube에서 보기
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearEmbed}>
                    닫기
                  </Button>
                </div>
              </div>

              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={embedUrl}
                  className="absolute top-0 left-0 w-full h-full rounded-lg border"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video player"
                />
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-semibold mb-1">💡 사용 팁:</p>
            <ul className="space-y-1 text-xs">
              <li>• YouTube에서 원하는 동영상의 URL을 복사해서 붙여넣으세요</li>
              <li>• youtu.be 단축 URL도 지원합니다</li>
              <li>• 교육용 콘텐츠를 활용하여 더 흥미로운 수업을 만들어보세요</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
