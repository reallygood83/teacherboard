# Teacher Board (우리 학급 홈페이지) - Claude Code Guide

A comprehensive Korean classroom management website built with Next.js, Firebase, and AI tools.

## 🎯 Project Overview

Teacher Board is a mobile-first Korean educational platform that provides classroom management tools with AI integration. It features 9 main sections for daily teaching activities, student management, and educational tools.

### Live Site: https://teacherboard.vercel.app/

## 🏗️ Architecture Overview

### Core Technologies
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Authentication**: Firebase Authentication with Google Sign-in
- **Database**: Firebase Firestore + localStorage backup
- **AI Integration**: Google Gemini API for document generation
- **Deployment**: Vercel with automatic GitHub integration

### Mobile-First Design Philosophy
- **Touch Gestures**: Swipe navigation between tabs
- **Responsive Layout**: 3-column desktop → 2-column tablet → 1-column mobile
- **Touch-friendly**: 44px minimum touch targets
- **Korean Optimization**: Noto Sans KR font family

## 📁 Key Directory Structure

```
teacherboard/
├── app/
│   ├── class/page.tsx           # Main classroom homepage with 9 tabs
│   ├── login/page.tsx           # Authentication page
│   └── globals.css              # Global styles with Korean font imports
├── components/
│   ├── auth/                    # Authentication components
│   ├── timetable.tsx           # Schedule management with OCR support
│   ├── ai-tools-gallery.tsx   # AI tools thumbnail gallery
│   ├── mobile-navigation.tsx   # Mobile-optimized navigation
│   └── ui/                     # Radix UI components
├── contexts/
│   └── AuthContext.tsx         # Firebase authentication provider
├── lib/
│   ├── firebase.ts             # Firebase configuration with demo mode
│   ├── tab-config.ts           # Tab configuration for 9 sections
│   └── utils.ts                # Utility functions
└── public/
    └── thumbnails/             # SVG thumbnails for AI tools
```

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint checks

# Git workflow (commonly used)
git add .
git commit -m "descriptive message"
git push origin main
```

## 🔐 Authentication System

### Firebase Configuration
Firebase is configured with demo mode fallback in `lib/firebase.ts`:
- **Production**: Full Firebase integration with Google Authentication
- **Development**: Demo mode when Firebase env vars are missing
- **Auto-retry**: Connection retry logic with 5-second timeout

### Environment Variables (Required for Production)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GEMINI_API_KEY=
```

## 📱 9-Tab Navigation System

Configured in `lib/tab-config.ts`:

### Main Features (📚)
1. **수업 도구** (tools) - Classroom tools and quick links
2. **시간표** (schedule) - Daily timetable with OCR PDF import
3. **시간 관리** (time) - Digital clock and class timer

### Educational Tools (🛠️)
4. **AI 도구** (ai-tools) - AI document generation gallery
5. **학생 관리** (students) - Student picker and group maker
6. **YouTube** (youtube) - Educational video search
7. **외부 링크** (links) - External site embedding

### Management (⚙️)
8. **일정 관리** (schedule-management) - Annual schedule management
9. **설정** (settings) - Site customization and preferences

## 🤖 AI Tools Gallery System

### Component: `components/ai-tools-gallery.tsx`

**Current Tools:**
- **공문 생성기** (Document Generator) - Internal component
- **AI 퀴즈 생성기** - External link to Google Apps Script
- **AI 설문 생성기** - External link to Google Apps Script  
- **AI 통신문 생성기** - External link to Google Apps Script

### Adding New AI Tools
```typescript
// In ai-tools-gallery.tsx
const newTool: AITool = {
  id: "unique-id",
  title: "도구 이름",
  description: "도구 설명",
  icon: IconComponent,
  thumbnail: "/thumbnails/tool-thumbnail.svg",
  category: "document" | "planning" | "assessment" | "analysis",
  status: "available" | "external-link",
  externalUrl?: "https://external-link.com", // For external tools
  component?: YourComponent, // For internal tools
}
```

