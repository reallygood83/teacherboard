# 📚 Teacher Board - 학생 연결 시스템 개발 계획서

## 🎯 프로젝트 개요

Teacher Board와 학생들을 연결하는 실시간 협업 시스템을 구축하여, 교사와 학생 간의 원활한 소통과 수업 참여를 지원합니다.

---

## 📋 단순화된 핵심 요구사항

### 현재 요구사항 (단순화)
- ✅ 고정 URL 학생 페이지
- ✅ 교사 설정 코드로 접근
- ✅ 교사 칠판 내용 단방향 공유 (실시간 동기화 제거)
- ✅ 읽기 전용 학급 공유 노트
- ❌ 메시징/채팅 기능 제거
- ❌ 양방향 소통 제거

### 4개 섹션 구조
1. **📢 공지사항 섹션**: 교사가 작성한 공지사항
2. **🔗 링크 공유**: 수업 링크 복사 및 SNS 공유
3. **📝 수업 내용 섹션**: 오늘 배운 내용 정리
4. **📚 교과서 내용 섹션**: 교과서 진도 및 숙제

---

## 🏗️ 시스템 아키텍처

### 1. URL 구조
```
🌐 학생 페이지 URL 패턴:
https://teacherboard.vercel.app/student/{sessionCode}

예시:
- https://teacherboard.vercel.app/student/ABC123
- https://teacherboard.vercel.app/student/MATH2024
- https://teacherboard.vercel.app/student/CLASS5A
```

### 2. 단순화된 데이터베이스 구조 (Firebase Firestore)
```
📂 Collections (단순화):
├── 📁 users/{teacherId}/
│   └── 📄 sessions/{sessionId}
│       ├── sessionCode: "ABC123"
│       ├── className: "5학년 1반"
│       ├── subject: "수학"
│       ├── isActive: true
│       ├── createdAt: timestamp
│       ├── expiresAt: timestamp
│       │
│       ├── notices: ["공지사항1", "공지사항2"]
│       ├── classContent: "오늘 배운 내용..."
│       ├── bookContent: "교과서 84-87페이지..."
│       └── lastUpdated: timestamp
│
├── 📁 sharedClassrooms/{sessionCode}/  
│   ├── notices: [...] 
│   ├── classContent: "..."
│   ├── bookContent: "..."
│   └── lastUpdated: timestamp
```

---

## 🎨 UI/UX 설계

### 단순화된 학생 페이지 레이아웃 (접이식 섹션 구조)
```
┌─────────────────────────────────────┐
│ 🎓 Teacher Board - 학생용          │ 
├─────────────────────────────────────┤
│ 📚 [수학 - 5학년 1반]              │
├─────────────────────────────────────┤
│                                     │
│ ▼ 📢 공지사항 섹션 [접기/펼치기]    │
│ ┌─────────────────────────────────┐ │
│ │ • 내일 수학 시험 있습니다       │ │
│ │ • 교과서 84페이지 예습하세요    │ │
│ │ • 모둠 과제 발표 준비           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ▼ 🔗 링크 공유 [접기/펼치기]       │
│ ┌─────────────────────────────────┐ │
│ │ [📋 이 수업 링크 복사하기]      │ │
│ │ [📱 카카오톡으로 공유]          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ▼ 📝 수업 내용 섹션 [접기/펼치기]   │
│ ┌─────────────────────────────────┐ │
│ │ 오늘 배운 내용:                 │ │
│ │ 1. 분수의 덧셈                  │ │
│ │ 2. 분모가 다른 분수 계산        │ │
│ │ 3. 연습 문제 풀이               │ │
│ │                                 │ │
│ │ 📊 [첨부된 자료/이미지]         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ▼ 📚 교과서 내용 섹션 [접기/펼치기] │
│ ┌─────────────────────────────────┐ │
│ │ 📖 교과서 84-87페이지           │ │
│ │ • 분수의 기본 개념              │ │
│ │ • 분모가 같은 분수 덧셈         │ │
│ │ • 분모가 다른 분수 덧셈         │ │
│ │                                 │ │
│ │ 🏠 숙제: 연습장 15번까지        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 접이식 섹션 컴포넌트 구조
```typescript
interface CollapsibleSection {
  id: string;
  title: string;
  icon: string;
  content: ReactNode;
  defaultOpen: boolean;  // 기본값: 모두 열려있음 (true)
  isEmpty?: boolean;     // 내용이 없으면 회색 표시
}

const sections: CollapsibleSection[] = [
  {
    id: "notices",
    title: "공지사항 섹션",
    icon: "📢",
    defaultOpen: true,    // 기본값: 열려있음
    content: <NoticesContent />
  },
  {
    id: "share-links", 
    title: "링크 공유",
    icon: "🔗",
    defaultOpen: true,    // 기본값: 열려있음
    content: <ShareLinksContent />
  },
  {
    id: "class-content",
    title: "수업 내용 섹션", 
    icon: "📝",
    defaultOpen: true,    // 기본값: 열려있음
    content: <ClassContent />
  },
  {
    id: "book-content",
    title: "교과서 내용 섹션",
    icon: "📚", 
    defaultOpen: true,    // 기본값: 열려있음
    content: <BookContent />
  }
];

