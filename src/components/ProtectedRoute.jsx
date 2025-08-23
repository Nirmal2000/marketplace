'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@civic/auth-web3/react'

/**
 * Protected route component that handles authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 */
export function ProtectedRoute({ children }) {
  const userContext = useUser()
  const router = useRouter()

  useEffect(() => {
    // If explicitly not authenticated, send to login page
    if (userContext && !userContext.isAuthenticated) {
      router.push('/login')
    }
  }, [userContext, router])

  // Show loading while authentication state is being determined
  if (!userContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show a lightweight loading state while redirecting
  if (!userContext.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login…</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}