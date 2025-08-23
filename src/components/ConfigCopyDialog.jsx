'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Copy, Check } from 'lucide-react'

export function ConfigCopyDialog({ mcp, isOpen, onClose }) {
  const [copied, setCopied] = useState(false)
  const [configText, setConfigText] = useState('')
  const { toast } = useToast()

  if (!mcp || !mcp.deploy_url) {
    return null
  }

  const generateConfig = () => {
    const config = {
      mcpServers: {
        [mcp.name]: {
          command: "node",
          args: ["{client-proxy.js}"],
          env: {
            PRIVATE_KEY: "{your-private-key}",
            TARGET_URL: mcp.deploy_url + '/mcp'
          }
        }
      }
    }
    return JSON.stringify(config, null, 2)
  }

  // Initialize config text when dialog opens
  useEffect(() => {
    if (isOpen) {
      setConfigText(generateConfig())
    }
  }, [isOpen])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(configText)
      setCopied(true)
      toast({
        title: 'Configuration copied!',
        description: 'MCP configuration has been copied to your clipboard.'
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy configuration to clipboard.',
        variant: 'destructive'
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>MCP Configuration</DialogTitle>
          <DialogDescription>
            Copy this configuration to use {mcp.name} in your Claude Code setup
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            className="font-mono text-sm min-h-[200px]"
          />
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">To use this MCP:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Copy the configuration above</li>
              <li>Add it to your Claude Code MCP settings</li>
              <li>Restart Claude Code to load the new MCP server</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={copyToClipboard} disabled={copied}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Configuration
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}