"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

const subjects = [
  "국어",
  "수학",
  "사회",
  "과학",
  "영어",
  "음악",
  "미술",
  "체육",
  "실과",
  "도덕",
  "학교",
  "사람들",
  "우리나라",
  "탐험",
  "나",
  "자연",
  "마을",
  "세계",
]

const periods = ["1교시", "2교시", "3교시", "4교시", "5교시", "6교시"]

export function Timetable() {
  const [schedule, setSchedule] = useState<{ [key: string]: string }>({
    "1교시": "",
    "2교시": "",
    "3교시": "",
    "4교시": "",
    "5교시": "",
    "6교시": "",
  })
  const [customSubjects, setCustomSubjects] = useState<{ [key: string]: string }>({})

  const handleSubjectChange = (period: string, subject: string) => {
    setSchedule((prev) => ({ ...prev, [period]: subject }))
    if (subject !== "직접입력") {
      setCustomSubjects((prev) => {
        const newCustom = { ...prev }
        delete newCustom[period]
        return newCustom
      })
    }
  }

  const handleCustomSubjectChange = (period: string, customSubject: string) => {
    setCustomSubjects((prev) => ({ ...prev, [period]: customSubject }))
  }

  const getCurrentDate = () => {
    const today = new Date()
    return today.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  return (
    <div className="space-y-4">
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-green-700 mb-2">오늘 날짜</h3>
          <p className="text-lg">{getCurrentDate()}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {periods.map((period) => (
          <Card key={period} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 text-center text-green-700">{period}</h4>
              <div className="space-y-2">
                <Select
                  value={schedule[period] || "선택"}
                  onValueChange={(value) => handleSubjectChange(period, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="과목 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="선택">선택</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                    <SelectItem value="직접입력">직접 입력</SelectItem>
                  </SelectContent>
                </Select>

                {schedule[period] === "직접입력" && (
                  <Input
                    placeholder="과목명을 입력하세요"
                    value={customSubjects[period] || ""}
                    onChange={(e) => handleCustomSubjectChange(period, e.target.value)}
                  />
                )}
              </div>

              {schedule[period] && schedule[period] !== "직접입력" && (
                <div className="mt-3 p-2 bg-green-100 rounded text-center font-medium text-green-800">
                  {schedule[period]}
                </div>
              )}

              {schedule[period] === "직접입력" && customSubjects[period] && (
                <div className="mt-3 p-2 bg-green-100 rounded text-center font-medium text-green-800">
                  {customSubjects[period]}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
