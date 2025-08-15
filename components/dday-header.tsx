'use client';

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Clock, Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import { format, differenceInDays, isAfter, isBefore, startOfDay } from "date-fns";
import { ko } from "date-fns/locale";

interface ImportantEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  category: 'holiday' | 'school-event' | 'personal' | 'meeting' | 'consultation';
  isImportant: boolean;
  isAllDay: boolean;
  description: string;
}

interface DDayHeaderProps {
  events: ImportantEvent[];
  maxDisplay?: number; // 최대 표시할 D-Day 개수 (기본값: 3)
  onEventClick?: (event: ImportantEvent) => void;
  className?: string;
}

export function DDayHeader({ 
  events, 
  maxDisplay = 3, 
  onEventClick,
  className = "" 
}: DDayHeaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleEvents, setVisibleEvents] = useState<ImportantEvent[]>([]);
  const [displayMode, setDisplayMode] = useState<'carousel' | 'list'>('list');

  // 중요 일정 중 미래 일정만 필터링하고 날짜순 정렬
  useEffect(() => {
    const today = startOfDay(new Date());
    const upcomingEvents = events
      .filter(event => 
        event.isImportant && 
        isAfter(new Date(event.startDate), today) || 
        format(new Date(event.startDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      )
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 10); // 최대 10개까지만

    setVisibleEvents(upcomingEvents);
    
    // 표시할 이벤트가 maxDisplay보다 많으면 carousel 모드
    setDisplayMode(upcomingEvents.length > maxDisplay ? 'carousel' : 'list');
  }, [events, maxDisplay]);

  // D-Day 계산 함수
  const calculateDDay = (targetDate: string): { days: number; text: string; color: string } => {
    const today = startOfDay(new Date());
    const target = startOfDay(new Date(targetDate));
    const days = differenceInDays(target, today);
    
    if (days === 0) {
      return { days: 0, text: "D-DAY", color: "bg-red-500 text-white" };
    } else if (days > 0) {
      return { days, text: `D-${days}`, color: days <= 7 ? "bg-orange-500 text-white" : "bg-blue-500 text-white" };
    } else {
      return { days, text: `D+${Math.abs(days)}`, color: "bg-gray-500 text-white" };
    }
  };

  // 카테고리별 색상
  const getCategoryColor = (category: ImportantEvent['category']): string => {
    switch (category) {
      case 'holiday':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'school-event':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'personal':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'meeting':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'consultation':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // 카테고리 이모지
  const getCategoryEmoji = (category: ImportantEvent['category']): string => {
    switch (category) {
      case 'holiday': return '🌴';
      case 'school-event': return '🏫';
      case 'personal': return '📝';
      case 'meeting': return '👥';
      case 'consultation': return '💬';
      default: return '📅';
    }
  };

  // 다음/이전 이벤트로 이동 (carousel 모드)
  const handleNext = () => {
    if (visibleEvents.length > 0) {
      setCurrentIndex((prev) => (prev + maxDisplay) % visibleEvents.length);
    }
  };

  const handlePrev = () => {
    if (visibleEvents.length > 0) {
      setCurrentIndex((prev) => (prev - maxDisplay + visibleEvents.length) % visibleEvents.length);
    }
  };

  // 이벤트가 없으면 렌더링하지 않음
  if (visibleEvents.length === 0) {
    return null;
  }

  // 현재 표시할 이벤트들
  const eventsToShow = displayMode === 'carousel' 
    ? visibleEvents.slice(currentIndex, currentIndex + maxDisplay)
    : visibleEvents.slice(0, maxDisplay);

  return (
    <div className={`w-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3 mb-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* 헤더 타이틀 */}
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-800">중요 일정</span>
          {visibleEvents.length > maxDisplay && (
            <Badge variant="secondary" className="text-xs">
              {currentIndex + 1}-{Math.min(currentIndex + maxDisplay, visibleEvents.length)} / {visibleEvents.length}
            </Badge>
          )}
        </div>

        {/* 네비게이션 버튼 (carousel 모드일 때) */}
        {displayMode === 'carousel' && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              className="h-6 w-6 p-0 hover:bg-indigo-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="h-6 w-6 p-0 hover:bg-indigo-100"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* D-Day 이벤트 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
        {eventsToShow.map((event) => {
          const dday = calculateDDay(event.startDate);
          return (
            <div
              key={event.id}
              className={`relative flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${getCategoryColor(event.category)}`}
              onClick={() => onEventClick?.(event)}
            >
              {/* D-Day 뱃지 */}
              <div className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-bold ${dday.color}`}>
                {dday.text}
              </div>

              {/* 이벤트 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{getCategoryEmoji(event.category)}</span>
                  <span className="text-sm font-medium truncate">{event.title}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(event.startDate), 'M월 d일', { locale: ko })}</span>
                  {event.startTime && !event.isAllDay && (
                    <>
                      <Clock className="w-3 h-3 ml-1" />
                      <span>{event.startTime}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 더 많은 이벤트가 있을 때 표시 */}
      {visibleEvents.length > maxDisplay && displayMode === 'list' && (
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500">
            +{visibleEvents.length - maxDisplay}개 더 있습니다
          </span>
        </div>
      )}
    </div>
  );
}

// 간단한 인라인 D-Day 표시 컴포넌트 (헤더 타이틀 옆에 표시용)
export function InlineDDay({ 
  event, 
  className = "" 
}: { 
  event: ImportantEvent; 
  className?: string; 
}) {
  const dday = (() => {
    const today = startOfDay(new Date());
    const target = startOfDay(new Date(event.startDate));
    const days = differenceInDays(target, today);
    
    if (days === 0) return "D-DAY";
    if (days > 0) return `D-${days}`;
    return `D+${Math.abs(days)}`;
  })();

  const color = (() => {
    const today = startOfDay(new Date());
    const target = startOfDay(new Date(event.startDate));
    const days = differenceInDays(target, today);
    
    if (days === 0) return "text-red-600 bg-red-100";
    if (days <= 7) return "text-orange-600 bg-orange-100";
    return "text-blue-600 bg-blue-100";
  })();

  return (
    <Badge className={`text-xs font-bold ${color} ${className}`}>
      {event.title} {dday}
    </Badge>
  );
}