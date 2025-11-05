# Firebase Security Rules 배포 가이드

## 📋 개요

하이브리드 스토리지 시스템(localStorage + Firebase) 구현에 따라 Firebase Security Rules를 업데이트해야 합니다.

새로운 규칙은 사용자 설정 데이터(Gemini API 키 포함)를 안전하게 보호합니다.

## 🔐 보안 규칙 내용

### 추가된 규칙

```javascript
// 사용자 설정 데이터 보안 규칙 (Gemini API 키 등)
match /users/{userId}/settings/{document=**} {
  // 읽기: 본인만 가능
  allow read: if request.auth != null && request.auth.uid == userId;

  // 쓰기/수정/삭제: 본인만 가능하며 필수 필드 검증
  allow write, update, delete: if request.auth != null
    && request.auth.uid == userId
    && validateSettings();
}
```

### 검증 함수

```javascript
function validateSettings() {
  let data = request.resource.data;
  return data.keys().hasAll([
      'title', 'subtitle', 'footerText', 'footerSubtext',
      'backgroundMode', 'geminiApiKey', 'geminiModel', 'lastUpdated'
    ])
    && data.title is string && data.title.size() > 0 && data.title.size() <= 100
    && data.subtitle is string && data.subtitle.size() <= 200
    && data.footerText is string && data.footerText.size() <= 100
    && data.footerSubtext is string && data.footerSubtext.size() <= 500
    && data.backgroundMode is string
    && data.backgroundMode in ['green', 'blue', 'purple', 'orange', 'pink', 'gray']
    && data.geminiApiKey is string && data.geminiApiKey.size() <= 100
    && data.geminiModel is string
    && data.geminiModel in ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp', 'gemini-1.0-pro']
    && data.lastUpdated is string;
}
```

## 🚀 배포 방법

### 방법 1: Firebase Console (권장)

1. **Firebase Console 접속**
   - https://console.firebase.google.com 접속
   - 프로젝트 선택

2. **Firestore Database 섹션 이동**
   - 왼쪽 메뉴에서 "Firestore Database" 클릭
   - 상단 탭에서 "규칙" 클릭

3. **규칙 업데이트**
   - 에디터에서 기존 규칙을 `firestore.rules` 파일 내용으로 교체
   - "게시" 버튼 클릭

4. **배포 확인**
   - "규칙이 게시되었습니다" 메시지 확인
   - 규칙 버전 기록에서 새 버전 확인

### 방법 2: Firebase CLI (고급 사용자)

```bash
# 1. Firebase CLI 설치 (이미 설치된 경우 생략)
npm install -g firebase-tools

# 2. Firebase 로그인
firebase login

# 3. 프로젝트 초기화 (이미 초기화된 경우 생략)
firebase init firestore

# 4. 규칙 배포
firebase deploy --only firestore:rules

# 5. 배포 확인
firebase firestore:rules
```

## ✅ 배포 확인 절차

### 1. Console에서 확인
- Firebase Console > Firestore Database > 규칙 탭
- 최신 규칙이 표시되는지 확인
- "마지막 게시" 시간이 최근인지 확인

### 2. 애플리케이션에서 테스트

#### 테스트 시나리오 1: 로그인 사용자 (정상 작동)
```
1. 로그인
2. 설정 페이지 이동
3. Gemini API 키 입력 후 저장
4. ✅ "클라우드에 안전하게 저장되었습니다" 메시지 확인
5. 브라우저 새로고침
6. ✅ 설정이 유지되는지 확인
```

#### 테스트 시나리오 2: 비로그인 사용자 (정상 작동)
```
1. 로그아웃 상태
2. 설정 페이지 이동
3. Gemini API 키 입력 후 저장
4. ✅ "로컬에만 저장되었습니다" 메시지 확인
5. 브라우저 새로고침
6. ✅ 설정이 유지되는지 확인 (localStorage)
```

