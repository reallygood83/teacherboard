"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, RotateCcw } from "lucide-react"

export function GroupMaker() {
  const [totalStudents, setTotalStudents] = useState(30)
  const [groupCount, setGroupCount] = useState(4)
  const [missingNumbers, setMissingNumbers] = useState("")
  const [groups, setGroups] = useState<number[][]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [shufflingStudents, setShufflingStudents] = useState<number[]>([])

  const makeGroups = () => {
    const missingNums = missingNumbers
      .split(",")
      .map((num) => Number.parseInt(num.trim()))
      .filter((num) => num && num > 0 && num <= totalStudents)

    const availableStudents = Array.from({ length: totalStudents }, (_, i) => i + 1).filter(
      (num) => !missingNums.includes(num),
    )

    if (availableStudents.length === 0) {
      alert("사용 가능한 학생이 없습니다!")
      return
    }

    setIsAnimating(true)
    setGroups([])
    setShufflingStudents([...availableStudents])

    // 카드 셔플링 애니메이션
    let shuffleCount = 0
    const shuffleInterval = setInterval(() => {
      setShufflingStudents((prev) => [...prev].sort(() => Math.random() - 0.5))
      shuffleCount++

      if (shuffleCount >= 15) {
        // 15번 셔플 후 결과 표시
        clearInterval(shuffleInterval)

        setTimeout(() => {
          // 최종 랜덤 셔플
          const finalShuffled = [...availableStudents].sort(() => Math.random() - 0.5)
          const newGroups: number[][] = Array.from({ length: groupCount }, () => [])

          finalShuffled.forEach((student, idx) => {
            newGroups[idx % groupCount].push(student)
          })

          setGroups(newGroups)
          setIsAnimating(false)
          setShufflingStudents([])
        }, 800)
      }
    }, 150)
  }

  const reset = () => {
    setGroups([])
    setMissingNumbers("")
    setIsAnimating(false)
    setShufflingStudents([])
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
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
          <label className="block text-sm font-medium mb-1">없는 번호 (쉼표로 구분)</label>
          <Input
            type="text"
            value={missingNumbers}
            onChange={(e) => setMissingNumbers(e.target.value)}
            placeholder="예: 3, 7, 15"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">모둠 수</label>
          <Input
            type="number"
            value={groupCount}
            onChange={(e) => setGroupCount(Number.parseInt(e.target.value) || 4)}
            min="1"
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={makeGroups} className="flex-1 bg-green-600 hover:bg-green-700" disabled={isAnimating}>
          <Users className={`w-4 h-4 mr-2 ${isAnimating ? "animate-spin" : ""}`} />
          {isAnimating ? "모둠 짜는 중..." : "모둠 짜기"}
        </Button>
        <Button onClick={reset} variant="outline" disabled={isAnimating}>
          <RotateCcw className="w-4 h-4 mr-2" />
          초기화
        </Button>
      </div>

      {isAnimating && shufflingStudents.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2 text-blue-700">🔄 모둠을 짜고 있어요...</h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-hidden">
              {shufflingStudents.slice(0, 20).map((student, index) => (
                <Badge
                  key={`${student}-${index}`}
                  className="bg-blue-500 text-white animate-pulse transition-all duration-300"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    transform: `translateY(${Math.sin(index * 0.5) * 5}px)`,
                  }}
                >
                  {student}번
                </Badge>
              ))}
              {shufflingStudents.length > 20 && (
                <Badge className="bg-blue-300 text-blue-700">+{shufflingStudents.length - 20}명</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {groups.length > 0 && !isAnimating && (
        <div className="space-y-3">
          {groups.map((group, idx) => (
            <Card
              key={idx}
              className="bg-green-50 border-green-200 animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">
                  🏆 {idx + 1}모둠 ({group.length}명)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {group
                    .sort((a, b) => a - b)
                    .map((student, studentIdx) => (
                      <Badge
                        key={student}
                        className="bg-green-600 text-white animate-bounce"
                        style={{ animationDelay: `${studentIdx * 0.1}s` }}
                      >
                        {student}번
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
