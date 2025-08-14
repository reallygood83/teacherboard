'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  UserCredential 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

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
    if (!auth || !googleProvider) {
      throw new Error('Firebase가 초기화되지 않았습니다. 환경 변수를 확인해주세요.');
    }
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error) {
      console.error('Google 로그인 에러:', error);
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