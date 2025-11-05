"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to the console and any error reporting service
    console.error('애플리케이션 에러 발생:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })

    this.setState({
      hasError: true,
      error,
      errorInfo
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state
      const isFirebaseError = error?.message.includes('Firebase') || error?.message.includes('auth')
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={error} resetError={this.resetError} />
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                애플리케이션 오류가 발생했습니다
              </CardTitle>
              <CardDescription>
                {isFirebaseError 
                  ? "Firebase 연결에 문제가 있습니다. 하지만 대부분의 기능은 계속 사용할 수 있습니다."
                  : "예상치 못한 오류가 발생했습니다. 다시 시도해보세요."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTitle>오류 정보</AlertTitle>
                <AlertDescription className="font-mono text-sm">
                  {error?.message || '알 수 없는 오류'}
                </AlertDescription>
              </Alert>

              {isFirebaseError && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTitle className="text-amber-800">Firebase 연결 문제</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    • 설정 페이지는 로컬 저장소를 사용하여 정상 작동합니다<br />
                    • 로그인 및 실시간 동기화 기능은 일시적으로 제한됩니다<br />
                    • 관리자에게 환경 변수 설정을 요청하세요
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.resetError} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  다시 시도
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  홈으로 이동
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && error?.stack && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                    개발자 정보 (개발 환경에서만 표시)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    console.error('Handled error:', error)
    setError(error)
  }, [])

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  if (error) {
    throw error // This will be caught by the nearest ErrorBoundary
  }

  return { handleError, resetError }
}

export default ErrorBoundary