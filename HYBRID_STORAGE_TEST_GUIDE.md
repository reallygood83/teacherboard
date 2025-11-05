# 하이브리드 스토리지 시스템 테스트 가이드

## 📋 개요

이 문서는 하이브리드 스토리지 시스템의 완전한 테스트 절차를 설명합니다.

**개발지침 준수**: "Always Works™" 철학에 따라 모든 시나리오에서 작동해야 합니다.

## 🎯 테스트 범위

### 테스트해야 할 5가지 핵심 시나리오

1. ✅ **일반 브라우저 + 로그인**: Firebase 클라우드 동기화
2. ✅ **일반 브라우저 + 비로그인**: localStorage 로컬 저장
3. ✅ **시크릿 모드 + 비로그인**: sessionStorage 임시 저장
4. ✅ **시크릿 모드 + 로그인**: Firebase + sessionStorage 하이브리드
5. ✅ **기존 사용자 마이그레이션**: localStorage → Firebase 자동 전환

## 🧪 테스트 환경 준비

### 1. 로컬 개발 환경

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 접속
http://localhost:3000
```

### 2. 필요한 브라우저

- Chrome (일반 + 시크릿 모드)
- Safari (일반 + 프라이빗 모드)
- Firefox (일반 + 사생활 보호 모드)

### 3. 테스트 계정

- **테스트 계정 1**: test1@example.com
- **테스트 계정 2**: test2@example.com
- **기존 사용자 시뮬레이션**: localStorage에 기존 데이터 삽입

## 📝 시나리오 1: 일반 브라우저 + 로그인

**목표**: Firebase 클라우드 동기화가 정상 작동하는지 확인

### 테스트 절차

```
1. 크롬 브라우저 열기 (일반 모드)
2. http://localhost:3000 접속
3. 로그인 버튼 클릭 → Google 계정으로 로그인
4. 설정 페이지 이동

✅ 확인 사항:
   - "클라우드 동기화 활성" 녹색 알림이 표시되는가?
   - "✅ 설정이 클라우드에 안전하게 저장되었습니다" 메시지가 있는가?

5. Gemini API 키 입력: "TEST_API_KEY_12345"
6. 모델 선택: "gemini-1.5-flash"
7. 제목 변경: "테스트 학급 홈페이지"
8. 저장 버튼 클릭 (자동 저장)

✅ 확인 사항:
   - 개발자 도구 > Console에서 "✅ Firebase 저장 성공" 로그 확인
   - 동기화 상태: "⏳ 클라우드에 동기화 중..." → "✅ 설정이 클라우드에 안전하게 저장되었습니다"

9. 브라우저 새로고침 (Cmd/Ctrl + R)

✅ 확인 사항:
   - API 키가 "TEST_API_KEY_12345"로 유지되는가?
   - 제목이 "테스트 학급 홈페이지"로 유지되는가?
   - 모델이 "gemini-1.5-flash"로 유지되는가?

10. 개발자 도구 > Application > Local Storage
    - classHomepageSettings 확인
    - lastUpdated 필드가 최신 날짜인가?

11. Firebase Console > Firestore Database
    - users/{userId}/settings/preferences 문서 확인
    - 저장된 데이터가 일치하는가?

12. 로그아웃 → 다시 로그인

✅ 확인 사항:
   - 설정이 여전히 유지되는가?
   - "✅ 설정이 클라우드에 안전하게 저장되었습니다" 메시지가 표시되는가?
```

### 예상 결과

- ✅ localStorage에 즉시 저장
- ✅ Firebase에 비동기 동기화
- ✅ 브라우저 새로고침 후에도 설정 유지
- ✅ 다른 기기에서 로그인 시 동일한 설정 로드

## 📝 시나리오 2: 일반 브라우저 + 비로그인

**목표**: localStorage 로컬 저장이 정상 작동하는지 확인

### 테스트 절차

```
1. 크롬 브라우저 열기 (일반 모드)
2. http://localhost:3000 접속
3. 로그인하지 않은 상태 확인
4. 설정 페이지 이동

