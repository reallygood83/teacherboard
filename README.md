# 우리 학급 홈페이지 (Korean Classroom Website)

*Firebase Authentication과 모바일 최적화를 갖춘 교육용 클래스 홈페이지*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/moon-jungs-projects/v0-korean-classroom-website)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

## 📱 주요 특징

### 🔐 보안 인증 시스템
- **Firebase Authentication** 통합
- 안전한 교사 계정 관리
- 실시간 인증 상태 관리

### 📱 완벽한 모바일 최적화
- **반응형 디자인**: 모든 기기에서 완벽한 사용성
- **터치 제스처**: 좌우 스와이프로 탭 전환 가능
- **모바일 전용 네비게이션**: 9개 섹션을 카테고리별로 구성
- **Touch-friendly UI**: 44px 최소 터치 영역 보장

### 🎯 9개 핵심 기능 섹션
1. **수업 도구**: 수업 칠판 + 빠른 링크
2. **AI 도구**: Gemini API 기반 공문서 생성
3. **시간표**: 오늘의 수업 일정 관리
4. **일정 관리**: 연간/월간 스케줄 관리
5. **학생 관리**: 학생 뽑기 + 모둠 편성
6. **YouTube**: 교육 동영상 검색
7. **외부 링크**: 사이트 임베딩
8. **시간 관리**: 디지털 시계 + 타이머
9. **설정**: 사이트 커스터마이징

## 🚀 기술 스택

### Frontend
- **Next.js 15** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 반응형 스타일링
- **Framer Motion** - 애니메이션
- **Lucide React** - 아이콘 시스템

### Backend & Database
- **Firebase Authentication** - 사용자 인증
- **Firebase Realtime Database** - 실시간 데이터
- **Google Gemini API** - AI 기반 문서 생성

### Mobile Optimization
- **Touch Gestures** - 스와이프 내비게이션
- **Responsive Navigation** - 모바일 전용 네비게이션
- **Mobile-first Design** - 모바일 우선 설계
- **Performance Optimization** - 빠른 로딩

## 📱 모바일 최적화 세부사항

### 네비게이션 시스템
```typescript
// 카테고리별 탭 구성
const categories = {
  main: ['수업 도구', '시간표', '시간 관리'],     // 📚 주요 기능
  tools: ['AI 도구', '학생 관리', 'YouTube', '외부 링크'],  // 🛠️ 교육 도구
  management: ['일정 관리', '설정']  // ⚙️ 관리
}
```

### 터치 제스처
- **좌우 스와이프**: 탭 간 빠른 전환
- **터치 피드백**: 버튼 누를 때 시각적 반응
- **드래그 스크롤**: 부드러운 스크롤 경험

### 반응형 디자인 브레이크포인트
- **Mobile**: < 768px - 단일 컬럼, 모바일 네비게이션
- **Tablet**: 768px - 1024px - 2컬럼 그리드
- **Desktop**: > 1024px - 3컬럼 그리드, 데스크톱 탭

## 🛠️ 로컬 개발 설정

### 1. 저장소 클론
```bash
git clone <repository-url>
cd teacherboard
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
`.env.local` 파일 생성:
```env
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

### 4. 개발 서버 시작
```bash
npm run dev
```

### 5. 빌드 및 배포
```bash
npm run build
npm start
```

## 📱 모바일 테스트 방법

### Chrome 개발자 도구
1. F12로 개발자 도구 열기
2. 모바일 기기 시뮬레이션 활성화
3. iPhone 또는 Android 기기 선택
4. 터치 스와이프 제스처 테스트

### 실제 기기 테스트
1. 개발 서버 실행 후 네트워크 주소 확인
2. 모바일 기기에서 해당 주소 접속
3. 모든 기능이 터치로 잘 작동하는지 확인

## 🎨 커스터마이징

### 색상 테마 변경
```typescript
// app/class/page.tsx에서 배경 색상 설정
const backgroundModes = {
  green: 'bg-green-50',
  blue: 'bg-blue-50',
  purple: 'bg-purple-50',
  // 더 많은 색상 옵션...
}
```

### 모바일 네비게이션 수정
```typescript
// components/mobile-navigation.tsx에서 카테고리 구성
const categoryLabels = {
  main: '📚 주요 기능',
  tools: '🛠️ 교육 도구', 
  management: '⚙️ 관리'
}
```

## 🔧 주요 컴포넌트

### 인증 시스템
- `contexts/AuthContext.tsx` - Firebase 인증 관리
- `components/auth/UserProfile.tsx` - 사용자 프로필

### 모바일 최적화 컴포넌트
- `components/mobile-navigation.tsx` - 모바일 네비게이션
- `components/mobile-card.tsx` - 모바일 최적화 카드
- `components/touch-gestures.tsx` - 터치 제스처 핸들링

### 교육 기능 컴포넌트
- `components/chalkboard.tsx` - 수업 칠판
- `components/student-picker.tsx` - 학생 뽑기
- `components/group-maker.tsx` - 모둠 편성
- `components/digital-clock.tsx` - 디지털 시계
- `components/timetable.tsx` - 시간표

## 📊 성능 최적화

### Bundle Size
- Main page: **380 kB** (First Load)
- Mobile optimized chunks
- Dynamic imports for heavy components

### 모바일 최적화 항목
- ✅ 44px 최소 터치 영역
- ✅ 16px 최소 폰트 크기 (iOS 줌 방지)
- ✅ Touch-friendly 인터랙션
- ✅ 부드러운 애니메이션
- ✅ 빠른 탭 전환

## 🚀 배포

### Vercel 배포 (권장)
1. Vercel에 GitHub 저장소 연결
2. 환경변수 설정
3. 자동 배포 완료

### 수동 배포
```bash
npm run build
npm run export  # 정적 사이트 생성
```

## 🤝 기여하기

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 🙏 감사인사

- **Firebase** - 인증 및 데이터베이스
- **Google Gemini** - AI 기능
- **Next.js Team** - 훌륭한 프레임워크
- **Tailwind CSS** - 유틸리티 CSS
- **Framer Motion** - 애니메이션

---

**교육을 위한 따뜻한 기술** ❤️

*Made with ❤️ by Claude & 김문정 선생님*

---

**🚀 최신 업데이트 (2025.08.15)**
- ✅ 검은색 배경 스타일링 문제 완전 해결
- ✅ 모바일 네비게이션 1줄 정렬 최적화
- ✅ Firebase 설정 문제 해결로 안정성 향상
- ✅ Demo 모드 지원으로 개발 환경 개선