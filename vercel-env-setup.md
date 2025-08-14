# 🚨 Vercel 환경 변수 설정 가이드 - 즉시 설정 필요!

## 현재 상황
- Firebase 환경 변수가 Vercel에 설정되지 않아서 빌드가 실패하고 있습니다
- `.env.local` 파일의 더미 값을 제거했으므로 Vercel에서 실제 값을 설정해야 합니다

## 🔥 즉시 설정해야 할 환경 변수

### 1. Vercel 대시보드 접속
1. https://vercel.com/dashboard 접속
2. `teacherboard` 프로젝트 클릭
3. **Settings** 탭 클릭
4. **Environment Variables** 섹션으로 이동

### 2. Firebase Client 설정 (6개) - 필수!
```
NEXT_PUBLIC_FIREBASE_API_KEY=실제_API_키
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=teacher-board-4b6ef.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=teacher-board-4b6ef
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=teacher-board-4b6ef.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=실제_메시징_센더_ID
NEXT_PUBLIC_FIREBASE_APP_ID=실제_앱_ID
```

### 3. Firebase Admin SDK 설정 (3개) - 필수!
```
FIREBASE_PROJECT_ID=teacher-board-4b6ef
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@teacher-board-4b6ef.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n실제_프라이빗_키_내용\n-----END PRIVATE KEY-----"
```

## 🔑 Firebase 실제 값 확인하는 방법

### Firebase Console에서 확인:
1. https://console.firebase.google.com/project/teacher-board-4b6ef
2. **프로젝트 설정** (톱니바퀴) 클릭
3. **일반** 탭에서 웹 앱 설정 확인
4. **서비스 계정** 탭에서 Admin SDK 키 다운로드

### 중요한 주의사항:
- ⚠️ `FIREBASE_PRIVATE_KEY`는 반드시 따옴표("")로 감싸고 전체 내용 복사
- ⚠️ 개행문자 `\n`는 그대로 유지해야 함
- ⚠️ 모든 `NEXT_PUBLIC_` 변수는 정확한 실제 값 필요

## 📋 설정 체크리스트
- [ ] NEXT_PUBLIC_FIREBASE_API_KEY 설정
- [ ] NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN 설정
- [ ] NEXT_PUBLIC_FIREBASE_PROJECT_ID 설정
- [ ] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET 설정
- [ ] NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID 설정
- [ ] NEXT_PUBLIC_FIREBASE_APP_ID 설정
- [ ] FIREBASE_PROJECT_ID 설정
- [ ] FIREBASE_CLIENT_EMAIL 설정
- [ ] FIREBASE_PRIVATE_KEY 설정

## 🎯 설정 완료 후
환경 변수 설정이 완료되면 자동으로 새로운 빌드가 시작됩니다.
빌드가 성공하면 Firebase 인증이 포함된 애플리케이션이 배포됩니다!

## 🆘 도움이 필요하면
Firebase Console에서 정확한 설정 값을 확인한 후 Vercel에 입력하세요.