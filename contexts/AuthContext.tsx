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
    if (!auth) {
      // Firebase가 초기화되지 않은 경우 로딩 상태 해제
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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