### Thumbnail Requirements
- **Format**: SVG files in `/public/thumbnails/`
- **Size**: 400x300px viewBox
- **Style**: Blue gradient background (#2563eb to #1d4ed8)
- **Content**: Tool icon + Korean title + brief description

## 📅 Timetable System

### Component: `components/timetable.tsx`

**Key Features:**
- **OCR Integration**: PDF upload → Gemini Vision API → structured timetable
- **Dual Storage**: Firebase Firestore + localStorage backup
- **Edit Mode**: Dropdown-based cell editing for corrections
- **Auto-save**: Immediate save after OCR processing

**Common Issues & Solutions:**
- **Save button not visible**: Check `hasUnsavedChanges` state
- **OCR not persisting**: Verify auto-save after `handleOCRSuccess`
- **Firebase connection**: Check console for authentication status

### OCR Workflow
1. User uploads PDF → Convert to images using PDF.js
2. Send images to Gemini Vision API with Korean prompt
3. Parse JSON response into `WeeklySchedule` interface
4. Auto-save to Firebase + localStorage
5. Enable edit mode for manual corrections

## 🔄 State Management Patterns

### Authentication State
```typescript
// contexts/AuthContext.tsx
const { currentUser, loading, firebaseAvailable, isDemoMode } = useAuth()
```

### Local Storage Integration
Most components use dual storage pattern:
```typescript
// Save to both Firebase and localStorage
const saveData = async (data) => {
  localStorage.setItem('key', JSON.stringify(data))
  if (currentUser && db) {
    await setDoc(doc(db, `users/${currentUser.uid}/collection`, 'document'), data)
  }
}
```

## 📱 Mobile Optimization

### Touch Gestures
Implemented in main page with swipe detection:
```typescript
// Touch handling for tab navigation
const handleTouchStart = (e) => {
  setTouchStart(e.touches[0].clientX)
}

const handleTouchEnd = (e) => {
  if (touchStart - e.changedTouches[0].clientX > 75) {
    // Swipe left - next tab
  } else if (e.changedTouches[0].clientX - touchStart > 75) {
    // Swipe right - previous tab
  }
}
```

### Mobile Navigation Component
`components/mobile-navigation.tsx` provides category-based navigation with visual indicators and smooth animations.

### Responsive Breakpoints
- **Mobile**: < 768px (single column, mobile nav)
- **Tablet**: 768px - 1024px (2-column grid)
- **Desktop**: > 1024px (3-column grid, desktop tabs)

## 🎨 Styling System

### Color Theme
```css
/* Primary colors */
--blue-600: #2563eb    /* Primary buttons, active states */
--blue-50: #eff6ff     /* Background tints */
--gray-900: #111827    /* Text primary */
--gray-600: #4b5563    /* Text secondary */
```

### Korean Typography
```css
font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Component Patterns
- **Cards**: `bg-white rounded-lg shadow-sm border p-6`
- **Buttons**: Radix UI components with consistent sizing
- **Animations**: Framer Motion for smooth transitions

## 🚀 Deployment Workflow

### Vercel Integration
- **Automatic**: Push to `main` branch triggers deployment
- **Environment**: Set all Firebase env vars in Vercel dashboard
- **Preview**: Pull requests get preview deployments

### Build Requirements
```bash
npm run build  # Requires all env vars to be set
```

### Performance Targets
- **First Load**: < 400KB main bundle
- **Mobile Score**: > 90 Lighthouse performance
- **Touch Response**: < 100ms interaction delay

## 🔍 Common Development Patterns

### Error Handling
```typescript
try {
  // Firebase operation
} catch (error) {
  console.error('Operation failed:', error)
  // Fallback to localStorage or show user-friendly message
}
```

### Loading States
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

// Show loading spinner or skeleton
if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
```

### Data Fetching
```typescript
useEffect(() => {
  if (!currentUser) return
  
  const unsubscribe = onSnapshot(
    doc(db, `users/${currentUser.uid}/data`, 'document'),
    (doc) => setData(doc.data())
  )
  
  return unsubscribe
}, [currentUser])
```

## 🐛 Common Issues & Solutions

### Firebase Connection Issues
- **Symptom**: "Firebase가 초기화되지 않았습니다"
- **Solution**: Check env vars, verify `isFirebaseReady()` before operations
- **Debug**: Use `logFirebaseStatus()` to check connection state

### Mobile Touch Issues
- **Symptom**: Buttons not responding on mobile
- **Solution**: Ensure 44px minimum touch target, add `touch-action: manipulation`
- **Debug**: Test with Chrome DevTools mobile simulation

### Korean Font Loading
- **Symptom**: Flash of unstyled text (FOUT)
- **Solution**: Preload Noto Sans KR in `app/layout.tsx`
- **Fallback**: Apple system fonts for iOS compatibility

### OCR Accuracy Issues
- **Symptom**: Incorrect timetable parsing
- **Solution**: Provide clear PDF with good contrast, use edit mode for corrections
- **Prompt**: Adjust Gemini prompt in timetable component for better accuracy

## 📝 Code Style Guidelines

### TypeScript Interfaces
```typescript
interface ComponentProps {
  title: string
  onSave: (data: DataType) => Promise<void>
  loading?: boolean
}
```

### Component Structure
```typescript
export default function Component({ prop1, prop2 }: Props) {
  // State declarations
  const [state, setState] = useState()
  
  // Hooks
  const { currentUser } = useAuth()
  
  // Effects
  useEffect(() => {}, [dependency])
  
  // Event handlers
  const handleEvent = () => {}
  
  // Render
  return <div>...</div>
}
```

### File Naming
- **Components**: `kebab-case.tsx`
- **Pages**: `page.tsx` (Next.js App Router)
- **Utilities**: `camelCase.ts`
- **Types**: `interfaces.ts` or inline interfaces

## 🤝 Contributing Guidelines

### Git Workflow
1. Create feature branch: `git checkout -b feature/description`
2. Make changes with descriptive commits
3. Test thoroughly on mobile devices
4. Push and create pull request
5. Merge to main triggers auto-deployment

### Testing Checklist
- [ ] Mobile responsiveness (iOS/Android)
- [ ] Touch gestures working
- [ ] Firebase authentication
- [ ] All 9 tabs functional
- [ ] Korean text display correctly
- [ ] AI tools gallery responsive

### Code Review Focus
- Mobile optimization and touch accessibility
- Firebase error handling and fallbacks
- Korean language support and typography
- Performance impact on mobile devices

---

**Built with ❤️ for Korean educators**

*This documentation helps future Claude instances understand the Teacher Board codebase architecture, common patterns, and development workflow.*