✅ 확인 사항:
   - "클라우드 동기화 활성" 알림이 없는가?
   - 로그인 권유 메시지가 표시되는가?

5. Gemini API 키 입력: "LOCAL_API_KEY_67890"
6. 제목 변경: "로컬 테스트"
7. 저장 버튼 클릭

✅ 확인 사항:
   - 개발자 도구 > Console에서 "💾 localStorage 저장 성공" 로그 확인
   - "💾 로컬에만 저장되었습니다" 메시지 표시

8. 브라우저 새로고침

✅ 확인 사항:
   - API 키가 "LOCAL_API_KEY_67890"로 유지되는가?
   - 제목이 "로컬 테스트"로 유지되는가?

9. 개발자 도구 > Application > Local Storage
   - classHomepageSettings 확인
   - lastUpdated 필드 확인

10. 브라우저 완전 종료 → 재시작 → 사이트 재접속

✅ 확인 사항:
   - 설정이 여전히 유지되는가?
```

### 예상 결과

- ✅ localStorage에 저장
- ✅ Firebase 동기화 없음 (로그인 안함)
- ✅ 브라우저 재시작 후에도 설정 유지
- ❌ 다른 기기에서는 설정 없음 (로컬 전용)

## 📝 시나리오 3: 시크릿 모드 + 비로그인

**목표**: sessionStorage 임시 저장이 정상 작동하는지 확인

### 테스트 절차

```
1. 크롬 브라우저 시크릿 모드 열기 (Cmd/Ctrl + Shift + N)
2. http://localhost:3000 접속
3. 로그인하지 않은 상태
4. 설정 페이지 이동

✅ 확인 사항:
   - "⚠️ 시크릿 모드 감지" 빨간색 경고 표시되는가?
   - "설정은 브라우저를 닫으면 사라집니다" 메시지가 있는가?

5. Gemini API 키 입력: "TEMP_API_KEY_11111"
6. 제목 변경: "임시 테스트"
7. 저장 버튼 클릭

✅ 확인 사항:
   - 개발자 도구 > Console에서 "⚠️ sessionStorage 저장 (시크릿 모드)" 로그 확인
   - "⚠️ 시크릿 모드: 설정은 임시 저장됩니다" 메시지 표시

8. 새 탭 열기 (Cmd/Ctrl + T) → 사이트 재접속

✅ 확인 사항:
   - 설정이 유지되는가? (동일 시크릿 세션 내)

9. 개발자 도구 > Application > Session Storage
   - classHomepageSettings 확인

10. 시크릿 브라우저 완전 종료
11. 시크릿 모드 다시 열기 → 사이트 접속

✅ 확인 사항:
   - 설정이 초기화되었는가? (정상 동작)
   - "⚠️ 시크릿 모드 감지" 경고가 다시 표시되는가?
```

### 예상 결과

- ✅ sessionStorage에 임시 저장
- ⚠️ 시크릿 모드 경고 표시
- ✅ 새 탭에서 설정 유지 (동일 세션 내)
- ✅ 브라우저 종료 후 설정 초기화 (정상 동작)

## 📝 시나리오 4: 시크릿 모드 + 로그인

**목표**: Firebase + sessionStorage 하이브리드가 작동하는지 확인

### 테스트 절차

```
1. 크롬 브라우저 시크릿 모드 열기
2. http://localhost:3000 접속
3. 로그인 버튼 클릭 → Google 계정으로 로그인
4. 설정 페이지 이동

✅ 확인 사항:
   - "⚠️ 시크릿 모드 감지" 경고가 여전히 표시되는가?
   - "클라우드 동기화 활성" 녹색 알림도 함께 표시되는가?

5. Gemini API 키 입력: "HYBRID_API_KEY_22222"
6. 제목 변경: "하이브리드 테스트"
7. 저장 버튼 클릭

✅ 확인 사항:
   - 개발자 도구 > Console에서:
     * "⚠️ sessionStorage 저장 (시크릿 모드)" 로그
     * "✅ Firebase 저장 성공" 로그
   - "✅ 설정이 클라우드에 안전하게 저장되었습니다" 메시지

