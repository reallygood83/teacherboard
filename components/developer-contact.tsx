'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Mail, MessageCircle, Phone, ExternalLink } from 'lucide-react'

export function DeveloperContact() {
  const [isOpen, setIsOpen] = useState(false)

  const handleEmailContact = () => {
    const subject = encodeURIComponent('Teacher Board 문의 - ')
    const body = encodeURIComponent(`안녕하세요,\n\nTeacher Board 관련 문의드립니다.\n\n문의 내용:\n\n\n감사합니다.`)
    const mailtoUrl = `mailto:jpmjkim23@gmail.com?subject=${subject}&body=${body}`
    
    // 이메일 클라이언트 열기
    window.location.href = mailtoUrl
    setIsOpen(false)
  }

  const handleKakaoContact = () => {
    // 카카오톡 오픈채팅 링크 열기
    window.open('https://open.kakao.com/o/gubGYQ7g', '_blank')
    setIsOpen(false)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm"
      >
        <Phone className="w-4 h-4 mr-1" />
        개발자에게 요청하기
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              개발자 연락하기
            </DialogTitle>
            <DialogDescription>
              Teacher Board에 대한 문의나 기능 요청이 있으시면 아래 방법으로 연락해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Button
              onClick={handleEmailContact}
              className="flex items-center justify-between p-6 h-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">이메일로 문의하기</div>
                  <div className="text-sm text-blue-100 mt-1">jpmjkim23@gmail.com</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-200" />
            </Button>

            <Button
              onClick={handleKakaoContact}
              className="flex items-center justify-between p-6 h-auto bg-yellow-500 hover:bg-yellow-600 text-white"
              variant="secondary"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">카카오톡 오픈채팅</div>
                  <div className="text-sm text-yellow-100 mt-1">실시간 채팅으로 빠른 소통</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-yellow-200" />
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center border-t pt-4">
            💡 버그 신고, 기능 제안, 사용법 문의 등 언제든 연락주세요!
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}