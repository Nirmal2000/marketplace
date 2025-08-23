'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { NavigationBar } from '@/components/NavigationBar'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { MCPCard } from '@/components/MCPCard'
import { Search, Package } from 'lucide-react'
import { DEPLOYMENT_STATUS, isLoadingStatus } from '@/lib/types'

export default function MarketplacePage() {
  const [mcps, setMcps] = useState([])
  const [filteredMcps, setFilteredMcps] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch MCPs from database
  const fetchMCPs = useCallback(async () => {
    console.log('🔄 Fetching MCPs from database...')
    try {
      const response = await fetch('/api/marketplace')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch MCPs')
      }

      const mcpsData = result.mcps || []
      console.log(`📦 Found ${mcpsData.length} MCPs in database`)

      // For live MCPs, fetch tool data from MCP tools API
      const mcpsWithTools = await Promise.all(
        mcpsData.map(async (mcp) => {
          if (mcp.status === DEPLOYMENT_STATUS.LIVE) {
            try {
              console.log(`🔍 Debugging MCP ${mcp.name}:`)
              console.log(`  - deploy_url: ${mcp.deploy_url}`)
              console.log(`  - output_json structure:`, mcp.output_json)

              // Extract URL from output_json if deploy_url is not available
              let serviceUrl = mcp.deploy_url
              if (!serviceUrl && mcp.output_json?.service?.serviceDetails?.url) {
                serviceUrl = mcp.output_json.service.serviceDetails.url
                console.log(`  - ✅ Extracted serviceUrl from output_json: ${serviceUrl}`)
              } else if (!serviceUrl) {
                console.log(`  - ❌ No serviceUrl found in deploy_url or output_json`)
                console.log(`  - output_json.service:`, mcp.output_json?.service)
                console.log(`  - output_json.service.serviceDetails:`, mcp.output_json?.service?.serviceDetails)
              } else {
                console.log(`  - ✅ Using deploy_url as serviceUrl: ${serviceUrl}`)
              }

              if (serviceUrl) {
                console.log(`🔧 Fetching tools for live MCP: ${mcp.name} from ${serviceUrl}`)
                const toolsResponse = await fetch(`/api/mcp-tools?url=${encodeURIComponent(serviceUrl)}`)
                console.log(`📡 MCP tools API response status: ${toolsResponse.status}`)

                if (toolsResponse.ok) {
                  const toolsData = await toolsResponse.json()
                  console.log(`🛠️ Tools data received for ${mcp.name}:`, toolsData)
                  return {
                    ...mcp,
                    tools: toolsData.tools || [],
                    description: toolsData.info?.description || mcp.name,
                    environment_variables: toolsData.info?.environmentVariables || {},
                    pricing: 0 // Default pricing, can be enhanced later
                  }
                } else {
                  console.error(`❌ MCP tools API failed for ${mcp.name}:`, await toolsResponse.text())
                }
              } else {
                console.log(`⚠️ No serviceUrl available for MCP ${mcp.name}, skipping tools fetch`)
              }
            } catch (error) {
              console.error(`Error fetching tools for MCP ${mcp.id}:`, error)
            }
          }

          return {
            ...mcp,
            tools: [],
            description: mcp.name,
            environment_variables: {},
            pricing: 0
          }
        })
      )

      console.log(`✅ MCPs processed, setting state with ${mcpsWithTools.length} MCPs`)
      setMcps(mcpsWithTools)
    } catch (error) {
      console.error('❌ Error fetching MCPs:', error)
      // Use toast directly instead of from dependency
      if (typeof window !== 'undefined') {
        // Only show toast on client side
        setTimeout(() => {
          const toastEvent = new CustomEvent('show-toast', {
            detail: {
              title: 'Error loading MCPs',
              description: 'Unable to load marketplace data. Please try again.',
              variant: 'destructive',
            }
          });
          window.dispatchEvent(toastEvent);
        }, 100);
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check deployment status for loading MCPs
  const checkDeploymentStatus = useCallback(async () => {
    const loadingMcps = mcps.filter(mcp => isLoadingStatus(mcp.status))
    
    console.log(`🔍 Checking deployment status... Found ${loadingMcps.length} MCPs in loading state`)
    loadingMcps.forEach(mcp => {
      console.log(`  - ${mcp.name} (${mcp.id}): ${mcp.status} | render_service_id: ${mcp.render_service_id} | deploy_id: ${mcp.deploy_id}`)
    })
    
    if (loadingMcps.length === 0) {
      console.log('⏸️ No loading MCPs found, skipping polling')
      return
    }

    console.log(`⏳ Polling ${loadingMcps.length} MCPs for status updates...`)

    // Check status for each loading MCP
    const statusPromises = loadingMcps.map(async (mcp) => {
      try {
        console.log(`📡 Checking status for ${mcp.name} (ID: ${mcp.id})`)
        const response = await fetch('/api/marketplace', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: mcp.id })
        })

        const result = await response.json()
        console.log(`📊 Status check result for ${mcp.name}:`, result)
        
        if (response.ok && result.statusChanged) {
          console.log(`🔄 Status changed for ${mcp.name}: ${result.oldStatus} → ${result.newStatus}`)
          return result.mcp
        }
        
        if (!response.ok) {
          console.error(`❌ Status check failed for ${mcp.name}:`, result.error)
        }
        
        return null
      } catch (error) {
        console.error(`💥 Error checking status for MCP ${mcp.name} (${mcp.id}):`, error)
        return null
      }
    })

    const updatedMcps = await Promise.all(statusPromises)
    
    // Update state with new statuses
    const hasUpdates = updatedMcps.some(mcp => mcp !== null)
    if (hasUpdates) {
      console.log('🔄 Updating MCPs state with new statuses')
      setMcps(prevMcps => 
        prevMcps.map(mcp => {
          const updated = updatedMcps.find(updated => updated?.id === mcp.id)
          return updated || mcp
        })
      )

      // If any MCP became live, fetch tools data
      const newlyLive = updatedMcps.filter(mcp => 
        mcp && mcp.status === DEPLOYMENT_STATUS.LIVE
      )
      
      if (newlyLive.length > 0) {
        console.log(`🎉 ${newlyLive.length} MCPs became live, fetching tools data...`)
        
        // Fetch tools data for newly live MCPs
        const mcpsWithNewTools = await Promise.all(
          newlyLive.map(async (liveMcp) => {
            try {
              // Extract URL from output_json if deploy_url is not available
              let serviceUrl = liveMcp.deploy_url
              if (!serviceUrl && liveMcp.output_json?.service?.serviceDetails?.url) {
                serviceUrl = liveMcp.output_json.service.serviceDetails.url
                console.log(`  - ✅ Extracted serviceUrl for ${liveMcp.name}: ${serviceUrl}`)
              }

              if (serviceUrl) {
                console.log(`🔧 Fetching tools for newly live MCP: ${liveMcp.name}`)
                const toolsResponse = await fetch(`/api/mcp-tools?url=${encodeURIComponent(serviceUrl)}`)
                
                if (toolsResponse.ok) {
                  const toolsData = await toolsResponse.json()
                  console.log(`🛠️ Tools data received for ${liveMcp.name}:`, toolsData)
                  return {
                    ...liveMcp,
                    tools: toolsData.tools || [],
                    description: toolsData.info?.description || liveMcp.name,
                    environment_variables: toolsData.info?.environmentVariables || {},
                  }
                } else {
                  console.error(`❌ Tools API failed for ${liveMcp.name}`)
                }
              }
              return liveMcp
            } catch (error) {
              console.error(`Error fetching tools for newly live MCP ${liveMcp.name}:`, error)
              return liveMcp
            }
          })
        )

        // Update state with tools data for newly live MCPs
        setMcps(prevMcps => 
          prevMcps.map(mcp => {
            const mcpWithTools = mcpsWithNewTools.find(updated => updated?.id === mcp.id)
            return mcpWithTools || mcp
          })
        )
      }
    } else {
      console.log('📊 No status changes detected')
    }
  }, [mcps, fetchMCPs])

  const filterMCPs = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredMcps(mcps)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = mcps.filter(mcp =>
      mcp.name.toLowerCase().includes(query) ||
      mcp.description.toLowerCase().includes(query) ||
      (mcp.tools && mcp.tools.some(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      ))
    )
    setFilteredMcps(filtered)
  }, [mcps, searchQuery])

  // Initial fetch
  useEffect(() => {
    fetchMCPs()
  }, [fetchMCPs])

  // Filter MCPs based on search query
  useEffect(() => {
    filterMCPs()
  }, [filterMCPs])

  // 5-second polling for loading states
  useEffect(() => {
    const hasLoadingMcps = mcps.some(mcp => isLoadingStatus(mcp.status))
    
    console.log(`🔄 Polling useEffect triggered. MCPs count: ${mcps.length}, Has loading MCPs: ${hasLoadingMcps}`)
    
    if (!hasLoadingMcps) {
      console.log('⏸️ No loading MCPs, not setting up polling interval')
      return
    }

    console.log('⏰ Setting up 5-second polling interval for deployment status')
    const interval = setInterval(() => {
      console.log('🔔 Polling interval triggered - calling checkDeploymentStatus()')
      checkDeploymentStatus()
    }, 5000)

    return () => {
      console.log('🧹 Cleaning up polling interval')
      clearInterval(interval)
    }
  }, [mcps, checkDeploymentStatus])

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="border-gray-600">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-5/6"></div>
              </div>
              <div className="h-20 bg-gray-700 rounded"></div>
              <div className="h-8 bg-gray-700 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const EmptyState = () => (
    <div className="text-center py-12">
      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        {searchQuery ? 'No MCPs found' : 'No MCPs available'}
      </h3>
      <p className="text-muted-foreground">
        {searchQuery 
          ? 'Try adjusting your search terms to find what you\'re looking for.' 
          : 'Be the first to create and share an MCP!'}
      </p>
    </div>
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">MCP Marketplace</h1>
            <p className="text-muted-foreground">
              Discover and integrate Modular Compute Protocol tools into your applications
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search MCPs, tools, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-600"
              />
            </div>
          </div>

          {/* Results Summary */}
          {!isLoading && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {searchQuery ? (
                  <>
                    Found {filteredMcps.length} MCP{filteredMcps.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                  </>
                ) : (
                  <>
                    {mcps.length} MCP{mcps.length !== 1 ? 's' : ''} available
                  </>
                )}
              </p>
            </div>
          )}

          {/* MCP Grid */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredMcps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMcps.map((mcp) => (
                <MCPCard key={mcp.id} mcp={mcp} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
