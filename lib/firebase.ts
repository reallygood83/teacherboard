import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';

// 환경 변수 검증
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// 더미 값 또는 누락된 환경 변수 검사
const isValidConfig = apiKey && 
  authDomain && 
  projectId && 
  storageBucket && 
  messagingSenderId && 
  appId &&
  !apiKey.includes('XXXX') && 
  !authDomain.includes('XXXX') &&
  !appId.includes('xxxx') &&
  apiKey.length > 10 &&
  projectId.length > 3;

if (!isValidConfig) {
  console.error('🔥 Firebase 환경 변수가 올바르게 설정되지 않았습니다.');
  console.error('📝 Vercel 대시보드에서 실제 Firebase 설정 값을 입력해주세요.');
  console.error('🔍 확인 필요 변수:', {
    apiKey: apiKey ? `설정됨 (${apiKey.substring(0, 10)}...)` : '❌ 누락',
    authDomain: authDomain || '❌ 누락',
    projectId: projectId || '❌ 누락',
    storageBucket: storageBucket || '❌ 누락',
    messagingSenderId: messagingSenderId || '❌ 누락',
    appId: appId ? `설정됨 (${appId.substring(0, 10)}...)` : '❌ 누락'
  });
}

const firebaseConfig = {
  apiKey: apiKey || '',
  authDomain: authDomain || '',
  projectId: projectId || '',
  storageBucket: storageBucket || '',
  messagingSenderId: messagingSenderId || '',
  appId: appId || '',
};

// Firebase 초기화 상태 추적 및 무한 루프 방지
let initializationAttempted = false;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2초
let lastRetryTime = 0;
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let db: Firestore | null = null;

// Firebase 초기화 함수 (재시도 로직 포함)
const initializeFirebase = () => {
  if (initializationAttempted) return;
  initializationAttempted = true;

  if (!isValidConfig) {
    console.warn('⚠️ Firebase 초기화 건너뜀 - 환경 변수 미설정');
    return;
  }

  try {
    console.log('🔥 Firebase 초기화 시작...');
    
    // Firebase 앱 초기화
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    console.log('✅ Firebase 앱 초기화 완료');
    
    // Auth 초기화
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('https://www.googleapis.com/auth/calendar');
    console.log('✅ Firebase Auth 초기화 완료 (Calendar 스코프 포함)');
    
    // Firestore 초기화 with 연결 설정
    db = getFirestore(app);
    
    // 로컬 개발 환경에서 에뮬레이터 연결 체크
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR === 'true') {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('🔧 Firestore 에뮬레이터 연결됨');
      } catch (error) {
        console.log('ℹ️ Firestore 에뮬레이터 연결 건너뜀 (이미 연결됨 또는 프로덕션 모드)');
      }
    }
    
    console.log('✅ Firestore 초기화 완료');
    console.log('🎉 Firebase 전체 초기화 성공!');
    
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error);
    app = null;
    auth = null;
    googleProvider = null;
    db = null;
  }
};

// 즉시 초기화 시도
initializeFirebase();

// 연결 상태 확인 함수
export const isFirebaseReady = (): boolean => {
  return !!(app && auth && db);
};

// 초기화 재시도 함수 - 무한 루프 방지
export const retryFirebaseInit = (): boolean => {
  const now = Date.now();
  
  // 무한 루프 방지: 2초 내 재시도 차단
  if (now - lastRetryTime < RETRY_DELAY) {
    console.log('🛑 Firebase 재시도 차단 - 너무 빠른 재시도');
    return false;
  }
  
  // 최대 재시도 횟수 초과 차단
  if (retryCount >= MAX_RETRIES) {
    console.log('🚫 Firebase 재시도 최대 횟수 초과', { retryCount, MAX_RETRIES });
    return false;
  }
  
  console.log(`🔄 Firebase 재초기화 시도 (${retryCount + 1}/${MAX_RETRIES})...`);
  lastRetryTime = now;
  retryCount++;
  
  // 상태 리셋
  initializationAttempted = false;
  app = null;
  auth = null;
  db = null;
  googleProvider = null;
  
  try {
    initializeFirebase();
    return true;
  } catch (error) {
    console.error('🔥 Firebase 재초기화 실패:', error);
    return false;
  }
};

// 연결 상태 로그
export const logFirebaseStatus = (): void => {
  console.log('🔥 Firebase 연결 상태:', {
    app: !!app,
    auth: !!auth,
    db: !!db,
    config: isValidConfig
  });
};

export { auth, googleProvider, db };
export default app;