8. 시크릿 브라우저 새로고침

✅ 확인 사항:
   - 설정이 유지되는가? (sessionStorage + Firebase)

9. 시크릿 브라우저 완전 종료
10. 일반 크롬 브라우저 열기 → 사이트 접속 → 로그인 (동일 계정)

✅ 확인 사항:
   - API 키가 "HYBRID_API_KEY_22222"로 로드되는가?
   - 제목이 "하이브리드 테스트"로 로드되는가?
   - Firebase에서 설정을 가져왔다는 로그가 있는가?
```

### 예상 결과

- ✅ sessionStorage에 임시 저장
- ✅ Firebase에 영구 저장
- ✅ 시크릿 모드 종료 후에도 Firebase에서 복원 가능
- ✅ 다른 기기/브라우저에서 동일한 설정 사용 가능

## 📝 시나리오 5: 기존 사용자 마이그레이션

**목표**: 기존 localStorage 데이터가 자동으로 Firebase로 마이그레이션되는지 확인

### 테스트 절차

```
1. 일반 크롬 브라우저 열기
2. http://localhost:3000 접속
3. 로그아웃 상태 확인
4. 개발자 도구 > Console에서 다음 코드 실행:

   // 기존 사용자 localStorage 데이터 시뮬레이션
   localStorage.setItem('classHomepageSettings', JSON.stringify({
     title: "기존 사용자 학급",
     subtitle: "마이그레이션 테스트",
     footerText: "기존 푸터",
     footerSubtext: "© 2024 기존 사용자",
     backgroundMode: "blue",
     geminiApiKey: "OLD_USER_API_KEY_99999",
     geminiModel: "gemini-1.5-pro",
     lastUpdated: "2024-12-01T00:00:00.000Z"
   }))

5. 브라우저 새로고침
6. 설정 페이지 이동

✅ 확인 사항:
   - 제목이 "기존 사용자 학급"으로 표시되는가?
   - API 키가 "OLD_USER_API_KEY_99999"로 표시되는가?
   - 모델이 "gemini-1.5-pro"로 표시되는가?

7. 로그인 버튼 클릭 → Google 계정으로 로그인

✅ 확인 사항:
   - 개발자 도구 > Console에서:
     * "📤 기존 localStorage 데이터를 Firebase로 마이그레이션 중..." 로그
     * "✅ Firebase 마이그레이션 완료" 로그
   - 설정이 그대로 유지되는가?

8. Firebase Console > Firestore Database
   - users/{userId}/settings/preferences 문서 확인

✅ 확인 사항:
   - 마이그레이션된 데이터가 정확히 저장되었는가?
   - lastUpdated가 현재 시간으로 업데이트되었는가?

9. 로그아웃 → 브라우저 완전 종료
10. localStorage 삭제:

    localStorage.removeItem('classHomepageSettings')

11. 브라우저 재시작 → 사이트 접속 → 로그인 (동일 계정)

✅ 확인 사항:
   - localStorage가 비어있어도 Firebase에서 설정을 복원하는가?
   - API 키가 "OLD_USER_API_KEY_99999"로 복원되는가?
```

### 예상 결과

- ✅ 기존 localStorage 데이터 인식
- ✅ 로그인 시 자동으로 Firebase로 업로드
- ✅ localStorage 삭제 후에도 Firebase에서 복원
- ✅ Zero-downtime 마이그레이션 (사용자 경험 중단 없음)

## 🔍 고급 테스트 시나리오

### 충돌 해결 테스트

**목표**: 여러 기기에서 동시 수정 시 타임스탬프 기반 충돌 해결

```
1. 크롬 브라우저 (기기 A) 열기 → 로그인
2. 파이어폭스 브라우저 (기기 B) 열기 → 동일 계정 로그인
3. 기기 A에서 API 키 변경: "DEVICE_A_KEY"
4. 기기 B에서 API 키 변경: "DEVICE_B_KEY" (기기 A 이후)
5. 기기 A 새로고침

