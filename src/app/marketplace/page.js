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

  // Fetch MCPs with dummy data
  const fetchMCPs = useCallback(async () => {
    console.log('🔄 Fetching dummy MCP data...')

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Dummy MCP data as if fetched from database
    const dummyMcpsData = [
      {
        id: 'playwright-001',
        name: 'Playwright MCP',
        status: DEPLOYMENT_STATUS.LIVE,
        deploy_url: 'https://playwright-mcp.example.com',
        render_service_id: 'srv-playwright-001',
        deploy_id: 'dpl-playwright-001',
        output_json: {
          service: {
            serviceDetails: {
              url: 'https://playwright-mcp.example.com'
            }
          }
        },
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 'browser-automation-002',
        name: 'Browser Automation MCP',
        status: DEPLOYMENT_STATUS.LIVE,
        deploy_url: 'https://browser-automation.example.com',
        render_service_id: 'srv-browser-002',
        deploy_id: 'dpl-browser-002',
        output_json: {
          service: {
            serviceDetails: {
              url: 'https://browser-automation.example.com'
            }
          }
        },
        created_at: '2024-01-14T09:15:00Z',
        updated_at: '2024-01-14T09:15:00Z'
      },
      {
        id: 'web-scraper-003',
        name: 'Web Scraper MCP',
        status: DEPLOYMENT_STATUS.DEPLOYING,
        deploy_url: null,
        render_service_id: 'srv-scraper-003',
        deploy_id: 'dpl-scraper-003',
        output_json: {
          service: {
            serviceDetails: {
              url: null
            }
          }
        },
        created_at: '2024-01-13T14:20:00Z',
        updated_at: '2024-01-13T14:20:00Z'
      },
      {
        id: 'data-extractor-004',
        name: 'Data Extractor MCP',
        status: DEPLOYMENT_STATUS.PENDING,
        deploy_url: null,
        render_service_id: 'srv-extractor-004',
        deploy_id: 'dpl-extractor-004',
        output_json: {
          service: {
            serviceDetails: {
              url: null
            }
          }
        },
        created_at: '2024-01-12T16:45:00Z',
        updated_at: '2024-01-12T16:45:00Z'
      },
      {
        id: 'form-filler-005',
        name: 'Form Filler MCP',
        status: DEPLOYMENT_STATUS.LIVE,
        deploy_url: 'https://form-filler.example.com',
        render_service_id: 'srv-form-005',
        deploy_id: 'dpl-form-005',
        output_json: {
          service: {
            serviceDetails: {
              url: 'https://form-filler.example.com'
            }
          }
        },
        created_at: '2024-01-11T11:10:00Z',
        updated_at: '2024-01-11T11:10:00Z'
      },
      {
        id: 'ui-tester-006',
        name: 'UI Testing MCP',
        status: DEPLOYMENT_STATUS.FAILED,
        deploy_url: null,
        render_service_id: 'srv-ui-006',
        deploy_id: 'dpl-ui-006',
        output_json: {
          service: {
            serviceDetails: {
              url: null
            }
          }
        },
        created_at: '2024-01-10T08:30:00Z',
        updated_at: '2024-01-10T08:30:00Z'
      }
    ]

    console.log(`📦 Found ${dummyMcpsData.length} dummy MCPs`)

    // Process dummy data with tools
    const mcpsWithTools = await Promise.all(
      dummyMcpsData.map(async (mcp) => {
        if (mcp.status === DEPLOYMENT_STATUS.LIVE) {
          try {
            console.log(`🔍 Processing dummy MCP ${mcp.name}:`)

            // Extract URL from output_json if deploy_url is not available
            let serviceUrl = mcp.deploy_url
            if (!serviceUrl && mcp.output_json?.service?.serviceDetails?.url) {
              serviceUrl = mcp.output_json.service.serviceDetails.url
              console.log(`  - ✅ Extracted serviceUrl from output_json: ${serviceUrl}`)
            }

            // Simulate fetching tools data for live MCPs
            let tools = []
            let description = mcp.name
            let environment_variables = {}

            if (serviceUrl) {
              console.log(`🔧 Fetching dummy tools for live MCP: ${mcp.name}`)

              // Create dummy tools based on MCP name
              if (mcp.name === 'Playwright MCP') {
                tools = [
                  {
                    name: 'browser_navigate',
                    description: 'Navigate to a URL',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        url: {
                          type: 'string',
                          description: 'The URL to navigate to'
                        }
                      },
                      required: ['url']
                    }
                  },
                  {
                    name: 'browser_navigate_back',
                    description: 'Go back to the previous page',
                    inputSchema: {
                      type: 'object',
                      properties: {},
                      required: []
                    }
                  },
                  {
                    name: 'browser_navigate_forward',
                    description: 'Go forward to the next page',
                    inputSchema: {
                      type: 'object',
                      properties: {},
                      required: []
                    }
                  }
                ]
                description = 'A comprehensive browser automation tool with navigation capabilities'
                environment_variables = {
                  BROWSER_TYPE: 'chromium',
                  HEADLESS: 'false',
                  TIMEOUT: '30000'
                }
              } else if (mcp.name === 'Browser Automation MCP') {
                tools = [
                  {
                    name: 'browser_click',
                    description: 'Perform click on a web page element',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        selector: {
                          type: 'string',
                          description: 'CSS selector or XPath of the element to click'
                        }
                      },
                      required: ['selector']
                    }
                  },
                  {
                    name: 'browser_type',
                    description: 'Type text into an editable element',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        selector: {
                          type: 'string',
                          description: 'CSS selector of the input element'
                        },
                        text: {
                          type: 'string',
                          description: 'Text to type into the element'
                        }
                      },
                      required: ['selector', 'text']
                    }
                  }
                ]
                description = 'Advanced browser automation with interaction capabilities'
                environment_variables = {
                  DEFAULT_TIMEOUT: '10000',
                  RETRY_ATTEMPTS: '3'
                }
              } else if (mcp.name === 'Form Filler MCP') {
                tools = [
                  {
                    name: 'browser_select_option',
                    description: 'Select an option in a dropdown',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        selector: {
                          type: 'string',
                          description: 'CSS selector of the dropdown element'
                        },
                        value: {
                          type: 'string',
                          description: 'Value or text to select'
                        }
                      },
                      required: ['selector', 'value']
                    }
                  },
                  {
                    name: 'browser_file_upload',
                    description: 'Upload one or multiple files',
                    inputSchema: {
                      type: 'object',
                      properties: {
                        selector: {
                          type: 'string',
                          description: 'CSS selector of the file input element'
                        },
                        filePaths: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Array of file paths to upload'
                        }
                      },
                      required: ['selector', 'filePaths']
                    }
                  }
                ]
                description = 'Specialized tool for form filling and file uploads'
                environment_variables = {
                  MAX_FILE_SIZE: '10MB',
                  SUPPORTED_FORMATS: 'pdf,doc,docx,jpg,png'
                }
              }

              console.log(`🛠️ Dummy tools created for ${mcp.name}:`, tools.length)
            }

            return {
              ...mcp,
              tools,
              description,
              environment_variables,
              pricing: Math.floor(Math.random() * 50) + 10 // Random pricing between 10-60
            }
          } catch (error) {
            console.error(`Error processing dummy MCP ${mcp.id}:`, error)
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

    console.log(`✅ Dummy MCPs processed, setting state with ${mcpsWithTools.length} MCPs`)
    setMcps(mcpsWithTools)
    setIsLoading(false)
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
