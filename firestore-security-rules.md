# 🔥 Firestore 보안 규칙 설정 가이드

## 🚨 현재 문제: 400 에러 발생 원인
콘솔에서 발생하는 Firestore 400 에러는 **보안 규칙**이 올바르게 설정되지 않아서입니다.

## 🎯 즉시 해결 방법

### 1. Firebase Console → Firestore Database → 규칙
```
https://console.firebase.google.com/project/teacher-board-4b6ef/firestore/rules
```

### 2. 현재 규칙 확인
기본값은 모든 접근을 차단합니다:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // ← 모든 접근 차단!
    }
  }
}
```

### 3. 수업 칠판 저장용 규칙 설정 (권장)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자별 칠판 노트 (로그인 필수)
    match /users/{userId}/chalkboardNotes/{noteId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 기타 문서들 (필요시 추가)
    match /{document=**} {
      allow read, write: if false; // 나머지는 차단
    }
  }
}
```

### 4. 임시 해결책 (테스트용, 보안 위험)
모든 인증 사용자에게 허용:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🔧 설정 단계

### Step 1: Firebase Console 접속
1. https://console.firebase.google.com/project/teacher-board-4b6ef
2. **Firestore Database** 클릭
3. **규칙** 탭 선택

### Step 2: 규칙 수정
1. 위 권장 규칙을 복사해서 붙여넣기
2. **게시** 버튼 클릭
3. 몇 분 내 적용됨

### Step 3: 테스트
1. 규칙 적용 후 웹사이트 새로고침
2. 로그인 후 칠판에서 저장 테스트
3. 콘솔 에러 사라지는지 확인

## 📝 규칙 설명

### 권장 규칙의 의미:
```javascript
match /users/{userId}/chalkboardNotes/{noteId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

- `users/{userId}/chalkboardNotes/{noteId}`: 경로 구조
- `request.auth != null`: 로그인한 사용자만
- `request.auth.uid == userId`: 본인 데이터만 접근 가능

### 데이터 저장 경로:
```
users/
  └── [사용자ID]/
      └── chalkboardNotes/
          ├── [노트ID1] - 첫 번째 저장
          ├── [노트ID2] - 두 번째 저장
          └── ...
```

## ⚡ 즉시 적용 후 확인사항
1. ✅ Firestore 규칙 게시 완료
2. ✅ 웹사이트에서 로그인 상태 확인
3. ✅ 칠판 저장 버튼 클릭 테스트
4. ✅ 히스토리 불러오기 테스트
5. ✅ 콘솔 에러 해결 확인

**지금 바로 Firebase Console에서 규칙을 설정하시면 즉시 해결됩니다!** 🚀