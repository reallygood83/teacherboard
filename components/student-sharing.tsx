'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Share2, 
  Eye, 
  EyeOff, 
  Copy, 
  RefreshCw,
  Users,
  Link2,
  CheckCircle,
  XCircle,
  Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { toast } from "sonner";

interface StudentSession {
  id: string;
  sessionCode: string;
  teacherName: string;
  className: string;
  isActive: boolean;
  createdAt: any;
  lastUpdated: any;
  settings: {
    allowNotices: boolean;
    allowLinks: boolean;
    allowClassContent: boolean;
    allowBookContent: boolean;
  };
}

interface StudentSharingProps {
  accentColor?: string;
}

export default function StudentSharing({ accentColor = "text-green-600" }: StudentSharingProps) {
  const { currentUser } = useAuth();
  const [currentSession, setCurrentSession] = useState<StudentSession | null>(null);
  const [className, setClassName] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 세션 코드 생성 함수
  const generateSessionCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Firebase에서 현재 세션 불러오기
  useEffect(() => {
    if (!currentUser || !db) return;

    const sessionRef = doc(db, `teachers/${currentUser.uid}/session`, 'current');
    
    const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
      if (docSnap.exists()) {
        const sessionData = docSnap.data() as StudentSession;
        setCurrentSession(sessionData);
        setClassName(sessionData.className);
      } else {
        setCurrentSession(null);
      }
    }, (error) => {
      console.error('세션 불러오기 실패:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 새 세션 생성
  const createSession = async () => {
    if (!currentUser || !db || !className.trim()) {
      toast.error('학급 이름을 입력해주세요.');
      return;
    }

    setIsCreatingSession(true);
    try {
      const sessionCode = generateSessionCode();
      const newSession: StudentSession = {
        id: currentUser.uid,
        sessionCode,
        teacherName: currentUser.displayName || '선생님',
        className: className.trim(),
        isActive: true,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        settings: {
          allowNotices: true,
          allowLinks: true,
          allowClassContent: true,
          allowBookContent: true,
        }
      };

      // 교사의 세션 정보 저장
      await setDoc(doc(db, `teachers/${currentUser.uid}/session`, 'current'), newSession);
      
      // 학생 접근용 세션 정보 저장
      await setDoc(doc(db, 'sessions', sessionCode), {
        teacherId: currentUser.uid,
        teacherName: newSession.teacherName,
        className: newSession.className,
        isActive: true,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      toast.success('학생 세션이 생성되었습니다!');
    } catch (error) {
      console.error('세션 생성 실패:', error);
      toast.error('세션 생성에 실패했습니다.');
    } finally {
      setIsCreatingSession(false);
    }
  };

  // 세션 비활성화
  const deactivateSession = async () => {
    if (!currentUser || !db || !currentSession) return;

    setIsUpdating(true);
    try {
      await updateDoc(doc(db, `teachers/${currentUser.uid}/session`, 'current'), {
        isActive: false,
        lastUpdated: serverTimestamp(),
      });

      await updateDoc(doc(db, 'sessions', currentSession.sessionCode), {
        isActive: false,
        lastUpdated: serverTimestamp(),
      });

      toast.success('학생 세션이 비활성화되었습니다.');
    } catch (error) {
      console.error('세션 비활성화 실패:', error);
      toast.error('세션 비활성화에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 세션 활성화
  const activateSession = async () => {
    if (!currentUser || !db || !currentSession) return;

    setIsUpdating(true);
    try {
      await updateDoc(doc(db, `teachers/${currentUser.uid}/session`, 'current'), {
        isActive: true,
        lastUpdated: serverTimestamp(),
      });

      await updateDoc(doc(db, 'sessions', currentSession.sessionCode), {
        isActive: true,
        lastUpdated: serverTimestamp(),
      });

      toast.success('학생 세션이 활성화되었습니다.');
    } catch (error) {
      console.error('세션 활성화 실패:', error);
      toast.error('세션 활성화에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 세션 코드 재생성
  const regenerateSessionCode = async () => {
    if (!currentUser || !db || !currentSession) return;

    setIsUpdating(true);
    try {
      const newSessionCode = generateSessionCode();
      
      // 기존 세션 삭제
      await updateDoc(doc(db, 'sessions', currentSession.sessionCode), {
        isActive: false,
        lastUpdated: serverTimestamp(),
      });

      // 새 세션 생성
      await setDoc(doc(db, 'sessions', newSessionCode), {
        teacherId: currentUser.uid,
        teacherName: currentSession.teacherName,
        className: currentSession.className,
        isActive: currentSession.isActive,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      // 교사 세션 정보 업데이트
      await updateDoc(doc(db, `teachers/${currentUser.uid}/session`, 'current'), {
        sessionCode: newSessionCode,
        lastUpdated: serverTimestamp(),
      });

      toast.success('새로운 세션 코드가 생성되었습니다!');
    } catch (error) {
      console.error('세션 코드 재생성 실패:', error);
      toast.error('세션 코드 재생성에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 공유 설정 업데이트
  const updateSharingSettings = async (setting: keyof StudentSession['settings'], value: boolean) => {
    if (!currentUser || !db || !currentSession) return;

    try {
      const newSettings = {
        ...currentSession.settings,
        [setting]: value
      };

      await updateDoc(doc(db, `teachers/${currentUser.uid}/session`, 'current'), {
        settings: newSettings,
        lastUpdated: serverTimestamp(),
      });

      toast.success('공유 설정이 업데이트되었습니다.');
    } catch (error) {
      console.error('공유 설정 업데이트 실패:', error);
      toast.error('공유 설정 업데이트에 실패했습니다.');
    }
  };

  // 세션 URL 복사
  const copySessionUrl = async () => {
    if (!currentSession) return;

    const sessionUrl = `${window.location.origin}/student/${currentSession.sessionCode}`;
    
    try {
      await navigator.clipboard.writeText(sessionUrl);
      toast.success('세션 URL이 복사되었습니다!');
    } catch (error) {
      console.error('URL 복사 실패:', error);
      toast.error('URL 복사에 실패했습니다.');
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">로그인이 필요합니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 현재 세션 상태 */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className={`w-5 h-5 ${accentColor}`} />
            학생 페이지 공유
          </CardTitle>
          <CardDescription>
            학생들이 접근할 수 있는 전용 페이지를 생성하고 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!currentSession ? (
            // 세션이 없는 경우 - 새 세션 생성
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">새로운 학생 세션 생성</h3>
                <p className="text-sm text-blue-700 mb-4">
                  학급 이름을 입력하고 세션을 생성하면, 학생들이 접근할 수 있는 고유한 URL이 생성됩니다.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="className">학급 이름</Label>
                    <Input
                      id="className"
                      placeholder="예: 3학년 1반, 6-2반"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={createSession}
                    disabled={!className.trim() || isCreatingSession}
                    className="w-full"
                  >
                    {isCreatingSession ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        세션 생성 중...
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-2" />
                        학생 세션 생성하기
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // 세션이 있는 경우 - 세션 관리
            <div className="space-y-6">
              {/* 세션 정보 */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-green-900 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {currentSession.className}
                    </h3>
                    <p className="text-sm text-green-700">
                      세션 코드: <span className="font-mono font-bold text-lg">{currentSession.sessionCode}</span>
                    </p>
                  </div>
                  <Badge 
                    variant={currentSession.isActive ? "default" : "secondary"}
                    className={currentSession.isActive ? "bg-green-600" : "bg-gray-500"}
                  >
                    {currentSession.isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        활성화
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        비활성화
                      </>
                    )}
                  </Badge>
                </div>

                {/* 세션 URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-800">학생 접속 URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/student/${currentSession.sessionCode}`}
                      readOnly
                      className="bg-white font-mono text-sm"
                    />
                    <Button 
                      size="sm" 
                      onClick={copySessionUrl}
                      className="flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-green-700">
                    학생들에게 이 URL을 공유하거나 세션 코드 <span className="font-bold">{currentSession.sessionCode}</span>를 알려주세요.
                  </p>
                </div>

                {/* 세션 제어 버튼 */}
                <div className="flex gap-2 mt-4">
                  {currentSession.isActive ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={deactivateSession}
                      disabled={isUpdating}
                      className="text-red-600 hover:text-red-700"
                    >
                      <EyeOff className="w-4 h-4 mr-1" />
                      세션 비활성화
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={activateSession}
                      disabled={isUpdating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      세션 활성화
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={regenerateSessionCode}
                    disabled={isUpdating}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    코드 재생성
                  </Button>
                </div>
              </div>

              <Separator />

              {/* 공유 설정 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className={`w-4 h-4 ${accentColor}`} />
                  <h3 className="font-medium">공유 콘텐츠 설정</h3>
                </div>
                <p className="text-sm text-gray-600">
                  학생들이 볼 수 있는 콘텐츠를 선택하세요.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">📢 공지사항</Label>
                      <p className="text-xs text-gray-600">교사가 작성한 공지사항</p>
                    </div>
                    <Switch
                      checked={currentSession.settings.allowNotices}
                      onCheckedChange={(checked) => updateSharingSettings('allowNotices', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">🔗 링크 공유</Label>
                      <p className="text-xs text-gray-600">유용한 링크 모음</p>
                    </div>
                    <Switch
                      checked={currentSession.settings.allowLinks}
                      onCheckedChange={(checked) => updateSharingSettings('allowLinks', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">📝 수업 내용</Label>
                      <p className="text-xs text-gray-600">칠판의 수업 노트</p>
                    </div>
                    <Switch
                      checked={currentSession.settings.allowClassContent}
                      onCheckedChange={(checked) => updateSharingSettings('allowClassContent', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">📚 도서 내용</Label>
                      <p className="text-xs text-gray-600">수업 관련 도서 정보</p>
                    </div>
                    <Switch
                      checked={currentSession.settings.allowBookContent}
                      onCheckedChange={(checked) => updateSharingSettings('allowBookContent', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* 사용 안내 */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">💡 사용 방법</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <span className="font-semibold">세션 코드</span>를 칠판에 적어서 학생들에게 알려주세요</li>
                  <li>• <span className="font-semibold">URL 복사</span> 버튼으로 링크를 복사해서 공유하세요</li>
                  <li>• 수업이 끝나면 <span className="font-semibold">세션 비활성화</span>를 눌러주세요</li>
                  <li>• 보안이 걱정되면 <span className="font-semibold">코드 재생성</span>을 이용하세요</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}