// 접이식 섹션 컴포넌트 예시
function CollapsibleSection({ section }: { section: CollapsibleSection }) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen); // 기본값 적용
  
  return (
    <div className="border rounded-lg mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-blue-50"
      >
        <span className="flex items-center gap-2">
          <span>{section.icon}</span>
          <span className="font-medium">{section.title}</span>
        </span>
        <span className="text-blue-600">
          {isOpen ? "▼" : "▶"}
        </span>
      </button>
      
      {isOpen && (
        <div className="p-4 border-t bg-white">
          {section.content}
        </div>
      )}
    </div>
  );
}
```

---

## ⚙️ 기술 구현 계획

### Phase 1: 기본 연결 시스템 (2주)

#### 1.1 교사용 세션 관리 컴포넌트
```typescript
// components/session-manager.tsx
interface SessionConfig {
  sessionCode: string;
  className: string;
  subject: string;
  duration: number; // 분
  allowQuestions: boolean;
  requireName: boolean;
}

// 기능:
// - 세션 코드 생성 (6자리 랜덤)
// - 세션 활성화/비활성화
// - 연결된 학생 수 실시간 표시
// - 세션 만료 시간 설정
```

#### 1.2 학생용 접근 페이지
```typescript
// app/student/[sessionCode]/page.tsx
// 기능:
// - 세션 코드 유효성 검증
// - 닉네임 입력 (선택사항)
// - 실시간 칠판 내용 동기화
// - 메시지 전송 기능
```

#### 1.3 실시간 동기화 시스템
```typescript
// lib/realtime-sync.ts
// Firebase Realtime Database 활용:
// - 칠판 내용 실시간 업데이트
// - 학생 연결 상태 추적
// - 메시지 실시간 전송/수신
```

### Phase 2: 고급 기능 추가 (3주)

#### 2.1 질문/답변 시스템
```typescript
// components/student-qa-system.tsx
interface Question {
  id: string;
  studentName: string;
  content: string;
  timestamp: Date;
  isAnswered: boolean;
  teacherReply?: string;
}

// 기능:
// - 익명/기명 질문 선택
// - 질문 우선순위 표시
// - 교사 답변 알림
```

#### 2.2 출석 체크 자동화
```typescript
// components/attendance-tracker.tsx
// 기능:
// - 세션 접속 시 자동 출석 체크
// - 접속 시간/종료 시간 기록
// - 출석률 통계 제공
```

#### 2.3 과제 제출 시스템
```typescript
// components/assignment-submission.tsx
// 기능:
// - 텍스트 과제 제출
// - 이미지/파일 업로드
// - 제출 현황 추적
```

---

## 🔧 단순화된 개발 우선순위

### 🥇 1순위 (MVP - 2주 목표)
1. **세션 관리 시스템**
   - 교사용 세션 생성/관리 UI
   - 학생용 세션 접속 페이지 (`/student/[sessionCode]`)
   - Firebase 단순 동기화 (실시간 제거)

2. **4개 섹션 구현**
   - 📢 공지사항 섹션 (교사 작성)
   - 🔗 링크 공유 버튼 
   - 📝 수업 내용 섹션
   - 📚 교과서 내용 섹션

3. **접이식 UI 구현**
   - 모든 섹션 접기/펼치기 가능
   - 기본값: 모든 섹션 열려있음
   - 토글 상태 저장 (localStorage)

### 🥈 2순위 (확장 기능 - 4주 목표) 
1. **교사용 편집 UI 개선**
2. **모바일 최적화**
3. **세션 만료 관리**

### ❌ 제거된 기능들
- 실시간 채팅/메시징 시스템
- 질문/답변 시스템  
- 출석 체크 자동화
- 과제 제출 시스템
- 학습 진도 추적

---

## 📱 사용자 경험 시나리오

### 교사 관점
```
1. 📝 수업 시작 전
   → "학생 연결" 탭에서 새 세션 생성
   → 세션 코드 "MATH123" 생성
   → 학생들에게 코드 안내

2. 🎓 수업 중
   → 칠판에 내용 작성 (자동으로 학생에게 동기화)
   → 학생 질문 실시간 확인
   → 필요시 답변 작성

3. 📊 수업 후
   → 출석 현황 확인
   → 학생 질문/의견 검토
   → 세션 종료 또는 연장
```

### 학생 관점 (단순화)
```
1. 🔗 수업 참여  
   → teacherboard.vercel.app/student/MATH123 접속
   → 바로 학급 공유 노트 확인
   → 4개 섹션 모두 열려있는 상태로 시작

