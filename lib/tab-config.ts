// Tab configuration for the class homepage
// Separated to avoid circular dependencies and hoisting issues

import { 
  BookOpen, 
  Brain, 
  Calendar, 
  Users, 
  Play, 
  Link, 
  Clock, 
  SettingsIcon 
} from "lucide-react"

export interface TabInfo {
  id: string
  label: string
  icon: any
  description: string
  category: 'main' | 'tools' | 'management'
}

export const tabConfig: TabInfo[] = [
  {
    id: "tools",
    label: "수업 도구",
    icon: BookOpen,
    description: "수업 칠판과 빠른 링크",
    category: "main" as const
  },
  {
    id: "ai-tools",
    label: "AI 도구", 
    icon: Brain,
    description: "AI 기반 문서 생성",
    category: "tools" as const
  },
  {
    id: "schedule",
    label: "시간표",
    icon: Calendar,
    description: "오늘의 수업 일정",
    category: "main" as const
  },
  {
    id: "schedule-management",
    label: "일정 관리",
    icon: Calendar,
    description: "방학, 행사 등 전체 일정",
    category: "management" as const
  },
  {
    id: "students",
    label: "학생 관리",
    icon: Users,
    description: "학생 뽑기와 모둠 편성",
    category: "tools" as const
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: Play,
    description: "교육 동영상 검색",
    category: "tools" as const
  },
  {
    id: "links",
    label: "외부 링크",
    icon: Link,
    description: "외부 사이트 임베딩",
    category: "tools" as const
  },
  {
    id: "time",
    label: "시간 관리",
    icon: Clock,
    description: "현재 시간과 수업 타이머",
    category: "main" as const
  },
  {
    id: "settings",
    label: "설정",
    icon: SettingsIcon,
    description: "홈페이지 설정 관리",
    category: "management" as const
  }
]

// Helper function to get tab IDs
export const getTabIds = (): string[] => tabConfig.map(tab => tab.id)

// Helper function to find tab by ID
export const findTabById = (id: string): TabInfo | undefined => 
  tabConfig.find(tab => tab.id === id)