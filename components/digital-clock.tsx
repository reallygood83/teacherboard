"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, RotateCcw, Volume2, VolumeX, AlertTriangle } from "lucide-react"
import { TimerCompletionModal, TimerAlert } from "@/components/ui/timer-completion-modal"
import { timerSounds, soundManager } from "@/lib/sound-manager"
import { motion, AnimatePresence } from "framer-motion"

export function DigitalClock() {
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [timerMinutes, setTimerMinutes] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [originalDuration, setOriginalDuration] = useState(0)
  
  // Sound and UI state
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showWarningAlert, setShowWarningAlert] = useState(false)
  const [warningShown, setWarningShown] = useState(false)
  
  // Animation states
  const [isUrgent, setIsUrgent] = useState(false)
  const [pulseIntensity, setPulseIntensity] = useState(0)
  
  // Accessibility states
  const [lastAnnouncement, setLastAnnouncement] = useState("")

  // Initialize sound system
  useEffect(() => {
    soundManager.initializeTimerSounds()
    
    // Load sound settings
    const savedSoundEnabled = localStorage.getItem('timer-sound-enabled')
    if (savedSoundEnabled !== null) {
      setSoundEnabled(savedSoundEnabled === 'true')
    }
  }, [])

  // Accessibility announcements
  const announceToScreenReader = (message: string) => {
    setLastAnnouncement(message)
    // Clear after a moment to allow re-announcement of same message
    setTimeout(() => setLastAnnouncement(""), 1000)
  }

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Spacebar to start/pause timer
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        if (timeLeft === 0) {
          startTimer()
        } else if (isRunning) {
          pauseTimer()
        } else if (timeLeft > 0) {
          setIsRunning(true)
        }
      }
      // Escape to reset timer
      if (e.code === 'Escape' && timeLeft > 0) {
        resetTimer()
        announceToScreenReader("타이머가 초기화되었습니다")
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isRunning, timeLeft])

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

  // Enhanced timer effect with sound and animation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1
          
          // Warning at 30 seconds and 10 seconds
          if (newTime === 30 && !warningShown && soundEnabled) {
            timerSounds.warning()
            setShowWarningAlert(true)
            setWarningShown(true)
            announceToScreenReader("타이머 30초 남음")
          }
          
          if (newTime === 10 && soundEnabled) {
            timerSounds.warning()
            announceToScreenReader("타이머 10초 남음")
          }
          
          // Last 10 seconds - urgent mode
          if (newTime <= 10 && newTime > 0) {
            setIsUrgent(true)
            setPulseIntensity(Math.max(0.5, (11 - newTime) / 10))
            
            // Tick sound for last 5 seconds
            if (newTime <= 5 && soundEnabled) {
              timerSounds.tick()
            }
          } else {
            setIsUrgent(false)
            setPulseIntensity(0)
          }
          
          return newTime
        })
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      // Timer completed
      setIsRunning(false)
      setIsUrgent(false)
      setPulseIntensity(0)
      
      if (originalDuration > 0) {
        // Play completion sound
        if (soundEnabled) {
          timerSounds.complete()
        }
        
        // Accessibility announcement
        announceToScreenReader("타이머가 완료되었습니다")
        
        // Show completion modal
        setShowCompletionModal(true)
      }
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, originalDuration, soundEnabled, warningShown])

  const startTimer = () => {
    if (timerMinutes === 0 && timerSeconds === 0) return
    const duration = timerMinutes * 60 + timerSeconds
    setTimeLeft(duration)
    setOriginalDuration(duration)
    setIsRunning(true)
    setWarningShown(false)
    setIsUrgent(false)
    setPulseIntensity(0)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(0)
    setOriginalDuration(0)
    setWarningShown(false)
    setIsUrgent(false)
    setPulseIntensity(0)
  }
  
  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled
    setSoundEnabled(newSoundEnabled)
    timerSounds.setEnabled(newSoundEnabled)
    localStorage.setItem('timer-sound-enabled', newSoundEnabled.toString())
  }
  
  const handleModalRestart = () => {
    setShowCompletionModal(false)
    startTimer()
  }
  
  const handleModalNewTimer = () => {
    setShowCompletionModal(false)
    resetTimer()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6" role="region" aria-label="시간 관리 섹션">
      {/* 현재 시간 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-green-600 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">현재 시간</h3>
            <div className="text-4xl font-mono font-bold mb-2">{currentTime}</div>
            <div className="text-green-100">{currentDate}</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 수업 타이머 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className={`transition-all duration-300 ${isUrgent ? 'ring-2 ring-red-500 shadow-lg' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">수업 타이머</h3>
              
              {/* Sound toggle button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSound}
                className="p-2"
                title={soundEnabled ? "알림음 끄기" : "알림음 켜기"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-green-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {/* Timer input */}
              <div className="flex gap-2 items-center justify-center">
                <Input
                  type="number"
                  placeholder="분"
                  value={timerMinutes || ""}
                  onChange={(e) => setTimerMinutes(Number.parseInt(e.target.value) || 0)}
                  className="w-20 text-center"
                  min="0"
                  max="99"
                  disabled={isRunning}
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
                  disabled={isRunning}
                />
                <span>초</span>
              </div>

              {/* Timer display with animations */}
              <div className="text-center">
                <motion.div
                  className={`text-6xl font-mono font-bold mb-4 ${
                    isUrgent ? 'text-red-600' : 'text-green-600'
                  }`}
                  animate={isUrgent ? {
                    scale: [1, 1.05, 1],
                    textShadow: [
                      '0 0 0px rgba(239, 68, 68, 0)',
                      `0 0 ${20 * pulseIntensity}px rgba(239, 68, 68, ${pulseIntensity})`,
                      '0 0 0px rgba(239, 68, 68, 0)'
                    ]
                  } : {}}
                  transition={{
                    duration: 1,
                    repeat: isUrgent ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  role="timer"
                  aria-live="polite"
                  aria-label={`타이머 ${formatTime(timeLeft)} 남음${isUrgent ? ', 곧 종료됩니다' : ''}`}
                >
                  {formatTime(timeLeft)}
                </motion.div>

                {/* Progress bar */}
                {originalDuration > 0 && (
                  <motion.div
                    className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isRunning || timeLeft > 0 ? 1 : 0 }}
                  >
                    <motion.div
                      className={`h-full rounded-full transition-colors duration-300 ${
                        isUrgent ? 'bg-red-500' : 'bg-green-600'
                      }`}
                      initial={{ width: '100%' }}
                      animate={{ 
                        width: `${(timeLeft / originalDuration) * 100}%`
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  </motion.div>
                )}

                {/* Warning indicator */}
                <AnimatePresence>
                  {isUrgent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2 text-red-600 mb-4"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </motion.div>
                      <span className="text-sm font-medium">곧 종료됩니다!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Control buttons */}
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

                {/* Quick timer buttons with educational context */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    ⏰ 빠른 설정
                    <span className="text-xs text-gray-400">(교육 활동별 권장 시간)</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { minutes: 5, label: '5분', context: '발표/토론' },
                      { minutes: 10, label: '10분', context: '개별 작업' },
                      { minutes: 15, label: '15분', context: '짝 활동' },
                      { minutes: 20, label: '20분', context: '모둠 학습' },
                      { minutes: 30, label: '30분', context: '프로젝트' },
                      { minutes: 45, label: '45분', context: '수업 전체' }
                    ].map(({ minutes, label, context }) => (
                      <Button
                        key={minutes}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!isRunning) {
                            setTimerMinutes(minutes)
                            setTimerSeconds(0)
                          }
                        }}
                        disabled={isRunning}
                        className="text-xs h-auto py-2 bg-gray-50 hover:bg-gray-100 flex flex-col gap-1"
                        title={`${context} 활동에 적합한 시간입니다`}
                      >
                        <span className="font-medium">{label}</span>
                        <span className="text-[10px] text-gray-500">{context}</span>
                      </Button>
                    ))}
                  </div>
                  
                  {/* Educational tips */}
                  <div className="mt-3 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                    💡 <strong>교육 팁:</strong> 학생들의 집중력을 고려하여 10-15분 단위로 활동을 나누어 진행하면 효과적입니다.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Timer completion modal */}
      <TimerCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        timerName="수업 타이머"
        duration={originalDuration}
        onRestart={handleModalRestart}
        onStartNew={handleModalNewTimer}
        soundEnabled={soundEnabled}
        onSoundToggle={toggleSound}
      />

      {/* Warning alert */}
      <TimerAlert
        show={showWarningAlert}
        message="⚠️ 타이머 30초 남음!"
        type="warning"
        onDismiss={() => setShowWarningAlert(false)}
        duration={3000}
      />

      {/* Screen reader announcements */}
      <div 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only"
      >
        {lastAnnouncement}
      </div>

      {/* Keyboard shortcuts help */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-gray-400 text-center mt-4 p-3 bg-gray-50 rounded-lg"
      >
        <p className="font-medium mb-1">⌨️ 키보드 단축키</p>
        <p>스페이스바: 시작/일시정지 | ESC: 초기화 | 사운드 토글: 소리 버튼 클릭</p>
      </motion.div>
    </div>
  )
}
