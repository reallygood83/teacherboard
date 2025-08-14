'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  UserCredential 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseReady, logFirebaseStatus } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async (): Promise<UserCredential> => {
    if (!isFirebaseReady() || !auth || !googleProvider) {
      logFirebaseStatus();
      throw new Error('Firebase가 초기화되지 않았습니다. 환경 변수를 확인하고 페이지를 새로고침해주세요.');
    }
    
    try {
      console.log('🔐 Google 로그인 시도...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Google 로그인 성공:', {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName
      });
      return result;
    } catch (error: any) {
      console.error('❌ Google 로그인 에러:', error);
      
      // 특정 오류에 대한 사용자 친화적 메시지
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('로그인 창이 닫혔습니다. 다시 시도해주세요.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('네트워크 연결을 확인하고 다시 시도해주세요.');
      }
      
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }
    
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('로그아웃 에러:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('🔥 AuthContext: useEffect 시작, auth:', !!auth);
    
    if (!auth) {
      console.log('❌ Firebase 초기화 실패 - auth 객체 없음');
      setLoading(false);
      return;
    }
    
    console.log('✅ Firebase Auth 리스너 설정 중...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔄 Auth 상태 변경:', {
        user: user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null,
        timestamp: new Date().toISOString()
      });
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}