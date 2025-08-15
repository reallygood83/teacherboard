"use client"

import { useState, useEffect, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileImage, Loader2, Trash2, RotateCcw, Calendar, Clock, FileText, Save, Edit3 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"

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
const weekDays = ["월", "화", "수", "목", "금"]

interface WeeklySchedule {
  [day: string]: { [period: string]: string }
}

export function Timetable() {
  const { currentUser } = useAuth()
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily")
  const [schedule, setSchedule] = useState<{ [key: string]: string }>({
    "1교시": "",
    "2교시": "",
    "3교시": "",
    "4교시": "",
    "5교시": "",
    "6교시": "",
  })
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({})
  const [customSubjects, setCustomSubjects] = useState<{ [key: string]: string }>({})
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string>("")
  const [uploadedFileType, setUploadedFileType] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingCell, setEditingCell] = useState<{day: string, period: string} | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Firebase 및 localStorage에서 시간표 데이터 불러오기
  const loadTimetableData = async () => {
    // 먼저 localStorage에서 데이터 불러오기
    const savedSchedule = localStorage.getItem("dailySchedule")
    const savedWeeklySchedule = localStorage.getItem("weeklySchedule")
    const savedCustomSubjects = localStorage.getItem("customSubjects")
    
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule))
    }
    if (savedWeeklySchedule) {
      setWeeklySchedule(JSON.parse(savedWeeklySchedule))
    }
    if (savedCustomSubjects) {
      setCustomSubjects(JSON.parse(savedCustomSubjects))
    }

    // Firebase에서 데이터 불러오기 (사용자가 로그인한 경우)
    if (currentUser && db) {
      try {
        const timetableDoc = await getDoc(doc(db, `users/${currentUser.uid}/timetable`, 'schedule'))
        if (timetableDoc.exists()) {
          const firebaseData = timetableDoc.data()
          if (firebaseData.dailySchedule) {
            setSchedule(firebaseData.dailySchedule)
            localStorage.setItem("dailySchedule", JSON.stringify(firebaseData.dailySchedule))
          }
          if (firebaseData.weeklySchedule) {
            setWeeklySchedule(firebaseData.weeklySchedule)
            localStorage.setItem("weeklySchedule", JSON.stringify(firebaseData.weeklySchedule))
          }
          if (firebaseData.customSubjects) {
            setCustomSubjects(firebaseData.customSubjects)
            localStorage.setItem("customSubjects", JSON.stringify(firebaseData.customSubjects))
          }
        }
      } catch (error) {
        console.error("Firebase에서 시간표 데이터 불러오기 실패:", error)
      }
    }
  }

  useEffect(() => {
    loadTimetableData()
  }, [currentUser])

  // 데이터 저장 함수 (localStorage + Firebase 연동)
  const saveToLocalStorage = async () => {
    // localStorage에 저장
    localStorage.setItem("dailySchedule", JSON.stringify(schedule))
    localStorage.setItem("weeklySchedule", JSON.stringify(weeklySchedule))
    localStorage.setItem("customSubjects", JSON.stringify(customSubjects))
    
    // Firebase에 저장 (사용자가 로그인한 경우)
    if (currentUser && db) {
      try {
        await setDoc(doc(db, `users/${currentUser.uid}/timetable`, 'schedule'), {
          dailySchedule: schedule,
          weeklySchedule: weeklySchedule,
          customSubjects: customSubjects,
          lastUpdated: new Date().toISOString()
        })
        console.log("Firebase에 시간표 데이터 저장 완료")
      } catch (error) {
        console.error("Firebase 저장 실패:", error)
        // Firebase 저장 실패해도 localStorage 저장은 유지
      }
    }
    
    setHasUnsavedChanges(false)
    console.log("시간표 데이터 저장 완료:", { 
      dailySchedule: schedule, 
      weeklySchedule, 
      customSubjects 
    })
  }

  // 수동 저장 함수
  const handleManualSave = async () => {
    try {
      await saveToLocalStorage()
      alert("시간표가 저장되었습니다!")
    } catch (error) {
      console.error("저장 중 오류:", error)
      alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.")
    }
  }

  // 주간 시간표 셀 편집 함수
  const handleWeeklyScheduleChange = (day: string, period: string, value: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: value
      }
    }))
    setHasUnsavedChanges(true)
    setEditingCell(null)
  }

  // PDF를 이미지로 변환하는 함수
  const convertPdfToImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // PDF.js를 동적으로 로드
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = async () => {
        try {
          const pdfjsLib = (window as any).pdfjsLib
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

          const arrayBuffer = await file.arrayBuffer()
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          const page = await pdf.getPage(1) // 첫 번째 페이지만 처리

          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          const viewport = page.getViewport({ scale: 2.0 })
          
          canvas.width = viewport.width
          canvas.height = viewport.height

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise

          resolve(canvas.toDataURL('image/png'))
        } catch (error) {
          reject(error)
        }
      }
      script.onerror = () => reject(new Error('PDF.js 로드 실패'))
      document.head.appendChild(script)
    })
  }

  // 파일 업로드 처리 (이미지 + PDF)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    setUploadedFileType(file.type)

    try {
      if (file.type === 'application/pdf') {
        // PDF 파일인 경우 이미지로 변환
        setIsProcessing(true)
        const imageDataUrl = await convertPdfToImage(file)
        setUploadedFile(imageDataUrl)
        setIsProcessing(false)
      } else if (file.type.startsWith('image/')) {
        // 이미지 파일인 경우 직접 읽기
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setUploadedFile(result)
        }
        reader.readAsDataURL(file)
      } else {
        alert('이미지 파일(PNG, JPG, JPEG) 또는 PDF 파일만 업로드 가능합니다.')
        return
      }
    } catch (error) {
      console.error('파일 처리 오류:', error)
      alert('파일 처리 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  // OCR 처리 및 시간표 생성
  const processImageWithOCR = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setOcrResult("")

    try {
      // 설정에서 API 키 가져오기
      const savedSettings = localStorage.getItem("classHomepageSettings")
      let apiKey = ""
      let model = "gemini-1.5-flash"
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        apiKey = settings.geminiApiKey
        model = settings.geminiModel
      }

      if (!apiKey) {
        alert("설정에서 Gemini API Key를 먼저 등록해주세요!")
        setIsProcessing(false)
        return
      }

      const response = await fetch("/api/gemini-vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: uploadedFile,
          apiKey: apiKey,
          model: model,
          prompt: `이 이미지는 주간 시간표입니다. 시간표의 내용을 읽고 순수한 JSON 형식으로만 변환해주세요.

요청사항:
1. 요일별(월,화,수,목,금)로 구성된 시간표를 분석
2. 각 교시별 과목명을 추출
3. 다음 JSON 형식으로 출력:

{
  "월": {"1교시": "과목명", "2교시": "과목명", ...},
  "화": {"1교시": "과목명", "2교시": "과목명", ...},
  "수": {"1교시": "과목명", "2교시": "과목명", ...},
  "목": {"1교시": "과목명", "2교시": "과목명", ...},
  "금": {"1교시": "과목명", "2교시": "과목명", ...}
}

중요 주의사항:
- 과목명은 한국어로 정확히 추출
- 빈 시간은 ""로 표시
- 교시는 1교시~6교시까지 처리
- 마크다운 코드 블록을 사용하지 말고 순수한 JSON만 출력
- 설명이나 추가 텍스트 없이 JSON만 반환`
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "OCR 처리 중 오류가 발생했습니다.")
      }

      setOcrResult(data.response)
      
      // JSON 파싱 시도 (마크다운 코드 블록 제거)
      try {
        let jsonString = data.response.trim()
        
        // ```json 및 ``` 마크다운 블록 제거
        if (jsonString.startsWith('```json')) {
          jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (jsonString.startsWith('```')) {
          jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        // 추가 정리: 앞뒤 공백 및 개행 문자 제거
        jsonString = jsonString.trim()
        
        console.log("정리된 JSON 문자열:", jsonString)
        
        const parsedSchedule = JSON.parse(jsonString)
        setWeeklySchedule(parsedSchedule)
        setViewMode("weekly")
        
        // OCR로 생성된 데이터 즉시 저장 (localStorage + Firebase)
        localStorage.setItem("weeklySchedule", JSON.stringify(parsedSchedule))
        
        if (currentUser && db) {
          try {
            await setDoc(doc(db, `users/${currentUser.uid}/timetable`, 'schedule'), {
              dailySchedule: schedule,
              weeklySchedule: parsedSchedule,
              customSubjects: customSubjects,
              lastUpdated: new Date().toISOString()
            })
          } catch (error) {
            console.error("Firebase OCR 저장 실패:", error)
          }
        }
        
        setHasUnsavedChanges(false) // OCR로 생성된 것은 즉시 저장됨으로 처리
        alert("시간표가 성공적으로 생성되어 저장되었습니다!")
      } catch (parseError) {
        console.error("JSON 파싱 오류:", parseError)
        console.error("원본 응답:", data.response)
        alert("시간표 데이터 파싱에 실패했습니다. OCR 결과를 확인해주세요.")
      }
      
    } catch (error: any) {
      console.error("OCR 처리 오류:", error)
      alert(error.message || "OCR 처리 중 오류가 발생했습니다.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubjectChange = (period: string, subject: string) => {
    setSchedule((prev) => ({ ...prev, [period]: subject }))
    if (subject !== "직접입력") {
      setCustomSubjects((prev) => {
        const newCustom = { ...prev }
        delete newCustom[period]
        return newCustom
      })
    }
    setHasUnsavedChanges(true)
  }

  const handleCustomSubjectChange = (period: string, customSubject: string) => {
    setCustomSubjects((prev) => ({ ...prev, [period]: customSubject }))
    setHasUnsavedChanges(true)
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

  const clearUploadedFile = () => {
    setUploadedFile(null)
    setUploadedFileName("")
    setUploadedFileType("")
    setOcrResult("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetSchedule = () => {
    if (confirm("시간표를 초기화하시겠습니까?")) {
      setSchedule({
        "1교시": "",
        "2교시": "",
        "3교시": "",
        "4교시": "",
        "5교시": "",
        "6교시": "",
      })
      setWeeklySchedule({})
      setCustomSubjects({})
      localStorage.removeItem("dailySchedule")
      localStorage.removeItem("weeklySchedule")
      localStorage.removeItem("customSubjects")
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 영역 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Card className="bg-green-50 border-green-200 flex-1">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              오늘 날짜
            </h3>
            <p className="text-lg">{getCurrentDate()}</p>
          </CardContent>
        </Card>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={viewMode === "daily" ? "default" : "outline"}
            onClick={() => setViewMode("daily")}
            size="sm"
          >
            <Clock className="w-4 h-4 mr-1" />
            오늘
          </Button>
          <Button
            variant={viewMode === "weekly" ? "default" : "outline"}
            onClick={() => setViewMode("weekly")}
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-1" />
            주간
          </Button>
          
          {/* 편집/저장 버튼 - 주간 시간표용 */}
          {viewMode === "weekly" && Object.keys(weeklySchedule).length > 0 && (
            <>
              <Button
                variant={isEditMode ? "default" : "outline"}
                onClick={() => setIsEditMode(!isEditMode)}
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                {isEditMode ? "편집완료" : "편집"}
              </Button>
              <Button
                variant="outline"
                onClick={handleManualSave}
                size="sm"
                className={hasUnsavedChanges ? "text-green-600 hover:text-green-700 border-green-300" : "text-gray-600"}
                disabled={!hasUnsavedChanges}
              >
                <Save className="w-4 h-4 mr-1" />
                저장{hasUnsavedChanges ? "*" : ""}
              </Button>
            </>
          )}
          
          {/* 일간 시간표용 저장 버튼 */}
          {viewMode === "daily" && (
            <Button
              variant="outline"
              onClick={handleManualSave}
              size="sm"
              className={hasUnsavedChanges ? "text-green-600 hover:text-green-700 border-green-300" : "text-gray-600"}
              disabled={!hasUnsavedChanges}
            >
              <Save className="w-4 h-4 mr-1" />
              저장{hasUnsavedChanges ? "*" : ""}
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={resetSchedule}
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            초기화
          </Button>
        </div>
      </div>

      {/* 파일 업로드 섹션 */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <FileText className="w-5 h-5" />
            시간표 파일로 자동 생성
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto"
                disabled={isProcessing}
              >
                <Upload className="w-4 h-4 mr-2" />
                시간표 파일 업로드 (이미지/PDF)
              </Button>
            </div>
            
            {uploadedFile && (
              <div className="flex gap-2">
                <Button
                  onClick={processImageWithOCR}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    "시간표 생성"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearUploadedFile}
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          
          {uploadedFile && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">
                업로드된 파일: <strong>{uploadedFileName}</strong> 
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {uploadedFileType.startsWith('image/') ? '이미지' : 'PDF'}
                </span>
              </p>
              <img 
                src={uploadedFile} 
                alt="업로드된 시간표" 
                className="max-w-full max-h-64 object-contain rounded border"
              />
            </div>
          )}
          
          {ocrResult && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <p className="text-sm text-blue-700 mb-2">OCR 결과:</p>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                {ocrResult}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 시간표 표시 영역 */}
      {viewMode === "weekly" && Object.keys(weeklySchedule).length > 0 ? (
        // 주간 시간표 표시
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              주간 시간표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-3 bg-green-100 text-green-800 font-semibold">교시</th>
                    {weekDays.map((day) => (
                      <th key={day} className="border p-3 bg-green-100 text-green-800 font-semibold min-w-24">
                        {day}요일
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => (
                    <tr key={period}>
                      <td className="border p-3 bg-gray-50 font-medium text-center">{period}</td>
                      {weekDays.map((day) => (
                        <td key={`${day}-${period}`} className="border p-3 text-center">
                          {isEditMode ? (
                            editingCell?.day === day && editingCell?.period === period ? (
                              <Select
                                value={weeklySchedule[day]?.[period] || ""}
                                onValueChange={(value) => handleWeeklyScheduleChange(day, period, value)}
                                onOpenChange={(open) => {
                                  if (!open) setEditingCell(null)
                                }}
                                defaultOpen={true}
                              >
                                <SelectTrigger className="w-full min-w-20">
                                  <SelectValue placeholder="과목 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">없음</SelectItem>
                                  {subjects.map((subject) => (
                                    <SelectItem key={subject} value={subject}>
                                      {subject}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <button
                                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors w-full min-w-16 cursor-pointer"
                                onClick={() => setEditingCell({ day, period })}
                                title="클릭하여 편집"
                              >
                                {weeklySchedule[day]?.[period] || "-"}
                              </button>
                            )
                          ) : (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                              {weeklySchedule[day]?.[period] || "-"}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        // 일간 시간표 (기존 방식)
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
      )}
    </div>
  )
}
