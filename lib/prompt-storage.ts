import { auth, db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';

// 프롬프트 인터페이스 정의
export interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: any;
  updatedAt: any;
  usage: number; // 사용 횟수
}

// 프롬프트 카테고리
export const PROMPT_CATEGORIES = {
  CLASS_PREP: '수업 준비',
  HOMEWORK: '숙제 관리',
  COMMUNICATION: '소통 문서',
  EVALUATION: '평가 관련',
  PLANNING: '계획 수립',
  OTHER: '기타'
} as const;

// 기본 프롬프트 템플릿
export const DEFAULT_PROMPTS: Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt' | 'usage'>[] = [
  {
    title: '오늘 배운 내용 정리',
    content: '오늘 배운 내용을 정리해주세요',
    category: PROMPT_CATEGORIES.CLASS_PREP
  },
  {
    title: '숙제 공지 작성',
    content: '학생들에게 숙제를 내주는 공지를 작성해주세요',
    category: PROMPT_CATEGORIES.HOMEWORK
  },
  {
    title: '내일 수업 계획',
    content: '내일 수업 계획을 세워주세요',
    category: PROMPT_CATEGORIES.PLANNING
  },
  {
    title: '학부모 상담 정리',
    content: '학부모 상담 내용을 정리해주세요',
    category: PROMPT_CATEGORIES.COMMUNICATION
  },
  {
    title: '교실 규칙 생성',
    content: '교실 규칙을 만들어주세요',
    category: PROMPT_CATEGORIES.CLASS_PREP
  },
  {
    title: '평가 기준표 작성',
    content: '이번 단원에 대한 평가 기준표를 작성해주세요',
    category: PROMPT_CATEGORIES.EVALUATION
  }
];

// 로컬 스토리지 키
const LOCAL_STORAGE_KEY = 'teacherboard_saved_prompts';

// Firebase에서 프롬프트 목록 가져오기
export const getSavedPrompts = async (): Promise<SavedPrompt[]> => {
  try {
    // Firebase 사용자 확인
    if (!auth?.currentUser || !db) {
      // 로컬 스토리지에서 가져오기
      const localPrompts = getLocalPrompts();
      return localPrompts;
    }

    const userId = auth.currentUser.uid;
    const promptsRef = collection(db, `users/${userId}/prompts`);
    const q = query(promptsRef, orderBy('usage', 'desc'), orderBy('updatedAt', 'desc'));
    
    const snapshot = await getDocs(q);
    const prompts: SavedPrompt[] = [];
    
    snapshot.forEach((doc) => {
      prompts.push({
        id: doc.id,
        ...doc.data()
      } as SavedPrompt);
    });

    return prompts;
  } catch (error) {
    console.error('프롬프트 가져오기 실패:', error);
    // 에러 시 로컬 스토리지에서 가져오기
    return getLocalPrompts();
  }
};

// 프롬프트 저장하기
export const savePrompt = async (
  title: string,
  content: string,
  category: string
): Promise<SavedPrompt | null> => {
  try {
    const promptData = {
      title: title.trim(),
      content: content.trim(),
      category,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      usage: 0
    };

    if (auth?.currentUser && db) {
      // Firebase에 저장
      const userId = auth.currentUser.uid;
      const promptsRef = collection(db, `users/${userId}/prompts`);
      const docRef = await addDoc(promptsRef, promptData);
      
      const newPrompt: SavedPrompt = {
        id: docRef.id,
        title,
        content,
        category,
        createdAt: new Date(),
        updatedAt: new Date(),
        usage: 0
      };
      
      // 로컬 스토리지에도 백업
      saveToLocalStorage(newPrompt);
      
      return newPrompt;
    } else {
      // 로컬 스토리지에만 저장
      const newPrompt: SavedPrompt = {
        id: `local_${Date.now()}`,
        title,
        content,
        category,
        createdAt: new Date(),
        updatedAt: new Date(),
        usage: 0
      };
      
      saveToLocalStorage(newPrompt);
      return newPrompt;
    }
  } catch (error) {
    console.error('프롬프트 저장 실패:', error);
    return null;
  }
};

// 프롬프트 사용 횟수 증가
export const incrementPromptUsage = async (promptId: string): Promise<void> => {
  try {
    if (auth?.currentUser && db && !promptId.startsWith('local_')) {
      // Firebase 업데이트
      const userId = auth.currentUser.uid;
      const promptRef = doc(db, `users/${userId}/prompts`, promptId);
      await updateDoc(promptRef, {
        usage: (await getDoc(promptRef)).data()?.usage + 1 || 1,
        updatedAt: serverTimestamp()
      });
    }
    
    // 로컬 스토리지도 업데이트
    updateLocalPromptUsage(promptId);
  } catch (error) {
    console.error('프롬프트 사용 횟수 업데이트 실패:', error);
  }
};

// 프롬프트 삭제하기
export const deletePrompt = async (promptId: string): Promise<boolean> => {
  try {
    if (auth?.currentUser && db && !promptId.startsWith('local_')) {
      // Firebase에서 삭제
      const userId = auth.currentUser.uid;
      const promptRef = doc(db, `users/${userId}/prompts`, promptId);
      await deleteDoc(promptRef);
    }
    
    // 로컬 스토리지에서도 삭제
    deleteFromLocalStorage(promptId);
    return true;
  } catch (error) {
    console.error('프롬프트 삭제 실패:', error);
    return false;
  }
};

// 기본 프롬프트 초기화
export const initializeDefaultPrompts = async (): Promise<void> => {
  try {
    const existingPrompts = await getSavedPrompts();
    
    // 이미 프롬프트가 있으면 기본 프롬프트 추가하지 않음
    if (existingPrompts.length > 0) return;
    
    // 기본 프롬프트 추가
    for (const prompt of DEFAULT_PROMPTS) {
      await savePrompt(prompt.title, prompt.content, prompt.category);
    }
  } catch (error) {
    console.error('기본 프롬프트 초기화 실패:', error);
  }
};

// 로컬 스토리지 헬퍼 함수들
const getLocalPrompts = (): SavedPrompt[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveToLocalStorage = (prompt: SavedPrompt): void => {
  try {
    const prompts = getLocalPrompts();
    const existingIndex = prompts.findIndex(p => p.id === prompt.id);
    
    if (existingIndex >= 0) {
      prompts[existingIndex] = prompt;
    } else {
      prompts.push(prompt);
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prompts));
  } catch (error) {
    console.error('로컬 저장 실패:', error);
  }
};

const updateLocalPromptUsage = (promptId: string): void => {
  try {
    const prompts = getLocalPrompts();
    const prompt = prompts.find(p => p.id === promptId);
    
    if (prompt) {
      prompt.usage = (prompt.usage || 0) + 1;
      prompt.updatedAt = new Date();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prompts));
    }
  } catch (error) {
    console.error('로컬 사용 횟수 업데이트 실패:', error);
  }
};

const deleteFromLocalStorage = (promptId: string): void => {
  try {
    const prompts = getLocalPrompts();
    const filtered = prompts.filter(p => p.id !== promptId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('로컬 삭제 실패:', error);
  }
};