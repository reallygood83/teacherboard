'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Download, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface DocumentGeneratorProps {
  geminiApiKey: string;
  geminiModel: string;
}

export function DocumentGenerator({ geminiApiKey, geminiModel }: DocumentGeneratorProps) {
  const [formData, setFormData] = useState({
    title: '',
    recipient: '',
    sender: '',
    content: '',
    deadline: '',
    attachments: ''
  });
  
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const generateDocument = async () => {
    if (!geminiApiKey) {
      setError('Gemini API 키가 설정되지 않았습니다. 설정 탭에서 API 키를 입력해주세요.');
      return;
    }

    if (!formData.title || !formData.recipient || !formData.content) {
      setError('제목, 수신처, 내용은 필수 입력사항입니다.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: geminiModel });

      const prompt = `
당신은 15년 경력의 행정공무원으로 행정안전부의 '행정업무 운영편람'을 완벽히 숙지한 공문서 작성 전문가입니다.

다음 정보를 바탕으로 한국 공문서 표준 형식에 맞는 공문을 작성해주세요:

**문서 정보:**
- 제목: ${formData.title}
- 수신: ${formData.recipient}
- 발신: ${formData.sender || '(작성자)'}
- 주요 내용: ${formData.content}
${formData.deadline ? `- 기한: ${formData.deadline}` : ''}
${formData.attachments ? `- 첨부: ${formData.attachments}` : ''}

**작성 지침:**
1. 문서 구조: 두문-본문-결문으로 구성
2. 항목 기호: 1. → 가. → 1) 순서로 2칸 들여쓰기
3. 날짜 표기: YYYY.M.D. 형식 (예: 2024.12.25.)
4. 시간 표기: HH:MM 형식 (예: 14:00)
5. 금액 표기: 원화 + 숫자 + 한글표기 (예: 1,000원(일천원))
6. 5W1H 원칙 준수: 누가, 무엇을, 언제, 어디서, 왜, 어떻게
7. 첨부 및 끝 표시 포함

공문서는 마크다운 형식으로 작성하되, HWP 호환성을 고려해주세요.
현재 날짜는 ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }).replace(/\//g, '.')}입니다.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setGeneratedDoc(text);
    } catch (err) {
      console.error('Document generation error:', err);
      setError('공문서 생성 중 오류가 발생했습니다. API 키를 확인하고 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedDoc);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const downloadDocument = () => {
    const blob = new Blob([generatedDoc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.title || '공문서'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            공문서 작성에 필요한 기본 정보를 입력해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">문서 제목 *</Label>
              <Input
                id="title"
                placeholder="예: 2025학년도 교육과정 운영 계획 수립"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="recipient">수신처 *</Label>
              <Input
                id="recipient"
                placeholder="예: 교육지원청 교육과정담당관"
                value={formData.recipient}
                onChange={(e) => handleInputChange('recipient', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sender">발신처</Label>
              <Input
                id="sender"
                placeholder="예: ○○초등학교장"
                value={formData.sender}
                onChange={(e) => handleInputChange('sender', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="deadline">처리 기한</Label>
              <Input
                id="deadline"
                placeholder="예: 2025.1.31."
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="content">주요 내용 *</Label>
            <Textarea
              id="content"
              placeholder="공문서의 주요 내용을 간략히 작성해주세요. 예: 2025학년도 교육과정 편성 및 운영에 관한 기본 계획을 수립하여 안내하오니 관련 업무에 참고하시기 바랍니다."
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="attachments">첨부 파일</Label>
            <Input
              id="attachments"
              placeholder="예: 교육과정 편성표 1부, 시간 배당표 1부"
              value={formData.attachments}
              onChange={(e) => handleInputChange('attachments', e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <Button 
            onClick={generateDocument} 
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                공문서 생성 중...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                공문서 생성하기
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 생성된 문서 */}
      {generatedDoc && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                생성된 공문서
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  {copySuccess ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copySuccess ? '복사됨!' : '복사'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadDocument}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  다운로드
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              생성된 공문서를 확인하고 필요시 수정하여 사용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                {generatedDoc}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}