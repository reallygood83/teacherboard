# 🔥 Firebase 실제 설정 값 확인 및 Vercel 설정 가이드

## 📋 현재 상황
- Vercel에 환경 변수가 설정되어 있지만 올바른 값이 아님
- `NEXT_PUBLIC_FIREBASE_API` → `NEXT_PUBLIC_FIREBASE_API_KEY`로 수정 필요
- 실제 Firebase 값으로 업데이트 필요

## 🚀 Firebase Console에서 실제 값 확인하기

### 1. Firebase Console 접속
```
https://console.firebase.google.com/project/teacher-board-4b6ef
```

### 2. 웹 앱 설정 정보 확인
1. **프로젝트 설정** (톱니바퀴 아이콘) 클릭
2. **일반** 탭 선택
3. **내 앱** 섹션에서 웹 앱 찾기
4. **구성** 버튼 클릭하여 설정 정보 확인

### 3. 확인해야 할 실제 값들
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...", // ← 이 값을 NEXT_PUBLIC_FIREBASE_API_KEY에
  authDomain: "teacher-board-4b6ef.firebaseapp.com",
  projectId: "teacher-board-4b6ef",
  storageBucket: "teacher-board-4b6ef.appspot.com",
  messagingSenderId: "12345...", // ← 이 값을 NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID에
  appId: "1:12345...:web:abc..." // ← 이 값을 NEXT_PUBLIC_FIREBASE_APP_ID에
};
```

## 🔑 Service Account 키 확인하기

### 1. Firebase Console → 프로젝트 설정 → 서비스 계정
1. **서비스 계정** 탭 클릭
2. **새 비공개 키 생성** 버튼 클릭
3. JSON 파일 다운로드

### 2. JSON 파일에서 필요한 값 확인
```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\n...", // ← FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-...@...iam.gserviceaccount.com", // ← FIREBASE_CLIENT_EMAIL
  "project_id": "teacher-board-4b6ef" // ← FIREBASE_PROJECT_ID
}
```

## 🎯 Vercel 환경 변수 수정하기

### 방법 1: Vercel 대시보드 (권장)
1. https://vercel.com/dashboard
2. teacherboard 프로젝트 선택
3. Settings → Environment Variables
4. 기존 잘못된 변수들 수정:

```
❌ NEXT_PUBLIC_FIREBASE_API (잘못됨)
✅ NEXT_PUBLIC_FIREBASE_API_KEY (올바름)

기존 환경 변수들을 실제 Firebase 값으로 업데이트:
- NEXT_PUBLIC_FIREBASE_API_KEY=실제_API_키
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=실제_센더_ID  
- NEXT_PUBLIC_FIREBASE_APP_ID=실제_앱_ID
- FIREBASE_PRIVATE_KEY="실제_프라이빗_키_전체"
```

### 방법 2: Vercel CLI (현재 프로젝트 연결됨)
```bash
# 잘못된 변수 제거
vercel env rm NEXT_PUBLIC_FIREBASE_API

# 올바른 변수 추가
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# → 실제 Firebase API 키 입력

# 다른 변수들도 실제 값으로 업데이트
vercel env add FIREBASE_PRIVATE_KEY
# → 전체 private key 입력 (따옴표 포함)
```

## ✅ 설정 완료 후
1. 환경 변수 수정 완료 시 자동으로 새 빌드 시작
2. 빌드 성공하면 Firebase 인증 정상 작동
3. 로컬에서도 실제 Firebase 값으로 테스트 가능

## 🆘 빠른 해결책
**가장 빠른 방법**: Vercel 대시보드에서 직접 수정
1. 기존 환경 변수들을 실제 Firebase Console 값으로 교체
2. `NEXT_PUBLIC_FIREBASE_API` → `NEXT_PUBLIC_FIREBASE_API_KEY`로 이름 수정
3. 저장하면 자동 재배포 시작!

Firebase Console에서 설정 값을 확인하신 후 Vercel에서 수정해주세요! 🔥