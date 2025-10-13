import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  // 환경 변수 검증
  if (!projectId || !clientEmail || !privateKey) {
    console.error('Firebase Admin SDK 환경 변수가 누락되었습니다:', {
      projectId: !!projectId,
      clientEmail: !!clientEmail,
      privateKey: !!privateKey
    });
    throw new Error('Firebase Admin SDK 환경 변수가 올바르게 설정되지 않았습니다.');
  }
  
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId,
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();