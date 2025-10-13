"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shuffle, RotateCcw } from "lucide-react"

export function StudentPicker() {
  const [totalStudents, setTotalStudents] = useState(30)
  const [pickCount, setPickCount] = useState(1)
  const [pickedStudents, setPickedStudents] = useState<number[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [animatingNumber, setAnimatingNumber] = useState<number | null>(null)

  const pickStudents = () => {
    const availableStudents = Array.from({ length: totalStudents }, (_, i) => i + 1).filter(
      (num) => !pickedStudents.includes(num),
    )

    if (availableStudents.length === 0) {
      alert("모든 학생이 이미 선택되었습니다. 초기화 버튼을 눌러주세요.")
      return
    }

    const actualPickCount = Math.min(pickCount, availableStudents.length)

    setIsAnimating(true)
    setSelectedStudents([])

    // 룰렛 애니메이션 효과
    let animationCount = 0
    const animationInterval = setInterval(() => {
      const randomNum = availableStudents[Math.floor(Math.random() * availableStudents.length)]
      setAnimatingNumber(randomNum)
      animationCount++

      if (animationCount >= 20) {
        // 20번 돌린 후 결과 표시
        clearInterval(animationInterval)

        setTimeout(() => {
          const selected = availableStudents.sort(() => Math.random() - 0.5).slice(0, actualPickCount)
          setSelectedStudents(selected)
          setPickedStudents([...pickedStudents, ...selected])
          setIsAnimating(false)
          setAnimatingNumber(null)
        }, 500)
      }
    }, 100)
  }

  const reset = () => {
    setPickedStudents([])
    setSelectedStudents([])
    setIsAnimating(false)
    setAnimatingNumber(null)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">학생 총 수</label>
          <Input
            type="number"
            value={totalStudents}
            onChange={(e) => setTotalStudents(Number.parseInt(e.target.value) || 30)}
            min="1"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">뽑을 학생 수</label>
          <Input
            type="number"
            value={pickCount}
            onChange={(e) => setPickCount(Number.parseInt(e.target.value) || 1)}
            min="1"
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={pickStudents}
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={totalStudents - pickedStudents.length === 0 || isAnimating}
        >
          <Shuffle className={`w-4 h-4 mr-2 ${isAnimating ? "animate-spin" : ""}`} />
          {isAnimating ? "뽑는 중..." : "학생 뽑기"}
        </Button>
        <Button onClick={reset} variant="outline" disabled={isAnimating}>
          <RotateCcw className="w-4 h-4 mr-2" />
          초기화
        </Button>
      </div>

      {isAnimating && animatingNumber && (
        <Card className="bg-yellow-50 border-yellow-200 animate-pulse">
          <CardContent className="p-6 text-center">
            <div className="text-6xl font-bold text-yellow-600 animate-bounce mb-2">{animatingNumber}번</div>
            <p className="text-yellow-700 font-medium">뽑는 중...</p>
          </CardContent>
        </Card>
      )}

      {selectedStudents.length > 0 && !isAnimating && (
        <Card className="bg-green-50 border-green-200 animate-fade-in">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">🎉 선택된 학생:</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedStudents
                .sort((a, b) => a - b)
                .map((student, index) => (
                  <Badge
                    key={student}
                    className="bg-green-600 text-white animate-bounce"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {student}번
                  </Badge>
                ))}
            </div>
            <p className="text-sm text-gray-600">
              지금까지 선택된 학생: {pickedStudents.sort((a, b) => a - b).join(", ")}번
            </p>
            <p className="text-sm text-gray-600">남은 학생 수: {totalStudents - pickedStudents.length}명</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
