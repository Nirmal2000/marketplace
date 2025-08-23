'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@civic/auth-web3/react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { NavigationBar } from '@/components/NavigationBar'
import { MetricsTable } from '@/components/MetricsTable'
import { DateFilter } from '@/components/DateFilter'
import { useToast } from '@/components/ui/use-toast'

export default function DashboardPage() {
  const userContext = useUser()
  const [metrics, setMetrics] = useState([])
  const [filteredMetrics, setFilteredMetrics] = useState([])
  const [dateRange, setDateRange] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  console.log('User context:', userContext)
  console.log('User object:', userContext?.user)

  useEffect(() => {
    // No data fetching - using static empty data
    setMetrics([])
    setIsLoading(false)
  }, [userContext])

  useEffect(() => {
    filterMetrics()
  }, [metrics, dateRange])

  const filterMetrics = () => {
    if (!dateRange) {
      setFilteredMetrics(metrics)
      return
    }

    const filtered = metrics.filter(metric => {
      const metricDate = new Date(metric.date)
      return metricDate >= dateRange.start && metricDate <= dateRange.end
    })
    
    setFilteredMetrics(filtered)
  }

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">
              Track your MCP performance and revenue analytics
            </p>
            {userContext?.user && (
              <p className="text-sm text-primary mt-2">
                Welcome back, {userContext.user.name || userContext.user.email || 'User'}!
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Date Filter Sidebar */}
            <div className="lg:col-span-1">
              <DateFilter
                dateRange={dateRange}
                onChange={setDateRange}
              />
            </div>

            {/* Metrics Content */}
            <div className="lg:col-span-3">
              <MetricsTable 
                metrics={filteredMetrics}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Additional Info */}
          {!isLoading && metrics.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <p className="text-lg mb-2">No metrics available yet</p>
                <p className="text-sm">
                  Create your first MCP to start tracking performance data
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}