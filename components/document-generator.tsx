'use client';

import { useState, useMemo } from "react";
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
    attachments: '',
    docType: 'notice',
  });
  
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'formatted' | 'markdown'>('formatted');

  // 문서 유형 목록 + 유형별 지침
  const documentTypes = [
    { value: 'notice', label: '안내문', hint: '행사/일정/절차 안내' },
    { value: 'request', label: '협조요청', hint: '부서/학교 간 협조 요청' },
    { value: 'report', label: '보고서', hint: '경과/실적/결과 보고' },
    { value: 'proposal', label: '기안서', hint: '승인을 위한 결재 문안' },
    { value: 'parent_letter', label: '가정통신문', hint: '가정에 전달할 안내' },
    { value: 'announcement', label: '공지문', hint: '공식 공지/지침 알림' },
  ] as const;

  const docTypeGuidelines: Record<string, string> = {
    notice: `
- 대상과 목적을 첫 문단에서 명확히 안내
- 일정/장소/방법 등 핵심 정보를 표처럼 정리하거나 항목화
- 참여/준수 요청 사항은 불릿 목록으로 간결하게 명시
    `.trim(),
    request: `
- 협조 배경과 필요성을 간단히 설명 후 구체 협조 사항을 번호 매김하여 제시
- 관련 근거(지침/공문 번호)가 있으면 본문에 명시
- 기한과 담당자 연락처를 결문에 포함
    `.trim(),
    report: `
- 목적, 추진 경과, 주요 실적/결과, 문제점 및 개선방안 순으로 구성
- 수치/지표/결과는 번호 목록 또는 표기법으로 가독성 있게 정리
- 첨부 자료(사진, 통계표 등) 유무를 결문에 기재
    `.trim(),
    proposal: `
- 배경 및 필요성 → 주요 내용(세부 항목) → 기대 효과 순으로 제시
- 결재선 보고를 염두에 두고 근거 규정/예산/일정 등을 항목화
- 선택/결정이 필요한 안건은 대안 비교 형식으로 기술
    `.trim(),
    parent_letter: `
- 상단 인사말과 대상(학부모님 귀하)을 명시
- 학생/가정에 필요한 안내 사항을 쉬운 문장과 목록으로 제시
- 문의처(담당 교사/연락처)와 회신 필요시 회신 방법을 결문에 명확히 표기
    `.trim(),
    announcement: `
- 공지 목적과 적용 대상/범위를 서두에 명확히 기재
- 시행일, 준수 사항, 위반 시 조치 등을 조항식 또는 번호 목록으로 정리
- 관련 근거 문서/규정을 결문에 표기
    `.trim(),
  };

  const selectedDocType = useMemo(() => {
    return documentTypes.find(d => d.value === formData.docType) || documentTypes[0];
  }, [formData.docType]);

  // Markdown → 정돈된 일반 문서 텍스트로 변환
  const toPlainDocument = (md: string): string => {
    if (!md) return '';
    let text = md.replace(/\r\n/g, '\n');

    // 코드 펜스/인라인 코드 마커 제거
    text = text.replace(/```/g, '');
    text = text.replace(/`([^`]+)`/g, '$1');

    const lines = text.split('\n');
    const out: string[] = [];
    for (let raw of lines) {
      let line = raw.replace(/\s+$/g, '');

      // Heading (#, ##, ...)
      const h = line.match(/^\s*#{1,6}\s+(.*)$/);
      if (h) {
        const title = h[1].trim();
        out.push(title);
        out.push('─'.repeat(Math.max(3, Math.min(80, title.length))));
        continue;
      }

      // Blockquote
      const bq = line.match(/^\s*>\s?(.*)$/);
      if (bq) {
        out.push(bq[1]);
        continue;
      }

      // Bullet list
      const bullet = line.match(/^(\s*)[-*]\s+(.*)$/);
      if (bullet) {
        const indent = bullet[1] || '';
        out.push(`${indent}• ${bullet[2]}`);
        continue;
      }

      // Numbered list
      const numbered = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
      if (numbered) {
        const indent = numbered[1] || '';
        out.push(`${indent}${numbered[2]}. ${numbered[3]}`);
        continue;
      }

      // Bold/italic 제거
      line = line.replace(/\*\*([^*]+)\*\*/g, '$1');
      line = line.replace(/__([^_]+)__/g, '$1');
      line = line.replace(/\*(?!\s)([^*]+)\*/g, '$1');
      line = line.replace(/_(?!\s)([^_]+)_/g, '$1');

      out.push(line);
    }

    // 공백 줄 과다 제거
    const compact: string[] = [];
    for (let i = 0; i < out.length; i++) {
      const cur = out[i];
      const prev = compact[compact.length - 1];
      if (!(cur.trim() === '' && (prev === undefined || prev.trim() === ''))) {
        compact.push(cur);
      }
    }

    return compact.join('\n').trim();
  };

  const formattedDoc = useMemo(() => toPlainDocument(generatedDoc), [generatedDoc]);

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
- 문서 유형: ${selectedDocType.label}
- 제목: ${formData.title}
- 수신: ${formData.recipient}
- 발신: ${formData.sender || '(작성자)'}
- 주요 내용: ${formData.content}
${formData.deadline ? `- 기한: ${formData.deadline}` : ''}
${formData.attachments ? `- 첨부: ${formData.attachments}` : ''}

**유형별 지침(반드시 반영):**
${docTypeGuidelines[formData.docType]}

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
      const textToCopy = viewMode === 'formatted' ? formattedDoc : generatedDoc;
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const downloadDocument = () => {
    const textToDownload = viewMode === 'formatted' ? formattedDoc : generatedDoc;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
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

          {/* 문서 유형 선택 */}
          <div>
            <Label htmlFor="docType">문서 유형</Label>
            <select
              id="docType"
              value={formData.docType}
              onChange={(e) => handleInputChange('docType', e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {documentTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{documentTypes.find(d => d.value === formData.docType)?.hint}</p>
            <div className="mt-2">
              <div className="text-xs font-medium text-gray-600">{selectedDocType.label} 작성 가이드</div>
              <ul className="mt-1 list-disc pl-5 text-sm text-gray-700 space-y-1">
                {docTypeGuidelines[formData.docType].split('\n').map((line, idx) => {
                  const text = line.replace(/^\s*-\s*/, '').trim();
                  if (!text) return null;
                  return <li key={idx}>{text}</li>;
                })}
              </ul>
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
              <div className="flex gap-2 items-center">
                {/* 보기 모드 토글 */}
                <div className="hidden sm:flex rounded-md border overflow-hidden">
                  <Button
                    variant={viewMode === 'formatted' ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode('formatted')}
                  >
                    문서형식
                  </Button>
                  <Button
                    variant={viewMode === 'markdown' ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-none border-l"
                    onClick={() => setViewMode('markdown')}
                  >
                    원문(MD)
                  </Button>
                </div>
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
              보기 모드: {viewMode === 'formatted' ? '정돈된 문서형식 (복사/붙여넣기 용이)' : '원문(Markdown)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viewMode === 'formatted' ? (
              <div className="bg-white p-5 rounded-lg border whitespace-pre-wrap text-[15px] leading-7 font-sans">
                {formattedDoc}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                  {generatedDoc}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}