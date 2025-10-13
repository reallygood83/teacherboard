# Vercel 환경변수 설정 가이드 

이 프로젝트를 Vercel에 배포하기 위해 설정해야 할 모든 환경변수와 설정 단계를 안내합니다.

## 📋 필수 환경변수 목록

### 1. Firebase 클라이언트 SDK (Next.js 앱에서 사용)
**모든 `NEXT_PUBLIC_` 환경변수는 클라이언트에서 접근 가능합니다.**

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... # Firebase 프로젝트 API 키
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=teacher-board-4b6ef.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=teacher-board-4b6ef
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=teacher-board-4b6ef.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 2. Firebase Admin SDK (서버사이드에서 사용)
```bash
FIREBASE_PROJECT_ID=teacher-board-4b6ef
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@teacher-board-4b6ef.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...실제 프라이빗 키...\n-----END PRIVATE KEY-----\n"
```

### 3. Google Calendar API (Google 캘린더 연동)
```bash
NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSy... # Google Cloud Console에서 생성한 API 키
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789012-abcdef123456.apps.googleusercontent.com
```

### 4. 개발 환경 설정 (선택사항)
```bash
# 개발 중 Firestore 에뮬레이터 사용 시
NEXT_PUBLIC_USE_FIRESTORE_EMULATOR=false  # 프로덕션에서는 false
```

## 🚀 Vercel 환경변수 설정 방법

### 방법 1: Vercel Dashboard 사용

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard 이동
   - 프로젝트 선택

2. **Settings > Environment Variables**
   - 좌측 메뉴에서 "Settings" 클릭
   - "Environment Variables" 탭 선택

3. **환경변수 추가**
   - Name: 환경변수명 입력 (예: `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - Value: 환경변수 값 입력
   - Environment: Production, Preview, Development 중 선택
   - "Add" 버튼 클릭

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치 (없다면)
npm i -g vercel

# 프로젝트 디렉토리에서 로그인
vercel login

# 환경변수 추가 (각각 실행)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production

vercel env add FIREBASE_PROJECT_ID production
vercel env add FIREBASE_CLIENT_EMAIL production
vercel env add FIREBASE_PRIVATE_KEY production

vercel env add NEXT_PUBLIC_GOOGLE_API_KEY production
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID production
```

## 🔑 API 키 발급 및 설정 방법

### 1. Firebase 설정

#### Firebase 프로젝트 설정값 확인
1. Firebase Console (https://console.firebase.google.com) 접속
2. 프로젝트 선택 → 프로젝트 설정 (⚙️)
3. "일반" 탭에서 "웹 앱" 섹션의 설정값 복사

#### Firebase Admin SDK 서비스 계정 키 생성
1. Firebase Console → 프로젝트 설정 → "서비스 계정" 탭
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드
4. JSON 파일에서 다음 값들 추출:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (줄바꿈 포함)

### 2. Google Calendar API 설정

#### Google Cloud Console 설정
1. Google Cloud Console (https://console.cloud.google.com) 접속
2. 프로젝트 선택 (Firebase와 동일 프로젝트 권장)
3. "API 및 서비스" → "라이브러리"
4. "Google Calendar API" 검색 후 활성화

#### API 키 생성
1. "API 및 서비스" → "사용자 인증 정보"
2. "+ 사용자 인증 정보 만들기" → "API 키"
3. 생성된 키를 `NEXT_PUBLIC_GOOGLE_API_KEY`에 설정

#### OAuth 2.0 클라이언트 ID 생성
1. "사용자 인증 정보" → "+ 사용자 인증 정보 만들기" → "OAuth 2.0 클라이언트 ID"
2. 애플리케이션 유형: "웹 애플리케이션"
3. 승인된 자바스크립트 원본: 
   - `http://localhost:3000` (개발용)
   - `https://your-domain.vercel.app` (프로덕션)
4. 생성된 클라이언트 ID를 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`에 설정

## ⚠️ 보안 주의사항

### 민감한 정보 처리
- **FIREBASE_PRIVATE_KEY**: JSON에서 복사할 때 `\n` 문자가 실제 줄바꿈으로 해석되도록 주의
- **API 키**: GitHub 등 공개 저장소에 절대 커밋하지 마세요
- **클라이언트 키**: `NEXT_PUBLIC_` 접두사가 있는 키는 브라우저에 노출됩니다

### API 키 제한 설정
1. **Google API 키 제한**:
   - HTTP 리퍼러 제한: `https://your-domain.vercel.app/*`
   - API 제한: Google Calendar API만 허용

2. **Firebase 보안 규칙**:
   - Firestore 보안 규칙 설정 확인
   - 인증된 사용자만 데이터 접근 허용

## 🔄 배포 후 확인사항

### 1. 기능 테스트
- [ ] 로그인/로그아웃 동작
- [ ] Firebase Firestore 데이터 읽기/쓰기
- [ ] Google Calendar 연동 (가져오기/내보내기)
- [ ] AI 기능 (Gemini API - 사용자가 설정에서 입력)

### 2. 환경변수 검증
```bash
# 로컬에서 환경변수 확인
vercel env ls

# 특정 환경변수 값 확인
vercel env get NEXT_PUBLIC_FIREBASE_API_KEY
```

### 3. 로그 확인
- Vercel Dashboard → Functions → 로그 확인
- 환경변수 관련 오류가 없는지 점검

## 🎯 완료 체크리스트

### Firebase 설정
- [ ] NEXT_PUBLIC_FIREBASE_API_KEY 설정
- [ ] NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN 설정
- [ ] NEXT_PUBLIC_FIREBASE_PROJECT_ID 설정
- [ ] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET 설정
- [ ] NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID 설정
- [ ] NEXT_PUBLIC_FIREBASE_APP_ID 설정
- [ ] FIREBASE_PROJECT_ID 설정 (서버)
- [ ] FIREBASE_CLIENT_EMAIL 설정 (서버)
- [ ] FIREBASE_PRIVATE_KEY 설정 (서버)

### Google API 설정
- [ ] NEXT_PUBLIC_GOOGLE_API_KEY 설정
- [ ] NEXT_PUBLIC_GOOGLE_CLIENT_ID 설정
- [ ] Google Calendar API 활성화
- [ ] OAuth 동의 화면 설정
- [ ] API 키 제한 설정

### 배포 확인
- [ ] Vercel 배포 성공
- [ ] 모든 기능 정상 작동
- [ ] 보안 규칙 적용 확인

## 🆘 문제 해결

### 일반적인 오류
1. **"Firebase API key not found"**
   - `NEXT_PUBLIC_FIREBASE_API_KEY` 환경변수 확인

2. **"Google Calendar API quota exceeded"**
   - Google Cloud Console에서 할당량 확인

3. **"Firebase Admin authentication failed"**
   - `FIREBASE_PRIVATE_KEY`의 줄바꿈 문자 확인
   - 서비스 계정 권한 확인

### 로그 확인 방법
```bash
# Vercel 함수 로그 실시간 확인
vercel logs --follow

# 특정 시간 범위 로그 확인
vercel logs --since=1h
```

이 가이드를 따라 모든 환경변수를 설정하면 Vercel에서 정상적으로 동작할 것입니다!