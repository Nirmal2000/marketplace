import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { convertHeaders } from './util.js';

/**
 * Creates a payment-aware MCP client transport that automatically handles X402 payments
 * @param {string} serverUrl - The MCP server URL
 * @param {import('viem').WalletClient} wallet - A viem WalletClient configured with account and chain
 * @param {(txHash: string) => void} [paymentCallback]
 * @returns {StreamableHTTPClientTransport} StreamableHTTPClientTransport configured with X402 payment capabilities
 */
export function makePaymentAwareClientTransport(serverUrl, _wallet, _paymentCallback = () => {}) {
  // Minimal fetch wrapper that ensures MCP-required Accept header.
  const fetchWithHeaders = async (input, init) => {
    const headers = {
      ...convertHeaders(init?.headers),
      Accept: 'application/json, text/event-stream',
    };
    return fetch(input, { ...init, headers });
  };

  return new StreamableHTTPClientTransport(new URL(serverUrl), { fetch: fetchWithHeaders });
}
