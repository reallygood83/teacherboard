"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Link,
  BookOpen,
  Library,
  Heart,
  Users,
  Globe,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { db, isFirebaseReady } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, doc, getDoc, where } from "firebase/firestore";

interface SessionData {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  sessionCode: string;
  createdAt: any;
  isActive: boolean;
}

interface ChalkboardNote {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: any;
  updatedAt: any;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: "low" | "medium" | "high";
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
}

interface SavedLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
}

interface BookContent {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: "low" | "medium" | "high";
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
}

export default function StudentPage() {
  const { toast } = useToast();
  const [sessionCode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname.split("/").pop() || "";
    }
    return "";
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
  const [chalkboardNotes, setChalkboardNotes] = useState<ChalkboardNote[]>([]);
  const [bookContents, setBookContents] = useState<BookContent[]>([]);

  // Collapsible state
  const [openSections, setOpenSections] = useState({
    notices: false,
    links: false,
    chalkboard: false,
    books: false,
  });

  // Pull to refresh state
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  // Load session data and content
  useEffect(() => {
    if (!sessionCode) return;
    loadSessionData();
  }, [sessionCode]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isFirebaseReady()) {
        throw new Error("Firebase가 초기화되지 않았습니다.");
      }

      // Load session data
      const sessionQuery = query(
        collection(db, "teachingSessions"),
        where("sessionCode", "==", sessionCode)
      );

      const sessionSnapshot = await getDocs(sessionQuery);

      if (sessionSnapshot.empty) {
        throw new Error("세션 코드가 올바르지 않습니다.");
      }

      const sessionDoc = sessionSnapshot.docs[0];
      const session = { id: sessionDoc.id, ...sessionDoc.data() } as SessionData;

      if (!session.isActive) {
        throw new Error("비활성화된 세션입니다.");
      }

      setSessionData(session);

      // Load content for this teacher
      await Promise.all([
        loadNotices(session.teacherId),
        loadSavedLinks(session.teacherId),
        loadChalkboardNotes(session.teacherId),
        loadBookContents(session.teacherId)
      ]);
    } catch (error: any) {
      console.error("Failed to load session data:", error);
      setError(error.message || "데이터 로딩 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadNotices = async (teacherId: string) => {
    try {
      const noticesRef = collection(db, `users/${teacherId}/notices`);
      const noticesQuery = query(noticesRef, where("isActive", "==", true), orderBy("createdAt", "desc"), limit(20));
      const noticesSnapshot = await getDocs(noticesQuery);
      const noticesData = noticesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notice[];
      setNotices(noticesData);
    } catch (error) {
      console.error("Failed to load notices:", error);
    }
  };

  const loadSavedLinks = async (teacherId: string) => {
    try {
      const linksRef = collection(db, `users/${teacherId}/savedLinks`);
      const linksQuery = query(linksRef, where("isActive", "==", true), orderBy("createdAt", "desc"), limit(20));
      const linksSnapshot = await getDocs(linksQuery);
      const linksData = linksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SavedLink[];
      setSavedLinks(linksData);
    } catch (error) {
      console.error("Failed to load saved links:", error);
    }
  };

  const loadChalkboardNotes = async (teacherId: string) => {
    try {
      const notesRef = collection(db, `users/${teacherId}/chalkboardNotes`);
      const notesQuery = query(notesRef, orderBy("createdAt", "desc"), limit(20));
      const notesSnapshot = await getDocs(notesQuery);
      const notesData = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChalkboardNote[];
      setChalkboardNotes(notesData);
    } catch (error) {
      console.error("Failed to load chalkboard notes:", error);
    }
  };

  const loadBookContents = async (teacherId: string) => {
    try {
      const booksRef = collection(db, `users/${teacherId}/bookContents`);
      const booksQuery = query(booksRef, where("isActive", "==", true), orderBy("createdAt", "desc"), limit(20));
      const booksSnapshot = await getDocs(booksQuery);
      const booksData = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BookContent[];
      setBookContents(booksData);
    } catch (error) {
      console.error("Failed to load book contents:", error);
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && touchStartY > 0) {
      const touchY = e.touches[0].clientY;
      const diff = touchY - touchStartY;
      
      if (diff > 0) {
        e.preventDefault();
        const distance = Math.min(diff, 120);
        setPullDistance(distance);
        setIsPulling(distance > 50);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isPulling && pullDistance > 50) {
      loadSessionData();
      toast({
        title: "새로고침 완료",
        description: "최신 정보를 불러왔습니다.",
      });
    }
    setPullDistance(0);
    setIsPulling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">학급 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 오류</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh 인디케이터 */}
      {isPulling && (
        <div 
          className="fixed top-0 left-0 right-0 bg-blue-100 text-blue-800 text-center py-2 z-50 transition-transform duration-200"
          style={{ transform: `translateY(${Math.min(pullDistance - 50, 20)}px)` }}
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          새로고침하려면 손을 놓으세요
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{sessionData?.title || "학급 홈페이지"}</h1>
                <p className="text-sm text-gray-600">{sessionData?.description || "우리 학급 공간"}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              <Globe className="w-3 h-3 mr-1" />
              연결됨
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 공지사항 섹션 */}
        <Card className="overflow-hidden shadow-lg border-0">
          <Collapsible open={openSections.notices} onOpenChange={() => toggleSection("notices")}>
            <CollapsibleTrigger className="w-full">
              <CardTitle className="flex items-center justify-between p-6 text-left group cursor-pointer hover:bg-orange-50/50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      🔔 공지사항
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      선생님의 중요한 알림 {notices.length}개
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {notices.length > 0 && (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                      {notices.length}
                    </Badge>
                  )}
                  {openSections.notices ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                  )}
                </div>
              </CardTitle>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-6 pb-6">
                {notices.length > 0 ? (
                  <div className="space-y-4">
                    {notices.map((notice) => (
                      <div
                        key={notice.id}
                        className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getPriorityIcon(notice.priority)}</span>
                            <Badge className={getPriorityColor(notice.priority)}>
                              {notice.priority === "high" && "긴급"}
                              {notice.priority === "medium" && "보통"}
                              {notice.priority === "low" && "일반"}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {notice.createdAt?.toDate?.()?.toLocaleDateString() || "날짜 없음"}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">{notice.title}</h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {notice.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">새로운 공지사항이 없습니다</p>
                    <p className="text-sm">선생님이 공지를 등록하면 여기에 표시됩니다</p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* 링크 공유 섹션 */}
        <Card className="overflow-hidden shadow-lg border-0">
          <Collapsible open={openSections.links} onOpenChange={() => toggleSection("links")}>
            <CollapsibleTrigger className="w-full">
              <CardTitle className="flex items-center justify-between p-6 text-left group cursor-pointer hover:bg-blue-50/50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg">
                    <Link className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      🔗 링크 공유
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      유용한 학습 자료와 사이트 {savedLinks.length}개
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {savedLinks.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      {savedLinks.length}
                    </Badge>
                  )}
                  {openSections.links ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  )}
                </div>
              </CardTitle>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-6 pb-6">
                {savedLinks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
                      >
                        <div className="flex items-start space-x-3">
                          <ExternalLink className="w-5 h-5 text-blue-500 mt-1 group-hover:text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {link.title}
                            </h3>
                            {link.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                                {link.description}
                              </p>
                            )}
                            <p className="text-xs text-blue-600 truncate">
                              {link.url}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Link className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">공유된 링크가 없습니다</p>
                    <p className="text-sm">선생님이 유용한 링크를 공유하면 여기에 표시됩니다</p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* 수업 내용 섹션 */}
        <Card className="overflow-hidden shadow-lg border-0">
          <Collapsible open={openSections.chalkboard} onOpenChange={() => toggleSection("chalkboard")}>
            <CollapsibleTrigger className="w-full">
              <CardTitle className="flex items-center justify-between p-6 text-left group cursor-pointer hover:bg-green-50/50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      📚 수업 내용
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      오늘 배운 내용과 학습 자료 {chalkboardNotes.length}개
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {chalkboardNotes.length > 0 && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      {chalkboardNotes.length}
                    </Badge>
                  )}
                  {openSections.chalkboard ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                  )}
                </div>
              </CardTitle>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-6 pb-6">
                {chalkboardNotes.length > 0 ? (
                  <div className="space-y-4">
                    {chalkboardNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            {note.category || "일반"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {note.createdAt?.toDate?.()?.toLocaleDateString() || "날짜 없음"}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-3">{note.title}</h3>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">수업 내용이 없습니다</p>
                    <p className="text-sm">선생님이 수업 내용을 작성하면 여기에 표시됩니다</p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* 도서 내용 섹션 */}
        <Card className="overflow-hidden shadow-lg border-0">
          <Collapsible open={openSections.books} onOpenChange={() => toggleSection("books")}>
            <CollapsibleTrigger className="w-full">
              <CardTitle className="flex items-center justify-between p-6 text-left group cursor-pointer hover:bg-purple-50/50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                    <Library className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      📖 도서 내용
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      함께 읽는 책과 독서 자료 {bookContents.length}개
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {bookContents.length > 0 && (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      {bookContents.length}
                    </Badge>
                  )}
                  {openSections.books ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                  )}
                </div>
              </CardTitle>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-6 pb-6">
                {bookContents.length > 0 ? (
                  <div className="space-y-4">
                    {bookContents.map((book) => (
                      <div
                        key={book.id}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getPriorityIcon(book.priority)}</span>
                            <Badge className={getPriorityColor(book.priority).replace("red", "purple").replace("yellow", "purple").replace("green", "purple")}>
                              {book.priority === "high" && "필독"}
                              {book.priority === "medium" && "권장"}
                              {book.priority === "low" && "참고"}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {book.createdAt?.toDate?.()?.toLocaleDateString() || "날짜 없음"}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-3">{book.title}</h3>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {book.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Library className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">도서 내용이 없습니다</p>
                    <p className="text-sm">선생님이 독서 자료를 올리면 여기에 표시됩니다</p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </main>

      {/* Footer - 학생 친화적 (모바일 최적화) */}
      <footer className="bg-white border-t border-gray-200 py-6 sm:py-8 px-4 mt-12 sm:mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-base sm:text-lg text-gray-600 mb-2 leading-relaxed">
            <Heart className="w-4 h-4 inline text-pink-500 mr-1" />
            즐겁고 안전한 학습 환경 ✨
          </p>
          <p className="text-sm sm:text-base text-gray-500">
            궁금한 점이 있으면 선생님께 언제든지 물어보세요! 📝
          </p>
          <div className="mt-4 text-xs text-gray-400">
            {/* 모바일에서 아래로 스와이프하면 새로고침 안내 */}
            <span className="inline-block sm:hidden">📱 화면을 아래로 당기면 새로고침할 수 있어요</span>
          </div>
        </div>
      </footer>
    </div>
  );
}