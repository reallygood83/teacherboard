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
  firebaseAvailable: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

// Demo user object for testing when Firebase is unavailable
const createDemoUser = (): User => {
  return {
    uid: 'demo-user-123',
    email: 'demo@example.com',
    displayName: 'Demo User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [{
      uid: 'demo-user-123',
      email: 'demo@example.com',
      displayName: 'Demo User',
      providerId: 'demo.com',
      photoURL: null,
      phoneNumber: null,
    }],
    refreshToken: 'demo-refresh-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'demo-token',
    getIdTokenResult: async () => ({ token: 'demo-token', expirationTime: '', authTime: '', issuedAtTime: '', signInProvider: 'demo', claims: {} }),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
    providerId: 'demo.com',
  } as User;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseAvailable, setFirebaseAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const signInWithGoogle = async (): Promise<UserCredential> => {
    // Demo mode: simulate successful login when Firebase is unavailable
    if (isDemoMode) {
      console.log('🎭 Demo 모드: 가상 Google 로그인');
      const demoUser = createDemoUser();
      setCurrentUser(demoUser);
      
      // Return a mock UserCredential
      return {
        user: demoUser,
        providerId: 'demo.com',
        operationType: 'signIn',
      } as UserCredential;
    }
    
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
    // Demo mode: simulate successful logout
    if (isDemoMode) {
      console.log('🎭 Demo 모드: 가상 로그아웃');
      setCurrentUser(null);
      return;
    }
    
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
    
    // Firebase 초기화 상태 체크 - 타임아웃으로 무한 로딩 방지
    const initTimeout = setTimeout(() => {
      if (loading) {
        console.log('⏰ Firebase 초기화 타임아웃 - Demo 모드로 전환');
        setError('Firebase 초기화에 실패했습니다. Demo 모드로 실행됩니다.');
        setFirebaseAvailable(false);
        setIsDemoMode(true);
        
        // Demo mode: auto-login with demo user
        console.log('🎭 Demo 모드 활성화 - 자동 로그인');
        const demoUser = createDemoUser();
        setCurrentUser(demoUser);
        setLoading(false);
      }
    }, 5000); // 5초 타임아웃
    
    if (!auth) {
      console.log('❌ Firebase 초기화 실패 - Demo 모드로 전환');
      setError('Firebase 환경 변수가 설정되지 않았습니다. Demo 모드로 실행됩니다.');
      setFirebaseAvailable(false);
      setIsDemoMode(true);
      
      // Demo mode: auto-login with demo user
      console.log('🎭 Demo 모드 활성화 - 자동 로그인');
      const demoUser = createDemoUser();
      setCurrentUser(demoUser);
      setLoading(false);
      clearTimeout(initTimeout);
      return;
    }
    
    console.log('✅ Firebase Auth 리스너 설정 중...');
    setFirebaseAvailable(true);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔄 Auth 상태 변경:', {
        user: user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null,
        timestamp: new Date().toISOString()
      });
      setCurrentUser(user);
      setLoading(false);
      clearTimeout(initTimeout);
    });

    return () => {
      unsubscribe();
      clearTimeout(initTimeout);
    };
  }, []);

  const value = {
    currentUser,
    loading,
    firebaseAvailable,
    error,
    signInWithGoogle,
    signOut,
    isDemoMode,
  };

  // 로딩 상태와 관계없이 children을 렌더링하여 애플리케이션 freeze 방지
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}