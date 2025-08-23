'use client'

import { useUser } from '@civic/auth-web3/react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { NavigationBar } from '@/components/NavigationBar'
import CreateMCPForm from '@/components/custom/CreateMCPForm'

export default function CreatePage() {
  const userContext = useUser()

  // Show loading while user context is loading
  if (userContext?.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New MCP</h1>
            <p className="text-muted-foreground">
              Deploy your Model Context Protocol service with GitHub integration
            </p>            
          </div>

          <div className="max-w-4xl mx-auto">
            <CreateMCPForm />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
