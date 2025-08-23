'use client';

import { useState } from 'react';
import { getMultipleMCPTools } from '@/lib/mcp-tools';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function MCPToolsDisplay() {
  const [urls, setUrls] = useState([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverData, setServerData] = useState([]);

  const addUrl = () => {
    if (currentUrl && !urls.includes(currentUrl)) {
      setUrls([...urls, currentUrl]);
      setCurrentUrl('');
    }
  };

  const removeUrl = (urlToRemove) => {
    setUrls(urls.filter(url => url !== urlToRemove));
  };

  const fetchTools = async () => {
    if (urls.length === 0) return;

    setLoading(true);
    try {
      const data = await getMultipleMCPTools(urls);
      setServerData(data);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">MCP Tools Explorer</h2>

        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Enter MCP server URL"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addUrl()}
          />
          <Button onClick={addUrl}>Add URL</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {urls.map((url) => (
            <Badge key={url} variant="secondary" className="cursor-pointer" onClick={() => removeUrl(url)}>
              {url} ×
            </Badge>
          ))}
        </div>

        <Button onClick={fetchTools} disabled={loading || urls.length === 0}>
          {loading ? 'Fetching Tools...' : 'Fetch Tools'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serverData.map((server, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm break-all">{server.url}</CardTitle>
              <CardDescription>
                <Badge variant={server.status === 'online' ? 'default' : 'destructive'}>
                  {server.status}
                </Badge>
                {server.toolCount} tools available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {server.tools && server.tools.length > 0 ? (
                <div className="space-y-2">
                  {server.tools.slice(0, 5).map((tool, toolIndex) => (
                    <div key={toolIndex} className="border rounded p-2">
                      <div className="font-medium text-sm">{tool.name}</div>
                      {tool.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {tool.description}
                        </div>
                      )}
                    </div>
                  ))}
                  {server.tools.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      ... and {server.tools.length - 5} more tools
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {server.error || 'No tools available'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
