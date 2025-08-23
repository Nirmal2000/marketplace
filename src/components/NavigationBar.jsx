'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Store, BarChart3, LogOut, User } from 'lucide-react'
import { useUser } from '@civic/auth-web3/react'

export function NavigationBar() {
  const userContext = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Extract user from context and check authentication
  const user = userContext?.user
  const isAuthenticated = userContext?.isAuthenticated

  const handleLogout = async () => {
    try {
      // Check if signOut is available in the context
      if ('signOut' in userContext && typeof userContext.signOut === 'function') {
        await userContext.signOut()
      } else {
        // Fallback to redirect to logout endpoint
        window.location.href = '/api/auth/civicauth/logout'
        return
      }
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      })
      router.push('/') // Redirect to homepage
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: 'Logout failed',
        description: 'An error occurred during logout.',
        variant: 'destructive',
      })
    }
  }

  const isActive = (path) => pathname === path

  // Show navigation if authenticated, even if user object is null
  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className="border-b border-gray-600 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/marketplace" className="text-xl font-bold text-foreground">
              MCP Platform
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/create"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors border ${
                isActive('/create')
                  ? 'text-primary border-primary bg-primary/10' 
                  : 'text-foreground hover:text-primary border-transparent hover:border-gray-600'
              }`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create MCP
            </Link>
            
            <Link 
              href="/marketplace"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors border ${
                isActive('/marketplace')
                  ? 'text-primary border-primary bg-primary/10' 
                  : 'text-foreground hover:text-primary border-transparent hover:border-gray-600'
              }`}
            >
              <Store className="mr-2 h-4 w-4" />
              Marketplace
            </Link>
            
            <Link 
              href="/dashboard"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors border ${
                isActive('/dashboard')
                  ? 'text-primary border-primary bg-primary/10' 
                  : 'text-foreground hover:text-primary border-transparent hover:border-gray-600'
              }`}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Link>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border-gray-600">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.picture} alt={user?.name || 'User'} />
                    <AvatarFallback className="bg-gray-700">
                      {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 border-gray-600" align="end" forceMount>
                <DropdownMenuItem className="flex flex-col items-start">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span className="font-medium">{user?.name || user?.email || 'Authenticated User'}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-600" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}