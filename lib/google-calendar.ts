'use client';

import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';

// Declare gapi on Window to satisfy TypeScript
declare global {
  interface Window {
    gapi: any;
  }
}

interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  location?: string;
}

interface LocalEvent {
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
}

class GoogleCalendarService {
  private gapi: any = null;
  private isSignedIn: boolean = false;

  async initializeGAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google API는 브라우저 환경에서만 사용 가능합니다.'));
        return;
      }

      if ((window as any).gapi) {
        this.gapi = (window as any).gapi;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.gapi = (window as any).gapi;
        resolve();
      };
      script.onerror = () => reject(new Error('Google API 로드 실패'));
      document.head.appendChild(script);
    });
  }

  async authenticate(): Promise<boolean> {
    try {
      if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        throw new Error('Google API Key 또는 Client ID가 설정되지 않았습니다.');
      }

      await this.initializeGAPI();
      
      await new Promise<void>((resolve, reject) => {
        this.gapi.load('client:auth2', async () => {
          try {
            await this.gapi.client.init({
              apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
              clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
              scope: 'https://www.googleapis.com/auth/calendar'
            });

            const authInstance = this.gapi.auth2.getAuthInstance();
            this.isSignedIn = authInstance.isSignedIn.get();

            if (!this.isSignedIn) {
              await authInstance.signIn();
              this.isSignedIn = authInstance.isSignedIn.get();
            }
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });

      return this.isSignedIn;
    } catch (error) {
      console.error('Google Calendar 인증 실패:', error);
      throw new Error('Google Calendar 인증에 실패했습니다. API 키와 클라이언트 ID를 확인해주세요.');
    }
  }

  async getCalendarEvents(timeMin?: string, timeMax?: string): Promise<GoogleCalendarEvent[]> {
    if (!this.isSignedIn) {
      await this.authenticate();
    }

    try {
      const response = await this.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Google Calendar 이벤트 가져오기 실패:', error);
      throw new Error('Google Calendar 이벤트를 가져오는데 실패했습니다.');
    }
  }

  async createCalendarEvent(event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> {
    if (!this.isSignedIn) {
      await this.authenticate();
    }

    try {
      const response = await this.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      return response.result;
    } catch (error) {
      console.error('Google Calendar 이벤트 생성 실패:', error);
      throw new Error('Google Calendar 이벤트 생성에 실패했습니다.');
    }
  }

  async updateCalendarEvent(eventId: string, event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> {
    if (!this.isSignedIn) {
      await this.authenticate();
    }

    try {
      const response = await this.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event
      });

      return response.result;
    } catch (error) {
      console.error('Google Calendar 이벤트 수정 실패:', error);
      throw new Error('Google Calendar 이벤트 수정에 실패했습니다.');
    }
  }

  async deleteCalendarEvent(eventId: string): Promise<void> {
    if (!this.isSignedIn) {
      await this.authenticate();
    }

    try {
      await this.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });
    } catch (error) {
      console.error('Google Calendar 이벤트 삭제 실패:', error);
      throw new Error('Google Calendar 이벤트 삭제에 실패했습니다.');
    }
  }

  convertLocalToGoogleEvent(localEvent: LocalEvent): GoogleCalendarEvent {
    const googleEvent: GoogleCalendarEvent = {
      summary: localEvent.title,
      description: localEvent.description || undefined,
      location: localEvent.location || undefined,
      start: {},
      end: {}
    };

    if (localEvent.isAllDay) {
      googleEvent.start.date = localEvent.startDate;
      googleEvent.end.date = localEvent.endDate;
    } else {
      const startDateTime = localEvent.startTime 
        ? `${localEvent.startDate}T${localEvent.startTime}:00`
        : `${localEvent.startDate}T09:00:00`;
      const endDateTime = localEvent.endTime 
        ? `${localEvent.endDate}T${localEvent.endTime}:00`
        : `${localEvent.endDate}T10:00:00`;
      
      googleEvent.start.dateTime = startDateTime;
      googleEvent.start.timeZone = 'Asia/Seoul';
      googleEvent.end.dateTime = endDateTime;
      googleEvent.end.timeZone = 'Asia/Seoul';
    }

    return googleEvent;
  }

  convertGoogleToLocalEvent(googleEvent: GoogleCalendarEvent, userId: string): Partial<LocalEvent> {
    const isAllDay = !!(googleEvent.start.date && googleEvent.end.date);
    
    let startDate: string;
    let endDate: string;
    let startTime: string | undefined;
    let endTime: string | undefined;

    if (isAllDay) {
      startDate = googleEvent.start.date!;
      endDate = googleEvent.end.date!;
    } else {
      const startDateTime = new Date(googleEvent.start.dateTime!);
      const endDateTime = new Date(googleEvent.end.dateTime!);
      
      startDate = startDateTime.toISOString().split('T')[0];
      endDate = endDateTime.toISOString().split('T')[0];
      startTime = startDateTime.toTimeString().slice(0, 5);
      endTime = endDateTime.toTimeString().slice(0, 5);
    }

    return {
      title: googleEvent.summary || '제목 없음',
      description: googleEvent.description || '',
      startDate,
      endDate,
      startTime,
      endTime,
      category: 'personal' as const,
      isAllDay,
      isImportant: false,
      location: googleEvent.location || '',
      repetition: 'none' as const,
      userId
    };
  }
}

export const googleCalendarService = new GoogleCalendarService();
export type { GoogleCalendarEvent, LocalEvent };