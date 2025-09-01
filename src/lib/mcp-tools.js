import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { makePaymentAwareClientTransport } from './x402/client.js';

// Fake private key for tool discovery (read-only operations)
const FAKE_PRIVATE_KEY = '0x1234567890123456789012345678901234567890123456789012345678901234';

/**
 * Parse price and clean description from tool description
 * @param {string} description - Tool description
 * @returns {Object} - Object with cleanDescription and price
 */
function parseToolPrice(description) {
  if (!description) return { cleanDescription: '', price: 0 };
  
  // Look for pattern like "(COST: $1.001)" or "(COST: {})" 
  const costMatch = description.match(/\(COST:\s*([^)]+)\)/i);
  
  if (costMatch) {
    const costValue = costMatch[1].trim();
    let price = 0;
    
    // Parse price - handle {} as 0, parse $X.XX format
    if (costValue === '{}' || costValue === '') {
      price = 0;
    } else {
      // Remove $ sign if present and parse as float
      const numericValue = costValue.replace('$', '');
      const numericPrice = parseFloat(numericValue);
      price = isNaN(numericPrice) ? 0 : numericPrice;
    }
    
    // Remove the cost part from description
    const cleanDescription = description.replace(/\s*\(COST:\s*[^)]+\)/i, '').trim();
    
    return { cleanDescription, price };
  }
  
  // No cost found, it's free
  return { cleanDescription: description, price: 0 };
}

/**
 * Get available tools from an MCP server
 * @param {string} mcpUrl - The URL of the MCP server
 * @returns {Promise<Array>} - Array of available tools with parsed pricing
 */
export async function getMCPTools(mcpUrl) {
  try {
    // Create wallet client with fake private key
    const account = privateKeyToAccount(FAKE_PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    }).extend(publicActions);

    // Create payment-aware transport
    const transport = makePaymentAwareClientTransport(mcpUrl, walletClient);

    // Create MCP client
    const client = new Client({ name: 'tool-discovery-client', version: '1.0.0' }, { capabilities: {} });

    // Connect with payment-aware transport
    await client.connect(transport);

    // List available tools
    const toolsResponse = await client.listTools();

    // Close the connection
    await client.close();

    // Parse prices from tool descriptions
    const toolsWithPricing = (toolsResponse.tools || []).map(tool => {
      const { cleanDescription, price } = parseToolPrice(tool.description);
      return {
        ...tool,
        description: cleanDescription,
        price: price,
        originalDescription: tool.description // Keep original for reference
      };
    });

    return toolsWithPricing;

  } catch (error) {
    console.error(`Error fetching tools from ${mcpUrl}:`, error.message);
    return [];
  }
}

/**
 * Get MCP server info including tools
 * @param {string} mcpUrl - The URL of the MCP server
 * @returns {Promise<Object>} - Object with server info and tools
 */
export async function getMCPServerInfo(mcpUrl) {
  try {
    const tools = await getMCPTools(mcpUrl + '/mcp');

    return {
      url: mcpUrl,
      tools: tools,
      toolCount: tools.length,
      lastChecked: new Date().toISOString(),
      status: 'online'
    };

  } catch (error) {
    return {
      url: mcpUrl,
      tools: [],
      toolCount: 0,
      lastChecked: new Date().toISOString(),
      status: 'offline',
      error: error.message
    };
  }
}

/**
 * Batch get tools from multiple MCP servers
 * @param {Array<string>} mcpUrls - Array of MCP server URLs
 * @returns {Promise<Array>} - Array of server info objects
 */
export async function getMultipleMCPTools(mcpUrls) {
  const promises = mcpUrls.map(url => getMCPServerInfo(url));
  const results = await Promise.allSettled(promises);

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        url: mcpUrls[index],
        tools: [],
        toolCount: 0,
        lastChecked: new Date().toISOString(),
        status: 'error',
        error: result.reason.message
      };
    }
  });
}