✅ 확인 사항:
   - 기기 A에 "DEVICE_B_KEY"가 로드되는가?
   - Console에 "Firebase가 더 최신 데이터입니다" 로그 확인
```

### 네트워크 오프라인 테스트

**목표**: 오프라인 상태에서도 localStorage로 작동하는지 확인

```
1. 크롬 브라우저 열기 → 로그인
2. 개발자 도구 > Network 탭 > "Offline" 선택
3. 설정 페이지에서 API 키 변경: "OFFLINE_KEY"
4. 저장 버튼 클릭

✅ 확인 사항:
   - "💾 로컬에만 저장되었습니다" 메시지 표시
   - Console에 "❌ Firebase 저장 실패: Network error" 로그
   - localStorage에는 정상 저장되었는가?

5. Network 탭 > "Online" 선택
6. 브라우저 새로고침

✅ 확인 사항:
   - Firebase에 자동 동기화되는가?
   - "✅ 설정이 클라우드에 안전하게 저장되었습니다" 메시지 표시
```

## 📊 테스트 체크리스트

### 기능 테스트

- [ ] 시나리오 1: 일반 브라우저 + 로그인 (Firebase 동기화)
- [ ] 시나리오 2: 일반 브라우저 + 비로그인 (localStorage)
- [ ] 시나리오 3: 시크릿 모드 + 비로그인 (sessionStorage)
- [ ] 시나리오 4: 시크릿 모드 + 로그인 (하이브리드)
- [ ] 시나리오 5: 기존 사용자 마이그레이션
- [ ] 충돌 해결 테스트 (타임스탬프 비교)
- [ ] 오프라인 모드 테스트

### 브라우저 호환성

- [ ] Chrome (Windows/Mac)
- [ ] Safari (Mac/iOS)
- [ ] Firefox (Windows/Mac)
- [ ] Edge (Windows)

### 데이터 무결성

- [ ] API 키 정확히 저장/로드
- [ ] 모든 설정 필드 유지
- [ ] lastUpdated 자동 업데이트
- [ ] 특수문자 포함 데이터 처리

### 사용자 경험

- [ ] 저장 중 로딩 인디케이터
- [ ] 성공/실패 메시지 명확
- [ ] 시크릿 모드 경고 표시
- [ ] Firebase 동기화 상태 표시

### 보안

- [ ] 타인의 설정 접근 차단
- [ ] API 키 암호화 전송 (HTTPS)
- [ ] Firebase Security Rules 적용
- [ ] XSS/CSRF 방어

## 🐛 알려진 이슈 및 해결책

### 이슈 1: "localStorage is not defined"

**원인**: 서버사이드 렌더링 중 localStorage 접근

**해결**:
```typescript
if (typeof window !== 'undefined') {
  // localStorage 사용
}
```

### 이슈 2: 시크릿 모드 감지 실패

**원인**: 일부 브라우저에서 localStorage.setItem()이 예외를 던지지 않음

**해결**:
```typescript
try {
  const test = '__storage_test__'
  localStorage.setItem(test, test)
  localStorage.removeItem(test)
  return true
} catch {
  return false
}
```

### 이슈 3: Firebase 동기화 지연

**원인**: 네트워크 지연 또는 Firebase 응답 지연

**해결**:
- localStorage에 즉시 저장 (UI 즉시 반응)
- Firebase 비동기 저장 (백그라운드)
- 사용자에게 동기화 상태 표시

## 🎯 성공 기준

모든 테스트 시나리오에서:

✅ **기능성**: 설정이 정확히 저장/로드됨
✅ **안정성**: 브라우저 재시작 후에도 데이터 유지
✅ **보안성**: 본인의 설정만 접근 가능
✅ **사용자 경험**: 명확한 피드백 메시지
✅ **호환성**: 모든 브라우저와 모드에서 작동
✅ **Zero-downtime**: 기존 사용자 경험 중단 없음

---

**중요**: 모든 시나리오를 완료한 후 Production 배포를 진행하세요!
