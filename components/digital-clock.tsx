"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, RotateCcw } from "lucide-react"

export function DigitalClock() {
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [timerMinutes, setTimerMinutes] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString("ko-KR"))
      setCurrentDate(
        now.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        }),
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      if (timeLeft === 0 && (timerMinutes > 0 || timerSeconds > 0)) {
        alert("타이머가 종료되었습니다!")
      }
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, timerMinutes, timerSeconds])

  const startTimer = () => {
    if (timerMinutes === 0 && timerSeconds === 0) return
    setTimeLeft(timerMinutes * 60 + timerSeconds)
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* 현재 시간 */}
      <Card className="bg-green-600 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">현재 시간</h3>
          <div className="text-4xl font-mono font-bold mb-2">{currentTime}</div>
          <div className="text-green-100">{currentDate}</div>
        </CardContent>
      </Card>

      {/* 수업 타이머 */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">수업 타이머</h3>

          <div className="space-y-4">
            <div className="flex gap-2 items-center justify-center">
              <Input
                type="number"
                placeholder="분"
                value={timerMinutes || ""}
                onChange={(e) => setTimerMinutes(Number.parseInt(e.target.value) || 0)}
                className="w-20 text-center"
                min="0"
                max="99"
              />
              <span>분</span>
              <Input
                type="number"
                placeholder="초"
                value={timerSeconds || ""}
                onChange={(e) => setTimerSeconds(Number.parseInt(e.target.value) || 0)}
                className="w-20 text-center"
                min="0"
                max="59"
              />
              <span>초</span>
            </div>

            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-green-600 mb-4">{formatTime(timeLeft)}</div>

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={startTimer}
                  disabled={isRunning || (timerMinutes === 0 && timerSeconds === 0)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  시작
                </Button>
                <Button onClick={pauseTimer} disabled={!isRunning} variant="outline">
                  <Pause className="w-4 h-4 mr-1" />
                  정지
                </Button>
                <Button onClick={resetTimer} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  초기화
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