2. 📱 사용 방식
   → 📢 공지사항 확인 (시험, 숙제 안내)
   → 📝 수업 내용 읽기 (오늘 배운 것)
   → 📚 교과서 진도 확인 (숙제 범위)  
   → 🔗 친구들과 링크 공유

3. 📚 복습 활용
   → 언제든 접속해서 내용 복습
   → 섹션별로 필요한 부분만 펼쳐서 보기
   → 모바일에서 간편하게 확인
```

---

## 🛡️ 보안 및 안전성

### 보안 조치
1. **세션 코드 보안**
   - 6-8자리 랜덤 코드 생성
   - 일정 시간 후 자동 만료
   - 무단 접속 시도 제한

2. **학생 메시지 필터링**
   - 부적절한 언어 자동 필터
   - 스팸 메시지 차단
   - 교사 승인 후 표시 옵션

3. **개인정보 보호**
   - 학생 개인 정보 최소 수집
   - 익명 참여 옵션 제공
   - GDPR/개인정보보호법 준수

### 안전한 학습 환경
- 교사 모더레이션 도구
- 부적절한 행동 신고 기능
- 세션별 접근 권한 관리

---

## 📊 성공 지표 (KPI)

### 기술적 지표
- ⚡ 실시간 동기화 지연시간: < 500ms
- 📱 모바일 호환성: iOS/Android 100%
- 🔗 동시 접속자: 세션당 최대 50명
- ⏱️ 시스템 가용률: 99.5% 이상

### 교육적 지표
- 👥 세션 참여율: 90% 이상
- 💬 학생 질문 활성도: 수업당 평균 5개
- 📈 교사 만족도: 4.5/5.0 이상
- 🎯 재사용률: 교사 80% 재사용

---

## 🗓️ 개발 일정

### 1주차 - 프로젝트 설정
- [ ] Next.js 라우팅 구조 설계
- [ ] Firebase Realtime Database 설정
- [ ] 기본 UI 컴포넌트 제작

### 2주차 - 세션 관리 시스템
- [ ] 교사용 세션 생성 UI
- [ ] 학생용 접속 페이지
- [ ] 세션 코드 검증 로직

### 3주차 - 실시간 동기화
- [ ] 칠판 내용 실시간 동기화
- [ ] 연결 상태 관리
- [ ] 에러 처리 및 재연결

### 4주차 - 메시징 시스템
- [ ] 학생 메시지 전송
- [ ] 교사 알림 시스템
- [ ] 메시지 필터링

### 5-6주차 - 질문/답변 시스템
- [ ] Q&A 컴포넌트 제작
- [ ] 우선순위 표시
- [ ] 답변 알림 기능

### 7-8주차 - 테스트 및 배포
- [ ] 기능 테스트
- [ ] 성능 최적화
- [ ] 프로덕션 배포

---

## 💰 예상 비용 및 리소스

### 개발 리소스
- **개발자**: 1명 (풀타임 8주)
- **디자이너**: 0.5명 (파트타임 4주)
- **QA 테스터**: 0.5명 (파트타임 2주)

### 인프라 비용 (월간)
- **Firebase**: $25-50 (실시간 DB + Storage)
- **Vercel**: $0 (Hobby Plan으로 충분)
- **총 월 비용**: ~$30-60

### 추가 고려사항
- 학교별 맞춤화 요청
- 다국어 지원 (영어, 한국어)
- 접근성 개선 (시각/청각 장애 지원)

---

## 🚀 장기 비전

### 6개월 후
- 🏫 **다중 학교 지원**: 학교별 브랜딩
- 📊 **고급 분석**: 학습 패턴 분석
- 🎮 **게이미피케이션**: 참여 점수 시스템

### 1년 후
- 🤖 **AI 교사 보조**: 자동 질문 분류
- 📱 **모바일 앱**: 네이티브 앱 출시
- 🌏 **글로벌 확장**: 다국어 완전 지원

### 2년 후
- 🎓 **LMS 통합**: 기존 학습관리시스템 연동
- 📈 **빅데이터 분석**: 교육 효과성 측정
- 🏆 **에듀테크 리더**: 교육 혁신 플랫폼

---

## 📞 다음 단계

### 즉시 실행 가능한 작업
1. **기술 스택 최종 확정**
2. **Firebase 프로젝트 설정**
3. **MVP 프로토타입 제작** (1주 목표)
4. **교사 피드백 수집** (파일럿 테스트)

### 의사결정 필요사항
- [ ] 익명 vs 실명 참여 방식
- [ ] 메시지 실시간 vs 배치 처리
- [ ] 모바일 웹 vs 네이티브 앱 우선순위
- [ ] 유료화 계획 및 가격 정책

---

**🎯 목표**: 교사와 학생이 더 가깝게 소통할 수 있는 혁신적인 교육 플랫폼 구축

**💡 핵심 가치**: 접근성, 실시간성, 안전성, 사용자 친화성

*이 계획서는 Teacher Board의 새로운 도약을 위한 로드맵입니다. 함께 교육의 미래를 만들어가겠습니다!* 🚀