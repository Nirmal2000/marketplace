'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ConfigCopyDialog } from '@/components/ConfigCopyDialog'
import { Copy, Eye, DollarSign, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Wrench as Tool } from 'lucide-react'
import { DEPLOYMENT_STATUS, isLoadingStatus, isErrorStatus } from '@/lib/types'

export function MCPCard({ mcp }) {
  const [showDialog, setShowDialog] = useState(false)
  const [showAllTools, setShowAllTools] = useState(false)

  const displayedTools = showAllTools ? (mcp.tools || []) : (mcp.tools || []).slice(0, 3)
  const hasMoreTools = (mcp.tools || []).length > 3

  const getStatusBadge = (status) => {
    if (isLoadingStatus(status)) {
      return (
        <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-400">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          {status.replace(/_/g, ' ')}
        </Badge>
      )
    }
    
    if (isErrorStatus(status)) {
      return (
        <Badge variant="outline" className="text-xs border-red-600 text-red-400">
          <AlertCircle className="h-3 w-3 mr-1" />
          {status.replace(/_/g, ' ')}
        </Badge>
      )
    }
    
    if (status === DEPLOYMENT_STATUS.LIVE) {
      return (
        <Badge variant="outline" className="text-xs border-green-600 text-green-400">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Live
        </Badge>
      )
    }
    
    return (
      <Badge variant="outline" className="text-xs border-gray-600">
        {status || 'unknown'}
      </Badge>
    )
  }

  console.log(`🔍 Config check for ${mcp.name}:`, {
    status: mcp.status,
    isLive: mcp.status === DEPLOYMENT_STATUS.LIVE,
    deploy_url: mcp.deploy_url,
    hasDeployUrl: !!mcp.deploy_url
  });
  
  const canShowConfig = mcp.status === DEPLOYMENT_STATUS.LIVE && mcp.deploy_url

  return (
    <>
      <Card className="border-gray-600 hover:border-gray-400 transition-colors h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-2">{mcp.name}</CardTitle>
            {getStatusBadge(mcp.status)}
          </div>
          <CardDescription className="line-clamp-3 text-sm">
            {mcp.description || 'MCP service deployment'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {mcp.tools && mcp.tools.length > 0 ? (
            <div>
              <div className="flex items-center mb-2">
                <Tool className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Tools ({mcp.tools.length})
                </span>
              </div>
              
              <div className="space-y-2 max-h-50 overflow-y-auto">
                {displayedTools.map((tool, index) => (
                  <div key={index} className="bg-gray-800 p-2 rounded border border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-primary">{tool.name}</p>
                      {tool.price > 0 ? (
                        <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded">
                          ${tool.price}
                        </span>
                      ) : (
                        <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                          Free
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tool.description && tool.description.length > 100 
                        ? tool.description.substring(0, 100) + '...' 
                        : tool.description}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* {hasMoreTools && !showAllTools && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllTools(true)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Show {mcp.tools.length - 3} more tools
                </Button>
              )} */}
              
              {/* {showAllTools && hasMoreTools && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllTools(false)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  Show less
                </Button>
              )} */}
            </div>
          ) : mcp.status !== DEPLOYMENT_STATUS.LIVE ? (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <div className="text-center">
                {isLoadingStatus(mcp.status) ? (
                  <>
                    {/* <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" /> */}
                    <p className="text-sm">Loading tools...</p>
                  </>
                ) : isErrorStatus(mcp.status) ? (
                  <>
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                    <p className="text-sm">Deployment failed</p>
                  </>
                ) : (
                  <p className="text-sm">No tools available</p>
                )}
              </div>
            </div>
          ) : null}

          {mcp.environment_variables && Object.keys(mcp.environment_variables).length > 0 && (
            <>
              <Separator className="bg-gray-600" />
              <div>
                <p className="text-sm font-medium mb-2">Environment Variables</p>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(mcp.environment_variables).slice(0, 3).map((key) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}
                    </Badge>
                  ))}
                  {Object.keys(mcp.environment_variables).length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{Object.keys(mcp.environment_variables).length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className=" flex-col space-y-2">
          <div className="flex w-full space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDialog(true)}
              disabled={!canShowConfig}
              className="flex-1 border-gray-600 hover:border-gray-400 disabled:opacity-50"
            >
              <Copy className="h-4 w-4 mr-2" />
              {canShowConfig ? 'Copy Config' : 'Config Unavailable'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <span>Created {new Date(mcp.created_at).toLocaleDateString()}</span>
            {mcp.pricing > 0 && (
              <div className="flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                <span>{mcp.pricing} USDC</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      {canShowConfig && (
        <ConfigCopyDialog
          mcp={mcp}
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  )
}