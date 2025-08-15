'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
import { Calendar, Clock, Plus, Trash2, Edit, ExternalLink, AlertCircle, Loader2, Timer, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, addWeeks, startOfMonth, addMonths, isToday, isSameDay, addMinutes, parse, isAfter, isBefore } from "date-fns";
import { ko } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  category: 'holiday' | 'school-event' | 'personal' | 'meeting' | 'consultation';
  isAllDay: boolean;
  isImportant: boolean;
  location?: string;
  repetition?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  userId: string;
  googleEventId?: string;
}

interface ScheduleManagerProps {
  onEventSelect?: (event: Event | null) => void;
}

export function ScheduleManager({ onEventSelect }: ScheduleManagerProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);


  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    category: 'personal' as Event['category'],
    isAllDay: false,
    isImportant: false,
    location: '',
    repetition: 'none' as Event['repetition']
  });

  // Load events from Firestore
  const loadEvents = async () => {
    if (!currentUser || !db) return;
    
    try {
      setLoading(true);
      const eventsRef = collection(db!, `users/${currentUser.uid}/events`);
      const q = query(eventsRef, orderBy('startDate', 'asc'));
      const snapshot = await getDocs(q);
      
      const loadedEvents: Event[] = [];
      snapshot.forEach((doc) => {
        loadedEvents.push({ id: doc.id, ...doc.data() } as Event);
      });
      
      setEvents(loadedEvents);
    } catch (error) {
      console.error('일정 로드 실패:', error);
      toast({
        title: "오류",
        description: "일정을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentUser]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      category: 'personal',
      isAllDay: false,
      isImportant: false,
      location: '',
      repetition: 'none'
    });
    setEditingEvent(null);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !formData.title || !formData.startDate) return;

    setSaving(true);
    try {
      const eventData = {
        ...formData,
        endDate: formData.endDate || formData.startDate,
        userId: currentUser.uid,
        createdAt: editingEvent?.createdAt || new Date().toISOString()
      };

      if (editingEvent) {
        // Update existing event
        if (!db) throw new Error('Firestore 초기화되지 않음');
        await updateDoc(doc(db!, `users/${currentUser.uid}/events`, editingEvent.id), eventData);
        toast({
          title: "성공",
          description: "일정이 수정되었습니다.",
        });
      } else {
        // Create new event
        if (!db) throw new Error('Firestore 초기화되지 않음');
        await addDoc(collection(db!, `users/${currentUser.uid}/events`), eventData);
        toast({
          title: "성공",
          description: "일정이 추가되었습니다.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('일정 저장 실패:', error);
      toast({
        title: "오류",
        description: "일정 저장에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Show delete confirmation
  const showDeleteConfirmation = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  // Delete event
  const handleDelete = async () => {
    if (!currentUser || !db || !eventToDelete) return;

    try {
      await deleteDoc(doc(db!, `users/${currentUser.uid}/events`, eventToDelete.id));
      toast({
        title: "성공",
        description: "일정이 삭제되었습니다.",
      });
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
      loadEvents();
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      toast({
        title: "오류",
        description: "일정 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };


  // Edit event
  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      category: event.category,
      isAllDay: event.isAllDay,
      isImportant: event.isImportant,
      location: event.location || '',
      repetition: event.repetition || 'none'
    });
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  // Get events for current view
  const getEventsForView = () => {
    const start = getViewStart();
    const end = getViewEnd();
    
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return eventStart <= end && eventEnd >= start;
    });
  };

  // Get view start date
  const getViewStart = () => {
    switch (currentView) {
      case 'day':
        return currentDate;
      case 'week':
        return startOfWeek(currentDate, { weekStartsOn: 0 });
      case 'month':
        return startOfMonth(currentDate);
      case 'year':
        return new Date(currentDate.getFullYear(), 0, 1);
      default:
        return currentDate;
    }
  };

  // Get view end date
  const getViewEnd = () => {
    switch (currentView) {
      case 'day':
        return currentDate;
      case 'week':
        return addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), 6);
      case 'month':
        return addDays(addMonths(startOfMonth(currentDate), 1), -1);
      case 'year':
        return new Date(currentDate.getFullYear(), 11, 31);
      default:
        return currentDate;
    }
  };

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    switch (currentView) {
      case 'day':
        setCurrentDate(prev => addDays(prev, direction === 'next' ? 1 : -1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, direction === 'next' ? 1 : -1));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, direction === 'next' ? 1 : -1));
        break;
      case 'year':
        setCurrentDate(prev => new Date(prev.getFullYear() + (direction === 'next' ? 1 : -1), prev.getMonth(), prev.getDate()));
        break;
    }
  };

  // Get category color
  const getCategoryColor = (category: Event['category']) => {
    switch (category) {
      case 'holiday':
        return 'bg-red-100 text-red-800';
      case 'school-event':
        return 'bg-blue-100 text-blue-800';
      case 'personal':
        return 'bg-green-100 text-green-800';
      case 'meeting':
        return 'bg-purple-100 text-purple-800';
      case 'consultation':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category label
  const getCategoryLabel = (category: Event['category']) => {
    switch (category) {
      case 'holiday':
        return '방학/휴일';
      case 'school-event':
        return '학교행사';
      case 'personal':
        return '개인일정';
      case 'meeting':
        return '회의';
      case 'consultation':
        return '상담';
      default:
        return category;
    }
  };

  // Handle event selection for countdown
  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    onEventSelect?.(event);
  };

  // Handle event click with context menu
  const handleEventClick = (event: Event, action?: 'edit' | 'delete') => {
    if (action === 'edit') {
      handleEdit(event);
    } else if (action === 'delete') {
      showDeleteConfirmation(event);
    } else {
      handleEventSelect(event);
    }
  };

  // Render calendar grid for month view
  const renderMonthGrid = () => {
    const start = startOfMonth(currentDate);
    const startWeek = startOfWeek(start, { weekStartsOn: 0 });
    const days = [];
    
    for (let i = 0; i < 42; i++) {
      const day = addDays(startWeek, i);
      const dayEvents = events.filter(event => 
        isSameDay(new Date(event.startDate), day) || 
        (new Date(event.startDate) <= day && new Date(event.endDate) >= day)
      );
      
      days.push(
        <div 
          key={day.toISOString()} 
          className={`min-h-24 p-2 border border-gray-200 ${
            isToday(day) ? 'bg-blue-50' : 
            day.getMonth() === currentDate.getMonth() ? 'bg-white' : 'bg-gray-50'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday(day) ? 'text-blue-600' : 
            day.getMonth() === currentDate.getMonth() ? 'text-gray-900' : 'text-gray-400'
          }`}>
            {format(day, 'd')}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div
                key={`${event.id}-${idx}`}
                className={`group relative text-xs px-1 py-0.5 rounded cursor-pointer truncate ${getCategoryColor(event.category)} hover:shadow-sm`}
                onClick={() => handleEventClick(event)}
                title={event.title}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center min-w-0">
                    {event.isImportant && <Target className="w-3 h-3 inline mr-1 flex-shrink-0" />}
                    <span className="truncate">{event.title}</span>
                  </span>
                  <div className="hidden group-hover:flex items-center gap-0.5 ml-1 flex-shrink-0">
                    <button
                      className="p-0.5 hover:bg-black/10 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event, 'edit');
                      }}
                      title="편집"
                    >
                      <Edit className="w-2.5 h-2.5" />
                    </button>
                    <button
                      className="p-0.5 hover:bg-red-500/20 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event, 'delete');
                      }}
                      title="삭제"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="p-2 bg-gray-100 text-center font-medium text-sm border-b border-gray-200">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  // Render events list
  const renderEventsList = () => {
    const viewEvents = getEventsForView();
    
    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {viewEvents.map((event) => (
          <Card key={event.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1" onClick={() => handleEventSelect(event)}>
                <div className="flex items-center gap-2 mb-1">
                  {event.isImportant && <Target className="w-4 h-4 text-red-500" />}
                  <h4 className="font-medium">{event.title}</h4>
                  <Badge className={getCategoryColor(event.category)}>
                    {getCategoryLabel(event.category)}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {event.isAllDay ? (
                      `${format(new Date(event.startDate), 'M월 d일', { locale: ko })} (종일)`
                    ) : (
                      `${format(new Date(event.startDate), 'M월 d일', { locale: ko })} ${event.startTime || ''}`
                    )}
                    {event.endDate !== event.startDate && ` ~ ${format(new Date(event.endDate), 'M월 d일', { locale: ko })}`}
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3" />
                      📍 {event.location}
                    </div>
                  )}
                  
                  {event.description && (
                    <div className="text-gray-500 text-xs">{event.description}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(event)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => showDeleteConfirmation(event)}
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {viewEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>이 기간에 등록된 일정이 없습니다.</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>일정을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with view controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">일정 관리</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              ◀
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              {format(currentDate, currentView === 'year' ? 'yyyy년' : 'yyyy년 M월', { locale: ko })}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              ▶
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View selector */}
          <Select value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">일</SelectItem>
              <SelectItem value="week">주</SelectItem>
              <SelectItem value="month">월</SelectItem>
              <SelectItem value="year">년</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Add event button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                일정 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingEvent ? '일정 수정' : '새 일정 추가'}</DialogTitle>
                <DialogDescription>
                  일정의 세부 정보를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">제목 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="일정 제목을 입력하세요"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">카테고리</Label>
                    <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">개인일정</SelectItem>
                        <SelectItem value="school-event">학교행사</SelectItem>
                        <SelectItem value="holiday">방학/휴일</SelectItem>
                        <SelectItem value="meeting">회의</SelectItem>
                        <SelectItem value="consultation">상담</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="location">장소</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="장소 (선택사항)"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="startDate">시작 날짜 *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="endDate">종료 날짜</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isAllDay}
                          onChange={(e) => setFormData(prev => ({ ...prev, isAllDay: e.target.checked }))}
                        />
                        종일 일정
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isImportant}
                          onChange={(e) => setFormData(prev => ({ ...prev, isImportant: e.target.checked }))}
                        />
                        중요 일정 (카운트다운 표시)
                      </label>
                    </div>
                  </div>
                  
                  {!formData.isAllDay && (
                    <>
                      <div>
                        <Label htmlFor="startTime">시작 시간</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="endTime">종료 시간</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="col-span-2">
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="일정에 대한 추가 설명을 입력하세요"
                      rows={3}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    취소
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingEvent ? '수정' : '추가'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Google Calendar shortcut button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('https://calendar.google.com/calendar/u/0/r/eventedit', '_blank')}
            title="구글 캘린더 일정 등록 창을 새 탭에서 열어서 일정을 추가하세요"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            구글 캘린더 일정 등록
          </Button>
        </div>
      </div>

      {/* Calendar view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {currentView === 'month' ? renderMonthGrid() : renderEventsList()}
        </div>
        
        {/* Side panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">다가오는 중요 일정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {events
                  .filter(event => 
                    event.isImportant && 
                    new Date(event.startDate) >= new Date()
                  )
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-2 rounded bg-yellow-50 border-l-4 border-yellow-400 cursor-pointer hover:bg-yellow-100"
                      onClick={() => handleEventSelect(event)}
                    >
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-sm">{event.title}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {format(new Date(event.startDate), 'M월 d일', { locale: ko })}
                        {event.startTime && ` ${event.startTime}`}
                      </div>
                    </div>
                  ))}
                
                {events.filter(event => event.isImportant && new Date(event.startDate) >= new Date()).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    중요 일정이 없습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Selected event info */}
          {selectedEvent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">선택된 일정</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-medium">{selectedEvent.title}</h3>
                  <Badge className={getCategoryColor(selectedEvent.category)}>
                    {getCategoryLabel(selectedEvent.category)}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(selectedEvent.startDate), 'yyyy년 M월 d일', { locale: ko })}
                      {selectedEvent.startTime && ` ${selectedEvent.startTime}`}
                    </div>
                    {selectedEvent.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-3 h-3" />
                        📍 {selectedEvent.location}
                      </div>
                    )}
                  </div>
                  {selectedEvent.description && (
                    <p className="text-sm text-gray-600 mt-2">{selectedEvent.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

    </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>일정 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          
          {eventToDelete && (
            <div className="py-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{eventToDelete.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {format(new Date(eventToDelete.startDate), 'yyyy년 M월 d일', { locale: ko })}
                  {eventToDelete.startTime && ` ${eventToDelete.startTime}`}
                </p>
                {eventToDelete.location && (
                  <p className="text-sm text-gray-600">📍 {eventToDelete.location}</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}