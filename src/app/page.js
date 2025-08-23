'use client'

import { useUser } from '@civic/auth-web3/react'
import { UserButton } from '@civic/auth-web3/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Zap, Globe, Users, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const userContext = useUser()
  const router = useRouter()
  const [redirect, setRedirect] = useState(false)

  useEffect(() => {
    // Updated authentication check - if isAuthenticated is true, that's sufficient
    if (userContext?.isAuthenticated && userContext?.user) {
      console.log('User is authenticated, saving to database...')
      
      // Save user data to database
      const saveUserToDatabase = async () => {
        try {
          const userData = {
            user_id: userContext.user.id,
            email: userContext.user.email,
            username: userContext.user.username || userContext.user.displayName,
            avatar_url: userContext.user.avatarUrl || userContext.user.picture,
            metadata: {
              authProvider: 'civic',
              lastLogin: new Date().toISOString(),
              ...userContext.user
            }
          }

          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          })

          if (response.ok) {
            console.log('User data saved to database')
          } else {
            console.error('Failed to save user data:', await response.text())
          }
        } catch (error) {
          console.error('Error saving user data:', error)
        }
      }

      saveUserToDatabase()
      setRedirect(true)
      // Add a small delay to prevent immediate redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    }
  }, [userContext, router])

  // Show redirect message
  if (redirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              emcp
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors">Security</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              🚀 Web3-Enabled Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Modular Compute Protocol
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Create, manage, and deploy MCP tools with blockchain-powered authentication.
              Experience the future of modular computing with Web3 wallet integration.
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">MCP Tools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-muted-foreground">Uptime</div>
              </div>
            </div>

            {/* Main Authentication Interface */}
            <div className="max-w-md mx-auto">
              <Card className="border-2 border-primary/20 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">Get Started</CardTitle>
                  <CardDescription>
                    Sign in with your Web3 wallet or traditional account to access the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Civic Auth User Button with extended height for full interface */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-full max-w-xs flex items-center justify-center border-2 border-dashed border-primary/30 rounded-lg bg-primary/5 py-4">
                      <UserButton
                        style={{
                          width: '200px',
                          height: '50px'
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Choose your preferred authentication method above
                    </p>
                  </div>

                  {/* Web3 Features */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <Wallet className="w-4 h-4 text-primary" />
                      <span>Connect with MetaMask, WalletConnect, or other Web3 wallets</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Blockchain-verified identity and secure authentication</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Globe className="w-4 h-4 text-primary" />
                      <span>Decentralized access across multiple platforms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-accent/5">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, manage, and deploy MCP tools with enterprise-grade security
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Deploy and manage MCP tools with instant configuration and real-time updates
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <Shield className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Secure by Design</CardTitle>
                <CardDescription>
                  End-to-end encryption with blockchain authentication and row-level security
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Collaborative</CardTitle>
                <CardDescription>
                  Share configurations, collaborate on tools, and build together with your team
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 emcp. Powered by Civic Auth and Web3 technology.
          </p>
        </div>
      </footer>
    </div>
  )
}