#### 테스트 시나리오 3: 시크릿 모드 (정상 작동)
```
1. 시크릿/프라이빗 모드로 브라우저 열기
2. 사이트 접속
3. ⚠️ "시크릿 모드 감지" 경고 확인
4. 설정 입력 후 저장
5. 새 탭에서 사이트 재접속
6. ✅ sessionStorage 설정 유지 확인
7. 브라우저 완전 종료 후 재접속
8. ✅ 설정 초기화 확인 (정상 동작)
```

#### 테스트 시나리오 4: 보안 테스트 (권한 차단 확인)
```
1. 사용자 A로 로그인
2. 개발자 도구 > Console 열기
3. 다음 코드 실행 (사용자 B의 설정 접근 시도):

   const db = getFirestore();
   const otherUserSettings = doc(db, 'users/OTHER_USER_ID/settings/preferences');
   getDoc(otherUserSettings)
     .then(() => console.log('❌ 보안 문제: 타인 설정 접근 성공'))
     .catch(err => console.log('✅ 보안 정상:', err.message));

4. ✅ "Missing or insufficient permissions" 에러 확인
```

## 🔍 문제 해결

### 문제 1: "Missing or insufficient permissions" 에러 (로그인 사용자)

**원인**: Security Rules가 배포되지 않았거나 오래된 규칙 사용 중

**해결**:
```bash
# Firebase Console에서 규칙 확인
1. Console > Firestore Database > 규칙
2. validateSettings() 함수가 포함되어 있는지 확인
3. 없다면 firestore.rules 파일 내용을 복사하여 게시

# 또는 Firebase CLI로 강제 재배포
firebase deploy --only firestore:rules --force
```

### 문제 2: 규칙 배포 후에도 에러 발생

**원인**: 브라우저 캐시 또는 Firebase SDK 캐시

**해결**:
```bash
# 브라우저 캐시 완전 삭제
1. 개발자 도구 > Application > Storage > Clear site data
2. 브라우저 완전 종료 후 재시작
3. Hard Refresh (Cmd/Ctrl + Shift + R)

# Firebase SDK 초기화 다시 실행
window.location.reload(true)
```

### 문제 3: 기존 데이터가 규칙 위반으로 차단됨

**원인**: 기존 데이터가 새 규칙의 검증 조건을 만족하지 않음

**해결**:
```bash
# 1. Firebase Console에서 직접 수정
Console > Firestore Database > 데이터 탭
users/{userId}/settings/preferences 문서 확인
필수 필드 누락 시 추가:
- lastUpdated: "2025-01-01T00:00:00.000Z"

# 2. 또는 애플리케이션에서 재저장
- 로그인
- 설정 페이지에서 아무 설정이나 변경 후 저장
- 자동으로 lastUpdated 필드 추가됨
```

## 📊 배포 체크리스트

배포 전:
- [ ] `firestore.rules` 파일에 validateSettings() 함수 포함 확인
- [ ] Firebase Console 접속 확인
- [ ] 프로젝트 ID 확인 (teacherboard-main)

배포 중:
- [ ] Firebase Console에서 규칙 게시 완료
- [ ] "규칙이 게시되었습니다" 메시지 확인
- [ ] 브라우저 개발자 도구에 에러 없음

배포 후:
- [ ] 테스트 시나리오 1 통과 (로그인 사용자)
- [ ] 테스트 시나리오 2 통과 (비로그인 사용자)
- [ ] 테스트 시나리오 3 통과 (시크릿 모드)
- [ ] 테스트 시나리오 4 통과 (보안 테스트)

## 🎯 결론

이 보안 규칙 배포로 다음을 달성합니다:

✅ **보안**: 사용자는 본인의 설정만 읽고 쓸 수 있음
✅ **검증**: 잘못된 형식의 데이터 저장 차단
✅ **안정성**: API 키 크기 제한으로 과도한 데이터 저장 방지
✅ **호환성**: 기존 localStorage 사용자에게 영향 없음

---

**중요**: 배포 후 반드시 위의 테스트 시나리오를 모두 실행하여 정상 작동을 확인하세요!
