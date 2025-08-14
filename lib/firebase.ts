import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
  !appId.includes('xxxx');

if (!isValidConfig) {
  console.error('Firebase 환경 변수가 올바르게 설정되지 않았습니다.');
  console.error('Vercel 대시보드에서 실제 Firebase 설정 값을 입력해주세요.');
}

const firebaseConfig = {
  apiKey: apiKey || '',
  authDomain: authDomain || '',
  projectId: projectId || '',
  storageBucket: storageBucket || '',
  messagingSenderId: messagingSenderId || '',
  appId: appId || '',
};

// Firebase 초기화 (유효한 설정이 있을 때만)
let app: any = null;
let auth: any = null;
let googleProvider: GoogleAuthProvider | null = null;
let db: any = null;

if (isValidConfig) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
} else {
  // 빌드 시 오류 방지를 위한 더미 객체
  auth = null;
  googleProvider = null;
  db = null;
}

export { auth, googleProvider, db };
export default app;