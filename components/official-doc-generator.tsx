'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Copy, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentData {
  title: string;
  recipient: string;
  sender: string;
  senderPosition: string;
  mainContent: string;
  docType: string;
  purpose: string;
  deadline?: string;
  attachment?: string;
}

export function OfficialDocGenerator() {
  const { toast } = useToast();
  const [documentData, setDocumentData] = useState<DocumentData>({
    title: '',
    recipient: '',
    sender: '',
    senderPosition: '',
    mainContent: '',
    docType: '공문',
    purpose: '',
    deadline: '',
    attachment: ''
  });
  
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const docTypes = [
    { value: '공문', label: '공문 (Official Document)' },
    { value: '보고서', label: '보고서 (Report)' },
    { value: '계획서', label: '계획서 (Plan)' },
    { value: '요청서', label: '요청서 (Request)' },
    { value: '안내문', label: '안내문 (Notice)' },
    { value: '협조요청', label: '협조요청 (Cooperation Request)' }
  ];

  const handleInputChange = (field: keyof DocumentData, value: string) => {
    setDocumentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateDocument = async () => {
    if (!documentData.title || !documentData.recipient || !documentData.mainContent) {
      toast({
        title: "입력 오류",
        description: "제목, 수신자, 주요 내용은 필수 입력 항목입니다.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // korean-public-doc-specialist 에이전트 로직 구현
      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}.${currentDate.getMonth() + 1}.${currentDate.getDate()}.`;
      
      const docNumber = `${documentData.senderPosition || '교무부'}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
      
      const document = `
${documentData.docType}

문서번호: ${docNumber}
시행일자: ${formattedDate}

수신: ${documentData.recipient}
발신: ${documentData.sender || '안양 박달초등학교장'}

제목: ${documentData.title}

1. 목적
  ${documentData.purpose || '교육활동 지원 및 업무 효율성 제고를 위함'}

2. 주요 내용
  가. ${documentData.mainContent.split('\n').join('\n  나. ')}

3. 추진 일정
  ${documentData.deadline ? `가. 추진 기한: ${documentData.deadline}` : '가. 추진 기한: 공문 시행일로부터 7일 이내'}
  나. 세부 일정은 별도 협의

4. 기대 효과
  가. 교육활동의 원활한 진행
  나. 업무 효율성 향상
  다. 교육 목표 달성 기여

${documentData.attachment ? `붙임: ${documentData.attachment}` : '붙임: 없음'}

끝.

${formattedDate}

${documentData.sender || '안양 박달초등학교장'}
(직인생략)

담당자: ${documentData.senderPosition || '교무부'}
연락처: 031-XXX-XXXX
`.trim();

      setGeneratedDoc(document);
      
      toast({
        title: "공문 생성 완료",
        description: "한국 공문서 표준 형식에 따라 문서가 생성되었습니다.",
      });
      
    } catch (error) {
      console.error('Document generation error:', error);
      toast({
        title: "생성 오류",
        description: "문서 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedDoc);
      setIsCopied(true);
      toast({
        title: "복사 완료",
        description: "생성된 공문이 클립보드에 복사되었습니다.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const downloadDocument = () => {
    const blob = new Blob([generatedDoc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentData.title || '공문서'}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "다운로드 완료",
      description: "공문서 파일이 다운로드되었습니다.",
    });
  };

  const resetForm = () => {
    setDocumentData({
      title: '',
      recipient: '',
      sender: '',
      senderPosition: '',
      mainContent: '',
      docType: '공문',
      purpose: '',
      deadline: '',
      attachment: ''
    });
    setGeneratedDoc('');
  };

  return (
    <div className="space-y-6">
      {/* 입력 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            공문서 정보 입력
          </CardTitle>
          <CardDescription>
            교육부 행정업무 매뉴얼에 따른 표준 공문서를 생성합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="docType">문서 유형</Label>
              <Select value={documentData.docType} onValueChange={(value) => handleInputChange('docType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="문서 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {docTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                placeholder="예: 2025학년도 교육과정 운영 계획 안내"
                value={documentData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">수신자 *</Label>
              <Input
                id="recipient"
                placeholder="예: 각 학급 담임교사"
                value={documentData.recipient}
                onChange={(e) => handleInputChange('recipient', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sender">발신자</Label>
              <Input
                id="sender"
                placeholder="예: 안양 박달초등학교장 (기본값)"
                value={documentData.sender}
                onChange={(e) => handleInputChange('sender', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senderPosition">담당 부서</Label>
              <Input
                id="senderPosition"
                placeholder="예: 교무부, 행정실"
                value={documentData.senderPosition}
                onChange={(e) => handleInputChange('senderPosition', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">추진 기한</Label>
              <Input
                id="deadline"
                placeholder="예: 2025년 3월 15일까지"
                value={documentData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">목적</Label>
            <Input
              id="purpose"
              placeholder="예: 새 학년도 원활한 교육과정 운영을 위함"
              value={documentData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mainContent">주요 내용 *</Label>
            <Textarea
              id="mainContent"
              placeholder="주요 내용을 항목별로 입력하세요. 엔터를 입력하면 자동으로 가, 나, 다 형식으로 구성됩니다."
              value={documentData.mainContent}
              onChange={(e) => handleInputChange('mainContent', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment">붙임</Label>
            <Input
              id="attachment"
              placeholder="예: 교육과정 편성표 1부"
              value={documentData.attachment}
              onChange={(e) => handleInputChange('attachment', e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={generateDocument} disabled={isGenerating} className="flex-1">
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  공문서 생성
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 생성된 문서 */}
      {generatedDoc && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                생성된 공문서
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {isCopied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {isCopied ? '복사됨' : '복사'}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadDocument}>
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              교육부 행정업무 매뉴얼 표준 형식에 따라 생성된 공문서입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-6 font-mono text-sm whitespace-pre-line">
              {generatedDoc}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}