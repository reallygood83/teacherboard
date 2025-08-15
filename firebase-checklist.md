# Firebase 설정 체크리스트 🔥

## 1. Firebase Console에서 확인해야 할 것들

### 🔐 Authentication 설정
- **위치**: Firebase Console > Authentication > Sign-in method
- **확인사항**: 
  - Google 로그인이 활성화되어 있는가?
  - 승인된 도메인에 `localhost`와 Vercel 도메인이 포함되어 있는가?

### 📂 Firestore Database 설정
- **위치**: Firebase Console > Firestore Database
- **확인사항**:
  - Database가 생성되어 있는가?
  - 위치가 올바르게 설정되어 있는가? (asia-northeast3 권장)

### 🛡️ **가장 중요: Firestore 보안 규칙**
- **위치**: Firebase Console > Firestore Database > 규칙
- **현재 규칙 확인 필요**:

```javascript
// 올바른 보안 규칙 예시 (읽기/쓰기 모두 허용)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자별 데이터 접근
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 또는 임시로 모든 접근 허용 (테스트용)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### ⚠️ 확인해야 할 일반적인 문제들

1. **보안 규칙이 너무 제한적**
   - `allow read, write: if false;` → 아무도 접근 불가
   - 인증된 사용자도 데이터를 읽을 수 없음

2. **Authentication 도메인 미승인**
   - localhost가 승인된 도메인에 없음
   - Vercel 도메인이 승인된 도메인에 없음

3. **Database 위치 문제**
   - 잘못된 지역으로 설정됨

## 2. 로컬에서 테스트할 것들

### 브라우저 개발자 도구에서 확인:
1. **Console 탭**: Firebase 초기화 로그
   - "🎉 Firebase 전체 초기화 성공!" 메시지 확인
   - 오류 메시지 확인

2. **Network 탭**: Firestore 요청
   - `https://firestore.googleapis.com/` 요청들 확인
   - 403 Forbidden 오류가 있는지 확인

3. **Application 탭**: Authentication
   - 로그인된 사용자 정보 확인

### 테스트 단계:
1. 로그인 → 인증 성공 확인
2. 일정 관리 탭 → 일정 추가 테스트
3. 중요 일정 체크박스 ON → D-Day 표시 확인

## 3. 문제 해결 순서

1. **Firebase Console 보안 규칙부터 확인** ⭐ 가장 중요!
2. Authentication 도메인 승인 확인
3. 브라우저 개발자 도구에서 오류 확인
4. 로컬 환경변수 재확인

---

**주의**: 보안 규칙이 가장 흔한 문제 원인입니다!