import { NextResponse } from 'next/server';
import { getMCPTools, getMCPServerInfo, getMultipleMCPTools } from '@/lib/mcp-tools';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const urls = searchParams.get('urls');

    // Single URL mode
    if (url) {
      const serverInfo = await getMCPServerInfo(url);
      return NextResponse.json(serverInfo);
    }

    // Multiple URLs mode
    if (urls) {
      const urlArray = urls.split(',').map(u => u.trim()).filter(u => u);
      const results = await getMultipleMCPTools(urlArray);
      return NextResponse.json(results);
    }

    // No parameters provided
    return NextResponse.json(
      { error: 'Please provide either "url" for single server or "urls" for multiple servers' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in MCP tools API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch MCP tools' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'Please provide an array of URLs in the request body' },
        { status: 400 }
      );
    }

    const results = await getMultipleMCPTools(urls);
    return NextResponse.json(results);

  } catch (error) {
    console.error('Error in MCP tools API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch MCP tools' },
      { status: 500 }
    );
  }
}
