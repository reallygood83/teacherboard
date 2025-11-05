'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Play,
  Pause,
  X
} from 'lucide-react';

interface TimerCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerName?: string;
  duration: number;
  onRestart?: () => void;
  onStartNew?: () => void;
  soundEnabled?: boolean;
  onSoundToggle?: () => void;
}

export function TimerCompletionModal({
  isOpen,
  onClose,
  timerName = "수업 타이머",
  duration,
  onRestart,
  onStartNew,
  soundEnabled = true,
  onSoundToggle
}: TimerCompletionModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Hide confetti after animation
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  const confettiParticles = Array.from({ length: 50 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 rounded-full"
      style={{
        backgroundColor: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'][i % 5],
        left: `${Math.random() * 100}%`,
        top: '-10px',
      }}
      initial={{ y: -10, opacity: 1, rotate: 0 }}
      animate={{
        y: window.innerHeight + 100,
        opacity: 0,
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        ease: 'easeOut',
        delay: Math.random() * 0.5,
      }}
    />
  ));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Confetti Effect */}
          {showConfetti && (
            <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
              {confettiParticles}
            </div>
          )}

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            >
              <Card className="relative overflow-hidden bg-white shadow-2xl">
                {/* Success Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: 2 }}
                />

                <CardHeader className="text-center pb-4 relative">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>

                  {/* Success Icon with Animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      bounce: 0.6, 
                      duration: 0.8,
                      delay: 0.2 
                    }}
                    className="mx-auto mb-4"
                  >
                    <div className="relative">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                      {/* Pulse Ring */}
                      <motion.div
                        className="absolute inset-0 border-4 border-green-500 rounded-full"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>

                  <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                    🎉 타이머 완료!
                  </CardTitle>
                  
                  <motion.p 
                    className="text-lg text-gray-600"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Clock className="w-5 h-5 inline mr-2" />
                    {timerName} ({formatTime(duration)})
                  </motion.p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Teacher/Student Friendly Messages */}
                  <motion.div
                    className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <p className="text-green-800 font-medium mb-2">
                      📚 수업 시간이 끝났습니다!
                    </p>
                    <p className="text-green-600 text-sm mb-3">
                      학생들은 정리 시간을 갖고,<br />
                      선생님은 다음 활동을 준비해주세요.
                    </p>
                    
                    {/* Additional contextual messages */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-blue-700 font-medium">👨‍🏫 선생님께</p>
                        <p className="text-blue-600">활동 전환 준비 시간</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded p-2">
                        <p className="text-purple-700 font-medium">👨‍🎓 학생들께</p>
                        <p className="text-purple-600">책상 정리 및 휴식</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    className="grid grid-cols-2 gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    {onRestart && (
                      <Button
                        onClick={onRestart}
                        variant="outline"
                        className="flex items-center gap-2 py-3 h-auto"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="text-sm">다시 시작</span>
                      </Button>
                    )}
                    
                    {onStartNew && (
                      <Button
                        onClick={onStartNew}
                        className="flex items-center gap-2 py-3 h-auto bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4" />
                        <span className="text-sm">새 타이머</span>
                      </Button>
                    )}
                  </motion.div>

                  {/* Sound Control */}
                  {onSoundToggle && (
                    <motion.div
                      className="flex items-center justify-center gap-2 pt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1 }}
                    >
                      <button
                        onClick={onSoundToggle}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-600"
                      >
                        {soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-gray-400" />
                        )}
                        알림음 {soundEnabled ? '켜짐' : '꺼짐'}
                      </button>
                    </motion.div>
                  )}

                  {/* Quick Actions for Teachers */}
                  <motion.div
                    className="border-t pt-4 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                  >
                    <p className="text-center text-sm text-gray-500 mb-3">
                      ⏰ 빠른 설정
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { time: 300, label: '5분' },
                        { time: 600, label: '10분' },
                        { time: 900, label: '15분' }
                      ].map(({ time, label }) => (
                        <Button
                          key={time}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onStartNew?.();
                            // This would trigger a new timer with the specified duration
                            // Implementation depends on parent component
                          }}
                          className="text-xs h-8 bg-gray-50 hover:bg-gray-100"
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Mobile-specific bottom sheet variant */}
          <style jsx global>{`
            @media (max-width: 640px) {
              .timer-modal {
                align-items: flex-end;
              }
              
              .timer-modal .card {
                border-radius: 20px 20px 0 0;
                margin-bottom: 0;
              }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}

// Timer Alert Component (for less intrusive alerts)
interface TimerAlertProps {
  show: boolean;
  message: string;
  type?: 'warning' | 'info' | 'success';
  onDismiss: () => void;
  duration?: number;
}

export function TimerAlert({ 
  show, 
  message, 
  type = 'info', 
  onDismiss, 
  duration = 3000 
}: TimerAlertProps) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onDismiss]);

  const typeStyles = {
    warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    info: 'bg-blue-100 border-blue-300 text-blue-800',
    success: 'bg-green-100 border-green-300 text-green-800',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-sm"
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          <div className={`
            p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm
            ${typeStyles[type]}
            flex items-center gap-3
          `}>
            <Clock className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{message}</span>
            <button
              onClick={onDismiss}
              className="ml-auto p-1 hover:bg-black/10 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}